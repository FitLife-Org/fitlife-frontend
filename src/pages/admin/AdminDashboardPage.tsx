import { CheckSquare, Clock, DollarSign, Users } from "lucide-react";
import type { ReactNode } from "react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { formatCurrency } from "../../utils/formatCurrency";

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard quản trị" description="Tổng quan vận hành hệ thống phòng gym FitLife" />
      <div className="grid gap-6 xl:grid-cols-4">
        <AdminMetric icon={<Users />} label="Tổng hội viên" value="2.456" note="+8,2% so với tháng trước" />
        <AdminMetric icon={<CheckSquare />} label="Check-in hôm nay" value="348" note="+12,4% so với hôm qua" tone="blue" />
        <AdminMetric icon={<DollarSign />} label="Doanh thu tháng" value={formatCurrency(1250000000)} note="+15,6% so với tháng trước" />
        <AdminMetric icon={<Clock />} label="Gói sắp hết hạn" value="86" note="Xem danh sách" tone="orange" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-fit-text">Doanh thu 6 tháng</h2>
          <div className="mt-6 h-64 rounded-3xl bg-gradient-to-b from-white to-emerald-50 p-6">
            <svg className="h-full w-full" viewBox="0 0 700 240">
              {[40, 80, 120, 160, 200].map((y) => <line key={y} x1="0" x2="700" y1={y} y2={y} stroke="#e5e7eb" />)}
              {[40, 150, 260, 370, 480, 590].map((x, i) => <rect fill="#d1fae5" height={[50, 82, 62, 92, 132, 168][i]} key={x} rx="8" width="42" x={x} y={200 - [50, 82, 62, 92, 132, 168][i]} />)}
              <polyline fill="none" points="61,150 171,120 281,142 391,104 501,75 611,38" stroke="#059669" strokeWidth="5" />
            </svg>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-bold text-fit-text">Tỷ lệ gói tập</h2>
          <div className="mt-8 flex items-center gap-8">
            <div className="grid h-48 w-48 place-items-center rounded-full bg-[conic-gradient(#059669_0_34%,#2563eb_34%_62%,#7c3aed_62%_85%,#f97316_85%_100%)]">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center font-black text-fit-text">2.456<br /><span className="text-xs font-medium">tổng gói</span></div>
            </div>
            <div className="space-y-4 text-sm">
              {["Gói 1 tháng 34%", "Gói 3 tháng 28%", "Gói 6 tháng 23%", "Gói 12 tháng 15%"].map((item) => <p className="text-fit-muted" key={item}>{item}</p>)}
            </div>
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <ListCard title="Hội viên mới gần đây" items={["Nguyễn Minh Anh", "Trần Quang Huy", "Lê Thị Thu Trang", "Phạm Hoàng Nam"]} />
        <ListCard title="Lịch PT hôm nay" items={["09:00 - Nguyễn Minh Anh", "10:00 - Trần Quang Huy", "14:00 - Lê Thị Thu Trang"]} />
        <ListCard title="Thanh toán gần đây" items={["GD250601-0012", "GD250601-0011", "GD250531-0056"]} />
      </div>
    </>
  );
}

function AdminMetric({ icon, label, value, note, tone = "green" }: { icon: ReactNode; label: string; value: string; note: string; tone?: "green" | "blue" | "orange" }) {
  const tones = { green: "bg-fit-primarySoft text-fit-primary", blue: "bg-fit-adminSoft text-fit-admin", orange: "bg-fit-trainerSoft text-fit-trainer" };
  return <Card className="p-6"><div className="flex items-center gap-4"><div className={`flex h-16 w-16 items-center justify-center rounded-full ${tones[tone]}`}>{icon}</div><div><p className="text-sm text-fit-muted">{label}</p><p className="mt-2 text-3xl font-black text-fit-primary">{value}</p></div></div><p className="mt-4 text-sm text-fit-muted">{note}</p></Card>;
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return <Card className="p-6"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold text-fit-text">{title}</h2><a className="text-sm font-semibold text-fit-primary" href="/">Xem tất cả</a></div>{items.map((item, index) => <div className="flex items-center justify-between border-b border-fit-border py-3 last:border-0" key={item}><span className="text-sm font-medium text-fit-text">{item}</span><Badge variant={index === 0 ? "success" : "info"}>{index === 0 ? "Mới" : "OK"}</Badge></div>)}</Card>;
}
