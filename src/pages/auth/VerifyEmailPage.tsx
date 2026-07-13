import { useState } from "react";
import {
    Link,
    useLocation,
} from "react-router-dom";

import {
    CheckCircle2,
    Loader2,
    Mail,
    RefreshCw,
} from "lucide-react";

import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";

interface CheckEmailLocationState {
    email?: string;
}

export default function CheckEmailPage() {
    const location = useLocation();

    const state =
        location.state as
            | CheckEmailLocationState
            | null;

    const [email, setEmail] = useState(
        state?.email ?? "",
    );

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleResend = async () => {
        const normalizedEmail =
            email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError(
                "Vui lòng nhập email đã đăng ký.",
            );
            return;
        }

        try {
            setLoading(true);
            setMessage("");
            setError("");

            const responseMessage =
                await authService
                    .resendVerificationEmail({
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
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1593079831268-3381b0c42369?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center px-4">
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[3px]" />

            <section className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-100">
                    <Mail className="h-10 w-10 text-sky-600" />
                </div>

                <h1 className="mt-6 text-3xl font-black text-slate-900">
                    Kiểm tra email
                </h1>

                <p className="mt-3 text-slate-600">
                    FitLife đã gửi liên kết xác minh
                    đến email của bạn.
                </p>

                <div className="mt-6">
                    <label
                        htmlFor="verification-email"
                        className="mb-2 block text-left text-sm font-bold text-slate-700"
                    >
                        Email đăng ký
                    </label>

                    <input
                        id="verification-email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        placeholder="member@example.com"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    />
                </div>

                {message && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-left text-sm text-green-700">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                {error && (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Đang gửi...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="h-5 w-5" />
                            Gửi lại email xác minh
                        </>
                    )}
                </button>

                <Link
                    to={ROUTES.LOGIN}
                    className="mt-5 inline-block font-bold text-sky-600 hover:text-sky-500"
                >
                    Quay lại đăng nhập
                </Link>
            </section>
        </main>
    );
}