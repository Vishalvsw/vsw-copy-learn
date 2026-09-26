import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Megaphone, X, Loader2 } from 'lucide-react';
import { api } from '../../api';
import { Banner } from '../../types';

interface AdminBannersProps {
  banners: Banner[];
  onRefresh: () => void;
}

export const AdminBanners: React.FC<AdminBannersProps> = ({ banners, onRefresh }) => {
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenCreate = () => {
    setEditingBanner({
      title: 'Special Launch Offer: Get 20% Off With WELCOME20',
      description: 'Unlock 40+ production machine learning projects.',
      badge: 'LIMITED OFFER',
      ctaText: 'View Plans',
      ctaUrl: '#pricing',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner({
      ...b,
      startDate: b.startDate ? b.startDate.split('T')[0] : '',
      endDate: b.endDate ? b.endDate.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner || !editingBanner.title) return;

    setLoading(true);
    try {
      if (editingBanner.id) {
        await api.updateBanner(editingBanner.id, editingBanner);
      } else {
        await api.createBanner(editingBanner);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete banner "${title}"?`)) return;
    try {
      await api.deleteBanner(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Promotional Notification Banners</h2>
          <p className="text-xs text-slate-400">
            Schedule top announcement bars to promote new ML projects, flash discounts, or platform news.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 border border-blue-700/50">
                  {b.badge || 'PROMO'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    b.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {b.status.toUpperCase()}
                </span>
              </div>

              <h3 className="font-bold text-sm text-white mb-1">{b.title}</h3>
              <p className="text-xs text-slate-400 mb-2">{b.description}</p>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p>
                  CTA: <strong className="text-blue-400">{b.ctaText}</strong> ({b.ctaUrl})
                </p>
                <p>
                  Schedule: {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleOpenEdit(b)}
                className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(b.id, b.title)}
                className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">
                {editingBanner.id ? 'Edit Banner' : 'Create Banner'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Banner Title</label>
                <input
                  type="text"
                  required
                  value={editingBanner.title || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description Subtext</label>
                <input
                  type="text"
                  value={editingBanner.description || ''}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingBanner.badge || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                    placeholder="e.g. FLASH SALE"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Status</label>
                  <select
                    value={editingBanner.status || 'active'}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">CTA Label</label>
                  <input
                    type="text"
                    value={editingBanner.ctaText || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">CTA Link (URL)</label>
                  <input
                    type="text"
                    value={editingBanner.ctaUrl || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editingBanner.startDate || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={editingBanner.endDate || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Banner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
