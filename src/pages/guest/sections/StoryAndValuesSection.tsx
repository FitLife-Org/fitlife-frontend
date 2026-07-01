import { motion, type Variants } from "framer-motion";
import { Target, Eye, Settings2, ShieldCheck, Zap, RefreshCw, Smile, HeartHandshake } from "lucide-react";
import { cn } from "../../../utils/cn";

export default function StoryAndValuesSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const values = [
    { icon: <Settings2 className="w-6 h-6 text-emerald-600" />, title: "Thực tiễn", desc: "Phát triển từ nhu cầu thực tế", colSpan: "col-span-1" },
    { icon: <Smile className="w-6 h-6 text-sky-600" />, title: "Đơn giản", desc: "Giao diện thân thiện, dễ dùng", colSpan: "col-span-1" },
    { icon: <Zap className="w-6 h-6 text-amber-500" />, title: "Hiệu quả", desc: "Tối ưu chi phí, tăng doanh thu", colSpan: "col-span-1" },
    { icon: <RefreshCw className="w-6 h-6 text-purple-500" />, title: "Đổi mới", desc: "Ứng dụng AI hiện đại", colSpan: "col-span-1" },
  ];

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-50 rounded-full blur-[120px] -z-10" />
      
      <div className="container mx-auto px-4 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-bold uppercase tracking-widest mb-6"
          >
            Câu chuyện FitLife
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Hiểu phòng gym — Từ thực tiễn để tạo ra <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">giải pháp phù hợp</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 leading-relaxed font-medium"
          >
            Đội ngũ FitLife mang sứ mệnh biến những khó khăn quản lý thủ công, thất thoát doanh thu thành một hệ thống vận hành tự động, thông minh và nhẹ nhàng nhất.
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {/* Mission Card (Span 2 cols on md) */}
          <motion.div variants={itemVariants} className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-8 lg:p-10 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
              <Target className="w-48 h-48" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20">
                <Target className="w-7 h-7 text-sky-400" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-4">Sứ mệnh</h3>
                <p className="text-slate-300 leading-relaxed text-lg max-w-md">Giúp các phòng gym vận hành hiệu quả, tối ưu nguồn lực và nâng cao trải nghiệm tập luyện cho hàng triệu người Việt.</p>
              </div>
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div variants={itemVariants} className="bg-sky-50 p-8 lg:p-10 rounded-[2rem] border border-sky-100 shadow-lg shadow-sky-100/50 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm">
              <Eye className="w-7 h-7 text-sky-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Tầm nhìn</h3>
            <p className="text-slate-600 leading-relaxed">Trở thành nền tảng quản lý phòng gym hàng đầu Việt Nam, kiến tạo chuẩn mực fitness mới.</p>
          </motion.div>

          {/* Core Values (4 small cards) */}
          {values.map((val, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants} 
              className={cn("bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-default", val.colSpan)}
            >
               <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 {val.icon}
               </div>
               <h4 className="text-xl font-bold text-slate-800 mb-2">{val.title}</h4>
               <p className="text-slate-500 font-medium">{val.desc}</p>
            </motion.div>
          ))}

          {/* Extra Banner Card */}
          <motion.div variants={itemVariants} className="md:col-span-2 bg-emerald-500 p-8 lg:p-10 rounded-[2rem] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group flex items-center justify-between">
            <div className="relative z-10 max-w-sm">
              <h3 className="text-2xl font-bold mb-2">Bạn sẵn sàng bứt phá?</h3>
              <p className="text-emerald-50">Đồng hành cùng 120+ phòng gym đang sử dụng FitLife.</p>
            </div>
            <div className="relative z-10 bg-white/20 p-4 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors cursor-pointer">
              <HeartHandshake className="w-8 h-8 text-white" />
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
