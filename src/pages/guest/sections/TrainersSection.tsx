import { useEffect, useState } from "react";
import { publicService } from "../../../services/publicService";
import type { PublicTrainer } from "../../../types/public.type";
import { usePageAnimation } from "../../../hooks/usePageAnimation";

export default function TrainersSection() {
  const containerRef = usePageAnimation();
  const [trainers, setTrainers] = useState<PublicTrainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const data = await publicService.getTrainers();
        setTrainers(data);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-white flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </section>
    );
  }

  if (trainers.length === 0) return null;

  return (
    <section ref={containerRef} className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl mb-4">
            Đội ngũ chuyên gia
          </h2>
          <p className="text-lg text-slate-500">
            Đồng hành cùng bạn là những huấn luyện viên cá nhân giàu kinh nghiệm, tận tâm và chuyên nghiệp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 gsap-animate"
            >
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={trainer.avatarUrl} 
                  alt={trainer.fullName} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/0 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-black text-white">{trainer.fullName}</h3>
                  <p className="text-emerald-400 font-medium text-sm mt-1">{trainer.experienceYears} năm kinh nghiệm</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4 line-clamp-2">{trainer.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {trainer.specialties.map(spec => (
                     <span key={spec} className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                       {spec}
                     </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
