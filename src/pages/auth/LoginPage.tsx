import { FormEvent, useState, useRef, ChangeEvent, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Dumbbell, Loader2, ArrowRight } from "lucide-react";
// Đổi từ useGoogleLogin sang GoogleLogin component
import { GoogleLogin } from '@react-oauth/google';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import CustomCursor from "../../components/common/CustomCursor";
import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { validateLogin } from "../../utils/validators/loginValidator";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);

  // Gộp state form để dễ quản lý và mở rộng
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Khai báo kiểu dữ liệu useRef chuẩn cho TypeScript
  const containerRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const locationState = location.state as { from?: { pathname?: string } } | null;

  // Xử lý thay đổi input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const getRedirectPath = (roles: string[]) => {
    if (locationState?.from?.pathname) return locationState.from.pathname;
    if (roles.includes("ADMIN")) return ROUTES.ADMIN_DASHBOARD;
    if (roles.includes("STAFF")) return ROUTES.STAFF_CHECKIN;
    if (roles.includes("TRAINER")) return ROUTES.TRAINER_SCHEDULE;
    return ROUTES.MEMBER_HOME;
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
      const session = await authService.login(formData);
      setSession(session);
      navigate(getRedirectPath(session.user.roles), { replace: true });
    } catch (err: any) {
      if (err.data && typeof err.data === 'object') {
        setFieldErrors(err.data as Record<string, string>);
        setError(err.message || "Đăng nhập thất bại.");
      } else {
        setError(err.message || "Tài khoản hoặc mật khẩu không chính xác.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Hiệu ứng GSAP
  const { contextSafe } = useGSAP(() => {
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
          formRef.current.querySelectorAll('.gsap-form-element'),
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
          className="fit-page relative w-full overflow-hidden bg-[url('https://images.unsplash.com/photo-1593079831268-3381b0c42369?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center"
      >
        <CustomCursor />
        {/* Overlay sáng mờ phủ toàn bộ background để hợp với tone sáng */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[4px] transition-all duration-700" />

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
              <span className="tracking-tight text-5xl bg-clip-text text-transparent bg-gradient-to-r from-fit-primary to-fit-teal">FitLife</span>
            </div>

            <div className="max-w-x2">
              <h1 className="text-5xl lg:text-5xl font-black leading-[1.15] mb-6 text-slate-900">
                Làm chủ phòng gym<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fit-primary to-fit-teal">
                gọn – chuẩn – chiến
              </span> mỗi ngày.
              </h1>

              <p className="text-lg leading-relaxed text-slate-700 border-l-4 border-fit-primary pl-6 bg-white/50 backdrop-blur-sm py-3 pr-4 rounded-r-xl shadow-sm border-white/60 border-y border-r">
                Quản lý hội viên, gói tập, check-in, lịch PT và thanh toán — tất cả trong một hệ thống mượt, nhanh, không độ trễ. Vận hành trơn tru, tập trung build cơ – không build stress.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-2 sm:gap-4 border-l-2 border-fit-primary/40 pl-6">
                {["EAT", "SLEEP", "GYM", "REPEAT"].map((text, idx) => {
                  const isActive = activeStep === idx;
                  return (
                      <div key={text} className="flex items-center gap-2 sm:gap-4">
                            <span
                                className={`font-black tracking-widest transition-all duration-500 ${isActive ? "scale-110 bg-gradient-to-r from-fit-primary to-fit-teal bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(5,150,105,0.6)]" : "scale-100 text-slate-600"}`}
                                style={{ fontSize: "1.5rem" }}
                            >
                                {text}
                            </span>
                        {idx < 3 && <ArrowRight className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-500 ${isActive ? "text-fit-primary drop-shadow-[0_0_8px_rgba(5,150,105,0.8)]" : "text-slate-800"}`} />}
                      </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Cột phải: Form đăng nhập */}
          <section className="flex items-center justify-center p-4 lg:p-12">
            <div ref={formRef} className="fit-card relative w-full max-w-md p-8 lg:p-10 overflow-hidden hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-fit-primarySoft via-transparent to-fit-teal/10 opacity-50"></div>
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-fit-primary/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-fit-teal/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col">
                <header className="mb-8 text-center lg:text-left gsap-form-element">
                  <div className="inline-block rounded-xl bg-fit-primarySoft px-3 py-1 mb-4 lg:hidden">
                    <div className="flex items-center gap-2 text-fit-primary font-bold">
                      <span>FitLife</span>
                    </div>
                  </div>
                  <h2 className="fit-title text-center">Chào mừng trở lại</h2>
                  <p className="fit-subtitle text-center">Nhập thông tin tài khoản của bạn để tiếp tục.</p>
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
                          name="identifier"
                          value={formData.identifier}
                          onChange={handleInputChange}
                          error={fieldErrors.identifier}
                          className="bg-transparent"
                          type="text"
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
                          className="bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 gsap-form-element">
                    <div className="flex items-center gap-2">
                      <input
                          type="checkbox"
                          id="remember-me"
                          className="w-4 h-4 text-fit-primary border-gray-300 rounded focus:ring-fit-primary cursor-pointer"
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

                  {/* Nút Đăng nhập Google sử dụng component chính chủ để lấy idToken */}
                  <div className="gsap-form-element mt-6 flex justify-center w-full">
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                          try {
                            setLoading(true);
                            setError("");

                            if (credentialResponse.credential) {
                              // Gửi trực tiếp credential (chính là idToken) lên backend
                              const session = await authService.googleLogin({ idToken: credentialResponse.credential });
                              setSession(session);
                              navigate(getRedirectPath(session.user.roles), { replace: true });
                            } else {
                              throw new Error("Không nhận được token từ Google");
                            }
                          } catch (error) {
                            console.error("Google login thất bại:", error);
                            setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        onError={() => {
                          setError("Cửa sổ đăng nhập Google đã đóng hoặc có lỗi xảy ra.");
                        }}
                        theme="outline"     // Phù hợp với theme sáng
                        size="large"        // Lớn, dễ bấm
                        shape="pill"        // Cạnh bo tròn cho giống button hiện tại
                        text="continue_with"
                    />
                  </div>

                  <div className="gsap-form-element mt-8 text-center font-medium text-slate-500">
                    Chưa có tài khoản?{" "}
                    <Link to={ROUTES.REGISTER} className="fit-auth-link">
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