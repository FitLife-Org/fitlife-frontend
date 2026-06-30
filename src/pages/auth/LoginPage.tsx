import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Loader2, ArrowRight } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { ROUTES } from "../../config/routes";
import { useLoginLogic } from "../../utils/validators/useLoginLogic";

function AnimatedText() {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 4);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
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
                        {idx < 3 && <ArrowRight
                            className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-500 ${isActive ? "text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" : "text-slate-800"}`} />}
                    </div>
                );
            })}
        </div>
    );
}

export default
    function LoginPage() {
    const {
        formData,
        error,
        fieldErrors,
        loading,
        containerRef,
        introRef,
        formRef,
        handleInputChange,
        handleGoogleSuccess,
        handleGoogleError,
        handleSubmit,
        setError,
    } = useLoginLogic();

    return (
        <main
            ref={containerRef}
            className="relative min-h-screen w-full overflow-hidden bg-[url('https://images.unsplash.com/photo-1593079831268-3381b0c42369?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center"
        >
            {/* Overlay sáng mờ phủ toàn bộ background để hợp với tone sáng */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] transition-all duration-700"/>

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
                        <span
                            className="tracking-tight text-5xl  bg-clip-text  bg-gradient-to-r from-green-500  to-cyan-500">FitLife</span>
                    </div>

                    <div className="max-w-x2">
                        <h1 className="text-5xl lg:text-5xl font-black leading-[1.15] mb-6 text-slate-900">
                            Làm chủ phòng gym<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
    gọn – chuẩn – chiến
  </span> mỗi ngày.
                        </h1>

                        <p className="text-lg leading-relaxed text-slate-700 border-l-4 border-sky-500 pl-6 bg-white/50 backdrop-blur-sm py-3 pr-4 rounded-r-xl shadow-sm border-white/60 border-y border-r">
                            Quản lý hội viên, gói tập, check-in, lịch PT và thanh toán — tất cả tích hợp trong một hệ thống mượt mà, không độ trễ. Tối ưu vận hành để bạn rảnh tay phát triển phòng tập, còn hội viên cứ việc tập trung "build cơ" — tuyệt đối không "build stress"!
                        </p>

           

                        <AnimatedText />
                    </div>
                </section>

                {/* Cột phải: Form đăng nhập */}
                <section className="flex items-center justify-center p-4 lg:p-12">
                    <div ref={formRef}
                         className="relative w-full max-w-md rounded-[2rem] bg-white/80 p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-2xl border border-white/60 lg:p-10 overflow-hidden">

                        <div
                            className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl pointer-events-none"/>
                        <div
                            className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl pointer-events-none"/>

                        <div className="relative z-10 flex flex-col">
                            <header className="mb-8 text-center lg:text-left gsap-form-element">
                                <div className="inline-block rounded-xl bg-sky-50 px-3 py-1 mb-4 lg:hidden">
                                    <div className="flex items-center gap-2 text-sky-600 font-bold">

                                        <span>FitLife</span>
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center">Chào mừng
                                    trở lại</h2>
                                <p className="mt-2 text-slate-500 font-medium text-center">Nhập thông tin tài khoản của
                                    bạn để tiếp tục.</p>
                            </header>


                            {error && (
                                <div
                                    className="gsap-form-element mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600 backdrop-blur-sm">
                                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
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
                                            className="bg-white"
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
                                    <span
                                        className="uppercase text-slate-400 text-xs font-black tracking-widest">Hoặc</span>
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200"/>
                                </div>

                                {/* Đăng nhập Google */}
                                <div className="gsap-form-element mt-6 flex w-full justify-center">
                                    {loading ? (
                                        <div
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-500 font-bold">
                                            <Loader2 className="h-5 w-5 animate-spin"/>
                                            Đang xử lý...
                                        </div>
                                    ) : (
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={handleGoogleError}
                                            useOneTap={false}
                                            text="signin_with"
                                            shape="pill"
                                            width="360"
                                        />
                                    )}
                                </div>

                                <div className="gsap-form-element mt-8 text-center font-medium text-slate-500">
                                    Chưa có tài khoản?{" "}
                                    <Link to={ROUTES.REGISTER}
                                          className="text-sky-600 hover:text-sky-500 font-bold transition-colors">
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
