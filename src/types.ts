export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status?: 'active' | 'suspended';
  aiCredits: number;
  accessLevel: 'Free' | 'Starter' | 'Professional' | 'Premium';
  activeSubscription?: Subscription | null;
  createdAt?: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  currency: string;
  duration: number;
  durationUnit: 'Days' | 'Months' | 'Years';
  description: string;
  features: string[];
  accessLevel: 'Starter' | 'Professional' | 'Premium';
  aiCredits: number;
  isFeatured: boolean;
  status: 'active' | 'inactive';
  displayOrder: number;
  couponEligibility: boolean;
  createdAt?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  accessLevel: 'Starter' | 'Professional' | 'Premium';
  paymentId: string;
  amount: number;
  currency: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked';
  paymentGateway: string;
  isManualGrant?: boolean;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  couponCode?: string;
  discountAmount?: number;
  status: 'succeeded' | 'failed' | 'pending';
  paymentGateway: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  createdAt: string;
}

export interface CodeSection {
  title: string;
  filename: string;
  language: string;
  description: string;
  code: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  categoryId: string;
  categoryName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  technologyStack: string[];
  accessLevel: 'Free' | 'Starter' | 'Professional' | 'Premium';
  thumbnail: string;
  viewsCount: number;
  hasAccess: boolean;
  codeSectionsCount: number;
  createdAt: string;
}

export interface ProjectDetail {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  categoryName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  technologyStack: string[];
  problemStatement: string;
  businessUseCase: string;
  datasetInformation: {
    name: string;
    source: string;
    rows: string;
    columns: string;
    description: string;
    downloadUrlOrInstructions: string;
  };
  architecture: {
    overview: string;
    pipelineSteps: string[];
    diagramSummary: string;
  };
  codeSections: CodeSection[];
  explanation: string;
  output: string;
  howToRun: string[];
  howToDeploy: string[];
  faq: { question: string; answer: string }[];
  aiPromptContext?: string;
  thumbnail: string;
  demoUrl?: string;
  accessLevel: 'Free' | 'Starter' | 'Professional' | 'Premium';
  status?: 'Published' | 'Draft' | 'Archived';
  viewsCount: number;
  hasAccess: boolean;
  accessDeniedReason?: string;
  requiredPlan?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  projectCount?: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  maxUses: number;
  usedCount: number;
  perUserLimit: number;
  applicablePlanIds: string[];
  minAmount: number;
  status: 'active' | 'inactive';
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  badge?: string;
  ctaText: string;
  ctaUrl: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  bgTheme?: string;
}

export interface HomepageCMS {
  hero: {
    brandTagline: string;
    title: string;
    subtitle: string;
    primaryCtaText: string;
    primaryCtaUrl: string;
    secondaryCtaText: string;
    secondaryCtaUrl: string;
    statsBadge: string;
  };
  whatIsVsw: {
    heading: string;
    subheading: string;
    points: { title: string; desc: string; icon: string }[];
  };
  howItWorks: {
    step1: { title: string; desc: string };
    step2: { title: string; desc: string };
    step3: { title: string; desc: string };
    step4: { title: string; desc: string };
  };
  testimonials: {
    name: string;
    role: string;
    company: string;
    avatar: string;
    quote: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  footer: {
    companyName: string;
    tagline: string;
    contactEmail: string;
    copyrightYear: string;
    disclaimer: string;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'payment' | 'subscription' | 'project' | 'announcement';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  details: string;
  targetId?: string;
  targetType?: string;
  timestamp: string;
}

export interface PaymentGatewayConfig {
  activeGateway: 'Razorpay' | 'Stripe' | 'Simulation';
  testMode: boolean;
  razorpay: {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
    enabled: boolean;
  };
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    enabled: boolean;
  };
  currency: string;
}

export interface SiteSettings {
  siteName: string;
  brandName: string;
  tagline: string;
  supportEmail: string;
  allowSignups: boolean;
  freeTierAIQuestionsLimit: number;
}
