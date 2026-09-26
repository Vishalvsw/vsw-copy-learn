import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Percent, DollarSign, X, Loader2 } from 'lucide-react';
import { api } from '../../api';
import { Coupon, Plan } from '../../types';

interface AdminCouponsProps {
  coupons: Coupon[];
  plans: Plan[];
  onRefresh: () => void;
}

export const AdminCoupons: React.FC<AdminCouponsProps> = ({ coupons, plans, onRefresh }) => {
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenCreate = () => {
    setEditingCoupon({
      code: '',
      discountType: 'Percentage',
      discountValue: 20,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxUses: 500,
      perUserLimit: 1,
      applicablePlanIds: [],
      minAmount: 0,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon({
      ...c,
      startDate: c.startDate ? c.startDate.split('T')[0] : '',
      endDate: c.endDate ? c.endDate.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !editingCoupon.code) return;

    setLoading(true);
    const payload = {
      ...editingCoupon,
      code: editingCoupon.code.toUpperCase().trim(),
      discountValue: Number(editingCoupon.discountValue),
      maxUses: Number(editingCoupon.maxUses),
      minAmount: Number(editingCoupon.minAmount)
    };

    try {
      if (editingCoupon.id) {
        await api.updateCoupon(editingCoupon.id, payload);
      } else {
        await api.createCoupon(payload);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.deleteCoupon(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Promotional Discount Coupons</h2>
          <p className="text-xs text-slate-400">
            Configure percentage or fixed deductions, redemption ceilings, minimum cart thresholds, and expiry limits.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-black text-lg text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                  {c.code}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    c.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {c.status.toUpperCase()}
                </span>
              </div>

              <div className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                {c.discountType === 'Percentage' ? (
                  <>
                    <Percent className="w-4 h-4 text-blue-400" />
                    <span>{c.discountValue}% Off Total Order</span>
                  </>
                ) : (
                  <>
                    <span className="font-mono">₹{c.discountValue}</span>
                    <span>Flat Cash Discount</span>
                  </>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-400 mb-4">
                <p>
                  Used: <strong className="text-white">{c.usedCount || 0}</strong> / {c.maxUses} times
                </p>
                <p>
                  Valid until: {new Date(c.endDate).toLocaleDateString()}
                </p>
                {c.minAmount > 0 && (
                  <p>Min order requirement: ₹{c.minAmount}</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleOpenEdit(c)}
                className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(c.id, c.code)}
                className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">
                {editingCoupon.id ? `Edit Coupon: ${editingCoupon.code}` : 'Create Discount Coupon'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={editingCoupon.code || ''}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. SUMMER25"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white uppercase font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Discount Type</label>
                  <select
                    value={editingCoupon.discountType || 'Percentage'}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, discountType: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Discount Value {editingCoupon.discountType === 'Percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={editingCoupon.discountType === 'Percentage' ? 100 : 10000}
                    value={editingCoupon.discountValue ?? 20}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Maximum Uses</label>
                  <input
                    type="number"
                    min="1"
                    value={editingCoupon.maxUses ?? 500}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, maxUses: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editingCoupon.startDate || ''}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editingCoupon.endDate || ''}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCoupon.minAmount ?? 0}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, minAmount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Status</label>
                  <select
                    value={editingCoupon.status || 'active'}
                    onChange={(e) =>
                      setEditingCoupon({ ...editingCoupon, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Coupon</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
