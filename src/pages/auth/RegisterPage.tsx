import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { ROUTES } from "../../config/routes";
import { useRegisterLogic } from "../../utils/validators/useRegisterLogic";

function AnimatedText() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-10 flex flex-wrap items-center justify-end gap-2 sm:gap-4 border-r-2 border-fit-primary/40 pr-6">
      {["GO", "HARD", "OR", "GO HOME"].map((text, idx) => {
        const isActive = activeStep === idx;
        return (
          <div key={text} className="flex items-center gap-2 sm:gap-4 flex-row-reverse">
            <span
              className={`font-black tracking-widest transition-all duration-500 ${isActive ? "scale-110 bg-gradient-to-l from-emerald-500 to-teal-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(5,150,105,0.4)]" : "scale-100 text-slate-600"}`}
              style={{ fontSize: "1.5rem" }}
            >
              {text}
            </span>
            {idx > 0 && (
              <ArrowRight
                className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-500 ${isActive ? "text-fit-primary drop-shadow-[0_0_8px_rgba(5,150,105,0.6)]" : "text-slate-800"} rotate-180`}
              />
            )}
          </div>
        );
      })}
    </div>
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

  return (
      <main
          ref={containerRef}
          className="relative min-h-screen w-full overflow-hidden bg-[url('https://images.unsplash.com/photo-1593079831268-3381b0c42369?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] transition-all duration-700" />

        <div className="relative z-10 grid min-h-screen w-full lg:grid-cols-2">

          {/* Register — Form */}
          <section className="flex items-center justify-center p-4 lg:p-10 order-2 lg:order-1">
            <div
                ref={formRef}
                className="relative w-full max-w-lg rounded-3xl bg-white/90 shadow-auth backdrop-blur-2xl border border-fit-border overflow-hidden"
            >
              {/* Subtle corner blobs */}
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 px-8 py-4 lg:px-10 lg:py-6">

                {/* Header */}
                <div className="gsap-form-element mb-4 text-center">
                  <div className="inline-block rounded-xl bg-fit-primarySoft px-3 py-1 mb-3 lg:hidden">
                    <span className="text-fit-primary font-bold text-sm">FitLife</span>
                  </div>
                  <h2 className="fit-title">Tạo tài khoản</h2>
                  <p className="fit-subtitle">Bắt đầu hành trình thay đổi của bạn.</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="gsap-form-element mb-4 flex items-center gap-3 rounded-xl border border-fit-danger/20 bg-fit-dangerSoft px-4 py-3 text-sm text-fit-danger">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">

                  {/* Row 1: username + fullName */}
                  <div className="gsap-form-element grid grid-cols-2 gap-2">
                    <Input
                        label="Tên đăng nhập"
                        name="username"
                        value={form.username}
                        onChange={updateField}
                        required
                        error={fieldErrors.username}
                        className="bg-white"
                    />
                    <Input
                        label="Họ tên"
                        name="fullName"
                        value={form.fullName}
                        onChange={updateField}
                        required
                        error={fieldErrors.fullName}
                        className="bg-white"
                    />
                  </div>

                  {/* Row 3: email */}
                  <div className="gsap-form-element">
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={updateField}
                        required
                        error={fieldErrors.email}
                        className="bg-white"
                    />
                  </div>

                  {/* Row 4: phone */}
                  <div className="gsap-form-element">
                    <Input
                        label="Số điện thoại"
                        name="phone"
                        value={form.phone}
                        onChange={updateField}
                        error={fieldErrors.phone}
                        className="bg-white"
                    />
                  </div>

                  {/* Row 5: password */}
                  <div className="gsap-form-element">
                    <Input
                        label="Mật khẩu"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={updateField}
                        error={fieldErrors.password}
                        className="bg-white"
                    />
                  </div>

                  {/* Row 6: confirmPassword */}
                  <div className="gsap-form-element">
                    <Input
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={updateField}
                        error={fieldErrors.confirmPassword}
                        className="bg-white"
                    />
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

          {/* RIGHT — Intro */}
          <section
              ref={introRef}
              className="hidden flex-col justify-center p-12 text-slate-900 lg:flex lg:pr-24 order-1 lg:order-2 items-end text-right"
          >
            <div className="flex items-center gap-2 text-3xl font-black mb-2 flex-row-reverse">
              <div className="p-3">
                <img
                    src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png"
                    alt="FitLife logo"
                    className="w-35 object-contain"
                />
              </div>
              <span className="tracking-tight text-5xl bg-clip-text text-transparent bg-gradient-to-l from-emerald-600 to-teal-500">
              FitLife
            </span>
            </div>

            <div className="max-w-x2">
              <h1 className="text-5xl lg:text-5xl font-black leading-[1.15] mb-6 text-slate-900">
                Bắt đầu hành trình<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500">
                thay đổi bản thân
              </span>
              </h1>

              <p className="text-lg leading-relaxed text-slate-700 border-r-4 border-fit-primary pr-6 bg-white/50 backdrop-blur-sm py-3 pl-4 rounded-l-xl shadow-sm border-white/60 border-y border-l">
                Bắt đầu hành trình khỏe mạnh cùng FitLife – quản lý lịch tập, theo dõi kết quả và khám phá các gói tập phù hợp nhất với bạn
              </p>

              <AnimatedText />
            </div>
          </section>

        </div>
      </main>
  );
}