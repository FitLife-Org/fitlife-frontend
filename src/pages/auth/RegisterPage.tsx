import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import CustomCursor from "../../components/common/CustomCursor";
import { ROUTES } from "../../config/routes";
import { useRegisterLogic } from "../../utils/validators/useRegisterLogic";

export default function RegisterPage() {
  const {
    form,
    error,
    fieldErrors,
    loading,
    googleLoading,
    activeStep,
    containerRef,
    introRef,
    formRef,
    updateField,
    handleSubmit,
    handleGoogleRegister,
  } = useRegisterLogic();

  return (
      <main
          ref={containerRef}
          className="relative min-h-screen w-full overflow-hidden bg-[url('https://images.unsplash.com/photo-1593079831268-3381b0c42369?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] transition-all duration-700" />

        <div className="relative z-10 grid min-h-screen w-full lg:grid-cols-2">

          {/* LEFT — Form */}
          <section className="flex items-center justify-center p-4 lg:p-10 order-2 lg:order-1">
            <div
                ref={formRef}
                className="relative w-full max-w-md rounded-3xl bg-white/85 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)] backdrop-blur-2xl border border-white/60 overflow-hidden"
            >
              {/* Subtle corner blobs */}
              <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-sky-200/25 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-blue-200/25 blur-3xl pointer-events-none" />

              <div className="relative z-10 px-8 py-7 lg:px-10 lg:py-8">

                {/* Header */}
                <div className="gsap-form-element mb-6 text-center">
                  <div className="inline-block rounded-xl bg-sky-50 px-3 py-1 mb-3 lg:hidden">
                    <span className="text-sky-600 font-bold text-sm">FitLife</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tạo tài khoản</h2>
                  <p className="mt-1 text-sm text-slate-500">Bắt đầu hành trình thay đổi của bạn.</p>
                </div>

                {/* Google Button */}
                <div className="gsap-form-element mb-5">
                  <button
                      type="button"
                      onClick={handleGoogleRegister}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {googleLoading ? (
                        <svg className="h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    )}
                    {googleLoading ? "Đang kết nối..." : "Đăng ký bằng Google"}
                  </button>
                </div>

                {/* Divider */}
                <div className="gsap-form-element relative flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium shrink-0">hoặc điền thông tin</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Error */}
                {error && (
                    <div className="gsap-form-element mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">

                  {/* Row 1: username + fullName */}
                  <div className="gsap-form-element grid grid-cols-2 gap-3">
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

                  {/* Row 2: email + phone */}
                  <div className="gsap-form-element grid grid-cols-2 gap-3">
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
                    <Input
                        label="Số điện thoại"
                        name="phone"
                        value={form.phone}
                        onChange={updateField}
                        error={fieldErrors.phone}
                        className="bg-white"
                    />
                  </div>

                  {/* Row 3: password + confirmPassword */}
                  <div className="gsap-form-element grid grid-cols-2 gap-3">
                    <Input
                        label="Mật khẩu"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={updateField}
                        error={fieldErrors.password}
                        className="bg-white"
                    />
                    <Input
                        label="Xác nhận"
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
                        className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white transition-all font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-sm"
                        type="submit"
                        isLoading={loading}
                    >
                      Đăng ký ngay
                    </Button>
                  </div>

                  <div className="gsap-form-element pt-1 text-center text-sm text-slate-500">
                    Đã có tài khoản?{" "}
                    <Link to={ROUTES.LOGIN} className="text-sky-600 hover:text-sky-500 font-bold transition-colors">
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
              <span className="tracking-tight text-5xl bg-clip-text text-transparent bg-gradient-to-l from-green-500 to-cyan-500">
              FitLife
            </span>
            </div>

            <div className="max-w-x2">
              <h1 className="text-5xl lg:text-5xl font-black leading-[1.15] mb-6 text-slate-900">
                Bắt đầu hành trình<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-sky-600 to-cyan-500">
                thay đổi bản thân
              </span>
              </h1>

              <p className="text-lg leading-relaxed text-slate-700 border-r-4 border-sky-500 pr-6 bg-white/50 backdrop-blur-sm py-3 pl-4 rounded-l-xl shadow-sm border-white/60 border-y border-l">
                Tham gia cộng đồng FitLife để được theo dõi tiến độ chi tiết, đặt lịch tập luyện, và nhận các gói tập
                tối ưu dành riêng cho bạn.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-end gap-2 sm:gap-4 border-r-2 border-sky-500/40 pr-6">
                {["GO", "HARD", "OR", "GO HOME"].map((text, idx) => {
                  const isActive = activeStep === idx;
                  return (
                      <div key={text} className="flex items-center gap-2 sm:gap-4 flex-row-reverse">
                    <span
                        className={`font-black tracking-widest transition-all duration-500 ${isActive ? "scale-110 bg-gradient-to-l from-sky-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]" : "scale-100 text-slate-600"}`}
                        style={{ fontSize: "1.5rem" }}
                    >
                      {text}
                    </span>
                        {idx > 0 && (
                            <ArrowRight
                                className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-500 ${isActive ? "text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" : "text-slate-800"} rotate-180`}
                            />
                        )}
                      </div>
                  );
                })}
              </div>
            </div>
          </section>

        </div>
      </main>
  );
}