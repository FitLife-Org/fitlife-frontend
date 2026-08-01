import {
    memo,
    useEffect,
    useState,
    type ChangeEvent,
} from "react";

import {
    GoogleLogin,
    type CredentialResponse,
} from "@react-oauth/google";

import {
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
} from "lucide-react";

import { Link } from "react-router-dom";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { ROUTES } from "../../config/routes";

import { useLoginLogic } from "../../utils/validators/useLoginLogic";

interface MemoizedGoogleLoginProps {
    onSuccess: (
        credentialResponse: CredentialResponse,
    ) => void | Promise<void>;

    onError: () => void;
}

const MemoizedGoogleLogin = memo(
    ({
         onSuccess,
         onError,
     }: MemoizedGoogleLoginProps) => (
        <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            useOneTap={false}
            auto_select={false}
            width="360"
            theme="outline"
            size="large"
            shape="rectangular"
            text="continue_with"
        />
    ),
);

MemoizedGoogleLogin.displayName =
    "MemoizedGoogleLogin";

function AnimatedText() {
    const [activeStep, setActiveStep] =
        useState(0);

    useEffect(() => {
        const interval = window.setInterval(
            () => {
                setActiveStep(
                    (previous) =>
                        (previous + 1) % 4,
                );
            },
            1200,
        );

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    const steps = [
        "EAT",
        "SLEEP",
        "GYM",
        "REPEAT",
    ];

    return (
        <div className="mt-10 flex flex-wrap items-center gap-2 border-l-2 border-fit-primary/40 pl-6 sm:gap-4">
            {steps.map((text, index) => {
                const isActive =
                    activeStep === index;

                return (
                    <div
                        key={text}
                        className="flex items-center gap-2 sm:gap-4"
                    >
            <span
                className={[
                    "text-2xl font-black tracking-widest",
                    "transition-all duration-500",
                    isActive
                        ? "scale-110 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent"
                        : "scale-100 text-slate-600",
                ].join(" ")}
            >
              {text}
            </span>

                        {index < steps.length - 1 && (
                            <ArrowRight
                                className={[
                                    "h-4 w-4 transition-colors duration-500 sm:h-5 sm:w-5",
                                    isActive
                                        ? "text-fit-primary"
                                        : "text-slate-800",
                                ].join(" ")}
                                aria-hidden="true"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function LoginPage() {
    const [showPassword, setShowPassword] =
        useState(false);

    const {
        formData,
        error,
        fieldErrors,
        loading,
        rememberMe,

        containerRef,
        introRef,
        formRef,

        handleInputChange,
        handleRememberMeChange,
        handleGoogleSuccess,
        handleGoogleError,
        handleSubmit,
    } = useLoginLogic();

    const handleRememberChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        handleRememberMeChange(
            event.target.checked,
        );
    };

    return (
        <main
            ref={containerRef}
            className="relative min-h-screen w-full overflow-hidden bg-[url('https://images.unsplash.com/photo-1593079831268-3381b0c42369?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center"
        >
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

            <div className="relative z-10 grid min-h-screen w-full lg:grid-cols-2">
                <section
                    ref={introRef}
                    className="hidden flex-col justify-center p-12 text-slate-900 lg:flex lg:pl-24"
                >
                    <div className="mb-2 flex items-center gap-2 text-3xl font-black">
                        <div className="p-3">
                            <img
                                src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png"
                                alt="FitLife logo"
                                className="w-32 object-contain"
                            />
                        </div>

                        <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-5xl tracking-tight text-transparent">
              FitLife
            </span>
                    </div>

                    <div className="max-w-2xl">
                        <h1 className="mb-6 text-5xl font-black leading-[1.15] text-slate-900">
                            Làm chủ phòng gym
                            <br />

                            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                gọn – chuẩn – chiến
              </span>{" "}
                            mỗi ngày.
                        </h1>

                        <p className="rounded-r-xl border-y border-r border-white/60 border-l-4 border-l-fit-primary bg-white/50 py-3 pl-6 pr-4 text-lg leading-relaxed text-slate-700 shadow-sm backdrop-blur-sm">
                            Đồng hành cùng bạn trên hành
                            trình tập luyện với lịch tập,
                            tiến độ và gói tập luôn trong
                            tầm tay.
                        </p>

                        <AnimatedText />
                    </div>
                </section>

                <section className="flex items-center justify-center p-4 lg:p-12">
                    <div
                        ref={formRef}
                        className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-fit-border bg-white/90 p-8 shadow-auth backdrop-blur-2xl lg:p-10"
                    >
                        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

                        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

                        <div className="relative z-10 flex flex-col">
                            <header className="gsap-form-element mb-8 text-center">
                                <div className="mb-4 inline-block rounded-xl bg-fit-primarySoft px-3 py-1 lg:hidden">
                  <span className="font-bold text-fit-primary">
                    FitLife
                  </span>
                                </div>

                                <h2 className="fit-title">
                                    Chào mừng trở lại
                                </h2>

                                <p className="fit-subtitle">
                                    Nhập thông tin tài khoản
                                    của bạn để tiếp tục.
                                </p>
                            </header>

                            {error && (
                                <div
                                    className="gsap-form-element mb-6 flex items-center gap-3 rounded-2xl border border-fit-danger/20 bg-fit-dangerSoft px-4 py-3 text-sm text-fit-danger"
                                    role="alert"
                                    aria-live="polite"
                                >
                                    <svg
                                        className="h-5 w-5 shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>

                                    <span>{error}</span>
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                                noValidate
                            >
                                <div className="space-y-4">
                                    <div className="gsap-form-element">
                                        <Input
                                            label="Email hoặc tên đăng nhập"
                                            name="identifier"
                                            type="text"
                                            value={
                                                formData.identifier
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            error={
                                                fieldErrors.identifier
                                            }
                                            className="bg-white"
                                            autoComplete="username"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="gsap-form-element">
                                        <div className="relative">
                                            <Input
                                                label="Mật khẩu"
                                                name="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    formData.password
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                error={
                                                    fieldErrors.password
                                                }
                                                className="bg-white pr-12"
                                                autoComplete="current-password"
                                                disabled={loading}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowPassword(
                                                        (previous) =>
                                                            !previous,
                                                    );
                                                }}
                                                className="absolute right-3 top-[43px] flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                                aria-label={
                                                    showPassword
                                                        ? "Ẩn mật khẩu"
                                                        : "Hiện mật khẩu"
                                                }
                                                disabled={loading}
                                            >
                                                {showPassword ? (
                                                    <EyeOff
                                                        className="h-5 w-5"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    <Eye
                                                        className="h-5 w-5"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="gsap-form-element mt-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="remember-me"
                                            checked={rememberMe}
                                            onChange={
                                                handleRememberChange
                                            }
                                            disabled={loading}
                                            className="h-4 w-4 cursor-pointer rounded border-fit-border text-fit-primary focus:ring-fit-primary"
                                        />

                                        <label
                                            htmlFor="remember-me"
                                            className="cursor-pointer select-none text-sm font-medium text-slate-700"
                                        >
                                            Ghi nhớ đăng nhập
                                        </label>
                                    </div>

                                    <Link
                                        to={
                                            ROUTES.FORGOT_PASSWORD
                                        }
                                        className="text-sm font-bold text-fit-primary transition-colors hover:text-fit-primaryHover"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                <div className="gsap-form-element pt-2">
                                    <Button
                                        className="fit-auth-button"
                                        type="submit"
                                        isLoading={loading}
                                        disabled={loading}
                                    >
                                        Đăng nhập
                                    </Button>
                                </div>

                                <div className="gsap-form-element mt-5 flex items-center gap-4">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />

                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Hoặc
                  </span>

                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
                                </div>

                                <div className="gsap-form-element pt-2">
                                    {loading ? (
                                        <div className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 font-bold text-slate-500">
                                            <Loader2 className="h-5 w-5 animate-spin" />

                                            Đang xử lý...
                                        </div>
                                    ) : (
                                        <div className="gsap-form-element pt-2">
                                            {loading ? (
                                                <div className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 font-bold text-slate-500">
                                                    <Loader2 className="h-5 w-5 animate-spin" />

                                                    Đang xử lý...
                                                </div>
                                            ) : (
                                                <div className="relative mx-auto h-[52px] w-full max-w-[400px] overflow-hidden rounded-2xl">
                                                    {/* Giao diện nút do FitLife hiển thị */}
                                                    <div className="pointer-events-none flex h-full w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-all">
                                                        <svg
                                                            width="20"
                                                            height="20"
                                                            viewBox="0 0 48 48"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                fill="#EA4335"
                                                                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                                                            />

                                                            <path
                                                                fill="#4285F4"
                                                                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                                                            />

                                                            <path
                                                                fill="#FBBC05"
                                                                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                                                            />

                                                            <path
                                                                fill="#34A853"
                                                                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                                                            />
                                                        </svg>

                                                        <span>Tiếp tục với Google</span>
                                                    </div>

                                                    {/* Google button thật phủ lên trên để nhận click */}
                                                    <div className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center overflow-hidden opacity-[0.01]">
                                                        <MemoizedGoogleLogin
                                                            onSuccess={handleGoogleSuccess}
                                                            onError={handleGoogleError}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="gsap-form-element mt-6 text-center font-medium text-slate-500">
                                    Chưa có tài khoản?{" "}

                                    <Link
                                        to={ROUTES.REGISTER}
                                        className="fit-auth-link"
                                    >
                                        Đăng ký ngay
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