import React, { useState, useEffect } from 'react';
import { Menu, X, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../api';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { AdminPlans } from './AdminPlans';
import { AdminProjects } from './AdminProjects';
import { AdminUsers } from './AdminUsers';
import { AdminCategories } from './AdminCategories';
import { AdminCoupons } from './AdminCoupons';
import { AdminHomepageCMS } from './AdminHomepageCMS';
import { AdminBanners } from './AdminBanners';
import { AdminSettings } from './AdminSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import {
  Plan,
  ProjectDetail,
  Category,
  Coupon,
  HomepageCMS,
  Banner,
  Subscription,
  Payment,
  PaymentGatewayConfig,
  SiteSettings,
  AuditLog
} from '../../types';

interface AdminDashboardProps {
  onExitAdmin: () => void;
  onOpenPublicProject: (slug: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onExitAdmin,
  onOpenPublicProject
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Aggregated data
  const [overviewData, setOverviewData] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [projects, setProjects] = useState<ProjectDetail[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [homepage, setHomepage] = useState<HomepageCMS | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [aiUsage, setAiUsage] = useState<any[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const fetchAllData = async () => {
    try {
      const [
        overviewRes,
        plansRes,
        projectsRes,
        usersRes,
        catsRes,
        couponsRes,
        homeRes,
        bannersRes,
        subsRes,
        paymentsRes,
        aiRes,
        settingsRes,
        auditRes
      ] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminPlans(),
        api.getAdminProjects(),
        api.getAdminUsers(),
        api.getAdminCategories(),
        api.getAdminCoupons(),
        api.getAdminHomepage(),
        api.getAdminBanners(),
        api.getAdminSubscriptions(),
        api.getAdminPayments(),
        api.getAdminAiUsage(),
        api.getAdminSettings(),
        api.getAdminAuditLogs()
      ]);

      setOverviewData(overviewRes);
      setPlans(plansRes.plans || []);
      setProjects(projectsRes.projects || []);
      setUsers(usersRes.users || []);
      setCategories(catsRes.categories || []);
      setCoupons(couponsRes.coupons || []);
      setHomepage(homeRes.homepage);
      setBanners(bannersRes.banners || []);
      setSubscriptions(subsRes.subscriptions || []);
      setPayments(paymentsRes.payments || []);
      setAiUsage(aiRes.aiUsage || []);
      setSettings(settingsRes.settings);
      setGatewayConfig(settingsRes.gatewayConfig);
      setAuditLogs(auditRes.auditLogs || []);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-sm font-semibold">Connecting to VSW ML HUB Admin Engine...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <AdminSidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onExitAdmin={onExitAdmin}
          metrics={{
            totalUsers: users.length,
            activeSubscriptions: subscriptions.filter((s) => s.status === 'active').length,
            publishedProjects: projects.filter((p) => p.status === 'Published').length
          }}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 h-full bg-slate-950 border-r border-slate-800">
            <div className="p-4 flex justify-between items-center border-b border-slate-800">
              <span className="font-extrabold text-white text-sm">ADMIN DASHBOARD</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminSidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setMobileSidebarOpen(false);
              }}
              onExitAdmin={onExitAdmin}
            />
          </div>
        </div>
      )}

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <div className="h-16 px-4 sm:px-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-extrabold text-white uppercase tracking-wider">
                {currentTab.replace('-', ' ')}
              </h1>
              <p className="text-[11px] text-slate-400">VSW ML HUB Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllData}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab View Container */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {currentTab === 'overview' && overviewData && (
            <AdminOverview
              metrics={overviewData.metrics}
              revenueHistory={overviewData.revenueHistory || []}
              recentPayments={overviewData.recentPayments || []}
              recentSubscriptions={overviewData.recentSubscriptions || []}
            />
          )}

          {currentTab === 'plans' && (
            <AdminPlans plans={plans} onRefresh={fetchAllData} />
          )}

          {currentTab === 'projects' && (
            <AdminProjects
              projects={projects}
              categories={categories}
              onRefresh={fetchAllData}
              onOpenPublicProject={onOpenPublicProject}
            />
          )}

          {currentTab === 'users' && (
            <AdminUsers users={users} plans={plans} onRefresh={fetchAllData} />
          )}

          {currentTab === 'categories' && (
            <AdminCategories categories={categories} onRefresh={fetchAllData} />
          )}

          {currentTab === 'coupons' && (
            <AdminCoupons coupons={coupons} plans={plans} onRefresh={fetchAllData} />
          )}

          {currentTab === 'homepage' && homepage && (
            <AdminHomepageCMS homepage={homepage} onRefresh={fetchAllData} />
          )}

          {currentTab === 'banners' && (
            <AdminBanners banners={banners} onRefresh={fetchAllData} />
          )}

          {currentTab === 'subscriptions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">Active Subscriber Contracts & Orders</h2>
                <p className="text-xs text-slate-400">
                  Comprehensive history of all customer orders, payments, and active access duration.
                </p>
              </div>

              <div className="border border-slate-800 rounded-2xl bg-slate-900 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-4">Subscriber</th>
                      <th className="p-4">Plan Name</th>
                      <th className="p-4">Access Level</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Start Date</th>
                      <th className="p-4">Expiry Date</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {subscriptions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-mono text-slate-300">{s.userId}</td>
                        <td className="p-4 font-bold text-white">{s.planName}</td>
                        <td className="p-4 text-blue-400 font-semibold">{s.accessLevel}</td>
                        <td className="p-4 font-bold text-slate-200">
                          {s.currency} {s.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(s.startDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(s.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {s.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentTab === 'ai-usage' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">Project AI Assistant Invocations</h2>
                <p className="text-xs text-slate-400">
                  Detailed analytics of queries answered across projects and token consumption.
                </p>
              </div>

              <div className="border border-slate-800 rounded-2xl bg-slate-900 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-4">Time</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Project</th>
                      <th className="p-4">Question Prompt</th>
                      <th className="p-4">Tokens Estimated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {aiUsage.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="p-4 text-slate-400 whitespace-nowrap">
                          {new Date(u.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4 font-semibold text-white">{u.userEmail}</td>
                        <td className="p-4 text-blue-400 font-medium">{u.projectTitle}</td>
                        <td className="p-4 text-slate-300 max-w-sm line-clamp-2">{u.question}</td>
                        <td className="p-4 font-mono text-amber-400">{u.tokensEstimated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentTab === 'settings' && settings && gatewayConfig && (
            <AdminSettings
              settings={settings}
              gatewayConfig={gatewayConfig}
              onRefresh={fetchAllData}
            />
          )}

          {currentTab === 'audit-logs' && (
            <AdminAuditLogs logs={auditLogs} />
          )}
        </main>
      </div>
    </div>
  );
};
