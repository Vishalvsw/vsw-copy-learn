import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  Check,
  X,
  Loader2,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { api } from '../../api';
import { Plan } from '../../types';

interface AdminPlansProps {
  plans: Plan[];
  onRefresh: () => void;
}

export const AdminPlans: React.FC<AdminPlansProps> = ({ plans, onRefresh }) => {
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [featuresText, setFeaturesText] = useState('');

  const handleOpenCreate = () => {
    setEditingPlan({
      name: '',
      price: 999,
      originalPrice: 1499,
      discountPercentage: 33,
      currency: 'INR',
      duration: 1,
      durationUnit: 'Months',
      description: '',
      features: ['Access to ML Projects', 'Code Viewer Access', 'AI Assistant'],
      accessLevel: 'Starter',
      aiCredits: 50,
      isFeatured: false,
      status: 'active',
      displayOrder: plans.length + 1,
      couponEligibility: true
    });
    setFeaturesText('Access to ML Projects\nCode Viewer Access\nAI Assistant');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan({ ...plan });
    setFeaturesText((plan.features || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editingPlan.name) return;

    setLoading(true);
    const parsedFeatures = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      ...editingPlan,
      features: parsedFeatures,
      price: Number(editingPlan.price),
      duration: Number(editingPlan.duration),
      aiCredits: Number(editingPlan.aiCredits)
    };

    try {
      if (editingPlan.id) {
        await api.updatePlan(editingPlan.id, payload);
      } else {
        await api.createPlan(payload);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicatePlan(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate plan');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the "${name}" plan?`)) return;
    try {
      await api.deletePlan(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete plan');
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    const newStatus = plan.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updatePlan(plan.id, { status: newStatus });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle plan status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Dynamic Plan & Pricing Engine</h2>
          <p className="text-xs text-slate-400">
            Create unlimited subscription tiers. Changes take effect on the public pricing table instantly.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Plans Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`p-5 rounded-2xl bg-slate-900 border flex flex-col justify-between transition ${
              p.isFeatured
                ? 'border-blue-500/80 shadow-lg shadow-blue-950/50'
                : 'border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  {p.isFeatured && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      Featured
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleToggleStatus(p)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                    p.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {p.status.toUpperCase()}
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {p.currency === 'INR' ? '₹' : '$'}
                    {p.price.toLocaleString()}
                  </span>
                  {p.originalPrice && p.originalPrice > p.price && (
                    <span className="text-xs text-slate-500 line-through">
                      ₹{p.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-400 font-semibold mt-1">
                  Duration: {p.duration} {p.durationUnit} • Tier: {p.accessLevel}
                </p>
                <p className="text-xs text-amber-400 mt-0.5">
                  AI Credits: {p.aiCredits} queries
                </p>
              </div>

              <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                {p.description || 'No description provided.'}
              </p>

              {/* Features list snapshot */}
              <div className="space-y-1.5 mb-6 text-xs text-slate-300">
                {p.features.slice(0, 4).map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{f}</span>
                  </div>
                ))}
                {p.features.length > 4 && (
                  <span className="text-[11px] text-slate-400 pl-5">
                    +{p.features.length - 4} more features
                  </span>
                )}
              </div>
            </div>

            {/* Plan Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Order: #{p.displayOrder}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDuplicate(p.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Duplicate Plan"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition"
                  title="Edit Plan"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 transition"
                  title="Delete Plan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Plan Modal */}
      {isModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">
                {editingPlan.id ? `Edit Plan: ${editingPlan.name}` : 'Create Subscription Plan'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    placeholder="e.g. Professional"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Access Level</label>
                  <select
                    value={editingPlan.accessLevel || 'Starter'}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, accessLevel: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Starter">Starter Access (Entry Projects)</option>
                    <option value="Professional">Professional Access (Most ML Projects)</option>
                    <option value="Premium">Premium Access (Unrestricted Access)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingPlan.price ?? 799}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Original Price (Strike)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingPlan.originalPrice || ''}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    placeholder="e.g. 1999"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">AI Assistant Credits</label>
                  <input
                    type="number"
                    min="0"
                    value={editingPlan.aiCredits ?? 50}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, aiCredits: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Access Duration Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingPlan.duration ?? 30}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, duration: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Duration Unit</label>
                  <select
                    value={editingPlan.durationUnit || 'Months'}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, durationUnit: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Days">Days (e.g. 30 Days)</option>
                    <option value="Months">Months (e.g. 6 Months)</option>
                    <option value="Years">Years (e.g. 1 Year)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description Subtitle</label>
                <textarea
                  rows={2}
                  value={editingPlan.description || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  placeholder="Target developer audience description..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Features Included (One line per feature):
                </label>
                <textarea
                  rows={5}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Access to 40+ Projects&#10;Line-by-line Code Viewer&#10;FastAPI Deployment Blueprints"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!editingPlan.isFeatured}
                    onChange={(e) => setEditingPlan({ ...editingPlan, isFeatured: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Featured Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingPlan.status === 'active'}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        status: e.target.checked ? 'active' : 'inactive'
                      })
                    }
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Active Plan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingPlan.couponEligibility !== false}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, couponEligibility: e.target.checked })
                    }
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Allow Coupons</span>
                </label>

                <div>
                  <span className="text-slate-400 block text-[10px]">Display Order</span>
                  <input
                    type="number"
                    value={editingPlan.displayOrder ?? 1}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, displayOrder: Number(e.target.value) })
                    }
                    className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Plan Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
