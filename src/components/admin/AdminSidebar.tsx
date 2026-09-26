import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileCode2,
  FolderTree,
  Tag,
  FileText,
  Megaphone,
  Receipt,
  Sparkles,
  Settings,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'plans'
  | 'projects'
  | 'users'
  | 'categories'
  | 'coupons'
  | 'homepage'
  | 'banners'
  | 'subscriptions'
  | 'ai-usage'
  | 'settings'
  | 'audit-logs';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  metrics?: {
    totalUsers: number;
    activeSubscriptions: number;
    publishedProjects: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onExitAdmin,
  metrics
}) => {
  const menuItems: { id: AdminTab; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'plans', label: 'Subscription Plans', icon: CreditCard },
    { id: 'projects', label: 'ML Project Library', icon: FileCode2, count: metrics?.publishedProjects },
    { id: 'users', label: 'Users & Access Control', icon: Users, count: metrics?.totalUsers },
    { id: 'categories', label: 'Project Categories', icon: FolderTree },
    { id: 'coupons', label: 'Discount Coupons', icon: Tag },
    { id: 'homepage', label: 'Homepage CMS', icon: FileText },
    { id: 'banners', label: 'Promotional Banners', icon: Megaphone },
    { id: 'subscriptions', label: 'Subscriptions & Orders', icon: Receipt, count: metrics?.activeSubscriptions },
    { id: 'ai-usage', label: 'AI Usage Analytics', icon: Sparkles },
    { id: 'settings', label: 'Payment & Site Settings', icon: Settings },
    { id: 'audit-logs', label: 'Admin Audit Logs', icon: ShieldAlert }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-4">
        {/* Brand Header */}
        <div className="px-2 pt-1 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>ADMIN CONSOLE</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                PRO
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">VSW DATA SOLUTIONS</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      active ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Return to website */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onExitAdmin}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Public Site</span>
        </button>
      </div>
    </aside>
  );
};
