import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { ArrowRight, Loader2 } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import CustomCursor from "../../components/common/CustomCursor";
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
    handleGoogleSuccess,
    setError,
  } = useRegisterLogic();

  const loginWithGoogle = useGoogleLogin({
      onSuccess: (tokenResponse) => {
          handleGoogleSuccess({ credential: tokenResponse.access_token } as any);
      },
      onError: () => {
          setError("Đăng ký Google thất bại. Vui lòng thử lại.");
      }
  });

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
                <div className="gsap-form-element mt-2 mb-6 flex w-full justify-center">
                  {loading ? (
                    <div
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-500 font-bold"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Đang xử lý...
                    </div>
                  ) : (
                    <div className="flex justify-center w-full">
                      <button
                          type="button"
                          onClick={() => loginWithGoogle()}
                          className="flex w-full max-w-[400px] items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                      >
                          <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                          </svg>
                          Tiếp tục với Google
                      </button>
                    </div>
                  )}
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

              <AnimatedText />
            </div>
          </section>

        </div>
      </main>
  );
}