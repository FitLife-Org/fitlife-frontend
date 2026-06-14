import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle2, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../../api/axiosClient';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    // Hiệu ứng GSAP khi chuyển bước
    useGSAP(() => {
        if (formRef.current) {
            gsap.fromTo(
                formRef.current.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
            );
        }
    }, { dependencies: [step], scope: containerRef });

    // Bước 1: Gửi Email lấy OTP
    const handleSendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await axiosInstance.post('/auth/forgot-password', { email });
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không tìm thấy tài khoản với email này!');
        } finally {
            setIsLoading(false);
        }
    };

    // Bước 2: Xác nhận OTP và Đổi mật khẩu
    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        setIsLoading(true);
        try {
            await axiosInstance.post('/auth/reset-password', { email, otp, newPassword });
            setStep(3);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="relative min-h-screen text-slate-100 selection:bg-sky-500/30 overflow-hidden flex items-center justify-center px-4 py-10 sm:px-6">
            {/* Ảnh nền và Lớp phủ giống hệt AuthPage */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-[2px]" />

            {/* Container Glassmorphism */}
            <div className="relative z-10 w-full max-w-md transition-all duration-700 ease-in-out rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl sm:p-10">
                
                {step < 3 && (
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-sky-400 transition-colors mb-8 group">
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Login
                    </Link>
                )}

                <div ref={formRef}>
                    <div className="mb-8 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                            {step === 1 && <Mail className="text-sky-400 w-8 h-8" />}
                            {step === 2 && <KeyRound className="text-sky-400 w-8 h-8" />}
                            {step === 3 && <CheckCircle2 className="text-green-400 w-8 h-8" />}
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                            {step === 1 ? 'Forgot Password?' : step === 2 ? 'Enter OTP' : 'All Done!'}
                        </h2>
                        <p className="text-sm text-slate-300">
                            {step === 1 
                                ? "No worries, we'll send you reset instructions." 
                                : step === 2 
                                ? `We sent a 6-digit code to ${email}` 
                                : 'Your password has been successfully reset.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 shadow-inner text-sm">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* ==================== BƯỚC 1 ==================== */}
                    {step === 1 && (
                        <form onSubmit={handleSendEmail} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-slate-200 pl-1 text-sm">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" />
                                    <input 
                                        type="email" 
                                        required 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-12 py-4 text-slate-100 outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/20 shadow-inner transition-all duration-200"
                                        placeholder="you@example.com" 
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-4 text-white font-bold text-sm hover:from-sky-400 hover:to-blue-500 disabled:opacity-70 transition-all duration-200"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    {/* ==================== BƯỚC 2 ==================== */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-slate-200 pl-1 text-sm">OTP Code</label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" />
                                    <input 
                                        type="text" 
                                        required 
                                        maxLength={6} 
                                        value={otp} 
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Chỉ cho nhập số
                                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-12 py-4 text-slate-100 outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/20 shadow-inner transition-all duration-200 tracking-[0.5em] font-bold text-center text-lg"
                                        placeholder="••••••" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-slate-200 pl-1 text-sm">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-12 py-4 text-slate-100 outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/20 shadow-inner transition-all duration-200"
                                        placeholder="••••••••" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-4 text-white font-bold text-sm hover:from-sky-400 hover:to-blue-500 disabled:opacity-70 transition-all duration-200"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* ==================== BƯỚC 3 ==================== */}
                    {step === 3 && (
                        <button 
                            onClick={() => navigate('/login')}
                            className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-4 text-white font-bold text-sm hover:from-sky-400 hover:to-blue-500 transition-all duration-200 mt-4"
                        >
                            Continue to Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;