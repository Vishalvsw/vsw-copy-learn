import {
  User,
  Plan,
  ProjectSummary,
  ProjectDetail,
  Category,
  Coupon,
  Banner,
  HomepageCMS,
  NotificationItem,
  AuditLog,
  Subscription,
  Payment,
  PaymentGatewayConfig,
  SiteSettings
} from './types';

const TOKEN_KEY = 'vsw_session_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () => request<{ user: User | null }>('/api/auth/me'),

  logout: () =>
    request<{ success: boolean }>('/api/auth/logout', {
      method: 'POST'
    }),

  // Public Dynamic Data
  getHomepage: () =>
    request<{
      homepage: HomepageCMS;
      settings: SiteSettings;
      featuredProjects: ProjectSummary[];
    }>('/api/homepage'),

  getPlans: () => request<{ plans: Plan[]; currency: string }>('/api/plans'),

  getCategories: () => request<{ categories: Category[] }>('/api/categories'),

  getBanners: () => request<{ banners: Banner[] }>('/api/banners'),

  getProjects: (params: {
    search?: string;
    category?: string;
    accessLevel?: string;
    difficulty?: string;
    sort?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.category) searchParams.set('category', params.category);
    if (params.accessLevel) searchParams.set('accessLevel', params.accessLevel);
    if (params.difficulty) searchParams.set('difficulty', params.difficulty);
    if (params.sort) searchParams.set('sort', params.sort);

    const query = searchParams.toString();
    return request<{ projects: ProjectSummary[]; total: number }>(`/api/projects${query ? `?${query}` : ''}`);
  },

  getProjectDetail: (idOrSlug: string) =>
    request<{ project: ProjectDetail }>(`/api/projects/${idOrSlug}`),

  // Checkout & Coupons
  validateCoupon: (code: string, planId: string, amount: number) =>
    request<{
      valid: boolean;
      code: string;
      discountType: 'Percentage' | 'Fixed';
      discountValue: number;
      discountAmount: number;
      finalPrice: number;
    }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, planId, amount })
    }),

  createPaymentOrder: (planId: string, couponCode?: string) =>
    request<{
      orderId: string;
      planId: string;
      planName: string;
      originalAmount: number;
      discountAmount: number;
      amount: number;
      currency: string;
      gateway: string;
      gatewayKeyId: string;
      testMode: boolean;
    }>('/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ planId, couponCode })
    }),

  verifyAndSubscribe: (payload: {
    orderId: string;
    planId: string;
    couponCode?: string;
    paymentGatewayId?: string;
    simulatedSuccess?: boolean;
  }) =>
    request<{
      success: boolean;
      payment: Payment;
      subscription: Subscription;
      message: string;
    }>('/api/payment/verify-and-subscribe', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getUserSubscriptions: () =>
    request<{
      subscriptions: Subscription[];
      payments: Payment[];
      currentPlan: string;
    }>('/api/user/subscriptions'),

  getUserNotifications: () =>
    request<{ notifications: NotificationItem[] }>('/api/user/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/user/notifications/${id}/read`, {
      method: 'POST'
    }),

  // AI Assistant
  askProjectAI: (payload: {
    projectId: string;
    prompt: string;
    history?: { role: 'user' | 'model'; text: string }[];
  }) =>
    request<{ answer: string; remainingCredits: number }>('/api/ai/ask', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Admin Endpoints
  getAdminOverview: () =>
    request<{
      metrics: {
        totalUsers: number;
        activeUsers: number;
        paidUsers: number;
        activeSubscriptions: number;
        expiredSubscriptions: number;
        totalRevenue: number;
        monthlyRevenue: number;
        totalProjects: number;
        publishedProjects: number;
        aiUsageCount: number;
        failedPayments: number;
      };
      revenueHistory: { month: string; revenue: number; subscriptions: number }[];
      recentPayments: Payment[];
      recentSubscriptions: Subscription[];
      recentAiUsage: any[];
    }>('/api/admin/overview'),

  getAdminUsers: (params: { search?: string; role?: string; status?: string } = {}) => {
    const sp = new URLSearchParams();
    if (params.search) sp.set('search', params.search);
    if (params.role) sp.set('role', params.role);
    if (params.status) sp.set('status', params.status);
    return request<{ users: any[] }>(`/api/admin/users?${sp.toString()}`);
  },

  setUserStatus: (userId: string, status: 'active' | 'suspended') =>
    request<{ success: boolean; user: any }>(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    }),

  grantUserAccess: (userId: string, payload: {
    planId: string;
    customExpiryDate?: string;
    additionalDays?: number;
    notes?: string;
  }) =>
    request<{ success: boolean; subscription: Subscription }>(`/api/admin/users/${userId}/grant-access`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  revokeUserAccess: (userId: string) =>
    request<{ success: boolean }>(`/api/admin/users/${userId}/revoke-access`, {
      method: 'POST'
    }),

  // Admin Plans
  getAdminPlans: () => request<{ plans: Plan[] }>('/api/admin/plans'),

  createPlan: (plan: Partial<Plan>) =>
    request<{ success: boolean; plan: Plan }>('/api/admin/plans', {
      method: 'POST',
      body: JSON.stringify(plan)
    }),

  updatePlan: (id: string, plan: Partial<Plan>) =>
    request<{ success: boolean; plan: Plan }>(`/api/admin/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plan)
    }),

  deletePlan: (id: string) =>
    request<{ success: boolean }>(`/api/admin/plans/${id}`, {
      method: 'DELETE'
    }),

  duplicatePlan: (id: string) =>
    request<{ success: boolean; plan: Plan }>(`/api/admin/plans/${id}/duplicate`, {
      method: 'POST'
    }),

  // Admin Projects
  getAdminProjects: () => request<{ projects: ProjectDetail[] }>('/api/admin/projects'),

  createProject: (project: Partial<ProjectDetail>) =>
    request<{ success: boolean; project: ProjectDetail }>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    }),

  updateProject: (id: string, project: Partial<ProjectDetail>) =>
    request<{ success: boolean; project: ProjectDetail }>(`/api/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project)
    }),

  deleteProject: (id: string) =>
    request<{ success: boolean }>(`/api/admin/projects/${id}`, {
      method: 'DELETE'
    }),

  // Admin Categories
  getAdminCategories: () => request<{ categories: Category[] }>('/api/admin/categories'),

  createCategory: (cat: { name: string; description: string; iconName: string }) =>
    request<{ success: boolean; category: Category }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(cat)
    }),

  updateCategory: (id: string, cat: Partial<Category>) =>
    request<{ success: boolean; category: Category }>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cat)
    }),

  deleteCategory: (id: string) =>
    request<{ success: boolean }>(`/api/admin/categories/${id}`, {
      method: 'DELETE'
    }),

  // Admin Coupons
  getAdminCoupons: () => request<{ coupons: Coupon[] }>('/api/admin/coupons'),

  createCoupon: (coupon: Partial<Coupon>) =>
    request<{ success: boolean; coupon: Coupon }>('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon)
    }),

  updateCoupon: (id: string, coupon: Partial<Coupon>) =>
    request<{ success: boolean; coupon: Coupon }>(`/api/admin/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(coupon)
    }),

  deleteCoupon: (id: string) =>
    request<{ success: boolean }>(`/api/admin/coupons/${id}`, {
      method: 'DELETE'
    }),

  // Admin Homepage CMS
  getAdminHomepage: () => request<{ homepage: HomepageCMS }>('/api/admin/homepage'),

  updateAdminHomepage: (homepage: Partial<HomepageCMS>) =>
    request<{ success: boolean; homepage: HomepageCMS }>('/api/admin/homepage', {
      method: 'PUT',
      body: JSON.stringify(homepage)
    }),

  // Admin Banners
  getAdminBanners: () => request<{ banners: Banner[] }>('/api/admin/banners'),

  createBanner: (banner: Partial<Banner>) =>
    request<{ success: boolean; banner: Banner }>('/api/admin/banners', {
      method: 'POST',
      body: JSON.stringify(banner)
    }),

  updateBanner: (id: string, banner: Partial<Banner>) =>
    request<{ success: boolean; banner: Banner }>(`/api/admin/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(banner)
    }),

  deleteBanner: (id: string) =>
    request<{ success: boolean }>(`/api/admin/banners/${id}`, {
      method: 'DELETE'
    }),

  // Admin Subscriptions & Payments
  getAdminSubscriptions: () => request<{ subscriptions: Subscription[] }>('/api/admin/subscriptions'),
  getAdminPayments: () => request<{ payments: Payment[] }>('/api/admin/payments'),
  getAdminAiUsage: () => request<{ aiUsage: any[] }>('/api/admin/ai-usage'),
  getAdminAuditLogs: () => request<{ auditLogs: AuditLog[] }>('/api/admin/audit-logs'),

  // Admin Settings
  getAdminSettings: () =>
    request<{ settings: SiteSettings; gatewayConfig: PaymentGatewayConfig }>('/api/admin/settings'),

  updateAdminSettings: (payload: { settings?: Partial<SiteSettings>; gatewayConfig?: Partial<PaymentGatewayConfig> }) =>
    request<{ success: boolean; settings: SiteSettings; gatewayConfig: PaymentGatewayConfig }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
};
