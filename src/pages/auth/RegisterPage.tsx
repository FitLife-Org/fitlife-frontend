import { FormEvent, useState, useRef, ChangeEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, CheckCircle2, Zap, Shield, UserPlus } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import CustomCursor from "../../components/common/CustomCursor";
import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { validateRegister } from "../../utils/validators/registerValidator";
import { showAlert } from "../../utils/alert";

export default function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ username: "", fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);

  const updateField = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
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
      const { confirmPassword, ...registerData } = form;
      const session = await authService.register(registerData);
      setSession(session);
      showAlert.success("Thành công", "Đăng ký thành công!");
      navigate(ROUTES.MEMBER_HOME, { replace: true });
    } catch (err: any) {
      if (err.data && typeof err.data === 'object') {
        setFieldErrors(err.data as Record<string, string>);
        setError(err.message || "Vui lòng kiểm tra lại thông tin.");
      } else {
        setError(err instanceof Error ? err.message : "Đăng ký thất bại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const { contextSafe } = useGSAP(() => {
    const tl = gsap.timeline();

    // Background scale effect
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        scale: 1.05,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    // Floating orbs
    if (orbsRef.current) {
      const orbs = orbsRef.current.children;
      Array.from(orbs).forEach((orb, i) => {
        gsap.to(orb, {
          y: "random(-40, 40)",
          x: "random(-40, 40)",
          duration: "random(4, 7)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.5
        });
      });
    }

    if (introRef.current) {
      tl.fromTo(
        introRef.current.querySelectorAll('.gsap-intro'),
        { opacity: 0, x: -40, filter: "blur(5px)" },
        { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );
    }

    if (formRef.current) {
      tl.fromTo(
        formRef.current,
        { opacity: 0, y: 40, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );

      tl.fromTo(
        formRef.current.querySelectorAll('.gsap-form-element'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
        "-=0.4"
      );
    }
  }, { scope: containerRef });

  const features = [
    { icon: <Zap className="w-5 h-5 text-amber-500" />, title: "Tập luyện hiệu quả", desc: "Lộ trình được cá nhân hóa" },
    { icon: <CheckCircle2 className="w-5 h-5 text-fit-primary" />, title: "Theo dõi tiến độ", desc: "Biểu đồ phân tích trực quan" },
    { icon: <Shield className="w-5 h-5 text-fit-blue" />, title: "Quản lý mục tiêu", desc: "Dễ dàng đạt được kết quả" },
  ];

  return (
    <main ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-fit-bg flex items-center justify-center font-sans selection:bg-fit-primary/30">
      <CustomCursor />
      
      {/* Dynamic Background */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/95 to-fit-primarySoft/90 backdrop-blur-md" />
      </div>

      {/* Floating Decorative Orbs */}
      <div ref={orbsRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[5%] left-[10%] w-[35rem] h-[35rem] rounded-full bg-gradient-to-br from-fit-primary/15 to-transparent blur-3xl mix-blend-multiply" />
        <div className="absolute bottom-[5%] right-[10%] w-[45rem] h-[45rem] rounded-full bg-gradient-to-br from-fit-blue/10 to-transparent blur-3xl mix-blend-multiply" />
        <div className="absolute top-[40%] left-[50%] w-[25rem] h-[25rem] rounded-full bg-gradient-to-br from-fit-purple/10 to-transparent blur-3xl mix-blend-multiply" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl p-4 lg:p-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 min-h-screen lg:min-h-0 py-12 lg:py-8">
        
        {/* Intro Section - Left on Desktop */}
        <section ref={introRef} className="hidden lg:flex w-full lg:w-1/2 flex-col justify-center space-y-8">
          <Link to={ROUTES.HOME} className="gsap-intro inline-flex items-center gap-3 w-fit group">
            <div className="p-2.5 bg-white rounded-2xl shadow-soft group-hover:shadow-card transition-all duration-300">
              <img
                src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png"
                alt="FitLife logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="text-3xl font-black tracking-tight text-slate-800">
              Fit<span className="text-fit-primary">Life</span>
            </span>
          </Link>

          <div className="space-y-6">
            <h1 className="gsap-intro text-5xl lg:text-6xl font-black leading-[1.1] text-slate-900 tracking-tight">
              Khởi đầu <br/>
              <span className="relative inline-block mt-2">
                <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-fit-primary via-fit-primaryHover to-fit-blue">
                  hành trình mới
                </span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-fit-primary/20 -z-10 rounded-full" />
              </span>
            </h1>
            
            <p className="gsap-intro text-lg text-slate-600 max-w-md leading-relaxed">
              Tạo tài khoản ngay hôm nay để nhận được lộ trình tập luyện cá nhân hóa và khám phá phiên bản tốt nhất của chính bạn.
            </p>
          </div>

          <div className="gsap-intro grid gap-4 mt-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 max-w-sm hover:-translate-y-0.5 transform">
                <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{feature.title}</h3>
                  <p className="text-slate-500 text-sm mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Form Section - Right on Desktop */}
        <section className="w-full max-w-md lg:w-1/2 flex justify-center">
          <div ref={formRef} className="w-full bg-white/80 backdrop-blur-2xl p-8 lg:p-10 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white relative overflow-hidden">
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-fit-primary via-fit-blue to-fit-purple" />
            
            <header className="mb-8 text-center gsap-form-element">
              <div className="inline-flex lg:hidden items-center gap-2 mb-6">
                 <div className="p-2 bg-white rounded-xl shadow-sm">
                   <img
                    src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png"
                    alt="FitLife logo"
                    className="w-6 h-6 object-contain"
                  />
                 </div>
                <span className="text-2xl font-black text-slate-800 tracking-tight">FitLife</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-2 tracking-tight">
                <UserPlus className="w-6 h-6 text-fit-primary" />
                Đăng ký
              </h2>
              <p className="text-slate-500 mt-2 text-sm">Điền thông tin bên dưới để tiếp tục</p>
            </header>

            {error && (
              <div className="gsap-form-element mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/80 p-4 text-sm text-red-600 backdrop-blur-md">
                <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="gsap-form-element grid grid-cols-2 gap-4">
                <Input
                  label="Tên đăng nhập"
                  name="username"
                  value={form.username}
                  onChange={updateField}
                  required
                  minLength={4}
                  maxLength={50}
                  error={fieldErrors.username}
                  className="bg-white/60 border-slate-200/60 focus:bg-white focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10 transition-all duration-300 rounded-xl"
                />
                <Input
                  label="Họ tên"
                  name="fullName"
                  value={form.fullName}
                  onChange={updateField}
                  required
                  error={fieldErrors.fullName}
                  className="bg-white/60 border-slate-200/60 focus:bg-white focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10 transition-all duration-300 rounded-xl"
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
                  className="bg-white/60 border-slate-200/60 focus:bg-white focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10 transition-all duration-300 rounded-xl"
                />
              </div>
              <div className="gsap-form-element">
                <Input
                  label="Số điện thoại"
                  name="phone"
                  value={form.phone}
                  onChange={updateField}
                  error={fieldErrors.phone}
                  className="bg-white/60 border-slate-200/60 focus:bg-white focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10 transition-all duration-300 rounded-xl"
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
                  className="bg-white/60 border-slate-200/60 focus:bg-white focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10 transition-all duration-300 rounded-xl"
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
                  className="bg-white/60 border-slate-200/60 focus:bg-white focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10 transition-all duration-300 rounded-xl"
                />
              </div>

              <div className="gsap-form-element pt-2">
                <Button
                  className="w-full py-4 h-auto text-base font-semibold rounded-xl bg-slate-900 text-white hover:bg-fit-primary hover:shadow-[0_8px_20px_rgba(5,150,105,0.3)] hover:-translate-y-0.5 transition-all duration-300 group flex items-center justify-center gap-2"
                  type="submit"
                  isLoading={loading}
                >
                  Tạo tài khoản
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="gsap-form-element mt-6 text-center text-sm font-medium text-slate-500">
                Đã có tài khoản?{" "}
                <Link to={ROUTES.LOGIN} className="text-fit-primary hover:text-fit-primaryHover hover:underline underline-offset-4 transition-all">
                  Đăng nhập ngay
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
