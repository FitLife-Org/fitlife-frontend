import { useState, useEffect, useRef, type ChangeEvent, type SyntheticEvent } from "react";
import { AlertCircle, User, Eye, EyeOff, Loader2, Lock, ArrowRight, Mail, Phone, UserPlus, Check } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore"; 
import axiosInstance from '../../api/axiosClient';
import { useGoogleLogin } from '@react-oauth/google';

interface LoginFormState { username: string; password: string; }
interface RegisterFormState { username: string; fullname: string; phone: string; email: string; password: string; confirmPassword: string; }

export default function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();

   
    const isLogin = location.pathname !== "/register"; 

    const containerRef = useRef<HTMLDivElement>(null);
    const leftPanelRef = useRef<HTMLElement>(null);
    const rightPanelRef = useRef<HTMLElement>(null);
    const formContainerRef = useRef<HTMLDivElement>(null);
    const [activeStep, setActiveStep] = useState(0);

    const { contextSafe } = useGSAP({ scope: containerRef });

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 4);
        }, 1200);
        return () => clearInterval(interval);
    }, []);
    

    useGSAP(() => {
        gsap.fromTo(
            leftPanelRef.current,
            { opacity: 0, x: -40 },
            { opacity: 1, x: 0, duration: 1.2, ease: "expo.out", delay: 0.1 }
        );
        gsap.fromTo(
            formContainerRef.current,
            { opacity: 0, y: 30, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "expo.out", delay: 0.25 }
        );
    }, { scope: containerRef });

    const toggleAuthMode = contextSafe(() => {
        const isDesktop = window.innerWidth >= 1024;
        const tl = gsap.timeline({ defaults: { ease: "expo.inOut" } });

        tl.to(formContainerRef.current, {
            opacity: 0,
            y: 20,
            scale: 0.97,
            duration: 0.35,
            ease: "power3.in",
        });

        tl.call(() => {
            if (isLogin) {
                navigate("/register");
            } else {
                navigate("/login");
            }
        });

        if (isDesktop) {
            const leftTarget = isLogin ? 100 : 0;
            const rightTarget = isLogin ? -100 : 0;

            tl.to(
                leftPanelRef.current,
                { xPercent: leftTarget, duration: 1.1 },
                "-=0.15"
            ).to(
                rightPanelRef.current,
                { xPercent: rightTarget, duration: 1.1 },
                "<"
            );
        }

        tl.fromTo(
            formContainerRef.current,
            { opacity: 0, y: -24, scale: 0.97 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.75,
                ease: "back.out(1.4)",
            },
            isDesktop ? "-=0.5" : "+=0.05"
        );
    });

    return (
        <div ref={containerRef} className="relative min-h-screen text-slate-100 selection:bg-sky-500/30 overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-[2px]" />

            <div className="relative z-10 flex min-h-screen flex-col lg:flex-row w-full">
                <section
                    ref={leftPanelRef}
                    className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between p-12 xl:p-16 border-r border-white/10 z-20 bg-[#020617]/40 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-3 text-4xl font-black tracking-wider text-white">
                        <img src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png" alt="FitLife" className="w-40" />
                        FitLife
                    </div>

                    <div className="mt-0 mb-auto">
                        <h1 className="max-w-2xl font-black leading-[1.1] tracking-tight text-white drop-shadow-md" style={{ fontSize: "3.75rem" }}>
                            {isLogin ? "Defy your limits." : "Break boundaries"}
                            <span className="mt-2 block bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent h-18 drop-shadow-sm">
                                {isLogin ? "Define your legacy." : "Build your legacy"}
                            </span>
                        </h1>

                        <p className="mt-5 max-w-lg leading-relaxed text-slate-300 drop-shadow" style={{ fontSize: "1.125rem" }}>
                            {isLogin
                                ? "Transform your body, elevate your mind, and become the best version of yourself. Join thousands of athletes achieving their goals with personalized training and expert guidance."
                                : "Push past your limits and forge the ultimate version of yourself. Join a community of driven individuals leveling up with custom plans and expert coaching"}
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

                    <div className="flex justify-between items-center pr-8 tracking-wide text-slate-400" style={{ fontSize: "0.875rem" }}>
                        <p>© {new Date().getFullYear()} FitLife. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                        </div>
                    </div>
                </section>

                <section
                    ref={rightPanelRef}
                    className="flex w-full lg:w-1/2 items-center justify-center px-4 py-10 sm:px-6 relative z-10"
                >
                    <div
                        ref={formContainerRef}
                        className={`w-full ${isLogin ? "max-w-md" : "max-w-2xl"} transition-[max-width] duration-700 ease-in-out rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl sm:p-10`}
                    >
                        {isLogin ? (
                            <LoginForm onToggle={toggleAuthMode} />
                        ) : (
                            <RegisterForm onToggle={toggleAuthMode} />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function LoginForm({ onToggle }: { onToggle: () => void }) {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [form, setForm] = useState<LoginFormState>({ username: "", password: "" });
    const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({}); 
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    useGSAP(() => {
        const fields = formRef.current?.querySelectorAll(".field-row");
        if (fields) {
            gsap.fromTo(fields, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.08, delay: 0.1 });
        }
    }, { scope: formRef });

    useEffect(() => {
        const btn = submitButtonRef.current;
        if (!btn) return;

        const onEnter = () => gsap.to(btn, { scale: 1.02, duration: 0.18, ease: "power3.out" });
        const onLeave = () => gsap.to(btn, { scale: 1, duration: 0.18, ease: "power3.out" });

        btn.addEventListener("mouseenter", onEnter);
        btn.addEventListener("mouseleave", onLeave);

        return () => {
            btn.removeEventListener("mouseenter", onEnter);
            btn.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    
        if (fieldErrors[e.target.name as keyof typeof fieldErrors]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
        }
    };

    const validateForm = () => {
        const errors: { username?: string; password?: string } = {};
        let isValid = true;

        if (!form.username.trim()) {
            errors.username = "Username không được để trống";
            isValid = false;
        }

        if (!form.password) {
            errors.password = "Mật khẩu không được để trống";
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");
        
        if (!validateForm()) return; // Chặn Submit nếu lỗi

        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post('/auth/login', {
                username: form.username,
                password: form.password
            });

            const token = response.data?.data?.token;

            if (token) {
                localStorage.setItem('token', token);
                login(token);
                navigate('/me');
            } else {
                setErrorMessage("Đăng nhập thất bại, không nhận được token.");
            }
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || "Sai tài khoản hoặc mật khẩu.");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsSubmitting(true);
                setErrorMessage("");
                
              
                const response = await axiosInstance.post('/auth/google', {
                    token: tokenResponse.access_token
                });

                const token = response.data?.data?.token;

                if (token) {
                    localStorage.setItem('token', token);
                    login(token); 
                    navigate('/me');
                } else {
                    setErrorMessage("Đăng nhập Google thất bại, không nhận được token.");
                }
            } catch (err: any) {
                setErrorMessage(err.response?.data?.message || "Lỗi xác thực Google với Backend.");
            } finally {
                setIsSubmitting(false);
            }
        },
        onError: () => {
            setErrorMessage('Tài khoản Google từ chối quyền truy cập.');
        }
    });

    return (
        <div ref={formRef}>
            <div className="field-row mb-10 text-center">
              <img src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png" alt="FitLife" className="w-24 mx-auto mb-2" />
                
              <h2 className="tracking-tight text-white font-bold text-3xl">Welcome back</h2>
                <p className="mt-2 text-slate-300 text-sm">Enter your details to access your account.</p>
            </div>

            {errorMessage && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 shadow-inner text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Form Inputs (Giữ nguyên như cũ) */}
                <div className="field-row space-y-1.5">
                    <label className="text-slate-200 pl-1 text-sm">Username</label>
                    <div className="relative group">
                        <User className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${fieldErrors.username ? 'text-red-400' : 'text-slate-400 group-focus-within:text-sky-400'}`} />
                        <input name="username" type="text" value={form.username} onChange={handleChange} placeholder="your_username" 
                            className={`w-full rounded-2xl border bg-black/40 px-12 py-4 text-slate-100 outline-none transition-all duration-200 shadow-inner ${fieldErrors.username ? 'border-red-500/50 focus:ring-red-500/20' : 'border-white/10 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/20'}`} />
                    </div>
                    {fieldErrors.username && <p className="text-red-400 text-xs pl-1 mt-1">{fieldErrors.username}</p>}
                </div>

                <div className="field-row space-y-1.5">
                    <label className="text-slate-200 pl-1 text-sm">Password</label>
                    <div className="relative group">
                        <Lock className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-sky-400'}`} />
                        <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="••••••••" 
                            className={`w-full rounded-2xl border bg-black/40 px-12 py-4 text-slate-100 outline-none transition-all duration-200 shadow-inner ${fieldErrors.password ? 'border-red-500/50 focus:ring-red-500/20' : 'border-white/10 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/20'}`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-400 transition-colors">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    {fieldErrors.password && <p className="text-red-400 text-xs pl-1 mt-1">{fieldErrors.password}</p>}
                </div>

                <div className="field-row flex items-center justify-between pl-1">
                    <label className="group flex cursor-pointer items-center gap-2.5">
                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer sr-only" />
                        <div className="h-5 w-5 rounded-md border border-white/20 bg-black/40 peer-checked:bg-sky-500 peer-checked:border-sky-500 relative transition-colors duration-200">
                            <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-slate-300 text-sm">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-sky-400 hover:text-sky-300 text-sm transition-colors">
                        Forgot password?
                    </Link>
                </div>

                <div className="field-row">
                    <button ref={submitButtonRef} type="submit" disabled={isSubmitting} className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-4 text-white font-bold text-sm hover:from-sky-400 hover:to-blue-500 disabled:opacity-70 transition-all duration-200">
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign in to your account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
                    </button>
                </div>
            </form>

            <div className="field-row mt-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
                <span className="uppercase text-slate-400 text-xs font-semibold">Or continue with</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
            </div>

            <div className="field-row">
          
                <button 
                    type="button" 
                    onClick={() => handleGoogleLogin()} 
                    disabled={isSubmitting}
                    className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white hover:bg-white/[0.1] font-semibold text-sm transition-all duration-200 disabled:opacity-70"
                >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <>
                            <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Google
                        </>
                    )}
                </button>
            </div>

            <div className="field-row mt-8 text-center text-slate-400 text-sm">
                Don't have an account?{" "}
                <button type="button" onClick={(e) => { e.preventDefault(); onToggle(); }} className="text-white hover:text-sky-400 font-semibold underline underline-offset-4 cursor-pointer transition-colors">
                    Create one now
                </button>
            </div>
        </div>
    );

}

function RegisterForm({ onToggle }: { onToggle: () => void }) {
    const [form, setForm] = useState<RegisterFormState>({ username: "", fullname: "", phone: "", email: "", password: "", confirmPassword: "" });
    const [fieldErrors, setFieldErrors] = useState<Partial<RegisterFormState>>({}); 
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    useGSAP(() => {
        const fields = formRef.current?.querySelectorAll(".field-row");
        if (fields) {
            gsap.fromTo(fields, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.07, delay: 0.1 });
        }
    }, { scope: formRef });

    useEffect(() => {
        const btn = submitButtonRef.current;
        if (!btn) return;

        const onEnter = () => gsap.to(btn, { scale: 1.02, duration: 0.18, ease: "power3.out" });
        const onLeave = () => gsap.to(btn, { scale: 1, duration: 0.18, ease: "power3.out" });

        btn.addEventListener("mouseenter", onEnter);
        btn.addEventListener("mouseleave", onLeave);

        return () => {
            btn.removeEventListener("mouseenter", onEnter);
            btn.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name as keyof RegisterFormState]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
        }
    };

    const validateForm = () => {
        const errors: Partial<RegisterFormState> = {};
        let isValid = true;

        if (!form.username.trim() || form.username.length < 3) {
            errors.username = "Username tối thiểu 3 ký tự";
            isValid = false;
        }
        if (!form.fullname.trim()) {
            errors.fullname = "Họ tên không được để trống";
            isValid = false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            errors.email = "Định dạng email không hợp lệ";
            isValid = false;
        }

        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(form.phone)) {
            errors.phone = "SĐT không hợp lệ (10 số, bắt đầu bằng 0)";
            isValid = false;
        }

        if (form.password.length < 6) {
            errors.password = "Mật khẩu tối thiểu 6 ký tự";
            isValid = false;
        }
        if (form.password !== form.confirmPassword) {
            errors.confirmPassword = "Mật khẩu xác nhận không khớp";
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await axiosInstance.post('/auth/register', {
                username: form.username,
                fullName: form.fullname,
                email: form.email,
                phone: form.phone,
                password: form.password
            });

            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            onToggle();

        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || "Email hoặc Username đã tồn tại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInputClass = (fieldName: keyof RegisterFormState) => 
        `w-full rounded-2xl border bg-black/40 px-12 py-3 text-slate-100 outline-none transition-all duration-200 shadow-inner ${fieldErrors[fieldName] ? 'border-red-500/50 focus:ring-red-500/20' : 'border-white/10 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/20'}`;

    return (
        <div ref={formRef}>
            <div className="field-row mb-6 text-center">
                <img src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png" alt="FitLife" className="w-24 mx-auto mb-2" />
                <h2 className="tracking-tight text-white font-bold text-3xl">Register FitLife</h2>
                <p className="mt-2 text-slate-300 text-sm">Create your account and start your fitness journey.</p>
            </div>

            {errorMessage && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 shadow-inner text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="field-row grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-slate-200 pl-1 text-sm">Username</label>
                        <div className="relative group">
                            <User className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${fieldErrors.username ? 'text-red-400' : 'text-slate-400 group-focus-within:text-sky-400'}`} />
                            <input name="username" type="text" value={form.username} onChange={handleChange} placeholder="your_username" className={getInputClass('username')} />
                        </div>
                        {fieldErrors.username && <p className="text-red-400 text-xs pl-1 mt-1">{fieldErrors.username}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-slate-200 pl-1 text-sm">Full Name</label>
                        <div className="relative group">
                            <UserPlus className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${fieldErrors.fullname ? 'text-red-400' : 'text-slate-400 group-focus-within:text-sky-400'}`} />
                            <input name="fullname" type="text" value={form.fullname} onChange={handleChange} placeholder="NgTKhoa" className={getInputClass('fullname')} />
                        </div>
                        {fieldErrors.fullname && <p className="text-red-400 text-xs pl-1 mt-1">{fieldErrors.fullname}</p>}
                    </div>
                </div>

                <div className="field-row grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-slate-200 pl-1 text-sm">Email</label>
                        <div className="relative group">
                            <Mail className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-sky-400'}`} />
                            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={getInputClass('email')} />
                        </div>
                        {fieldErrors.email && <p className="text-red-400 text-xs pl-1 mt-1">{fieldErrors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-slate-200 pl-1 text-sm">Phone Number</label>
                        <div className="relative group">
                            <Phone className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${fieldErrors.phone ? 'text-red-400' : 'text-slate-400 group-focus-within:text-sky-400'}`} />
                            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="0912 345 678" className={getInputClass('phone')} />
                        </div>
                        {fieldErrors.phone && <p className="text-red-400 text-xs pl-1 mt-1">{fieldErrors.phone}</p>}
                    </div>
                </div>

                <div className="field-row grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-slate-200 pl-1 text-sm">Password</label>
                        <div className="relative group">
                            <Lock className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-sky-400'}`} />
                            <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="••••••••" className={getInputClass('password')} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-400 transition-colors">
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {fieldErrors.password && <p className="text-red-400 text-xs pl-1 mt-1">{fieldErrors.password}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-slate-200 pl-1 text-sm">Confirm Password</label>
                        <div className="relative group">
                            <Lock className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${fieldErrors.confirmPassword ? 'text-red-400' : 'text-slate-400 group-focus-within:text-sky-400'}`} />
                            <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" className={getInputClass('confirmPassword')} />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-400 transition-colors">
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {fieldErrors.confirmPassword && <p className="text-red-400 text-xs pl-1 mt-1">{fieldErrors.confirmPassword}</p>}
                    </div>
                </div>

                <div className="field-row mt-6">
                    <button ref={submitButtonRef} type="submit" disabled={isSubmitting} className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-white font-bold text-sm hover:from-sky-400 hover:to-blue-500 disabled:opacity-70 transition-all duration-200">
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create your account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
                    </button>
                </div>
            </form>

            <div className="field-row mt-6 text-center text-slate-400 text-sm">
                Already have an account?{" "}
                <button type="button" onClick={(e) => { e.preventDefault(); onToggle(); }} className="text-white hover:text-sky-400 font-semibold underline underline-offset-4 cursor-pointer transition-colors">
                    Sign in
                </button>
            </div>
        </div>
    );
}