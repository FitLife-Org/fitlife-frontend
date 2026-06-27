import { CheckCircle2 } from "lucide-react";
import Button from "../../../components/common/Button";

export default function PricingSection() {
  const plans = [
    {
      name: "Basic",
      target: "Phù hợp phòng gym nhỏ & mới bắt đầu",
      price: "299.000đ",
      oldPrice: "374.000đ/tháng",
      features: [
        "Quản lý hội viên không giới hạn",
        "Quản lý gói tập, PT, dịch vụ",
        "Check-in QR & Lịch hẹn cơ bản",
        "Báo cáo doanh thu cơ bản",
        "Hỗ trợ qua email"
      ],
      popular: false
    },
    {
      name: "Standard",
      target: "Phù hợp phòng gym đang phát triển",
      price: "599.000đ",
      oldPrice: "749.000đ/tháng",
      features: [
        "Tất cả tính năng trong Basic",
        "Quản lý PT & hoa hồng",
        "App hội viên (đặt lịch, gói tập, QR)",
        "Báo cáo nâng cao",
        "Tích hợp Zalo OA, SMS",
        "Hỗ trợ ưu tiên"
      ],
      popular: false
    },
    {
      name: "Premium",
      target: "Phù hợp gym nhiều chi nhánh",
      price: "999.000đ",
      oldPrice: "1.249.000đ/tháng",
      features: [
        "Tất cả tính năng trong Standard",
        "Quản lý chi nhánh & phân quyền",
        "Tồn kho & bán hàng (POS)",
        "Marketing Automation",
        "API & Webhook",
        "Hỗ trợ VIP 1-1"
      ],
      popular: true
    },
    {
      name: "PT Pro / Enterprise",
      target: "Phù hợp chuỗi gym & doanh nghiệp lớn",
      price: "Liên hệ",
      oldPrice: "",
      features: [
        "Tất cả tính năng trong Premium",
        "Tùy chỉnh theo nhu cầu",
        "SSO, Domain riêng, White-label",
        "Hỗ trợ triển khai & đào tạo",
        "Cam kết SLA & hỗ trợ 24/7"
      ],
      popular: false,
      isContact: true
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">
            Gói phần mềm quản lý phòng gym<br/>
            <span className="text-fit-primary">Đơn giản – Minh bạch – Hiệu quả</span>
          </h2>
          <p className="text-lg text-slate-600">Chọn gói phù hợp với quy mô và nhu cầu của phòng gym. Nâng cao trải nghiệm hội viên, tối ưu vận hành và tăng trưởng doanh thu.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={idx} className={`relative bg-white rounded-3xl p-8 flex flex-col h-full border ${plan.popular ? 'border-fit-primary shadow-xl shadow-fit-primary/10 lg:-translate-y-4' : 'border-slate-100 shadow-sm hover:shadow-md transition-shadow'}`}>
               {plan.popular && (
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-fit-primary text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full">
                   PHỔ BIẾN NHẤT
                 </div>
               )}
               
               <div className="text-center mb-8 border-b border-slate-100 pb-8">
                 <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                 <p className="text-sm text-slate-500 mb-6 h-10">{plan.target}</p>
                 <div className="text-4xl font-black text-slate-900 mb-2">{plan.price}<span className="text-base font-medium text-slate-500">/tháng</span></div>
                 {plan.oldPrice && <div className="text-sm font-medium text-slate-400 line-through">{plan.oldPrice}</div>}
                 {!plan.oldPrice && <div className="h-5"></div>}
               </div>

               <div className="flex-1 mb-8">
                 <ul className="space-y-4">
                   {plan.features.map((feat, i) => (
                     <li key={i} className="flex items-start gap-3">
                       <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                       <span className="text-sm text-slate-600">{feat}</span>
                     </li>
                   ))}
                 </ul>
               </div>

               <Button variant={plan.popular ? "primary" : "outline"} className={`w-full rounded-xl py-6 ${!plan.popular && !plan.isContact ? 'border-fit-primary text-fit-primary hover:bg-fit-primary hover:text-white' : ''}`}>
                 {plan.isContact ? "Liên hệ tư vấn" : "Dùng thử miễn phí 14 ngày"}
               </Button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
