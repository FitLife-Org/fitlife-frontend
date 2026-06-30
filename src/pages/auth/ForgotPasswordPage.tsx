import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { ROUTES } from "../../config/routes";
import { useForgotPasswordLogic } from "../../utils/validators/forgotPasswordValidator"; 

export default function ForgotPasswordPage() {
    const {
        form,
        fieldErrors,
        error,
        successMessage,
        loading,
        updateField,
        handleSubmit,
    } = useForgotPasswordLogic();

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[url('https://images.unsplash.com/photo-1593079831268-3381b0c42369?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

            <div className="relative z-10 grid min-h-screen w-full lg:grid-cols-2">
                <section className="hidden flex-col justify-center p-12 text-slate-900 lg:flex lg:pl-24">
                    <div className="mb-2 flex items-center gap-2 text-3xl font-black">
                        <div className="p-3">
                            <img
                                src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png"
                                alt="FitLife logo"
                                className="w-35 object-contain"
                            />
                        </div>

                        <span className="bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-5xl tracking-tight text-transparent">
                            FitLife
                        </span>
                    </div>

                    <div className="max-w-xl">
                        <h1 className="mb-6 text-5xl font-black leading-[1.15] text-slate-900">
                            Khôi phục tài khoản
                            <br />
                            <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
                                nhanh – an toàn
                            </span>
                        </h1>

                        <p className="rounded-r-xl border-y border-r border-white/60 border-l-4 border-sky-500 bg-white/50 py-3 pl-6 pr-4 text-lg leading-relaxed text-slate-700 shadow-sm backdrop-blur-sm">
                            Nhập email đã đăng ký. FitLife sẽ gửi mã OTP để bạn xác nhận và đặt lại mật khẩu mới.
                        </p>
                    </div>
                </section>

                <section className="flex items-center justify-center p-4 lg:p-12">
                    <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-2xl lg:p-10">
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />

                        <div className="relative z-10">
                            <header className="mb-8 text-center">
                                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                                    <Mail className="h-7 w-7" />
                                </div>

                                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                                    Quên mật khẩu?
                                </h2>

                                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                                    Nhập email tài khoản của bạn để nhận mã OTP đặt lại mật khẩu.
                                </p>
                            </header>

                            {error && (
                                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            {successMessage && (
                                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    {successMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={updateField}
                                    error={fieldErrors.email}
                                    className="bg-white"
                                />

                                <Button
                                    className="w-full rounded-2xl bg-slate-900 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl active:translate-y-0"
                                    type="submit"
                                    isLoading={loading}
                                >
                                    Gửi mã OTP
                                </Button>

                                <Link
                                    to={ROUTES.LOGIN}
                                    className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-sky-600 transition-colors hover:text-sky-500"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Quay lại đăng nhập
                                </Link>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}