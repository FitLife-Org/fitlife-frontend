import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, MailCheck, ArrowRight } from "lucide-react";
import { ROUTES } from "../../config/routes";
import { authService } from "../../features/auth/services/authService";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Đang xác thực email của bạn...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Không tìm thấy mã xác minh. Vui lòng kiểm tra lại đường dẫn trong email.");
            return;
        }

        const verify = async () => {
            try {
                const response = await authService.verifyEmail(token);
                setStatus("success");
                setMessage(response || "Xác thực email thành công. Bạn đã có thể đăng nhập!");
            } catch (err: any) {
                setStatus("error");
                setMessage(err.message || "Mã xác minh không hợp lệ hoặc đã hết hạn.");
            }
        };

        verify();
    }, [token]);

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1593079831268-3381b0c42369?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center px-4">
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[3px]" />

            <section className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
                
                <AnimatePresence mode="wait">
                    {status === "loading" && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center"
                        >
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 shadow-sm border border-slate-200">
                                <Loader2 className="h-10 w-10 text-slate-400 animate-spin" />
                            </div>
                            <h1 className="mt-6 text-3xl font-black text-slate-900">
                                Đang xử lý
                            </h1>
                            <p className="mt-3 text-slate-600">
                                Vui lòng đợi trong giây lát...
                            </p>
                        </motion.div>
                    )}

                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center"
                        >
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 shadow-sm border border-emerald-200">
                                <MailCheck className="h-10 w-10 text-emerald-600" />
                            </div>
                            <h1 className="mt-6 text-3xl font-black text-slate-900">
                                Xác thực thành công!
                            </h1>
                            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-700">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                                <span>{message}</span>
                            </div>
                            <Link
                                to={ROUTES.LOGIN}
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-4 font-bold text-white transition hover:bg-slate-800 shadow-xl shadow-slate-900/20 active:scale-95"
                            >
                                Đăng nhập ngay <ArrowRight className="h-5 w-5" />
                            </Link>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center"
                        >
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 shadow-sm border border-rose-200">
                                <XCircle className="h-10 w-10 text-rose-600" />
                            </div>
                            <h1 className="mt-6 text-3xl font-black text-slate-900">
                                Xác thực thất bại
                            </h1>
                            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-600">
                                {message}
                            </div>
                            <Link
                                to={ROUTES.CHECK_EMAIL}
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800 shadow-lg active:scale-95"
                            >
                                Yêu cầu gửi lại email
                            </Link>
                            <Link
                                to={ROUTES.HOME}
                                className="mt-4 inline-block font-bold text-slate-500 hover:text-slate-700 transition"
                            >
                                Quay về trang chủ
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
                
            </section>
        </main>
    );
}