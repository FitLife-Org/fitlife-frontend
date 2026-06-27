import { Users, Ticket, Activity, Bot } from "lucide-react";

export default function FeaturesGridSection() {
  const features = [
    {
      title: "Quản lý hội viên",
      description: "Lưu trữ thông tin, theo dõi lịch sử tập luyện, đánh giá sức khỏe và phân hạng hội viên.",
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      title: "Quản lý gói tập",
      description: "Tạo và quản lý gói tập linh hoạt theo tháng, quý, năm. PT cá nhân, group class...",
      icon: <Ticket className="h-6 w-6 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      title: "Theo dõi chỉ số cơ thể",
      description: "Đo lường BMI, cân nặng, mỡ cơ thể và theo dõi tiến độ theo thời gian.",
      icon: <Activity className="h-6 w-6 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      title: "AI Assistant & Dinh dưỡng",
      description: "Trợ lý AI 24/7 gợi ý lịch tập, chế độ dinh dưỡng và phân tích sức khỏe thông minh.",
      icon: <Bot className="h-6 w-6 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Tính năng nổi bật</h2>
          <p className="text-lg text-slate-600">FitLife cung cấp đầy đủ công cụ giúp bạn quản lý và phát triển phòng gym hiệu quả.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex gap-6">
              <div className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${feature.bg}`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
