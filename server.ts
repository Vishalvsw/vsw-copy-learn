import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  db,
  hashPassword,
  calculateExpiry,
  getAccessHierarchyLevel,
  User,
  Plan,
  Subscription,
  Payment,
  Project,
  Category,
  Coupon,
  Banner,
  NotificationItem,
  AuditLog
} from './server/db.js';
import {
  authMiddleware,
  requireAuth,
  requireAdmin,
  createSessionToken,
  revokeSessionToken,
  checkProjectAccess,
  AuthenticatedRequest
} from './server/auth.js';
import { askProjectAssistant } from './server/gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Attach user auth to requests
app.use(authMiddleware as express.RequestHandler);

// Helper for admin action audit logging
function logAdminAction(admin: User, action: string, details: string, targetId?: string, targetType?: string) {
  const data = db.get();
  const entry: AuditLog = {
    id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    adminId: admin.id,
    adminEmail: admin.email,
    action,
    details,
    targetId,
    targetType,
    timestamp: new Date().toISOString()
  };
  data.auditLogs.unshift(entry);
  if (data.auditLogs.length > 500) {
    data.auditLogs.pop();
  }
  db.save();
}

// ==========================================
// AUTH ROUTES
// ==========================================

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const data = db.get();
  const existing = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser: User = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
    role: 'user',
    status: 'active',
    aiCredits: 15, // Complimentary initial credits
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.users.push(newUser);

  // Welcome notification
  const notif: NotificationItem = {
    id: 'notif_' + Date.now(),
    userId: newUser.id,
    title: 'Welcome to VSW ML HUB!',
    message: 'Browse our project catalog, inspect free tier source code, and select an access plan when ready.',
    type: 'announcement',
    read: false,
    createdAt: new Date().toISOString()
  };
  data.notifications.unshift(notif);

  db.save();

  const token = createSessionToken(newUser.id);
  res.json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      aiCredits: newUser.aiCredits,
      accessLevel: 'Free',
      activeSubscription: null
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const data = db.get();
  const user = data.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.passwordHash === hashPassword(password)
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been suspended. Please contact support@vswdata.com.' });
  }

  const token = createSessionToken(user.id);
  const now = new Date();
  const activeSub = data.subscriptions
    .filter((s) => s.userId === user.id && s.status === 'active' && new Date(s.expiryDate) > now)
    .sort((a, b) => getAccessHierarchyLevel(b.accessLevel) - getAccessHierarchyLevel(a.accessLevel))[0] || null;

  const accessLevel = user.role === 'admin' ? 'Premium' : (activeSub ? activeSub.accessLevel : 'Free');

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      aiCredits: user.aiCredits,
      accessLevel,
      activeSubscription: activeSub
    }
  });
});

app.get('/api/auth/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      aiCredits: req.user.aiCredits,
      accessLevel: req.userAccessLevel || 'Free',
      activeSubscription: req.userSubscription || null
    }
  });
});

app.post('/api/auth/logout', (req: AuthenticatedRequest, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    revokeSessionToken(authHeader.substring(7).trim());
  }
  res.json({ success: true });
});

// ==========================================
// PUBLIC DYNAMIC DATA ROUTES
// ==========================================

app.get('/api/homepage', (_req, res) => {
  const data = db.get();
  res.json({
    homepage: data.homepage,
    settings: data.settings,
    featuredProjects: data.projects
      .filter((p) => p.status === 'Published')
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDescription,
        categoryName: p.categoryName,
        difficulty: p.difficulty,
        accessLevel: p.accessLevel,
        technologyStack: p.technologyStack,
        thumbnail: p.thumbnail,
        viewsCount: p.viewsCount
      }))
  });
});

app.get('/api/plans', (_req, res) => {
  const data = db.get();
  const activePlans = data.plans
    .filter((p) => p.status === 'active')
    .sort((a, b) => a.displayOrder - b.displayOrder);
  res.json({ plans: activePlans, currency: data.gatewayConfig.currency });
});

app.get('/api/categories', (_req, res) => {
  const data = db.get();
  const counts: Record<string, number> = {};
  data.projects.forEach((p) => {
    if (p.status === 'Published') {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    }
  });

  const categoriesWithCounts = data.categories.map((c) => ({
    ...c,
    projectCount: counts[c.id] || 0
  }));

  res.json({ categories: categoriesWithCounts });
});

app.get('/api/banners', (_req, res) => {
  const data = db.get();
  const now = new Date();
  const activeBanners = data.banners.filter((b) => {
    if (b.status !== 'active') return false;
    if (b.startDate && new Date(b.startDate) > now) return false;
    if (b.endDate && new Date(b.endDate) < now) return false;
    return true;
  });
  res.json({ banners: activeBanners });
});

app.get('/api/projects', (req: AuthenticatedRequest, res) => {
  const data = db.get();
  const { search, category, accessLevel, difficulty, sort } = req.query as Record<string, string>;

  let filtered = data.projects.filter((p) => p.status === 'Published');

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.technologyStack.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.categoryId === category || p.categoryName.toLowerCase() === category.toLowerCase());
  }

  if (accessLevel && accessLevel !== 'all') {
    filtered = filtered.filter((p) => p.accessLevel === accessLevel);
  }

  if (difficulty && difficulty !== 'all') {
    filtered = filtered.filter((p) => p.difficulty === difficulty);
  }

  if (sort === 'popular') {
    filtered.sort((a, b) => b.viewsCount - a.viewsCount);
  } else {
    // Default newest
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Map to summary cards (do not leak source code in list)
  const summaries = filtered.map((p) => {
    const accessCheck = checkProjectAccess(req.user?.role, req.userAccessLevel, p.accessLevel);
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      shortDescription: p.shortDescription,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      difficulty: p.difficulty,
      technologyStack: p.technologyStack,
      accessLevel: p.accessLevel,
      thumbnail: p.thumbnail,
      viewsCount: p.viewsCount,
      hasAccess: accessCheck.allowed,
      codeSectionsCount: p.codeSections?.length || 0,
      createdAt: p.createdAt
    };
  });

  res.json({ projects: summaries, total: summaries.length });
});

app.get('/api/projects/:idOrSlug', (req: AuthenticatedRequest, res) => {
  const { idOrSlug } = req.params;
  const data = db.get();

  const project = data.projects.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  // Increment views
  project.viewsCount = (project.viewsCount || 0) + 1;
  db.save();

  // Enforce access control server-side
  const accessCheck = checkProjectAccess(req.user?.role, req.userAccessLevel, project.accessLevel);

  if (!accessCheck.allowed) {
    // Return high-level summary & architecture teaser, but withhold protected code and deployment instructions
    return res.json({
      project: {
        id: project.id,
        title: project.title,
        slug: project.slug,
        shortDescription: project.shortDescription,
        fullDescription: project.fullDescription,
        categoryId: project.categoryId,
        categoryName: project.categoryName,
        difficulty: project.difficulty,
        technologyStack: project.technologyStack,
        problemStatement: project.problemStatement,
        businessUseCase: project.businessUseCase,
        datasetInformation: {
          name: project.datasetInformation.name,
          source: project.datasetInformation.source,
          rows: project.datasetInformation.rows,
          columns: project.datasetInformation.columns,
          description: project.datasetInformation.description,
          downloadUrlOrInstructions: 'Upgrade required to unlock dataset download links and ingestion pipelines.'
        },
        architecture: {
          overview: project.architecture.overview,
          pipelineSteps: project.architecture.pipelineSteps,
          diagramSummary: project.architecture.diagramSummary
        },
        codeSections: [], // Concealed on server!
        explanation: 'Source code and technical execution guides are reserved for subscribers.',
        output: project.output,
        howToRun: ['Upgrade to unlock interactive run commands.'],
        howToDeploy: ['Upgrade to unlock deployment configurations.'],
        faq: project.faq,
        thumbnail: project.thumbnail,
        accessLevel: project.accessLevel,
        viewsCount: project.viewsCount,
        hasAccess: false,
        accessDeniedReason: accessCheck.reason,
        requiredPlan: project.accessLevel
      }
    });
  }

  // User has access -> Return complete project payload
  res.json({
    project: {
      ...project,
      hasAccess: true
    }
  });
});

// ==========================================
// COUPON & PAYMENT ROUTES
// ==========================================

app.post('/api/coupons/validate', (req, res) => {
  const { code, planId, amount } = req.body;
  if (!code || !planId) {
    return res.status(400).json({ error: 'Coupon code and plan are required.' });
  }

  const data = db.get();
  const coupon = data.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim() && c.status === 'active');
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired coupon code.' });
  }

  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return res.status(400).json({ error: 'This coupon is not active yet.' });
  }
  if (coupon.endDate && new Date(coupon.endDate) < now) {
    return res.status(400).json({ error: 'This coupon has expired.' });
  }

  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return res.status(400).json({ error: 'This coupon has reached its maximum redemptions.' });
  }

  if (coupon.applicablePlanIds && coupon.applicablePlanIds.length > 0 && !coupon.applicablePlanIds.includes(planId)) {
    return res.status(400).json({ error: 'This coupon is not applicable to the selected plan.' });
  }

  const basePrice = Number(amount) || 0;
  if (coupon.minAmount > 0 && basePrice < coupon.minAmount) {
    return res.status(400).json({ error: `Coupon requires minimum order amount of ₹${coupon.minAmount}.` });
  }

  let discountAmount = 0;
  if (coupon.discountType === 'Percentage') {
    discountAmount = Math.round((basePrice * coupon.discountValue) / 100);
  } else {
    discountAmount = Math.min(basePrice, coupon.discountValue);
  }

  const finalPrice = Math.max(0, basePrice - discountAmount);

  res.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    finalPrice
  });
});

app.post('/api/payment/create-order', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to proceed with checkout.' });
  }

  const { planId, couponCode } = req.body;
  const data = db.get();
  const plan = data.plans.find((p) => p.id === planId && p.status === 'active');
  if (!plan) {
    return res.status(404).json({ error: 'Selected plan is not available.' });
  }

  let amount = plan.price;
  let discountAmount = 0;
  let validatedCoupon: Coupon | null = null;

  if (couponCode) {
    validatedCoupon = data.coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase().trim() && c.status === 'active') || null;
    if (validatedCoupon) {
      if (validatedCoupon.discountType === 'Percentage') {
        discountAmount = Math.round((amount * validatedCoupon.discountValue) / 100);
      } else {
        discountAmount = Math.min(amount, validatedCoupon.discountValue);
      }
      amount = Math.max(0, amount - discountAmount);
    }
  }

  const orderId = 'order_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  res.json({
    orderId,
    planId: plan.id,
    planName: plan.name,
    originalAmount: plan.price,
    discountAmount,
    amount,
    currency: plan.currency,
    gateway: data.gatewayConfig.activeGateway,
    gatewayKeyId:
      data.gatewayConfig.activeGateway === 'Razorpay'
        ? data.gatewayConfig.razorpay.keyId
        : data.gatewayConfig.stripe.publishableKey,
    testMode: data.gatewayConfig.testMode
  });
});

app.post('/api/payment/verify-and-subscribe', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to complete checkout.' });
  }

  const { orderId, planId, couponCode, paymentGatewayId, simulatedSuccess = true } = req.body;
  const data = db.get();
  const plan = data.plans.find((p) => p.id === planId);
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found.' });
  }

  if (!simulatedSuccess) {
    // Record failed payment
    const failedPayment: Payment = {
      id: 'pay_fail_' + Date.now(),
      orderId: orderId || 'order_unknown',
      userId: req.user.id,
      userEmail: req.user.email,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      currency: plan.currency,
      status: 'failed',
      paymentGateway: (data.gatewayConfig.activeGateway as any) || 'Razorpay',
      createdAt: new Date().toISOString()
    };
    data.payments.unshift(failedPayment);
    db.save();
    return res.status(400).json({ error: 'Payment was declined or cancelled.' });
  }

  // Calculate final amount after coupon
  let finalAmount = plan.price;
  let discountAmount = 0;
  if (couponCode) {
    const coupon = data.coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase().trim() && c.status === 'active');
    if (coupon) {
      if (coupon.discountType === 'Percentage') {
        discountAmount = Math.round((finalAmount * coupon.discountValue) / 100);
      } else {
        discountAmount = Math.min(finalAmount, coupon.discountValue);
      }
      finalAmount = Math.max(0, finalAmount - discountAmount);
      coupon.usedCount = (coupon.usedCount || 0) + 1;
    }
  }

  const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  // 1. Record Payment
  const payment: Payment = {
    id: paymentId,
    orderId: orderId || ('ord_' + Date.now()),
    userId: req.user.id,
    userEmail: req.user.email,
    planId: plan.id,
    planName: plan.name,
    amount: finalAmount,
    currency: plan.currency,
    couponCode: couponCode || undefined,
    discountAmount: discountAmount || undefined,
    status: 'succeeded',
    paymentGateway: (data.gatewayConfig.activeGateway as any) || 'Razorpay',
    gatewayPaymentId: paymentGatewayId || ('sim_gw_' + Date.now()),
    gatewayOrderId: orderId,
    createdAt: new Date().toISOString()
  };
  data.payments.unshift(payment);

  // 2. Calculate dynamic expiry date based on plan configuration
  const startDate = new Date().toISOString();
  const expiryDate = calculateExpiry(plan.duration, plan.durationUnit);

  // Expire any existing active subscriptions for this user
  data.subscriptions.forEach((s) => {
    if (s.userId === req.user!.id && s.status === 'active') {
      s.status = 'expired';
    }
  });

  // 3. Create Subscription
  const newSubscription: Subscription = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    userId: req.user.id,
    planId: plan.id,
    planName: plan.name,
    accessLevel: plan.accessLevel,
    paymentId: payment.id,
    amount: finalAmount,
    currency: plan.currency,
    startDate,
    expiryDate,
    status: 'active',
    paymentGateway: payment.paymentGateway,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.subscriptions.unshift(newSubscription);

  // 4. Credit AI Queries to User
  const targetUser = data.users.find((u) => u.id === req.user!.id);
  if (targetUser) {
    targetUser.aiCredits = (targetUser.aiCredits || 0) + (plan.aiCredits || 50);
  }

  // 5. Notification
  const notif: NotificationItem = {
    id: 'notif_' + Date.now(),
    userId: req.user.id,
    title: `Payment Successful! ${plan.name} Plan Active`,
    message: `Thank you for subscribing to ${plan.name}. Access is valid until ${new Date(expiryDate).toLocaleDateString()}. Enjoy full code access and ${plan.aiCredits} AI queries!`,
    type: 'payment',
    read: false,
    createdAt: new Date().toISOString()
  };
  data.notifications.unshift(notif);

  db.save();

  res.json({
    success: true,
    payment,
    subscription: newSubscription,
    message: `Successfully subscribed to ${plan.name}!`
  });
});

app.get('/api/user/subscriptions', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Sign in required.' });
  }
  const data = db.get();
  const userSubs = data.subscriptions.filter((s) => s.userId === req.user!.id);
  const userPayments = data.payments.filter((p) => p.userId === req.user!.id);

  res.json({
    subscriptions: userSubs,
    payments: userPayments,
    currentPlan: req.userAccessLevel
  });
});

app.get('/api/user/notifications', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Sign in required.' });
  }
  const data = db.get();
  const userNotifs = data.notifications.filter((n) => n.userId === req.user!.id);
  res.json({ notifications: userNotifs });
});

app.post('/api/user/notifications/:id/read', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Sign in required.' });
  }
  const { id } = req.params;
  const data = db.get();
  const notif = data.notifications.find((n) => n.id === id && n.userId === req.user!.id);
  if (notif) {
    notif.read = true;
    db.save();
  }
  res.json({ success: true });
});

// ==========================================
// PROJECT AI ASSISTANT ROUTE
// ==========================================

app.post('/api/ai/ask', async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to interact with the project AI Assistant.' });
  }

  const { projectId, prompt, history } = req.body;
  if (!projectId || !prompt) {
    return res.status(400).json({ error: 'Project ID and user question are required.' });
  }

  const data = db.get();
  const project = data.projects.find((p) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  // Access control check
  const accessCheck = checkProjectAccess(req.user.role, req.userAccessLevel, project.accessLevel);
  if (!accessCheck.allowed) {
    return res.status(403).json({
      error: 'Upgrade required. The AI Assistant for this project is available on the ' + project.accessLevel + ' plan.'
    });
  }

  // Check AI credits (admins have unlimited)
  const targetUser = data.users.find((u) => u.id === req.user!.id);
  if (req.user.role !== 'admin' && targetUser && targetUser.aiCredits <= 0) {
    return res.status(402).json({
      error: 'You have reached your AI query limit for this billing period. Upgrade your plan or contact support for top-up credits.'
    });
  }

  // Build context from project
  const codeSnippets = (project.codeSections || [])
    .map((s) => `### File: ${s.filename} (${s.title})\n\`\`\`${s.language}\n${s.code}\n\`\`\``)
    .join('\n\n');

  try {
    const answer = await askProjectAssistant({
      projectTitle: project.title,
      category: project.categoryName,
      techStack: project.technologyStack,
      problemStatement: project.problemStatement,
      architectureOverview: project.architecture.overview + '\n' + project.architecture.diagramSummary,
      codeSnippets,
      userQuestion: prompt,
      conversationHistory: history
    });

    // Deduct credit
    if (req.user.role !== 'admin' && targetUser) {
      targetUser.aiCredits = Math.max(0, targetUser.aiCredits - 1);
    }

    // Log AI usage
    const usageLog: any = {
      id: 'ai_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: req.user.id,
      userEmail: req.user.email,
      projectId: project.id,
      projectTitle: project.title,
      question: prompt,
      tokensEstimated: Math.round(prompt.length / 4 + answer.length / 4),
      timestamp: new Date().toISOString()
    };
    data.aiUsage.unshift(usageLog);
    if (data.aiUsage.length > 1000) data.aiUsage.pop();

    db.save();

    res.json({
      answer,
      remainingCredits: targetUser ? targetUser.aiCredits : 0
    });
  } catch (err: any) {
    console.error('AI route error:', err);
    res.status(500).json({ error: 'AI processing failed: ' + (err.message || 'Unknown error') });
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// Dashboard Overview
app.get('/api/admin/overview', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const data = db.get();
  const now = new Date();

  const totalUsers = data.users.length;
  const activeUsers = data.users.filter((u) => u.status === 'active').length;
  const activeSubs = data.subscriptions.filter((s) => s.status === 'active' && new Date(s.expiryDate) > now);
  const expiredSubs = data.subscriptions.filter((s) => s.status === 'expired' || new Date(s.expiryDate) <= now);
  const paidUsers = new Set(data.subscriptions.map((s) => s.userId)).size;

  const totalRevenue = data.payments
    .filter((p) => p.status === 'succeeded')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = data.payments
    .filter((p) => p.status === 'succeeded' && new Date(p.createdAt) >= thisMonthStart)
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const failedPayments = data.payments.filter((p) => p.status === 'failed').length;

  const publishedProjects = data.projects.filter((p) => p.status === 'Published').length;

  // Monthly revenue breakdown (last 6 months)
  const revenueHistory = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString('default', { month: 'short' });
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const rev = data.payments
      .filter((p) => p.status === 'succeeded' && new Date(p.createdAt) >= d && new Date(p.createdAt) < nextMonth)
      .reduce((sum, p) => sum + p.amount, 0);
    const subsCount = data.subscriptions.filter(
      (s) => new Date(s.createdAt) >= d && new Date(s.createdAt) < nextMonth
    ).length;
    revenueHistory.push({ month: monthName, revenue: rev, subscriptions: subsCount });
  }

  res.json({
    metrics: {
      totalUsers,
      activeUsers,
      paidUsers,
      activeSubscriptions: activeSubs.length,
      expiredSubscriptions: expiredSubs.length,
      totalRevenue,
      monthlyRevenue,
      totalProjects: data.projects.length,
      publishedProjects,
      aiUsageCount: data.aiUsage.length,
      failedPayments
    },
    revenueHistory,
    recentPayments: data.payments.slice(0, 5),
    recentSubscriptions: data.subscriptions.slice(0, 5),
    recentAiUsage: data.aiUsage.slice(0, 5)
  });
});

// Admin Users
app.get('/api/admin/users', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const data = db.get();
  const { search, role, status } = req.query as Record<string, string>;

  let users = [...data.users];
  if (search) {
    const q = search.toLowerCase();
    users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  if (role && role !== 'all') {
    users = users.filter((u) => u.role === role);
  }
  if (status && status !== 'all') {
    users = users.filter((u) => u.status === status);
  }

  const now = new Date();
  const enriched = users.map((u) => {
    const activeSub = data.subscriptions.find((s) => s.userId === u.id && s.status === 'active' && new Date(s.expiryDate) > now);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      aiCredits: u.aiCredits,
      currentPlan: u.role === 'admin' ? 'Premium (Admin)' : (activeSub ? activeSub.planName : 'Free Tier'),
      planExpiry: activeSub ? activeSub.expiryDate : null,
      createdAt: u.createdAt
    };
  });

  res.json({ users: enriched });
});

app.post('/api/admin/users/:id/status', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const data = db.get();
  const target = data.users.find((u) => u.id === id);
  if (!target) return res.status(404).json({ error: 'User not found.' });

  target.status = status === 'suspended' ? 'suspended' : 'active';
  target.updatedAt = new Date().toISOString();
  logAdminAction(req.user!, 'USER_STATUS_CHANGE', `Changed user ${target.email} status to ${target.status}`, target.id, 'User');
  db.save();

  res.json({ success: true, user: target });
});

// Admin Manual Access Control
app.post('/api/admin/users/:id/grant-access', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { planId, customExpiryDate, additionalDays, notes } = req.body;
  const data = db.get();

  const target = data.users.find((u) => u.id === id);
  if (!target) return res.status(404).json({ error: 'User not found.' });

  const plan = data.plans.find((p) => p.id === planId) || data.plans[0];

  let expiryDate = '';
  if (customExpiryDate) {
    expiryDate = new Date(customExpiryDate).toISOString();
  } else if (additionalDays) {
    // Add to existing active subscription or today
    const now = new Date();
    const existing = data.subscriptions.find((s) => s.userId === id && s.status === 'active' && new Date(s.expiryDate) > now);
    const baseDate = existing ? new Date(existing.expiryDate) : now;
    baseDate.setDate(baseDate.getDate() + Number(additionalDays));
    expiryDate = baseDate.toISOString();
  } else {
    expiryDate = calculateExpiry(plan.duration, plan.durationUnit);
  }

  // Retire existing active sub
  data.subscriptions.forEach((s) => {
    if (s.userId === id && s.status === 'active') {
      s.status = 'expired';
    }
  });

  const newSub: Subscription = {
    id: 'sub_manual_' + Date.now(),
    userId: target.id,
    planId: plan.id,
    planName: plan.name,
    accessLevel: plan.accessLevel,
    paymentId: 'pay_manual_grant_' + Date.now(),
    amount: 0,
    currency: plan.currency,
    startDate: new Date().toISOString(),
    expiryDate,
    status: 'active',
    paymentGateway: 'Manual',
    isManualGrant: true,
    notes: notes || 'Admin manual access grant',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.subscriptions.unshift(newSub);

  // Grant AI credits
  target.aiCredits = (target.aiCredits || 0) + (plan.aiCredits || 50);

  logAdminAction(
    req.user!,
    'MANUAL_ACCESS_GRANT',
    `Granted ${plan.name} access to ${target.email} until ${new Date(expiryDate).toLocaleDateString()}. Notes: ${notes || 'None'}`,
    target.id,
    'User'
  );

  db.save();
  res.json({ success: true, subscription: newSub });
});

app.post('/api/admin/users/:id/revoke-access', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const data = db.get();
  const target = data.users.find((u) => u.id === id);
  if (!target) return res.status(404).json({ error: 'User not found.' });

  data.subscriptions.forEach((s) => {
    if (s.userId === id && s.status === 'active') {
      s.status = 'revoked';
      s.updatedAt = new Date().toISOString();
    }
  });

  logAdminAction(req.user!, 'REVOKE_ACCESS', `Revoked all active subscriptions for ${target.email}`, target.id, 'User');
  db.save();
  res.json({ success: true });
});

// Admin Plans CRUD
app.get('/api/admin/plans', requireAdmin as express.RequestHandler, (_req, res) => {
  const data = db.get();
  res.json({ plans: data.plans });
});

app.post('/api/admin/plans', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const planData = req.body;
  if (!planData.name || planData.price === undefined || !planData.duration) {
    return res.status(400).json({ error: 'Name, price, and duration are required.' });
  }

  const data = db.get();
  const newPlan: Plan = {
    id: 'plan_' + Date.now(),
    name: planData.name,
    slug: planData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    price: Number(planData.price),
    originalPrice: planData.originalPrice ? Number(planData.originalPrice) : undefined,
    discountPercentage: planData.discountPercentage ? Number(planData.discountPercentage) : undefined,
    currency: planData.currency || 'INR',
    duration: Number(planData.duration),
    durationUnit: planData.durationUnit || 'Months',
    description: planData.description || '',
    features: Array.isArray(planData.features) ? planData.features : [],
    accessLevel: planData.accessLevel || 'Starter',
    aiCredits: Number(planData.aiCredits) || 50,
    isFeatured: !!planData.isFeatured,
    status: planData.status || 'active',
    displayOrder: Number(planData.displayOrder) || data.plans.length + 1,
    couponEligibility: planData.couponEligibility !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.plans.push(newPlan);
  logAdminAction(req.user!, 'CREATE_PLAN', `Created plan ${newPlan.name} with price ₹${newPlan.price}`, newPlan.id, 'Plan');
  db.save();

  res.json({ success: true, plan: newPlan });
});

app.put('/api/admin/plans/:id', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const update = req.body;
  const data = db.get();
  const plan = data.plans.find((p) => p.id === id);
  if (!plan) return res.status(404).json({ error: 'Plan not found.' });

  Object.assign(plan, update, { updatedAt: new Date().toISOString() });
  logAdminAction(req.user!, 'UPDATE_PLAN', `Updated plan ${plan.name} configuration`, plan.id, 'Plan');
  db.save();

  res.json({ success: true, plan });
});

app.delete('/api/admin/plans/:id', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const data = db.get();
  const index = data.plans.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Plan not found.' });

  const deleted = data.plans.splice(index, 1)[0];
  logAdminAction(req.user!, 'DELETE_PLAN', `Deleted plan ${deleted.name}`, id, 'Plan');
  db.save();

  res.json({ success: true });
});

app.post('/api/admin/plans/:id/duplicate', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const data = db.get();
  const original = data.plans.find((p) => p.id === id);
  if (!original) return res.status(404).json({ error: 'Plan not found.' });

  const duplicated: Plan = {
    ...original,
    id: 'plan_' + Date.now(),
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
    displayOrder: original.displayOrder + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.plans.push(duplicated);
  logAdminAction(req.user!, 'DUPLICATE_PLAN', `Duplicated plan from ${original.name}`, duplicated.id, 'Plan');
  db.save();

  res.json({ success: true, plan: duplicated });
});

// Admin Projects CRUD
app.get('/api/admin/projects', requireAdmin as express.RequestHandler, (_req, res) => {
  const data = db.get();
  res.json({ projects: data.projects });
});

app.post('/api/admin/projects', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const p = req.body;
  if (!p.title) return res.status(400).json({ error: 'Title is required.' });

  const data = db.get();
  const category = data.categories.find((c) => c.id === p.categoryId) || data.categories[0];

  const newProject: Project = {
    id: 'proj_' + Date.now(),
    title: p.title,
    slug: p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    shortDescription: p.shortDescription || '',
    fullDescription: p.fullDescription || '',
    categoryId: category?.id || 'cat_ml',
    categoryName: category?.name || 'Machine Learning',
    difficulty: p.difficulty || 'Intermediate',
    technologyStack: Array.isArray(p.technologyStack) ? p.technologyStack : ['Python'],
    problemStatement: p.problemStatement || '',
    businessUseCase: p.businessUseCase || '',
    datasetInformation: p.datasetInformation || {
      name: 'Curated Project Dataset',
      source: 'Open ML Repository',
      rows: '10,000 samples',
      columns: 'Normalized features and target',
      description: 'Standard dataset formatted for this architecture.',
      downloadUrlOrInstructions: 'Available upon environment setup.'
    },
    architecture: p.architecture || {
      overview: 'Modular data pipeline and model training orchestration.',
      pipelineSteps: ['Data Ingestion', 'Feature Pipeline', 'Training Engine', 'Inference Service'],
      diagramSummary: 'Input -> Pipeline -> Model -> Evaluator -> API'
    },
    codeSections: Array.isArray(p.codeSections) ? p.codeSections : [],
    explanation: p.explanation || '',
    output: p.output || '',
    howToRun: Array.isArray(p.howToRun) ? p.howToRun : ['python main.py'],
    howToDeploy: Array.isArray(p.howToDeploy) ? p.howToDeploy : ['docker build -t vsw-proj .'],
    faq: Array.isArray(p.faq) ? p.faq : [],
    aiPromptContext: p.aiPromptContext || p.title,
    thumbnail: p.thumbnail || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    demoUrl: p.demoUrl || '',
    accessLevel: p.accessLevel || 'Professional',
    status: p.status || 'Published',
    viewsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.projects.unshift(newProject);
  logAdminAction(req.user!, 'CREATE_PROJECT', `Created project: ${newProject.title}`, newProject.id, 'Project');
  db.save();

  res.json({ success: true, project: newProject });
});

app.put('/api/admin/projects/:id', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const update = req.body;
  const data = db.get();
  const project = data.projects.find((p) => p.id === id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });

  if (update.categoryId) {
    const category = data.categories.find((c) => c.id === update.categoryId);
    if (category) {
      project.categoryName = category.name;
    }
  }

  Object.assign(project, update, { updatedAt: new Date().toISOString() });
  logAdminAction(req.user!, 'UPDATE_PROJECT', `Updated project: ${project.title}`, project.id, 'Project');
  db.save();

  res.json({ success: true, project });
});

app.delete('/api/admin/projects/:id', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const data = db.get();
  const index = data.projects.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Project not found.' });

  const deleted = data.projects.splice(index, 1)[0];
  logAdminAction(req.user!, 'DELETE_PROJECT', `Deleted project: ${deleted.title}`, id, 'Project');
  db.save();

  res.json({ success: true });
});

// Admin Categories CRUD
app.get('/api/admin/categories', requireAdmin as express.RequestHandler, (_req, res) => {
  const data = db.get();
  res.json({ categories: data.categories });
});

app.post('/api/admin/categories', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { name, description, iconName } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required.' });

  const data = db.get();
  const newCat: Category = {
    id: 'cat_' + Date.now(),
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    iconName: iconName || 'Brain'
  };

  data.categories.push(newCat);
  logAdminAction(req.user!, 'CREATE_CATEGORY', `Created category: ${name}`, newCat.id, 'Category');
  db.save();

  res.json({ success: true, category: newCat });
});

app.put('/api/admin/categories/:id', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const update = req.body;
  const data = db.get();
  const cat = data.categories.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ error: 'Category not found.' });

  Object.assign(cat, update);
  logAdminAction(req.user!, 'UPDATE_CATEGORY', `Updated category: ${cat.name}`, cat.id, 'Category');
  db.save();

  res.json({ success: true, category: cat });
});

app.delete('/api/admin/categories/:id', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const data = db.get();
  const index = data.categories.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Category not found.' });

  const deleted = data.categories.splice(index, 1)[0];
  logAdminAction(req.user!, 'DELETE_CATEGORY', `Deleted category: ${deleted.name}`, id, 'Category');
  db.save();

  res.json({ success: true });
});

// Admin Coupons CRUD
app.get('/api/admin/coupons', requireAdmin as express.RequestHandler, (_req, res) => {
  const data = db.get();
  res.json({ coupons: data.coupons });
});

app.post('/api/admin/coupons', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const c = req.body;
  if (!c.code || c.discountValue === undefined) {
    return res.status(400).json({ error: 'Coupon code and discount value are required.' });
  }

  const data = db.get();
  const newCoupon: Coupon = {
    id: 'coup_' + Date.now(),
    code: c.code.toUpperCase().trim(),
    discountType: c.discountType || 'Percentage',
    discountValue: Number(c.discountValue),
    startDate: c.startDate || new Date().toISOString(),
    endDate: c.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: Number(c.maxUses) || 500,
    usedCount: 0,
    perUserLimit: Number(c.perUserLimit) || 1,
    applicablePlanIds: Array.isArray(c.applicablePlanIds) ? c.applicablePlanIds : [],
    minAmount: Number(c.minAmount) || 0,
    status: c.status || 'active',
    createdAt: new Date().toISOString()
  };

  data.coupons.push(newCoupon);
  logAdminAction(req.user!, 'CREATE_COUPON', `Created coupon: ${newCoupon.code}`, newCoupon.id, 'Coupon');
  db.save();

  res.json({ success: true, coupon: newCoupon });
});

app.put('/api/admin/coupons/:id', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const update = req.body;
  const data = db.get();
  const coupon = data.coupons.find((c) => c.id === id);
  if (!coupon) return res.status(404).json({ error: 'Coupon not found.' });

  if (update.code) update.code = update.code.toUpperCase().trim();
  Object.assign(coupon, update);
  logAdminAction(req.user!, 'UPDATE_COUPON', `Updated coupon: ${coupon.code}`, coupon.id, 'Coupon');
  db.save();

  res.json({ success: true, coupon });
});

app.delete('/api/admin/coupons/:id', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const data = db.get();
  const index = data.coupons.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Coupon not found.' });

  const deleted = data.coupons.splice(index, 1)[0];
  logAdminAction(req.user!, 'DELETE_COUPON', `Deleted coupon: ${deleted.code}`, id, 'Coupon');
  db.save();

  res.json({ success: true });
});

// Admin Homepage CMS
app.get('/api/admin/homepage', requireAdmin as express.RequestHandler, (_req, res) => {
  const data = db.get();
  res.json({ homepage: data.homepage });
});

app.put('/api/admin/homepage', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const update = req.body;
  const data = db.get();
  data.homepage = {
    ...data.homepage,
    ...update
  };
  logAdminAction(req.user!, 'UPDATE_HOMEPAGE_CMS', 'Updated dynamic homepage marketing content and layout');
  db.save();

  res.json({ success: true, homepage: data.homepage });
});

// Admin Banners CRUD
app.get('/api/admin/banners', requireAdmin as express.RequestHandler, (_req, res) => {
  const data = db.get();
  res.json({ banners: data.banners });
});

app.post('/api/admin/banners', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const b = req.body;
  if (!b.title) return res.status(400).json({ error: 'Banner title is required.' });

  const data = db.get();
  const newBanner: Banner = {
    id: 'ban_' + Date.now(),
    title: b.title,
    description: b.description || '',
    badge: b.badge || 'PROMO',
    ctaText: b.ctaText || 'Learn More',
    ctaUrl: b.ctaUrl || '#pricing',
    startDate: b.startDate || new Date().toISOString(),
    endDate: b.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: b.status || 'active',
    bgTheme: b.bgTheme || 'from-blue-900 to-indigo-950',
    createdAt: new Date().toISOString()
  };

  data.banners.unshift(newBanner);
  logAdminAction(req.user!, 'CREATE_BANNER', `Created banner: ${newBanner.title}`, newBanner.id, 'Banner');
  db.save();

  res.json({ success: true, banner: newBanner });
});

app.put('/api/admin/banners/:id', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const update = req.body;
  const data = db.get();
  const banner = data.banners.find((b) => b.id === id);
  if (!banner) return res.status(404).json({ error: 'Banner not found.' });

  Object.assign(banner, update);
  logAdminAction(req.user!, 'UPDATE_BANNER', `Updated banner: ${banner.title}`, banner.id, 'Banner');
  db.save();

  res.json({ success: true, banner });
});

app.delete('/api/admin/banners/:id', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const data = db.get();
  const index = data.banners.findIndex((b) => b.id === id);
  if (index === -1) return res.status(404).json({ error: 'Banner not found.' });

  const deleted = data.banners.splice(index, 1)[0];
  logAdminAction(req.user!, 'DELETE_BANNER', `Deleted banner: ${deleted.title}`, id, 'Banner');
  db.save();

  res.json({ success: true });
});

// Admin Subscriptions & Payments
app.get('/api/admin/subscriptions', requireAdmin as express.RequestHandler, (_req, res) => {
  const data = db.get();
  res.json({ subscriptions: data.subscriptions });
});

app.get('/api/admin/payments', requireAdmin as express.RequestHandler, (_req, res) => {
  const data = db.get();
  res.json({ payments: data.payments });
});

app.get('/api/admin/ai-usage', requireAdmin as express.RequestHandler, (_req, res) => {
  const data = db.get();
  res.json({ aiUsage: data.aiUsage });
});

// Admin Settings & Payment Gateways
app.get('/api/admin/settings', requireAdmin as express.RequestHandler, (_req, res) => {
  const data = db.get();
  // Safe representation (mask secrets)
  const safeConfig = {
    ...data.gatewayConfig,
    razorpay: {
      ...data.gatewayConfig.razorpay,
      keySecret: data.gatewayConfig.razorpay.keySecret ? '••••••••••••••••' : ''
    },
    stripe: {
      ...data.gatewayConfig.stripe,
      secretKey: data.gatewayConfig.stripe.secretKey ? '••••••••••••••••' : ''
    }
  };

  res.json({
    settings: data.settings,
    gatewayConfig: safeConfig
  });
});

app.put('/api/admin/settings', requireAdmin as express.RequestHandler, (req: AuthenticatedRequest, res) => {
  const { settings, gatewayConfig } = req.body;
  const data = db.get();

  if (settings) {
    data.settings = { ...data.settings, ...settings };
  }

  if (gatewayConfig) {
    // Preserve secrets if masked
    const currentRzpSecret = data.gatewayConfig.razorpay.keySecret;
    const currentStripeSecret = data.gatewayConfig.stripe.secretKey;

    data.gatewayConfig = {
      ...data.gatewayConfig,
      ...gatewayConfig,
      razorpay: {
        ...data.gatewayConfig.razorpay,
        ...gatewayConfig.razorpay,
        keySecret:
          gatewayConfig.razorpay?.keySecret && !gatewayConfig.razorpay.keySecret.includes('••••')
            ? gatewayConfig.razorpay.keySecret
            : currentRzpSecret
      },
      stripe: {
        ...data.gatewayConfig.stripe,
        ...gatewayConfig.stripe,
        secretKey:
          gatewayConfig.stripe?.secretKey && !gatewayConfig.stripe.secretKey.includes('••••')
            ? gatewayConfig.stripe.secretKey
            : currentStripeSecret
      }
    };
  }

  logAdminAction(req.user!, 'UPDATE_SYSTEM_SETTINGS', 'Updated system site settings and payment gateway parameters');
  db.save();

  res.json({ success: true, settings: data.settings, gatewayConfig: data.gatewayConfig });
});

app.get('/api/admin/audit-logs', requireAdmin as express.RequestHandler, (_req, res) => {
  const data = db.get();
  res.json({ auditLogs: data.auditLogs });
});

// ==========================================
// VITE DEV MIDDLEWARE / STATIC ASSETS
// ==========================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: Number(PORT) },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[VSW ML HUB] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
