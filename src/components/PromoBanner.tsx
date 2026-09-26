import React, { useState } from 'react';
import { Tag, ArrowRight, X } from 'lucide-react';
import { Banner } from '../types';

interface PromoBannerProps {
  banners: Banner[];
  onCtaClick: (url: string) => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ banners, onCtaClick }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !banners || banners.length === 0) return null;

  const currentBanner = banners[0];

  return (
    <aside
      aria-label="Promotional announcement"
      className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 border-b border-blue-800/40 text-white px-4 py-2 text-xs sm:text-sm relative z-30"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden">
          {currentBanner.badge && (
            <span className="shrink-0 font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {currentBanner.badge}
            </span>
          )}
          <span className="font-semibold text-slate-200 truncate">{currentBanner.title}</span>
          <span className="hidden md:inline text-slate-400">— {currentBanner.description}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {currentBanner.ctaText && (
            <button
              onClick={() => onCtaClick(currentBanner.ctaUrl || '#pricing')}
              className="font-bold text-blue-300 hover:text-white flex items-center gap-1 hover:underline transition"
            >
              <span>{currentBanner.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
