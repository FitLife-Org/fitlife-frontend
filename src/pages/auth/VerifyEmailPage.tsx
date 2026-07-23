import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, MailCheck, ArrowRight } from "lucide-react";
import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Đang xác thực email của bạn...");

    useEffect(() => {
        let isMounted = true;
        if (!token) {
            return;
        }

        const verify = async () => {
            try {
                const response = await authService.verifyEmail(token);
                if (isMounted) {
                    setStatus("success");
                    setMessage(response || "Xác thực email thành công. Bạn đã có thể đăng nhập!");
                }
            } catch (err: unknown) {
                if (isMounted) {
                    setStatus("error");
                    const errMsg = err instanceof Error ? err.message : "Mã xác minh không hợp lệ hoặc đã hết hạn.";
                    setMessage(errMsg);
                }
            }
        };

        verify();
        return () => { isMounted = false; };
    }, [token]);

    const activeStatus = !token ? "error" : status;
    const activeMessage = !token ? "Không tìm thấy mã xác minh. Vui lòng kiểm tra lại đường dẫn trong email." : message;

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1593079831268-3381b0c42369?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center px-4">
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[3px]" />

            <section className="relative z-10 w-full max-w-md rounded-[2rem] border border-fit-border bg-white/90 p-8 text-center shadow-auth backdrop-blur-2xl">
                
                <AnimatePresence mode="wait">
                    {activeStatus === "loading" && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center"
                        >
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 shadow-sm border border-slate-200">
                                <Loader2 className="h-10 w-10 text-fit-muted animate-spin" />
                            </div>
                            <h1 className="mt-6 fit-title text-center">
                                Đang xử lý
                            </h1>
                            <p className="mt-3 fit-subtitle text-center">
                                Vui lòng đợi trong giây lát...
                            </p>
                        </motion.div>
                    )}

                    {activeStatus === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center"
                        >
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-fit-primarySoft shadow-sm border border-fit-primary/20">
                                <MailCheck className="h-10 w-10 text-fit-primary" />
                            </div>
                            <h1 className="mt-6 fit-title text-center">
                                Xác thực thành công!
                            </h1>
                            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-fit-primary/20 bg-fit-primarySoft px-4 py-3 text-left text-sm text-fit-primary font-medium">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                                <span>{activeMessage}</span>
                            </div>
                            <Link
                                to={ROUTES.LOGIN}
                                className="mt-6 fit-auth-button flex items-center justify-center gap-2"
                            >
                                Đăng nhập ngay <ArrowRight className="h-5 w-5" />
                            </Link>
                        </motion.div>
                    )}

                    {activeStatus === "error" && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center"
                        >
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-fit-dangerSoft shadow-sm border border-fit-danger/20">
                                <XCircle className="h-10 w-10 text-fit-danger" />
                            </div>
                            <h1 className="mt-6 fit-title text-center">
                                Xác thực thất bại
                            </h1>
                            <div className="mt-5 rounded-2xl border border-fit-danger/20 bg-fit-dangerSoft px-4 py-4 text-sm text-fit-danger">
                                {activeMessage}
                            </div>
                            <Link
                                to={ROUTES.CHECK_EMAIL}
                                className="mt-6 fit-auth-button flex items-center justify-center gap-2"
                            >
                                Yêu cầu gửi lại email
                            </Link>
                            <Link
                                to={ROUTES.HOME}
                                className="mt-4 inline-block font-bold text-fit-muted hover:text-fit-text transition"
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