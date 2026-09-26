import React, { useState } from 'react';
import { Save, ShieldCheck, Key, CreditCard, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../../api';
import { PaymentGatewayConfig, SiteSettings } from '../../types';

interface AdminSettingsProps {
  settings: SiteSettings;
  gatewayConfig: PaymentGatewayConfig;
  onRefresh: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  gatewayConfig,
  onRefresh
}) => {
  const [siteForm, setSiteForm] = useState<SiteSettings>(settings);
  const [gatewayForm, setGatewayForm] = useState<PaymentGatewayConfig>(gatewayConfig);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      await api.updateAdminSettings({
        settings: siteForm,
        gatewayConfig: gatewayForm
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Payment Gateway & System Configuration</h2>
          <p className="text-xs text-slate-400">
            Configure live payment provider keys, test mode, and global platform parameters.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save System Settings</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Payment configuration and site settings safely updated!</span>
        </div>
      )}

      {/* Payment Gateway Abstraction Configuration */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-white">Payment Abstraction Engine</h3>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/40">
            Multi-Gateway Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Active Gateway</label>
            <select
              value={gatewayForm.activeGateway}
              onChange={(e) =>
                setGatewayForm({ ...gatewayForm, activeGateway: e.target.value as any })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
            >
              <option value="Razorpay">Razorpay (Recommended for India & UPI)</option>
              <option value="Stripe">Stripe (Global Cards)</option>
              <option value="Simulation">Simulation Sandbox (1-Click Instant Test)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Billing Currency</label>
            <input
              type="text"
              value={gatewayForm.currency}
              onChange={(e) => setGatewayForm({ ...gatewayForm, currency: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white uppercase font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Environment Mode</label>
            <select
              value={gatewayForm.testMode ? 'true' : 'false'}
              onChange={(e) =>
                setGatewayForm({ ...gatewayForm, testMode: e.target.value === 'true' })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold"
            >
              <option value="true">Test Mode (Sandbox / No Real Money)</option>
              <option value="false">Live Production Mode</option>
            </select>
          </div>
        </div>

        {/* Razorpay Parameters */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200">Razorpay Credentials (India)</span>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-[11px]">
              <input
                type="checkbox"
                checked={gatewayForm.razorpay.enabled}
                onChange={(e) =>
                  setGatewayForm({
                    ...gatewayForm,
                    razorpay: { ...gatewayForm.razorpay, enabled: e.target.checked }
                  })
                }
                className="rounded text-blue-600 focus:ring-0"
              />
              <span>Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-0.5">Razorpay Key ID</label>
              <input
                type="text"
                value={gatewayForm.razorpay.keyId}
                onChange={(e) =>
                  setGatewayForm({
                    ...gatewayForm,
                    razorpay: { ...gatewayForm.razorpay, keyId: e.target.value }
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-0.5">Razorpay Key Secret</label>
              <input
                type="password"
                value={gatewayForm.razorpay.keySecret}
                onChange={(e) =>
                  setGatewayForm({
                    ...gatewayForm,
                    razorpay: { ...gatewayForm.razorpay, keySecret: e.target.value }
                  })
                }
                placeholder="Keep empty to preserve existing secret"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Stripe Parameters */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200">Stripe Global Credentials</span>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-[11px]">
              <input
                type="checkbox"
                checked={gatewayForm.stripe.enabled}
                onChange={(e) =>
                  setGatewayForm({
                    ...gatewayForm,
                    stripe: { ...gatewayForm.stripe, enabled: e.target.checked }
                  })
                }
                className="rounded text-blue-600 focus:ring-0"
              />
              <span>Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-0.5">Publishable Key</label>
              <input
                type="text"
                value={gatewayForm.stripe.publishableKey}
                onChange={(e) =>
                  setGatewayForm({
                    ...gatewayForm,
                    stripe: { ...gatewayForm.stripe, publishableKey: e.target.value }
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-0.5">Secret Key</label>
              <input
                type="password"
                value={gatewayForm.stripe.secretKey}
                onChange={(e) =>
                  setGatewayForm({
                    ...gatewayForm,
                    stripe: { ...gatewayForm.stripe, secretKey: e.target.value }
                  })
                }
                placeholder="Keep empty to preserve existing secret"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Platform Branding Settings */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400">
          Global Branding & Platform Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Site Title</label>
            <input
              type="text"
              value={siteForm.siteName}
              onChange={(e) => setSiteForm({ ...siteForm, siteName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Parent Brand</label>
            <input
              type="text"
              value={siteForm.brandName}
              onChange={(e) => setSiteForm({ ...siteForm, brandName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Tagline</label>
            <input
              type="text"
              value={siteForm.tagline}
              onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Support Email</label>
            <input
              type="email"
              value={siteForm.supportEmail}
              onChange={(e) => setSiteForm({ ...siteForm, supportEmail: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={siteForm.allowSignups}
              onChange={(e) => setSiteForm({ ...siteForm, allowSignups: e.target.checked })}
              className="rounded text-blue-600 focus:ring-0"
            />
            <span>Allow Public Registrations</span>
          </label>
        </div>
      </div>
    </form>
  );
};
