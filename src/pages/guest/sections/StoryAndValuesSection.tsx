import { Target, Eye, Settings2, ShieldCheck, Zap, RefreshCw, Smile } from "lucide-react";

export default function StoryAndValuesSection() {
  const values = [
    { icon: <Settings2 className="w-6 h-6 text-emerald-600" />, title: "Thực tiễn", desc: "Sản phẩm được phát triển dựa trên nhu cầu thực tế của hàng nghìn phòng gym." },
    { icon: <Smile className="w-6 h-6 text-emerald-600" />, title: "Đơn giản", desc: "Giao diện thân thiện, dễ dùng, đội ngũ hỗ trợ tận tâm đồng hành cùng bạn." },
    { icon: <Zap className="w-6 h-6 text-emerald-600" />, title: "Hiệu quả", desc: "Tối ưu quy trình vận hành, giảm chi phí và gia tăng doanh thu." },
    { icon: <RefreshCw className="w-6 h-6 text-emerald-600" />, title: "Đổi mới", desc: "Ứng dụng AI và công nghệ hiện đại để nâng cao trải nghiệm người dùng." },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex gap-6 items-start">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Target className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Sứ mệnh</h3>
              <p className="text-slate-600 leading-relaxed">Giúp các phòng gym vận hành hiệu quả, tối ưu nguồn lực và nâng cao trải nghiệm tập luyện cho hàng triệu người Việt.</p>
            </div>
          </div>
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex gap-6 items-start">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Eye className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Tầm nhìn</h3>
              <p className="text-slate-600 leading-relaxed">Trở thành nền tảng quản lý phòng gym hàng đầu Việt Nam, đồng hành cùng ngành fitness phát triển bền vững và chuyên nghiệp.</p>
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold uppercase tracking-wider mb-6">Câu chuyện FitLife</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Hiểu phòng gym — Từ thực tiễn để tạo ra giải pháp phù hợp</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            FitLife được xây dựng bởi đội ngũ có nhiều năm kinh nghiệm trong lĩnh vực fitness và công nghệ. Chúng tôi thấu hiểu những khó khăn của chủ phòng gym: quản lý thủ công, thất thoát doanh thu, chăm sóc hội viên chưa hiệu quả.
            <br/><br/>
            Vì vậy, <strong className="text-slate-800">FitLife</strong> ra đời với mục tiêu mang đến một hệ thống quản lý toàn diện, dễ sử dụng và thực sự giúp chủ gym vận hành nhẹ nhàng — phát triển bền vững.
          </p>
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {values.map((val, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
               <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
                 {val.icon}
               </div>
               <h4 className="text-lg font-bold text-slate-800 mb-3">{val.title}</h4>
               <p className="text-sm text-slate-600 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
