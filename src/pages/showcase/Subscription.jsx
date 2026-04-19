import { useState } from "react";
import { Check, Zap, Shield, Crown, Gem, Star, ArrowRight, Sparkles } from "lucide-react";
import PaymentResult from "./PaymentResult.jsx";

// ─── Plan Data ────────────────────────────────────────────────────────────────
const PLANS = [
    {
        id: "gold",
        name: "Gold",
        tagline: "Essential Access",
        price: "499,000",
        priceRaw: 499000,
        period: "/ month",
        icon: Star,
        accentClass: "text-amber-500",
        borderClass: "border-amber-200",
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
        btnClass:
            "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50",
        popular: false,
        features: [
            "Unlimited gym floor access",
            "2 group classes / week",
            "Locker room access",
            "Basic fitness tracking",
            "Member mobile app",
            "—",
            "—",
        ],
    },
    {
        id: "platinum",
        name: "Platinum",
        tagline: "Most Popular",
        price: "1,500,000",
        priceRaw: 1500000,
        period: "/ month",
        icon: Shield,
        accentClass: "text-slate-600",
        borderClass: "border-slate-900",
        badgeBg: "bg-slate-900 text-white border-slate-900",
        btnClass:
            "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20",
        popular: true,
        features: [
            "Unlimited gym floor access",
            "Unlimited group classes",
            "Premium locker + towel service",
            "Advanced AI workout planner",
            "Member mobile app",
            "1 personal training session / mo",
            "Nutrition consultation",
        ],
    },
    {
        id: "diamond",
        name: "Diamond",
        tagline: "Elite Concierge",
        price: "3,200,000",
        priceRaw: 3200000,
        period: "/ month",
        icon: Gem,
        accentClass: "text-cyan-600",
        borderClass: "border-cyan-200",
        badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
        btnClass:
            "border border-cyan-300 text-cyan-700 hover:border-cyan-400 hover:bg-cyan-50",
        popular: false,
        features: [
            "Unlimited gym floor access",
            "Unlimited group classes",
            "VIP suite + spa access",
            "Advanced AI workout planner",
            "Dedicated concierge app",
            "Unlimited personal training",
            "Full dietitian program",
        ],
    },
];

// ─── Feature Row ─────────────────────────────────────────────────────────────
function FeatureRow({ text, active }) {
    if (text === "—")
        return (
            <li className="flex items-center gap-3 py-1.5">
        <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
          <span className="w-3 h-px bg-slate-200 block" />
        </span>
                <span className="text-sm text-slate-300">Not included</span>
            </li>
        );
    return (
        <li className="flex items-center gap-3 py-1.5">
      <span className="w-4 h-4 flex-shrink-0 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
        <Check size={9} className="text-emerald-600 stroke-[3]" />
      </span>
            <span className="text-sm text-slate-600">{text}</span>
        </li>
    );
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────
function PricingCard({ plan, onSelect }) {
    const Icon = plan.icon;
    return (
        <div
            className={`relative flex flex-col rounded-2xl border-2 bg-white transition-all duration-300
        ${plan.popular ? "border-slate-900 shadow-2xl shadow-slate-900/10 scale-[1.02] z-10" : `${plan.borderClass} shadow-sm hover:shadow-lg hover:-translate-y-0.5`}
      `}
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
            {/* Popular ribbon */}
            {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
            <Sparkles size={9} className="fill-white" />
            Most Popular
          </span>
                </div>
            )}

            <div className="p-7">
                {/* Tier header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-3 ${plan.badgeBg}`}>
                            <Icon size={9} />
                            {plan.tagline}
                        </div>
                        <h3 className={`text-2xl font-black tracking-tight ${plan.popular ? "text-slate-900" : "text-slate-800"}`}>
                            {plan.name}
                        </h3>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? "bg-slate-900" : "bg-slate-50 border border-slate-100"}`}>
                        <Icon size={18} className={plan.popular ? "text-white" : plan.accentClass} />
                    </div>
                </div>

                {/* Price */}
                <div className="mb-7 pb-7 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-semibold text-slate-400">₫</span>
                        <span className="text-4xl font-black text-slate-900 tracking-tight">{plan.price}</span>
                        <span className="text-sm text-slate-400 font-medium ml-0.5">{plan.period}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">Billed monthly · Cancel anytime</p>
                </div>

                {/* Features */}
                <ul className="space-y-0.5 mb-8">
                    {plan.features.map((f, i) => (
                        <FeatureRow key={i} text={f} active={f !== "—"} />
                    ))}
                </ul>

                {/* CTA */}
                <button
                    onClick={() => onSelect(plan)}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-200 ${plan.btnClass}`}
                >
                    Pay with VNPay
                    <ArrowRight size={14} />
                </button>
            </div>

            {/* Bottom accent for popular */}
            {plan.popular && (
                <div className="h-1 w-full rounded-b-2xl bg-gradient-to-r from-slate-700 via-slate-900 to-slate-700" />
            )}
        </div>
    );
}

// ─── Main Subscription View ───────────────────────────────────────────────────
export default function Subscription() {
    const [selectedPlan, setSelectedPlan] = useState(null);

    if (selectedPlan) {
        return (
            <Paymentresults
                plan={selectedPlan}
                onBack={() => setSelectedPlan(null)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {/* Fine grid background */}
            <div
                className="fixed inset-0 opacity-[0.4] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16">
                {/* Page header */}
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-xs font-semibold px-4 py-2 rounded-full shadow-sm mb-6 tracking-wide">
                        <Crown size={12} className="text-amber-500" />
                        FitLife Premium Membership
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
                        Invest in your<br />
                        <span className="relative">
              best self
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-amber-400/60 rounded-full" />
            </span>
                    </h1>
                    <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed">
                        Transparent pricing. No hidden fees. Secure payment via VNPay with HMAC SHA-512 verification.
                    </p>

                    {/* Trust bar */}
                    <div className="flex items-center justify-center gap-6 mt-7 flex-wrap">
                        {["256-bit SSL", "VNPay Secured", "Cancel Anytime"].map((t) => (
                            <span key={t} className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Check size={11} className="text-emerald-500 stroke-[3]" />
                                {t}
              </span>
                        ))}
                    </div>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {PLANS.map((plan) => (
                        <PricingCard key={plan.id} plan={plan} onSelect={setSelectedPlan} />
                    ))}
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-slate-400 mt-10 leading-relaxed">
                    All prices include 10% VAT. Membership auto-renews monthly until cancelled.
                    <br />
                    By subscribing you agree to FitLife's <span className="underline cursor-pointer hover:text-slate-600">Terms of Service</span> and <span className="underline cursor-pointer hover:text-slate-600">Privacy Policy</span>.
                </p>
            </div>
        </div>
    );
}