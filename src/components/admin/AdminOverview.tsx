import React from 'react';
import {
  Users,
  CreditCard,
  FileCode2,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Payment, Subscription } from '../../types';

interface AdminOverviewProps {
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
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  metrics,
  revenueHistory,
  recentPayments,
  recentSubscriptions
}) => {
  const maxRevenue = Math.max(...revenueHistory.map((r) => r.revenue), 1000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white">System Analytics & Platform Performance</h2>
        <p className="text-xs text-slate-400">
          Real-time metrics on user acquisition, subscriber retention, and cloud usage.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Gross Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{metrics.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            ₹{metrics.monthlyRevenue.toLocaleString()} this current month
          </p>
        </div>

        {/* Active Subscribers */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Subscriptions</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics.activeSubscriptions}
          </div>
          <p className="text-[11px] text-slate-400">
            {metrics.paidUsers} unique paying customers ({metrics.expiredSubscriptions} expired)
          </p>
        </div>

        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Registered Engineers</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalUsers}</div>
          <p className="text-[11px] text-indigo-400 font-medium">
            {metrics.activeUsers} active accounts
          </p>
        </div>

        {/* Projects & AI Queries */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ML Projects & AI Invocations</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics.publishedProjects} / {metrics.totalProjects}
          </div>
          <p className="text-[11px] text-amber-400 font-medium">
            {metrics.aiUsageCount} AI Assistant Queries answered
          </p>
        </div>
      </div>

      {/* Revenue History Chart Visualizer */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Revenue & Subscription Trajectory</h3>
            <p className="text-xs text-slate-400">Monthly billing volume over the last 6 months</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
            INR (₹) Gross
          </span>
        </div>

        <div className="h-48 pt-6 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-800 pb-2">
          {revenueHistory.map((item, idx) => {
            const heightPercent = Math.max(8, Math.round((item.revenue / maxRevenue) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition">
                  ₹{item.revenue.toLocaleString()}
                </div>
                <div className="w-full max-w-[48px] bg-slate-800 rounded-t-lg overflow-hidden h-32 flex items-end">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg group-hover:brightness-125 transition"
                  />
                </div>
                <span className="text-xs font-bold text-slate-300">{item.month}</span>
                <span className="text-[10px] text-slate-400">{item.subscriptions} subs</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column: Recent Transactions & Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Recent Payment Orders</h4>
            <span className="text-xs text-slate-400">Total: {recentPayments.length}</span>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {recentPayments.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{p.planName}</p>
                  <p className="text-[11px] text-slate-400">{p.userEmail}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-200">
                    {p.currency} {p.amount.toLocaleString()}
                  </p>
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      p.status === 'succeeded'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Active Subscriber Contracts</h4>
            <span className="text-xs text-slate-400">Recent grants</span>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {recentSubscriptions.map((s) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{s.planName} Plan</p>
                  <p className="text-[11px] text-slate-400">
                    Expires: {new Date(s.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
                    {s.accessLevel}
                  </span>
                  {s.isManualGrant && (
                    <p className="text-[10px] text-amber-400 mt-1">Manual Grant</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
