import React from 'react';
import { Check, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { Plan } from '../types';

interface DynamicPricingProps {
  plans: Plan[];
  currencySymbol?: string;
  onSelectPlan: (plan: Plan) => void;
  currentUserPlan?: string;
}

export const DynamicPricing: React.FC<DynamicPricingProps> = ({
  plans,
  currencySymbol = '₹',
  onSelectPlan,
  currentUserPlan
}) => {
  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        Loading dynamic plan offerings...
      </div>
    );
  }

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Transparent Developer Access
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          One Subscription. Complete Machine Learning Library.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-400">
          Gain unrestricted online access to clean source code, architectural blueprints, dataset guides, and in-depth AI assistance. No hidden lock-ins.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isFeatured = plan.isFeatured;
          const isCurrent = Boolean(currentUserPlan && currentUserPlan.toLowerCase().includes(plan.name.toLowerCase()));

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                isFeatured
                  ? 'bg-gradient-to-b from-blue-950/70 via-slate-900 to-slate-950 border-2 border-blue-500 shadow-2xl shadow-blue-900/30 scale-100 lg:-translate-y-2'
                  : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              } p-6 sm:p-8`}
            >
              {/* Featured Ribbon */}
              {isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-bold tracking-wide uppercase shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Most Popular Choice
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {plan.duration} {plan.durationUnit}
                  </span>
                </div>

                <p className="text-sm text-slate-400 min-h-[40px] mb-6">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      {currencySymbol}{plan.price.toLocaleString()}
                    </span>
                    {plan.originalPrice && plan.originalPrice > plan.price && (
                      <span className="text-lg text-slate-500 line-through">
                        {currencySymbol}{plan.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {plan.discountPercentage && plan.discountPercentage > 0 ? (
                    <div className="mt-2 inline-block px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                      Save {plan.discountPercentage}% Limited Offer
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-slate-400 font-medium">
                      Billed for full {plan.duration} {plan.durationUnit}
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    What's Included:
                  </p>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}

                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      <strong className="text-white font-semibold">{plan.aiCredits}</strong> Project AI Assistant Queries
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div>
                <button
                  onClick={() => onSelectPlan(plan)}
                  disabled={isCurrent}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 cursor-default'
                      : isFeatured
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-4 h-4" />
                      Active Subscription
                    </>
                  ) : (
                    <>
                      <span>Get {plan.name} Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2.5 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3 text-slate-400" />
                  Instant access • Secure payments
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
