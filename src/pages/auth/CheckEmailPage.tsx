import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Loader2, Mail, RefreshCw, ArrowRight } from "lucide-react";

import { ROUTES } from "../../config/routes";
import { authService } from "../../features/auth/services/authService";

interface CheckEmailLocationState {
    email?: string;
}

export default function CheckEmailPage() {
    const location = useLocation();
    const state = location.state as CheckEmailLocationState | null;

    const [email, setEmail] = useState(state?.email ?? "");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResend = async () => {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Vui lòng nhập email đã đăng ký.");
            return;
        }

        try {
            setLoading(true);
            setMessage("");
            setError("");

            const responseMessage = await authService.resendVerificationEmail({
                email: normalizedEmail,
            });

            setMessage(responseMessage);
        } catch (requestError: unknown) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Không thể gửi lại email xác minh.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 selection:bg-fit-primary/20">
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fit-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-fit-blue/10 rounded-full blur-3xl opacity-50" />
            
            <section className="relative z-10 w-full max-w-md px-4">
                <div className="rounded-[2.5rem] border border-white bg-white/70 p-8 sm:p-10 text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                    
                    <div className="relative mx-auto flex h-24 w-24 items-center justify-center mb-8">
                        <div className="absolute inset-0 rounded-full bg-fit-primarySoft animate-ping opacity-75 duration-1000"></div>
                        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-fit-primarySoft border-[6px] border-white shadow-sm">
                            <Mail className="h-10 w-10 text-fit-primary" strokeWidth={2.5} />
                        </div>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        Kiểm tra hòm thư
                    </h1>
                    
                    <p className="mt-4 text-[15px] leading-relaxed text-slate-500 font-medium">
                        Chúng tôi đã gửi một liên kết xác minh đến email của bạn. Vui lòng kiểm tra để kích hoạt tài khoản FitLife.
                    </p>

                    <div className="mt-8 text-left">
                        <label
                            htmlFor="verification-email"
                            className="mb-2 block text-sm font-bold text-slate-700 ml-1"
                        >
                            Email đăng ký
                        </label>
                        <div className="relative">
                            <input
                                id="verification-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="member@example.com"
                                className="w-full rounded-2xl border-2 border-slate-100 bg-white/50 px-4 py-3.5 outline-none transition-all focus:border-fit-primary focus:bg-white focus:ring-4 focus:ring-fit-primarySoft text-slate-700 font-medium placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-left text-sm text-emerald-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                            <span className="font-medium leading-relaxed">{message}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-600 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="group mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-fit-primary px-4 py-3.5 font-bold text-white transition-all hover:bg-fit-primaryHover hover:shadow-lg hover:shadow-fit-primary/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Đang gửi lại...</span>
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-5 w-5 transition-transform group-hover:rotate-180 duration-500" />
                                <span>Gửi lại email xác minh</span>
                            </>
                        )}
                    </button>

                    <div className="mt-8">
                        <Link
                            to={ROUTES.LOGIN}
                            className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900"
                        >
                            Quay lại trang đăng nhập
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}