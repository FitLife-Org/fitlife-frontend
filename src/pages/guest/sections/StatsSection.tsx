import { useEffect, useState } from "react";
import { Users, Building2, Dumbbell, Award } from "lucide-react";
import { publicService } from "../../../services/publicService";
import type { HomeData } from "../../../types/public.type";

export default function StatsSection() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await publicService.getHomeData();
        setHomeData(data);
      } catch {
        // Fallback is handled in publicService
      }
    };
    fetchData();
  }, []);

  if (!homeData) return null;

  const { stats } = homeData;

  const statItems = [
    { icon: <Users className="h-8 w-8" />, value: `${stats.totalMembers}+`, label: "Hội viên đang tập", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: <Award className="h-8 w-8" />, value: `${stats.activeTrainers}+`, label: "Huấn luyện viên", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: <Dumbbell className="h-8 w-8" />, value: `${stats.totalEquipment}+`, label: "Máy tập hiện đại", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: <Building2 className="h-8 w-8" />, value: `${stats.yearsOfExperience}`, label: "Năm kinh nghiệm", color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <section className="py-12 bg-white relative z-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            {statItems.map((stat, index) => (
              <div key={index} className={`flex flex-col md:flex-row items-center justify-center gap-4 ${index !== 0 ? "pl-0 md:pl-8" : ""}`}>
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
