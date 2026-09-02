import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { ROUTES } from "../../config/routes";
import { useResetPasswordLogic } from "../../utils/validators/resetPasswordValidator";

export default function ResetPasswordPage() {
    const {
        form,
        fieldErrors,
        error,
        successMessage,
        loading,
        updateField,
        handleSubmit,
    } = useResetPasswordLogic();

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

                        <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-5xl tracking-tight text-transparent">
                            FitLife
                        </span>
                    </div>

                    <div className="max-w-xl">
                        <h1 className="mb-6 text-5xl font-black leading-[1.15] text-slate-900">
                            Tạo mật khẩu mới
                            <br />
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                                bảo mật – dễ nhớ
                            </span>
                        </h1>

                        <p className="rounded-r-xl border-y border-r border-white/60 border-l-4 border-fit-primary bg-white/50 py-3 pl-6 pr-4 text-lg leading-relaxed text-slate-700 shadow-sm backdrop-blur-sm">
                            Nhập OTP từ email và mật khẩu mới. Sau khi hoàn tất, bạn có thể
                            đăng nhập lại vào hệ thống FitLife.
                        </p>
                    </div>
                </section>

                <section className="flex items-center justify-center p-4 lg:p-12">
                    <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-fit-border bg-white/90 p-8 shadow-auth backdrop-blur-2xl lg:p-10">
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            <header className="mb-8 text-center">
                                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-fit-primarySoft text-fit-primary">
                                    <KeyRound className="h-7 w-7" />
                                </div>

                                <h2 className="fit-title text-center">
                                    Đặt lại mật khẩu
                                </h2>

                                <p className="fit-subtitle text-center">
                                    Nhập email, mã OTP và mật khẩu mới để hoàn tất khôi phục tài khoản.
                                </p>
                            </header>

                            {error && (
                                <div className="mb-6 rounded-2xl border border-fit-danger/20 bg-fit-dangerSoft px-4 py-3 text-sm text-fit-danger">
                                    {error}
                                </div>
                            )}

                            {successMessage && (
                                <div className="mb-6 rounded-2xl border border-emerald-200 bg-fit-primarySoft px-4 py-3 text-sm text-fit-primary font-medium">
                                    {successMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={updateField}
                                    error={fieldErrors.email}
                                    className="bg-white"
                                />

                                <Input
                                    label="Mã OTP"
                                    name="otp"
                                    type="text"
                                    inputMode="numeric"
                                    value={form.otp}
                                    onChange={updateField}
                                    error={fieldErrors.otp}
                                    className="bg-white text-center text-lg font-black tracking-[0.35em]"
                                />

                                <Input
                                    label="Mật khẩu mới"
                                    name="newPassword"
                                    type="password"
                                    value={form.newPassword}
                                    onChange={updateField}
                                    error={fieldErrors.newPassword}
                                    className="bg-white"
                                />

                                <Input
                                    label="Xác nhận mật khẩu"
                                    name="confirmPassword"
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={updateField}
                                    error={fieldErrors.confirmPassword}
                                    className="bg-white"
                                />

                                <Button
                                    className="fit-auth-button"
                                    type="submit"
                                    isLoading={loading}
                                >
                                    Đặt lại mật khẩu
                                </Button>

                                <div className="flex items-center justify-between pt-1">
                                    <Link
                                        to={ROUTES.LOGIN}
                                        className="flex items-center gap-2 fit-auth-link text-sm"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Đăng nhập
                                    </Link>

                                    <Link
                                        to={ROUTES.FORGOT_PASSWORD}
                                        className="fit-auth-link text-sm"
                                    >
                                        Gửi lại OTP
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}