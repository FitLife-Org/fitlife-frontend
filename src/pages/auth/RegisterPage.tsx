import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import CustomCursor from "../../components/common/CustomCursor";
import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";
import { validateRegister } from "../../utils/validators/registerValidator";
import { useAuthStore } from "../../store/authStore";

export default function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const containerRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const updateField = (e: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setForm((prev) => ({...prev, [name]: value}));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({...prev, [name]: ""}));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const validationErrors = validateRegister(form);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        username: form.username.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      };

      const authSession = await authService.register(registerData);
      setSession(authSession);

      alert("Đăng ký thành công!");
      navigate(ROUTES.MEMBER_HOME, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại.");
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
            {opacity: 0, x: 50},
            {opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: "power3.out"}
        );
      }

      if (formRef.current) {
        tl.fromTo(
            formRef.current,
            {opacity: 0, y: 30, scale: 0.95},
            {opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out"},
            "-=0.4"
        );

        tl.fromTo(
            formRef.current.querySelectorAll(".gsap-form-element"),
            {opacity: 0, y: 15},
            {opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out"},
            "-=0.4"
        );
      }
    }, {scope: containerRef});

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
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] transition-all duration-700"/>

          {/* Nội dung chính */}
          <div className="relative z-10 grid min-h-screen w-full lg:grid-cols-2">

            {/* Cột trái (Form đăng ký): order-2 lg:order-1 */}
            <section className="flex items-center justify-center p-4 lg:p-12 order-2 lg:order-1">
              <div ref={formRef}
                   className="relative w-full max-w-md rounded-[2rem] bg-white/80 p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-2xl border border-white/60 lg:p-10 overflow-hidden">
                <div
                    className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl pointer-events-none"/>
                <div
                    className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl pointer-events-none"/>

                <div className="relative z-10 flex flex-col">
                  <header className="mb-8 text-center lg:text-left gsap-form-element">
                    <div className="inline-block rounded-xl bg-sky-50 px-3 py-1 mb-4 lg:hidden">
                      <div className="flex items-center justify-center gap-2 text-sky-600 font-bold">
                        <span>FitLife</span>
                      </div>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center">Tạo tài khoản</h2>
                    <p className="mt-2 text-slate-500 font-medium text-center">Bắt đầu theo dõi tiến độ của bạn.</p>
                  </header>

                  {error && (
                      <div
                          className="gsap-form-element mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600 backdrop-blur-sm">
                        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {error}
                      </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="gsap-form-element">
                      <Input
                          label="Tên đăng nhập"
                          name="username"
                          value={form.username}
                          onChange={updateField}
                          required
                          error={fieldErrors.username}
                          className="bg-white"
                      />
                    </div>

                    <div className="gsap-form-element">
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

                    <div className="gsap-form-element">
                      <Input
                          label="Mật khẩu"
                          name="password"
                          type="password"
                          value={form.password}
                          onChange={updateField}
                          required
                          minLength={6}
                          error={fieldErrors.password}
                          className="bg-white"
                      />
                    </div>

                    <div className="gsap-form-element">
                      <Input
                          label="Xác nhận mật khẩu"
                          name="confirmPassword"
                          type="password"
                          value={form.confirmPassword}
                          onChange={updateField}
                          required
                          minLength={6}
                          error={fieldErrors.confirmPassword}
                          className="bg-white"
                      />
                    </div>

                    <div className="gsap-form-element pt-4">
                      <Button
                          className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white transition-all font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 text-base"
                          type="submit"
                          isLoading={loading}
                      >
                        Đăng ký ngay
                      </Button>
                    </div>

                    <div className="gsap-form-element mt-6 text-center font-medium text-slate-500">
                      Đã có tài khoản?{" "}
                      <Link to={ROUTES.LOGIN} className="text-sky-600 hover:text-sky-500 font-bold transition-colors">
                        Đăng nhập
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </section>

            {/* Cột phải (Intro): order-1 lg:order-2 */}
            <section ref={introRef}
                     className="hidden flex-col justify-center p-12 text-slate-900 lg:flex lg:pr-24 order-1 lg:order-2 items-end text-right">
              <div className="flex items-center gap-2 text-3xl font-black mb-2 flex-row-reverse">
                <div className="p-3">
                  <img
                      src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png"
                      alt="FitLife logo"
                      className="w-35 object-contain"
                  />
                </div>
                <span
                    className="tracking-tight text-5xl bg-clip-text text-transparent bg-gradient-to-l from-green-500 to-cyan-500">FitLife</span>
              </div>

              <div className="max-w-x2">
                <h1 className="text-5xl lg:text-5xl font-black leading-[1.15] mb-6 text-slate-900">
                  Bắt đầu hành trình<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-sky-600 to-cyan-500">
                thay đổi bản thân
              </span>
                </h1>

                <p className="text-lg leading-relaxed text-slate-700 border-r-4 border-sky-500 pr-6 bg-white/50 backdrop-blur-sm py-3 pl-4 rounded-l-xl shadow-sm border-white/60 border-y border-l">
                  Tham gia cộng đồng FitLife để được theo dõi tiến độ chi tiết, đặt lịch tập luyện, và nhận các gói tập
                  tối ưu dành riêng cho bạn.
                </p>

                <div
                    className="mt-10 flex flex-wrap items-center justify-end gap-2 sm:gap-4 border-r-2 border-sky-500/40 pr-6">
                  {["GO", "HARD", "OR", "GO HOME"].map((text, idx) => {
                    const isActive = activeStep === idx;
                    return (
                        <div key={text} className="flex items-center gap-2 sm:gap-4 flex-row-reverse">
                    <span
                        className={`font-black tracking-widest transition-all duration-500 ${isActive ? "scale-110 bg-gradient-to-l from-sky-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]" : "scale-100 text-slate-600"}`}
                        style={{fontSize: "1.5rem"}}
                    >
                      {text}
                    </span>
                          {idx > 0 && <ArrowRight
                              className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-500 ${isActive ? "text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" : "text-slate-800"} rotate-180`}/>}
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

