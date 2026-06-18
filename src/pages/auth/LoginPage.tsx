import { FormEvent, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Dumbbell, Loader2 } from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || ROUTES.MEMBER_HOME;

  // Xử lý Đăng nhập qua Google
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        setLoading(true);
        setError("");
        console.log("Google Credentials:", credentialResponse);
      } catch (eer){
        console.error("Gooogle login thất bại ", eer)
        setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Cửa sổ đăng nhập Google đã đóng hoặc có lỗi xảy ra.");
    }
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await authService.login({ username, password });
      setSession(session);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tài khoản hoặc mật khẩu không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  useGSAP(() => {
    const tl = gsap.timeline();

    // Hiệu ứng cho phần giới thiệu bên trái
    if (introRef.current) {
      tl.fromTo(
        introRef.current.children,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }
      );
    }

    // Hiệu ứng cho form bên phải
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

  return (
      <main ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center">
        {/* Overlay tối mờ phủ toàn bộ background */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-700" />

        {/* Nội dung chính chia 2 cột */}
        <div className="relative z-10 grid min-h-screen w-full lg:grid-cols-2">
          
          {/* Cột trái: Thông điệp (ẩn trên mobile) */}
          <section ref={introRef} className="hidden flex-col justify-center p-12 text-white lg:flex lg:pl-24">
            <div className="flex items-center gap-3 text-3xl font-black mb-10">
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md">
                <Dumbbell className="h-8 w-8 text-sky-400 drop-shadow-md" />
              </div>
              <span className="tracking-tight drop-shadow-md">FitLife</span>
            </div>
            
            <div className="max-w-xl">
              <h1 className="text-5xl lg:text-6xl font-black leading-[1.15] drop-shadow-lg mb-6">
                Quản lý phòng gym <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 drop-shadow-none">
                  gọn gàng hơn
                </span> mỗi ngày.
              </h1>
              <p className="text-lg leading-relaxed text-slate-200 drop-shadow-md border-l-4 border-sky-400 pl-6 bg-slate-900/20 py-2 rounded-r-lg">
                Theo dõi hội viên, gói tập, check-in, lịch trainer và thanh toán trong một trải nghiệm thống nhất và mượt mà.
              </p>
            </div>
            
            <div className="mt-16 flex items-center gap-4 text-sm font-medium text-slate-300">
              <div className="h-px w-12 bg-sky-500/50" />
              React + Vite + TypeScript + Tailwind
            </div>
          </section>

          {/* Cột phải: Form đăng nhập */}
          <section className="flex items-center justify-center p-4 lg:p-12">
            <div ref={formRef} className="w-full max-w-md rounded-[2rem] bg-white/95 p-8 shadow-2xl backdrop-blur-xl border border-white/20 lg:p-10">
              <div className="mb-8 text-center lg:text-left gsap-form-element">
                <div className="inline-block rounded-xl bg-sky-50 px-3 py-1 mb-4 lg:hidden">
                  <div className="flex items-center gap-2 text-sky-600 font-bold">
                    <Dumbbell className="h-5 w-5" />
                    <span>FitLife</span>
                  </div>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Chào mừng trở lại</h2>
                <p className="mt-2 text-slate-500 font-medium">Nhập thông tin tài khoản của bạn để tiếp tục.</p>
              </div>

              {/* Hiển thị lỗi */}
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
                        label="Tên đăng nhập"
                        name="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                        className="bg-white"
                    />
                  </div>
                  <div className="gsap-form-element">
                    <Input
                        label="Mật khẩu"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        className="bg-white"
                    />
                  </div>
                </div>

                <div className="mt-2 flex justify-end gsap-form-element">
                  <Link className="text-sm font-bold text-sky-600 hover:text-sky-500 transition-colors" to={ROUTES.FORGOT_PASSWORD}>
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

                {/* Phần dải phân cách */}
                <div className="gsap-form-element mt-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                  <span className="uppercase text-slate-400 text-xs font-black tracking-widest">Hoặc</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
                </div>

                {/* Nút Đăng nhập Google */}
                <div className="gsap-form-element">
                  <button
                      type="button"
                      onClick={() => handleGoogleLogin()}
                      disabled={loading}
                      className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-700 hover:bg-slate-50 hover:border-slate-200 font-bold text-base transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : (
                        <>
                          <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                          Tiếp tục với Google
                        </>
                    )}
                  </button>
                </div>

                <div className="gsap-form-element mt-8 text-center font-medium text-slate-500">
                  Chưa có tài khoản?{" "}
                  <Link to={ROUTES.REGISTER} className="text-sky-600 hover:text-sky-500 font-bold transition-colors">
                    Đăng ký ngay
                  </Link>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
  );
}