import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Loader2, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { validateLogin } from "../../utils/validators/loginValidator";

// Tách riêng Icon Google để JSX bên dưới không bị rối mắt bởi đoạn SVG quá dài
const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);

  // Gộp state form để dễ quản lý và mở rộng
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Khai báo kiểu dữ liệu useRef chuẩn cho TypeScript
  const containerRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Rút gọn logic lấy đường dẫn điều hướng
  const locationState = location.state as { from?: { pathname?: string } } | null;
  const from = locationState?.from?.pathname || ROUTES.MEMBER_HOME;

  // Xử lý thay đổi input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setLoading(true);
      setError("");

      console.log("Google credential response:", credentialResponse);

      const idToken = credentialResponse.credential;

      if (!idToken) {
        throw new Error("Không nhận được ID token từ Google.");
      }

      const session = await authService.googleLogin(idToken);

      setSession(session);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Google login thất bại:", error);
      setError(
          error instanceof Error
              ? error.message
              : "Đăng nhập Google thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Đăng nhập truyền thống
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const validationErrors = validateLogin(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const session = await authService.login({
        identifier: formData.email,
        password: formData.password,
      });
      setSession(session);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tài khoản hoặc mật khẩu không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  // Hiệu ứng GSAP
  useGSAP(() => {
    const tl = gsap.timeline();

    if (introRef.current) {
      tl.fromTo(
          introRef.current.children,
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }
      );
    }

    if (formRef.current) {
      tl.fromTo(
          formRef.current,
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
          "-=0.4"
      );

      tl.fromTo(
          formRef.current.querySelectorAll(".gsap-form-element"),
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
          "-=0.4"
      );
    }
  }, { scope: containerRef });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-[url('https://images.unsplash.com/photo-1593079831268-3381b0c42369?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center"
    >
      {/* Overlay sáng mờ phủ toàn bộ background để hợp với tone sáng */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] transition-all duration-700" />

      {/* Nội dung chính */}
      <div className="relative z-10 grid min-h-screen w-full lg:grid-cols-2">


        <section ref={introRef} className="hidden flex-col justify-center p-12 text-slate-900 lg:flex lg:pl-24">
          <div className="flex items-center gap-2 text-3xl font-black mb-2">
            <div className="p-3 ">

              <img
                  src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png"
                  alt="FitLife logo"
                  className=" w-35 object-contain"
              />
            </div>
            <span className="tracking-tight text-5xl  bg-clip-text  bg-gradient-to-r from-green-500  to-cyan-500">FitLife</span>
          </div>

          <div className="max-w-x2">
           <h1 className="text-5xl lg:text-5xl font-black leading-[1.15] mb-6 text-slate-900">
  Làm chủ phòng gym<br/>
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
    gọn – chuẩn – chiến
  </span> mỗi ngày.
</h1>

<p className="text-lg leading-relaxed text-slate-700 border-l-4 border-sky-500 pl-6 bg-white/50 backdrop-blur-sm py-3 pr-4 rounded-r-xl shadow-sm border-white/60 border-y border-r">
  Quản lý hội viên, gói tập, check-in, lịch PT và thanh toán — tất cả trong một hệ thống mượt, nhanh, không độ trễ. Vận hành trơn tru, tập trung build cơ – không build stress.
</p>


            <div className="mt-10 flex flex-wrap items-center gap-2 sm:gap-4 border-l-2 border-sky-500/40 pl-6">
                {["EAT", "SLEEP", "GYM", "REPEAT"].map((text, idx) => {
                    const isActive = activeStep === idx;
                    return (
                        <div key={text} className="flex items-center gap-2 sm:gap-4">
                            <span
                                className={`font-black tracking-widest transition-all duration-500 ${isActive ? "scale-110 bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]" : "scale-100 text-slate-600"}`}
                                style={{ fontSize: "1.5rem" }}
                            >
                                {text}
                            </span>
                            {idx < 3 && <ArrowRight className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-500 ${isActive ? "text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" : "text-slate-800"}`} />}
                        </div>
                    );
                })}
            </div>
          </div>
        </section>

        {/* Cột phải: Form đăng nhập */}
        <section className="flex items-center justify-center p-4 lg:p-12">
          <div ref={formRef} className="relative w-full max-w-md rounded-[2rem] bg-white/80 p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-2xl border border-white/60 lg:p-10 overflow-hidden">
       
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col">
              <header className="mb-8 text-center lg:text-left gsap-form-element">
              <div className="inline-block rounded-xl bg-sky-50 px-3 py-1 mb-4 lg:hidden">
                <div className="flex items-center gap-2 text-sky-600 font-bold">

                  <span>FitLife</span>
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center">Chào mừng trở lại</h2>
              <p className="mt-2 text-slate-500 font-medium text-center">Nhập thông tin tài khoản của bạn để tiếp tục.</p>
            </header>

    
            {error && (
              <div className="gsap-form-element mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600 backdrop-blur-sm">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="gsap-form-element">
                    <Input
                        label="Email hoặc tên đăng nhập"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={fieldErrors.email}
                        className="bg-white"
                        type="email"
                    />
                  </div>
                  <div className="gsap-form-element">
                    <Input
                        label="Mật khẩu"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        error={fieldErrors.password}
                        className="bg-white"
                    />
                  </div>
                </div>
               <div className="flex items-center justify-between mt-2 gsap-form-element">
  {/* Phần Checkbox */}
  <div className="flex items-center gap-2">
    <input 
      type="checkbox" 
      id="remember-me" 
      className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 cursor-pointer" 
    />
    <label 
      htmlFor="remember-me" 
      className="text-sm text-gray-700 cursor-pointer select-none"
    >
      Remember me?
    </label>
  </div>

 
  <Link 
    to={ROUTES.FORGOT_PASSWORD}
    className="text-sm font-bold text-sky-600 transition-colors hover:text-sky-500"
  >
    Quên mật khẩu?
  </Link>
</div>

                <div className="gsap-form-element pt-2">
                  <Button
                      className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white transition-all font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 text-base"
                      type="submit"
                      isLoading={loading}
                  >
                    Đăng nhập
                  </Button>
                </div>

                {/* Dải phân cách */}
                <div className="gsap-form-element mt-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200"/>
                  <span className="uppercase text-slate-400 text-xs font-black tracking-widest">Hoặc</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200"/>
                </div>

                {/* Đăng nhập Google */}
                <div className="gsap-form-element mt-6 flex w-full justify-center">
                  {loading ? (
                      <div className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-500 font-bold">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Đang xử lý...
                      </div>
                  ) : (
                      <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => {
                            setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
                          }}
                          useOneTap={false}
                          text="signin_with"
                          shape="pill"
                          width="360"
                      />
                  )}
                </div>

                <div className="gsap-form-element mt-8 text-center font-medium text-slate-500">
                  Chưa có tài khoản?{" "}
                  <Link to={ROUTES.REGISTER} className="text-sky-600 hover:text-sky-500 font-bold transition-colors">
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