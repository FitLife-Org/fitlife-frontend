import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import Button from "../../../components/common/Button";
import { ArrowRight, PlayCircle } from "lucide-react";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const tl = gsap.timeline();
    
    tl.fromTo(
      ".hero-text",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }
    ).fromTo(
      ".hero-image",
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: "power3.out" },
      "-=0.4"
    );
  }, []);

  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden" ref={containerRef}>
      {/* Background blobs */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-fit-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <h1 className="hero-text text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] mb-6">
              Hệ thống quản lý phòng gym thông minh <span className="text-fit-primary">FitLife</span>
            </h1>
            <p className="hero-text text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Quản lý hội viên, lịch tập, gói tập, thanh toán và dữ liệu sức khỏe hiệu quả với AI Assistant – giải pháp toàn diện cho phòng gym hiện đại.
            </p>
            
            <div className="hero-text flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
              <Link to={ROUTES.REGISTER}>
                <Button className="rounded-full px-8 py-6 text-lg w-full sm:w-auto font-semibold flex items-center gap-2 shadow-lg shadow-fit-primary/30 hover:shadow-fit-primary/50 transition-all hover:-translate-y-1">
                  Bắt đầu ngay <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" className="rounded-full px-8 py-6 text-lg w-full sm:w-auto font-semibold flex items-center gap-2 hover:bg-slate-50 transition-all">
                <PlayCircle className="h-5 w-5 text-slate-500" /> Xem demo
              </Button>
            </div>
            
            <div className="hero-text flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=1" alt="Avatar" /></div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=2" alt="Avatar" /></div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=3" alt="Avatar" /></div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=4" alt="Avatar" /></div>
              </div>
              <span>Được tin dùng bởi <strong className="text-slate-800">120+</strong> phòng gym toàn quốc</span>
            </div>
          </div>
          
          {/* Images/Dashboard Preview */}
          <div className="flex-1 relative w-full max-w-2xl lg:max-w-none hero-image">
             <div className="relative rounded-xl shadow-2xl bg-white border border-slate-200 overflow-hidden z-10 transform lg:-rotate-2 hover:rotate-0 transition-transform duration-500">
               <div className="h-6 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
               </div>
               <img src="https://raw.githubusercontent.com/FitLife-Org/fitlife-frontend/main/public/vite.svg" className="w-full h-[300px] object-cover bg-slate-50" alt="Dashboard Preview" />
               <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
                   <span className="text-slate-800 font-bold text-xl px-6 py-3 bg-white/80 rounded-xl shadow-sm border border-slate-200">Giao diện Dashboard</span>
               </div>
             </div>
             
             <div className="absolute -bottom-10 -left-10 lg:-left-20 w-48 lg:w-56 rounded-[2rem] shadow-2xl bg-white border-[6px] border-slate-800 overflow-hidden z-20 transform rotate-6 hover:rotate-0 transition-transform duration-500 hidden md:block">
               <div className="h-6 bg-slate-800 flex justify-center pt-1"><div className="w-16 h-3 bg-black rounded-full"></div></div>
               <div className="h-[350px] bg-slate-50 flex items-center justify-center">
                 <span className="text-slate-500 font-medium text-sm text-center px-4">App Hội Viên<br/>Mobile Preview</span>
               </div>
             </div>
             
             <div className="absolute -top-10 -right-5 lg:-right-10 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-20 animate-bounce" style={{ animationDuration: "3s" }}>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                 </div>
                 <div>
                   <p className="text-xs text-slate-500 font-medium">Doanh thu hôm nay</p>
                   <p className="text-lg font-bold text-slate-800">+12.5M</p>
                 </div>
               </div>
             </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
