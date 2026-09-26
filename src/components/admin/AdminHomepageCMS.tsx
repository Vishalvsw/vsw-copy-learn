import React, { useState } from 'react';
import { Save, Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';
import { HomepageCMS } from '../../types';

interface AdminHomepageCMSProps {
  homepage: HomepageCMS;
  onRefresh: () => void;
}

export const AdminHomepageCMS: React.FC<AdminHomepageCMSProps> = ({ homepage, onRefresh }) => {
  const [formData, setFormData] = useState<HomepageCMS>(homepage);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await api.updateAdminHomepage(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update homepage content');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaq = () => {
    setFormData({
      ...formData,
      faq: [
        ...(formData.faq || []),
        { question: 'New frequently asked question?', answer: 'Answer explanation here.' }
      ]
    });
  };

  const handleRemoveFaq = (idx: number) => {
    const updated = formData.faq.filter((_, i) => i !== idx);
    setFormData({ ...formData, faq: updated });
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Dynamic Homepage Content (CMS)</h2>
          <p className="text-xs text-slate-400">
            Edit live marketing copy, slogans, hero buttons, and FAQs without touching source code.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Publish Changes to Public Site</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Homepage content updated successfully! The changes are now live.</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400">
          Hero Section Headline & CTAs
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Brand Tagline</label>
            <input
              type="text"
              value={formData.hero.brandTagline}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hero: { ...formData.hero, brandTagline: e.target.value }
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Stats Ribbon Badge</label>
            <input
              type="text"
              value={formData.hero.statsBadge}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hero: { ...formData.hero, statsBadge: e.target.value }
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-300 block mb-1">Hero Title (Main Tagline)</label>
          <input
            type="text"
            value={formData.hero.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                hero: { ...formData.hero, title: e.target.value }
              })
            }
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-black text-sm"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-300 block mb-1">Hero Subtitle</label>
          <textarea
            rows={2}
            value={formData.hero.subtitle}
            onChange={(e) =>
              setFormData({
                ...formData,
                hero: { ...formData.hero, subtitle: e.target.value }
              })
            }
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Primary Button Text</label>
            <input
              type="text"
              value={formData.hero.primaryCtaText}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hero: { ...formData.hero, primaryCtaText: e.target.value }
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Secondary Button Text</label>
            <input
              type="text"
              value={formData.hero.secondaryCtaText}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hero: { ...formData.hero, secondaryCtaText: e.target.value }
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
            />
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400">
            Frequently Asked Questions (FAQ)
          </h3>
          <button
            type="button"
            onClick={handleAddFaq}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold rounded-lg flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add FAQ</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.faq.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => {
                    const updated = [...formData.faq];
                    updated[idx].question = e.target.value;
                    setFormData({ ...formData, faq: updated });
                  }}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(idx)}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                rows={2}
                value={item.answer}
                onChange={(e) => {
                  const updated = [...formData.faq];
                  updated[idx].answer = e.target.value;
                  setFormData({ ...formData, faq: updated });
                }}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Copy */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400">
          Footer Branding & Legal Copy
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Company Entity</label>
            <input
              type="text"
              value={formData.footer.companyName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  footer: { ...formData.footer, companyName: e.target.value }
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Contact Email</label>
            <input
              type="email"
              value={formData.footer.contactEmail}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  footer: { ...formData.footer, contactEmail: e.target.value }
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-300 block mb-1">Legal Disclaimer</label>
          <textarea
            rows={2}
            value={formData.footer.disclaimer}
            onChange={(e) =>
              setFormData({
                ...formData,
                footer: { ...formData.footer, disclaimer: e.target.value }
              })
            }
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
          />
        </div>
      </div>
    </form>
  );
};
