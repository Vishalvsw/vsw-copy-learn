import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Bell,
  Sparkles,
  Calendar,
  Shield,
  Receipt,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api';
import { User, Subscription, Payment, NotificationItem } from '../types';

interface UserAccountModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpgradePlan: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpgradePlan
}) => {
  const [activeTab, setActiveTab] = useState<'access' | 'payments' | 'notifications'>('access');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([
      api.getUserSubscriptions(),
      api.getUserNotifications()
    ])
      .then(([subRes, notifRes]) => {
        setSubscriptions(subRes.subscriptions || []);
        setPayments(subRes.payments || []);
        setNotifications(notifRes.notifications || []);
      })
      .catch((err) => console.error('Failed to load user account data', err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleMarkNotification = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const activeSub = subscriptions.find((s) => s.status === 'active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-sm text-blue-400">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{user.name}</h3>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6">
          <button
            onClick={() => setActiveTab('access')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'access'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Access & Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Payment Invoices ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition relative ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Notifications
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[10px]">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'access' && (
            <div className="space-y-6">
              {/* Current Status Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/50 to-slate-950 border border-blue-800/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                      Current Subscription
                    </span>
                    <h4 className="text-xl font-extrabold text-white mt-0.5">
                      {user.role === 'admin'
                        ? 'Administrator (Full Access)'
                        : activeSub
                        ? `${activeSub.planName} Plan`
                        : 'Free Tier Explorer'}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onUpgradePlan();
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition shrink-0"
                  >
                    Upgrade / Renew Plan
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-blue-900/40 text-xs">
                  <div>
                    <span className="text-slate-400">Access Expiration:</span>
                    <p className="font-semibold text-white mt-0.5">
                      {user.role === 'admin'
                        ? 'Unlimited / Lifetime'
                        : activeSub
                        ? new Date(activeSub.expiryDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'Free tier only'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">AI Assistant Balance:</span>
                    <p className="font-semibold text-amber-400 mt-0.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {user.role === 'admin' ? 'Unlimited' : `${user.aiCredits} Queries`}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Access Level:</span>
                    <p className="font-semibold text-emerald-400 mt-0.5">
                      {user.role === 'admin' ? 'Master Premium' : user.accessLevel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscriptions History Table */}
              <div className="space-y-3">
                <h5 className="font-bold text-sm text-slate-200">Subscription History</h5>
                {subscriptions.length === 0 ? (
                  <p className="text-xs text-slate-400">No previous subscriptions recorded.</p>
                ) : (
                  <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950 text-slate-400">
                        <tr>
                          <th className="p-3">Plan</th>
                          <th className="p-3">Started</th>
                          <th className="p-3">Expires</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {subscriptions.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-semibold text-white">{s.planName}</td>
                            <td className="p-3 text-slate-400">
                              {new Date(s.startDate).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-slate-400">
                              {new Date(s.expiryDate).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  s.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
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
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h5 className="font-bold text-sm text-slate-200">Invoices & Transactions</h5>
              {payments.length === 0 ? (
                <p className="text-xs text-slate-400">No payment records found.</p>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Plan</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Gateway</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono text-slate-300">{p.orderId}</td>
                          <td className="p-3 text-white font-medium">{p.planName}</td>
                          <td className="p-3 font-bold text-slate-200">
                            {p.currency} {p.amount.toLocaleString()}
                          </td>
                          <td className="p-3 text-slate-400">{p.paymentGateway}</td>
                          <td className="p-3 text-slate-400">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.status === 'succeeded'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {p.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <h5 className="font-bold text-sm text-slate-200">System Notifications</h5>
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400">No notifications.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && handleMarkNotification(n.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                        n.read
                          ? 'bg-slate-950/50 border-slate-800 text-slate-400'
                          : 'bg-blue-950/20 border-blue-800/50 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
