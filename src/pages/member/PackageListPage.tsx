import { Check, Dumbbell } from "lucide-react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { formatCurrency } from "../../utils/formatCurrency";

const packages = [
  { name: "Basic", price: 199000, current: false, popular: false, features: ["Check-in không giới hạn", "AI Assistant hỗ trợ 24/7", "Theo dõi chỉ số cơ thể", "Chương trình tập cơ bản"] },
  { name: "Standard", price: 349000, current: false, popular: true, features: ["Check-in không giới hạn", "AI Assistant hỗ trợ 24/7", "Kế hoạch tập cá nhân hóa", "Kế hoạch dinh dưỡng cá nhân hóa", "Báo cáo tiến độ hằng tuần"] },
  { name: "Premium", price: 599000, current: true, popular: false, features: ["Tất cả trong gói Standard", "Tư vấn cùng PT online 1-1", "Chương trình tập nâng cao", "Phân tích kỹ thuật tập luyện", "Ưu tiên đặt lịch PT"] },
  { name: "PT Pro", price: 999000, current: false, popular: false, features: ["Tất cả trong gói Premium", "PT cá nhân 1-1", "Đo InBody định kỳ", "Hỗ trợ 24/7 từ chuyên gia", "Ưu tiên mọi dịch vụ"] },
];

export default function PackageListPage() {
  return (
    <>
      <PageHeader title="Gói tập" description="Chọn gói hội viên phù hợp với mục tiêu của bạn" />
      <div className="mb-6 inline-flex rounded-3xl border border-fit-border bg-white p-1 shadow-soft">
        {["Theo tháng", "Theo quý -10%", "Theo năm -20%"].map((item, index) => (
          <button className={`rounded-2xl px-8 py-3 text-sm font-bold ${index === 0 ? "bg-fit-primary text-white" : "text-fit-muted"}`} key={item} type="button">{item}</button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {packages.map((item) => (
              <Card className={`relative p-6 ${item.popular ? "border-fit-primary" : ""} ${item.current ? "border-fit-blue" : ""}`} key={item.name}>
                {item.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge variant="success">Phổ biến nhất</Badge></div>}
                {item.current && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge variant="info">Gói hiện tại</Badge></div>}
                <h2 className="mt-3 text-2xl font-black text-fit-text">{item.name}</h2>
                <p className={`mt-4 text-3xl font-black ${item.current ? "text-fit-blue" : "text-fit-primary"}`}>{formatCurrency(item.price)}<span className="text-sm font-medium text-fit-muted"> / tháng</span></p>
                <div className="mt-6 space-y-4">
                  {item.features.map((feature) => (
                    <div className="flex items-center gap-3 text-sm text-fit-text" key={feature}>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fit-primarySoft text-fit-primary"><Check className="h-4 w-4" /></span>
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-8 border-t border-fit-border pt-5 text-sm text-fit-muted">Thời hạn: 30 ngày</div>
                <Button className="mt-5 w-full" variant={item.current ? "outline" : "primary"}>{item.current ? "Gói hiện tại" : item.name === "PT Pro" ? "Nâng cấp" : "Chọn gói"}</Button>
              </Card>
            ))}
          </div>
          <Card className="mt-6 p-6">
            <h2 className="text-xl font-bold text-fit-text">So sánh nhanh các gói</h2>
            <div className="mt-5 grid gap-3 text-sm md:grid-cols-5">
              {["Tính năng", "Basic", "Standard", "Premium", "PT Pro"].map((heading) => <p className="font-bold text-fit-text" key={heading}>{heading}</p>)}
              {["Check-in không giới hạn", "AI Assistant hỗ trợ 24/7", "Kế hoạch tập cá nhân hóa", "PT cá nhân 1-1"].flatMap((feature) => [feature, "✓", "✓", "✓", "✓"]).map((cell, index) => <p className={index % 5 === 0 ? "text-fit-muted" : "text-fit-primary"} key={`${cell}-${index}`}>{cell}</p>)}
            </div>
          </Card>
        </div>
        <aside className="space-y-6">
          <Card className="overflow-hidden bg-gradient-to-b from-sky-100 to-orange-50 p-6">
            <h2 className="text-xl font-black text-fit-text">Ưu đãi mùa hè</h2>
            <p className="mt-4 text-4xl font-black text-fit-orange">GIẢM 20%</p>
            <p className="mt-3 text-fit-muted">Áp dụng cho tất cả gói tập khi đăng ký theo năm</p>
            <div className="mt-5 grid grid-cols-4 gap-2 text-center">
              {["06 Ngày", "23 Giờ", "48 Phút", "12 Giây"].map((time) => <div className="rounded-xl bg-white p-3 font-bold text-fit-text" key={time}>{time}</div>)}
            </div>
            <Button className="mt-6 w-full">Đăng ký ngay</Button>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-bold text-fit-text">Cần tư vấn gói tập phù hợp?</h2>
            <div className="mt-4 flex items-center gap-3 text-fit-primary"><Dumbbell className="h-8 w-8" /><span className="text-sm text-fit-muted">Đội ngũ FitLife luôn sẵn sàng hỗ trợ bạn.</span></div>
            <Button className="mt-5 w-full" variant="outline">Chat với tư vấn viên</Button>
          </Card>
        </aside>
      </div>
    </>
  );
}
