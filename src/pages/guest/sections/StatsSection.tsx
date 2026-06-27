import { Users, Building2, Smile, Sparkles } from "lucide-react";

export default function StatsSection() {
  const stats = [
    { icon: <Users className="h-8 w-8" />, value: "2.500+", label: "Hội viên đang hoạt động", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: <Building2 className="h-8 w-8" />, value: "120+", label: "Phòng gym sử dụng", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: <Smile className="h-8 w-8" />, value: "98%", label: "Khách hàng hài lòng", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: <Sparkles className="h-8 w-8" />, value: "24/7", label: "AI Assistant hỗ trợ", color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <section className="py-12 bg-white relative z-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            {stats.map((stat, index) => (
              <div key={index} className={`flex flex-col md:flex-row items-center justify-center gap-4 ${index !== 0 ? "pl-8" : ""}`}>
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-extrabold text-slate-800">{stat.value}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
