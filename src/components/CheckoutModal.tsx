import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Tag,
  ArrowRight,
  Loader2,
  CreditCard,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';
import { Plan, User } from '../types';

interface CheckoutModalProps {
  plan: Plan;
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPlanName: string) => void;
  onRequireAuth: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  user,
  isOpen,
  onClose,
  onSuccess,
  onRequireAuth
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);

  const [paymentGateway, setPaymentGateway] = useState<'Razorpay' | 'Stripe' | 'Simulation'>('Razorpay');
  const [processing, setProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    subscriptionId: string;
    expiryDate: string;
    amountPaid: number;
  } | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  if (!isOpen) return null;

  const currentPrice = appliedCoupon ? appliedCoupon.finalPrice : plan.price;
  const currentDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponValidating(true);
    setCouponError('');
    try {
      const res = await api.validateCoupon(couponCode.trim(), plan.id, plan.price);
      setAppliedCoupon(res);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setCouponValidating(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }

    setProcessing(true);
    setCheckoutError('');

    try {
      // 1. Create order on server
      const order = await api.createPaymentOrder(plan.id, appliedCoupon?.code);

      // 2. Complete payment verification server-side
      const verifyRes = await api.verifyAndSubscribe({
        orderId: order.orderId,
        planId: plan.id,
        couponCode: appliedCoupon?.code,
        paymentGatewayId: `pay_${paymentGateway.toLowerCase()}_${Date.now()}`,
        simulatedSuccess: true
      });

      setSuccessResult({
        subscriptionId: verifyRes.subscription.id,
        expiryDate: verifyRes.subscription.expiryDate,
        amountPaid: verifyRes.payment.amount
      });

      onSuccess(plan.name);
    } catch (err: any) {
      setCheckoutError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Subscribe to {plan.name}</h3>
              <p className="text-xs text-slate-400">
                {plan.duration} {plan.durationUnit} Full Online Access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {successResult ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-extrabold text-white">Payment Succeeded!</h4>
              <p className="text-sm text-slate-300 max-w-sm mx-auto">
                Your <strong>{plan.name}</strong> subscription is now active. All code viewers and AI assistants are unlocked until{' '}
                <strong className="text-white">
                  {new Date(successResult.expiryDate).toLocaleDateString()}
                </strong>.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-left space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Subscription ID:</span>
                  <span className="font-mono text-slate-200">{successResult.subscriptionId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Amount Paid:</span>
                  <span className="font-bold text-white">
                    {plan.currency} {successResult.amountPaid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>AI Queries Added:</span>
                  <span className="font-bold text-amber-400">+{plan.aiCredits} Credits</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition"
              >
                Go to Project Library
              </button>
            </div>
          ) : (
            <>
              {/* Plan Summary Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">{plan.name} Access Plan</h4>
                  <p className="text-xs text-slate-400">
                    Duration: {plan.duration} {plan.durationUnit} • {plan.aiCredits} AI Assistant Queries
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white">
                    ₹{plan.price.toLocaleString()}
                  </span>
                  {plan.originalPrice && plan.originalPrice > plan.price && (
                    <p className="text-xs text-slate-500 line-through">
                      ₹{plan.originalPrice.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Coupon Code Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  Have a Discount Coupon?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Try code WELCOME20"
                    disabled={couponValidating || appliedCoupon !== null}
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white uppercase placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                      }}
                      className="px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl border border-rose-500/30 transition"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponValidating || !couponCode.trim()}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                    >
                      {couponValidating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  )}
                </div>

                {couponError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {couponError}
                  </p>
                )}

                {appliedCoupon && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Coupon '{appliedCoupon.code}' applied! Saved ₹{appliedCoupon.discountAmount}.
                  </p>
                )}
              </div>

              {/* Payment Gateway Configuration */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('Razorpay')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      paymentGateway === 'Razorpay'
                        ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs">Razorpay</span>
                    <span className="text-[10px] text-slate-400">UPI & Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentGateway('Stripe')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      paymentGateway === 'Stripe'
                        ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs">Stripe</span>
                    <span className="text-[10px] text-slate-400">Global Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentGateway('Simulation')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      paymentGateway === 'Simulation'
                        ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs">Instant Test</span>
                    <span className="text-[10px] text-emerald-400">1-Click Demo</span>
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Plan Base Price</span>
                  <span>₹{plan.price.toLocaleString()}</span>
                </div>
                {currentDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{currentDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-extrabold text-white">
                  <span>Total Amount Due</span>
                  <span className="text-blue-400">₹{currentPrice.toLocaleString()}</span>
                </div>
              </div>

              {checkoutError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="button"
                  onClick={handleCompletePayment}
                  disabled={processing}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 text-sm"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Granting Access...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{currentPrice.toLocaleString()} & Activate Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Encrypted 256-bit checkout • Instant activation
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
