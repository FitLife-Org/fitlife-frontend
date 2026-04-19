import { CheckCircle2, ShieldCheck, Copy, ArrowLeft, Download, Home } from "lucide-react";
import { useState } from "react";

// ─── Mock transaction generator ───────────────────────────────────────────────
function genTxnId() {
    const prefix = "VNP";
    const ts = Date.now().toString().slice(-8);
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${ts}${rand}`;
}

const MOCK_TXN = {
    id: genTxnId(),
    orderId: `FL-${Math.floor(100000 + Math.random() * 900000)}`,
    bank: "VCB – Vietcombank",
    method: "ATM / Internet Banking",
    date: new Date().toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
    }),
    responseCode: "00",
    checksum: "HMAC-SHA512",
};

// ─── Detail Row ───────────────────────────────────────────────────────────────
function DetailRow({ label, value, mono = false, highlight = false }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
            <div className="flex items-center gap-2">
        <span
            className={`text-sm font-semibold ${mono ? "font-mono tracking-wide" : ""} ${highlight ? "text-emerald-600" : "text-slate-800"}`}
        >
          {value}
        </span>
                {mono && (
                    <button
                        onClick={handleCopy}
                        className="text-slate-300 hover:text-slate-500 transition-colors"
                        title="Copy"
                    >
                        {copied ? (
                            <span className="text-[10px] text-emerald-500 font-bold">Copied!</span>
                        ) : (
                            <Copy size={12} />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── PaymentResult ─────────────────────────────────────────────────────────────
export default function PaymentResult({ plan, onBack }) {
    const amount = plan ? `${plan.price} VND` : "1,500,000 VND";
    const planName = plan ? `FitLife ${plan.name}` : "FitLife Platinum";

    return (
        <div
            className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12"
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
            {/* Fine grid */}
            <div
                className="fixed inset-0 opacity-[0.35] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative w-full max-w-md">
                {/* Back link */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mb-6 transition-colors font-medium"
                    >
                        <ArrowLeft size={13} /> Back to plans
                    </button>
                )}

                {/* Main card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/8 overflow-hidden">

                    {/* Success header */}
                    <div className="relative bg-gradient-to-b from-emerald-50 to-white px-8 pt-10 pb-8 text-center">
                        {/* Subtle ring decoration */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />

                        {/* Large checkmark */}
                        <div className="relative inline-flex items-center justify-center mb-5">
                            <div className="absolute w-24 h-24 rounded-full bg-emerald-100 animate-ping opacity-20" />
                            <div className="absolute w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100" />
                            <CheckCircle2
                                size={56}
                                className="relative text-emerald-500"
                                strokeWidth={1.5}
                            />
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                            Payment Successful
                        </h2>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                            Your <span className="font-semibold text-slate-700">{planName}</span> membership is now active. A confirmation has been sent to your email.
                        </p>

                        {/* Amount pill */}
                        <div className="inline-flex items-baseline gap-1.5 mt-5 bg-emerald-600 text-white px-6 py-2.5 rounded-2xl shadow-md shadow-emerald-600/25">
                            <span className="text-sm font-semibold opacity-80">₫</span>
                            <span className="text-2xl font-black tracking-tight">{amount.replace(" VND", "")}</span>
                            <span className="text-xs font-semibold opacity-70 ml-0.5">VND</span>
                        </div>
                    </div>

                    {/* Transaction details */}
                    <div className="px-8 pb-2 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                            Transaction Details
                        </p>
                    </div>

                    <div className="px-8 pb-6">
                        <DetailRow label="Transaction ID" value={MOCK_TXN.id} mono />
                        <DetailRow label="Order ID" value={MOCK_TXN.orderId} mono />
                        <DetailRow label="Amount" value={`₫ ${amount}`} highlight />
                        <DetailRow label="Plan" value={planName} />
                        <DetailRow label="Bank" value={MOCK_TXN.bank} />
                        <DetailRow label="Method" value={MOCK_TXN.method} />
                        <DetailRow label="Date & Time" value={MOCK_TXN.date} />
                        <DetailRow label="Response Code" value={`${MOCK_TXN.responseCode} – Approved`} highlight />
                    </div>

                    {/* Action buttons */}
                    <div className="px-8 pb-7 grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl py-3 hover:border-slate-300 hover:bg-slate-50 transition-all">
                            <Download size={14} /> Receipt
                        </button>
                        <button className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-slate-900 rounded-xl py-3 hover:bg-slate-800 transition-all shadow-md shadow-slate-900/15">
                            <Home size={14} /> Dashboard
                        </button>
                    </div>

                    {/* Security badge */}
                    <div className="mx-6 mb-6 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm flex-shrink-0">
                                <ShieldCheck size={18} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-700 leading-snug">
                                    Securely verified by HMAC SHA-512 Checksum
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                                    Payment integrity guaranteed · Powered by VNPay Gateway
                                </p>
                            </div>
                        </div>

                        {/* Checksum hash preview */}
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Signature Hash</p>
                            <p className="font-mono text-[10px] text-slate-400 break-all leading-relaxed select-all">
                                a3f8c2d1e9b047563...c8f2a1d7e4b0{MOCK_TXN.id.slice(-6).toLowerCase()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-slate-400 mt-5 leading-relaxed">
                    Need help? Contact <span className="underline cursor-pointer hover:text-slate-600">support@fitlife.vn</span> or call <span className="font-medium text-slate-600">1800 1234</span>
                </p>
            </div>

            <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
        </div>
    );
}