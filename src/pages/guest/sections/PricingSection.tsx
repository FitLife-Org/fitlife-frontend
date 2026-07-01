import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../components/common/Button";
import { publicService } from "../../../services/publicService";
import type { PublicPackage } from "../../../types/public.type";

export default function PricingSection() {
  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await publicService.getPackages();
        setPackages(data);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-slate-50 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </section>
    );
  }

  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-emerald-600 tracking-widest uppercase mb-3">Bảng giá</h2>
          <h3 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl mb-4">
            Đầu tư cho sức khỏe
          </h3>
          <p className="text-lg text-slate-500">
            Lựa chọn gói tập phù hợp với mục tiêu của bạn. Đăng ký ngay để nhận ưu đãi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div 
              key={pkg.id}
              className={`relative rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-2 ${
                pkg.isPopular 
                  ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20" 
                  : "bg-white text-slate-900 shadow-sm border border-slate-200"
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full">
                    Bán chạy nhất
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h4 className="text-2xl font-black mb-2">{pkg.name}</h4>
                <p className={`text-sm ${pkg.isPopular ? "text-slate-400" : "text-slate-500"}`}>{pkg.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-black">{pkg.price.toLocaleString("vi-VN")}đ</span>
                <span className={`text-sm font-medium ml-1 ${pkg.isPopular ? "text-slate-400" : "text-slate-500"}`}>
                  /{pkg.durationMonths} tháng
                </span>
              </div>

              <ul className="space-y-4 mb-8">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${pkg.isPopular ? "text-emerald-400" : "text-emerald-500"}`} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={pkg.isPopular ? "primary" : "outline"}
                className={`w-full rounded-full py-3 ${pkg.isPopular ? "bg-emerald-500 hover:bg-emerald-600 text-white border-none" : ""}`}
                onClick={() => alert(`Gọi API chi tiết GET /public/packages/${pkg.id} tại đây`)}
              >
                Đăng ký ngay
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
