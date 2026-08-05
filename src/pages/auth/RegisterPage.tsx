import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { ROUTES } from "../../config/routes";
import { getPasswordChecks } from "../../utils/validators/passwordPolicy";
import { useRegisterLogic } from "../../utils/validators/useRegisterLogic";

function AnimatedText() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep((previous) => (previous + 1) % 4);
    }, 1200);
    return () => window.clearInterval(interval);
  }, []);

  return (
      <div className="mt-10 flex flex-wrap items-center justify-end gap-2 border-r-2 border-fit-primary/40 pr-6 sm:gap-4">
        {["GO", "HARD", "OR", "GO HOME"].map((text, index) => {
          const isActive = activeStep === index;
          return (
              <div
                  key={text}
                  className="flex flex-row-reverse items-center gap-2 sm:gap-4"
              >
            <span
                className={`font-black tracking-widest transition-all duration-500 ${
                    isActive
                        ? "scale-110 bg-gradient-to-l from-emerald-500 to-teal-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                        : "scale-100 text-slate-600"
                }`}
                style={{ fontSize: "1.5rem" }}
            >
              {text}
            </span>
                {index > 0 && (
                    <ArrowRight
                        className={`h-4 w-4 rotate-180 transition-colors duration-500 sm:h-5 sm:w-5 ${
                            isActive
                                ? "text-fit-primary drop-shadow-[0_0_8px_rgba(5,150,105,0.6)]"
                                : "text-slate-800"
                        }`}
                    />
                )}
              </div>
          );
        })}
      </div>
  );
}

type PasswordRuleProps = {
  passed: boolean;
  children: string;
};

function PasswordRule({ passed, children }: PasswordRuleProps) {
  const Icon = passed ? CheckCircle2 : Circle;
  return (
      <li
          className={`flex items-center gap-2 text-xs ${
              passed ? "text-emerald-600" : "text-slate-400"
          }`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span>{children}</span>
      </li>
  );
}

export default function RegisterPage() {
  const {
    form,
    error,
    fieldErrors,
    loading,
    containerRef,
    introRef,
    formRef,
    updateField,
    handleSubmit,
  } = useRegisterLogic();

  const passwordChecks = getPasswordChecks(form.password);
  const passwordsMatch =
      form.confirmPassword.length > 0 &&
      form.password === form.confirmPassword;

  return (
      <main
          ref={containerRef}
          className="relative h-screen w-full overflow-hidden bg-[url('https://images.unsplash.com/photo-1593079831268-3381b0c42369?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

        <div className="relative z-10 grid h-screen w-full lg:grid-cols-2">
          <section className="order-2 flex items-center justify-center p-4 lg:order-1 lg:p-10">
            <div
                ref={formRef}
                className="relative w-full max-w-lg max-h-full flex flex-col overflow-hidden rounded-3xl border border-fit-border bg-white/95 shadow-auth"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.15)_0%,_transparent_70%)]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(20,184,166,0.15)_0%,_transparent_70%)]" />

              <div className="relative z-10 px-8 py-5 lg:px-10 lg:py-7 overflow-y-auto">
                <div className="gsap-form-element mb-4 text-center">
                  <div className="mb-3 inline-block rounded-xl bg-fit-primarySoft px-3 py-1 lg:hidden">
                  <span className="text-sm font-bold text-fit-primary">
                    FitLife
                  </span>
                  </div>
                  <h2 className="fit-title">Tạo tài khoản</h2>
                  <p className="fit-subtitle">
                    Bắt đầu hành trình thay đổi của bạn.
                  </p>
                </div>

                {error && (
                    <div className="gsap-form-element mb-4 rounded-xl border border-fit-danger/20 bg-fit-dangerSoft px-4 py-3 text-sm text-fit-danger">
                      {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-3"
                    noValidate
                >
                  <div className="gsap-form-element grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                        label="Tên đăng nhập"
                        name="username"
                        value={form.username}
                        onChange={updateField}
                        autoComplete="username"
                        required
                        error={fieldErrors.username}
                        className="bg-white"
                    />
                    <Input
                        label="Họ tên"
                        name="fullName"
                        value={form.fullName}
                        onChange={updateField}
                        autoComplete="name"
                        required
                        error={fieldErrors.fullName}
                        className="bg-white"
                    />
                  </div>

                  <div className="gsap-form-element">
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={updateField}
                        autoComplete="email"
                        required
                        error={fieldErrors.email}
                        className="bg-white"
                    />
                  </div>

                  <div className="gsap-form-element">
                    <Input
                        label="Số điện thoại"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={updateField}
                        autoComplete="tel"
                        error={fieldErrors.phone}
                        className="bg-white"
                    />
                  </div>

                  <div className="gsap-form-element">
                    <Input
                        label="Mật khẩu"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={updateField}
                        autoComplete="new-password"
                        required
                        error={fieldErrors.password}
                        className="bg-white"
                    />

                    <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                      <PasswordRule passed={passwordChecks.minLength}>
                        Ít nhất 8 ký tự
                      </PasswordRule>
                      <PasswordRule passed={passwordChecks.hasLetter}>
                        Có ít nhất một chữ cái
                      </PasswordRule>
                      <PasswordRule passed={passwordChecks.hasNumber}>
                        Có ít nhất một chữ số
                      </PasswordRule>
                      <PasswordRule passed={passwordChecks.notBlank}>
                        Không chỉ gồm khoảng trắng
                      </PasswordRule>
                    </ul>
                  </div>

                  <div className="gsap-form-element">
                    <Input
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={updateField}
                        autoComplete="new-password"
                        required
                        error={fieldErrors.confirmPassword}
                        className="bg-white"
                    />

                    {form.confirmPassword && (
                        <p
                            className={`mt-2 flex items-center gap-2 text-xs ${
                                passwordsMatch
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                            }`}
                        >
                          {passwordsMatch ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                              <Circle className="h-3.5 w-3.5" />
                          )}
                          Mật khẩu xác nhận trùng khớp
                        </p>
                    )}
                  </div>

                  <div className="gsap-form-element pt-2">
                    <Button
                        className="fit-auth-button"
                        type="submit"
                        isLoading={loading}
                    >
                      Đăng ký ngay
                    </Button>
                  </div>

                  <div className="gsap-form-element pt-2 text-center text-sm font-medium text-slate-500">
                    Đã có tài khoản?{" "}
                    <Link to={ROUTES.LOGIN} className="fit-auth-link">
                      Đăng nhập
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </section>

          <section
              ref={introRef}
              className="order-1 hidden flex-col items-end justify-center p-12 text-right text-slate-900 lg:order-2 lg:flex lg:pr-24"
          >
            <div className="mb-2 flex flex-row-reverse items-center gap-2 text-3xl font-black">
              <div className="p-3">
                <img
                    src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png"
                    alt="FitLife logo"
                    className="w-35 object-contain"
                />
              </div>
              <span className="bg-gradient-to-l from-emerald-600 to-teal-500 bg-clip-text text-5xl tracking-tight text-transparent">
              FitLife
            </span>
            </div>

            <div className="max-w-2xl">
              <h1 className="mb-6 text-5xl font-black leading-[1.15] text-slate-900">
                Bắt đầu hành trình
                <br />
                <span className="bg-gradient-to-l from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                thay đổi bản thân
              </span>
              </h1>
              <p className="rounded-l-xl border-y border-l border-r-4 border-white/60 border-r-fit-primary bg-white/50 py-3 pl-4 pr-6 text-lg leading-relaxed text-slate-700 shadow-sm backdrop-blur-sm">
                Bắt đầu hành trình khỏe mạnh cùng FitLife – quản lý lịch tập,
                theo dõi kết quả và khám phá các gói tập phù hợp nhất với bạn.
              </p>
              <AnimatedText />
            </div>
          </section>
        </div>
      </main>
  );
}
