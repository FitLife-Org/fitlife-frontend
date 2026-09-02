import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import Button from "../../../components/common/Button";
import { ArrowRight, PlayCircle, Activity } from "lucide-react";
import { usePageAnimation } from "../../../hooks/usePageAnimation";

export default function HeroSection() {
  const containerRef = usePageAnimation();

  return (
    <section id="home" ref={containerRef} className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-sky-400/20 rounded-full blur-[100px] -z-10 mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-[100px] -z-10 mix-blend-multiply" />
      
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          
          {/* Text Content */}
          <div 
            className="flex-1 text-center lg:text-left z-10 gsap-animate"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100/80 text-sky-700 text-sm font-semibold mb-6 border border-sky-200/50 backdrop-blur-sm gsap-animate">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              Nền tảng quản lý phòng Gym số 1 Việt Nam
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight gsap-animate">
              Khai phóng tiềm năng <br className="hidden lg:block"/> với <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-400">FitLife</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium gsap-animate">
              Giải pháp toàn diện bằng công nghệ AI giúp tối ưu hóa quản lý phòng tập, theo dõi lộ trình và bứt phá mục tiêu thể hình của hội viên.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10 gsap-animate">
              <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
                <Button className="rounded-2xl px-8 py-6 text-lg w-full font-bold flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1">
                  Bắt đầu ngay <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" className="rounded-2xl px-8 py-6 text-lg w-full sm:w-auto font-bold flex items-center justify-center gap-2 border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm">
                <PlayCircle className="h-5 w-5 text-sky-500" /> Xem demo tính năng
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm text-slate-600 font-medium gsap-animate">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-50 bg-slate-200 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span className="flex flex-col items-center sm:items-start mt-2 sm:mt-0">
                <div className="flex text-amber-400 text-lg">★★★★★</div>
                <span>Tin dùng bởi <strong className="text-slate-900 font-bold">500+</strong> PT chuyên nghiệp</span>
              </span>
            </div>
          </div>
          
          {/* Images/Dashboard Preview with Parallax */}
          <div 
            className="flex-1 relative w-full max-w-2xl lg:max-w-none gsap-animate"
          >
             {/* Main Dashboard UI Mockup */}
             <div className="relative rounded-3xl shadow-2xl bg-white/70 backdrop-blur-xl border border-white overflow-hidden z-10 lg:rotate-[-2deg] transition-transform duration-700 hover:rotate-0">
               <div className="h-10 bg-slate-100/50 border-b border-white/50 flex items-center px-4 gap-2 backdrop-blur-sm">
                 <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
               </div>
               <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" className="w-full h-[400px] object-cover" alt="Dashboard Preview" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex flex-col justify-end p-8">
                 <h3 className="text-white font-bold text-2xl drop-shadow-md">Giao diện quản lý thông minh</h3>
                 <p className="text-white/80 font-medium">Báo cáo đa chiều, dễ dàng kiểm soát</p>
               </div>
             </div>
             
             {/* Floating Mobile Mockup */}
             <div 
               className="absolute -bottom-12 -left-8 lg:-left-16 w-52 rounded-[2.5rem] shadow-2xl bg-white border-8 border-slate-900 overflow-hidden z-20 rotate-6 gsap-animate"
             >
               <div className="h-6 bg-slate-900 flex justify-center pt-2"><div className="w-16 h-2 bg-slate-800 rounded-full"></div></div>
               <div className="h-[380px] bg-slate-50 relative">
                 <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" alt="Mobile Preview" />
                 <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                   <div className="px-3 py-1 bg-sky-500 text-white text-xs font-bold rounded-full w-max mb-2">Hội viên</div>
                   <p className="text-white font-semibold text-sm">App Theo Dõi Cá Nhân</p>
                 </div>
               </div>
             </div>
             
             {/* Floating Stats Card */}
             <div 
               className="absolute -top-8 -right-4 lg:-right-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-5 z-20 gsap-animate"
             >
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                   <Activity strokeWidth={2.5} />
                 </div>
                 <div>
                   <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Doanh thu</p>
                   <p className="text-2xl font-black text-slate-900">↑ 12.5M</p>
                 </div>
               </div>
             </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
