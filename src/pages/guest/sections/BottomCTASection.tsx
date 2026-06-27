import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import Button from "../../../components/common/Button";
import { ArrowRight } from "lucide-react";

export default function BottomCTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-fit-primary rounded-[2.5rem] p-12 lg:p-16 relative overflow-hidden shadow-2xl shadow-fit-primary/20">
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                Sẵn sàng nâng tầm phòng gym của bạn?
              </h2>
              <p className="text-emerald-100 text-lg max-w-xl">
                Dùng thử miễn phí 14 ngày – Không rủi ro, không cần thẻ tín dụng.
              </p>
            </div>
            <div className="shrink-0">
              <Link to={ROUTES.REGISTER}>
                <Button className="bg-white text-fit-primary hover:bg-slate-50 hover:text-fit-primary hover:scale-105 transition-transform rounded-full px-8 py-6 text-lg font-bold flex items-center gap-2 shadow-xl shadow-black/10">
                  Bắt đầu dùng thử ngay <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
