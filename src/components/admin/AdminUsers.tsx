import React, { useState } from 'react';
import {
  Users,
  Search,
  Shield,
  CreditCard,
  Calendar,
  PlusCircle,
  Ban,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Loader2
} from 'lucide-react';
import { api } from '../../api';
import { Plan } from '../../types';

interface AdminUsersProps {
  users: any[];
  plans: Plan[];
  onRefresh: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, plans, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Manual access modal state
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [targetPlanId, setTargetPlanId] = useState(plans[0]?.id || '');
  const [additionalDays, setAdditionalDays] = useState(30);
  const [customDate, setCustomDate] = useState('');
  const [grantMode, setGrantMode] = useState<'days' | 'custom'>('days');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggleSuspend = async (user: any) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const confirmMsg =
      nextStatus === 'suspended'
        ? `Are you sure you want to suspend ${user.email}? They will not be able to log in.`
        : `Re-activate account for ${user.email}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.setUserStatus(user.id, nextStatus);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleOpenGrantModal = (user: any) => {
    setSelectedUser(user);
    setTargetPlanId(plans[0]?.id || '');
    setAdditionalDays(30);
    setCustomDate('');
    setNotes('');
    setIsAccessModalOpen(true);
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);
    try {
      await api.grantUserAccess(selectedUser.id, {
        planId: targetPlanId,
        additionalDays: grantMode === 'days' ? additionalDays : undefined,
        customExpiryDate: grantMode === 'custom' ? customDate : undefined,
        notes
      });
      setIsAccessModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to grant access');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (user: any) => {
    if (!window.confirm(`Revoke all active subscription access for ${user.email}?`)) return;

    try {
      await api.revokeUserAccess(user.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke access');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white">User Accounts & Manual Access Control</h2>
        <p className="text-xs text-slate-400">
          Manage engineer accounts, inspect subscriptions, manually grant/extend plan days, and enforce suspensions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-40 px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40 px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Current Plan</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4">AI Credits</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Access Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div>
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">{u.currentPlan}</td>
                  <td className="p-4 text-slate-400">
                    {u.planExpiry
                      ? new Date(u.planExpiry).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'None'}
                  </td>
                  <td className="p-4 font-mono text-amber-400">{u.aiCredits}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenGrantModal(u)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold flex items-center gap-1 transition"
                        title="Grant or extend access"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Grant/Extend</span>
                      </button>

                      <button
                        onClick={() => handleRevokeAccess(u)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                        title="Revoke subscription"
                      >
                        Revoke
                      </button>

                      <button
                        onClick={() => handleToggleSuspend(u)}
                        className={`p-1.5 rounded-lg transition ${
                          u.status === 'suspended'
                            ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                            : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30'
                        }`}
                        title={u.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                      >
                        {u.status === 'suspended' ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Access Grant Modal */}
      {isAccessModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Manual Access Control</h3>
                <p className="text-xs text-slate-400">Target User: {selectedUser.email}</p>
              </div>
              <button
                onClick={() => setIsAccessModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrantAccess} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Select Access Plan</label>
                <select
                  value={targetPlanId}
                  onChange={(e) => setTargetPlanId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 font-semibold"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.accessLevel} Tier) — Default {p.duration} {p.durationUnit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Extension Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGrantMode('days')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                      grantMode === 'days'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-700'
                    }`}
                  >
                    Add Days (+30 / +90)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrantMode('custom')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                      grantMode === 'custom'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-700'
                    }`}
                  >
                    Set Custom Expiry Date
                  </button>
                </div>
              </div>

              {grantMode === 'days' ? (
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Number of Days to Extend
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setAdditionalDays(30)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                        additionalDays === 30
                          ? 'bg-blue-950 text-blue-300 border-blue-600'
                          : 'bg-slate-950 text-slate-400 border-slate-700'
                      }`}
                    >
                      +30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdditionalDays(90)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                        additionalDays === 90
                          ? 'bg-blue-950 text-blue-300 border-blue-600'
                          : 'bg-slate-950 text-slate-400 border-slate-700'
                      }`}
                    >
                      +90 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdditionalDays(365)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                        additionalDays === 365
                          ? 'bg-blue-950 text-blue-300 border-blue-600'
                          : 'bg-slate-950 text-slate-400 border-slate-700'
                      }`}
                    >
                      +1 Year (365d)
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={additionalDays}
                    onChange={(e) => setAdditionalDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Custom Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Audit Notes / Reason</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. VIP partner courtesy extension, scholarship grant"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccessModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Grant Access & Log Audit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
