import { ArrowRight, CalendarDays, Dumbbell, Flame } from "lucide-react";
import type { ReactNode } from "react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

const workouts = [
  ["Bench Press", "4 x 10-12"],
  ["Shoulder Press", "3 x 10-12"],
  ["Incline Dumbbell Press", "3 x 10-12"],
  ["Triceps Pushdown", "3 x 12-15"],
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Tổng quan hành trình tập luyện và sức khỏe của bạn" />

      <div className="grid gap-6 xl:grid-cols-4">
        <MetricCard icon={<Dumbbell />} label="Gói hiện tại" value="Premium 6 tháng" tone="green" footer={<Badge variant="success">Thành viên Premium</Badge>} />
        <MetricCard icon={<Dumbbell />} label="Buổi tập tuần này" value="4 / 6 buổi" progress={67} tone="blue" />
        <MetricCard icon={<Flame />} label="Calories hôm nay" value="1.850 / 2.200 kcal" progress={84} tone="green" />
        <MetricCard icon={<CalendarDays />} label="Ngày hết hạn" value="01/08/2025" tone="purple" footer={<span className="text-sm text-fit-muted">Còn 12 ngày</span>} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.2fr_0.95fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-fit-text">Lịch tập hôm nay</h2>
            <a className="text-sm font-semibold text-fit-primary" href="/member/booking">Xem lịch</a>
          </div>
          <p className="font-bold text-fit-primary">18:00 - 19:15</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="font-bold text-fit-text">Push (Ngực - Vai - Tay sau)</p>
            <Badge variant="success">Phòng Gym 1</Badge>
          </div>
          <div className="mt-5 space-y-4">
            {workouts.map(([name, reps], index) => (
              <div className="flex items-center justify-between text-sm" key={name}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-500">{index + 1}</div>
                  <span className="font-medium text-fit-text">{name}</span>
                </div>
                <span className="text-fit-muted">{reps}</span>
              </div>
            ))}
          </div>
          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-fit-border py-3 font-bold text-fit-primary" type="button">
            Xem chi tiết bài tập <ArrowRight className="h-4 w-4" />
          </button>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-fit-text">Tiến độ 8 tuần</h2>
            <select className="rounded-xl border border-fit-border px-3 py-2 text-sm text-fit-muted">
              <option>Cân nặng (kg)</option>
            </select>
          </div>
          <div className="relative h-64 rounded-2xl bg-gradient-to-b from-white to-emerald-50/40 p-4">
            <svg className="h-full w-full" viewBox="0 0 560 240" role="img" aria-label="Biểu đồ cân nặng">
              {[40, 88, 136, 184].map((y) => <line key={y} x1="0" x2="560" y1={y} y2={y} stroke="#e5e7eb" />)}
              <polyline fill="none" points="18,54 70,58 118,82 168,75 220,102 272,126 324,132 376,155 428,148 480,174 532,190" stroke="#059669" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
              {[18, 70, 118, 168, 220, 272, 324, 376, 428, 480, 532].map((x, i) => (
                <circle cx={x} cy={[54, 58, 82, 75, 102, 126, 132, 155, 148, 174, 190][i]} fill="#059669" key={x} r="6" />
              ))}
            </svg>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Summary label="Bắt đầu" value="74.3 kg" />
            <Summary label="Hiện tại" value="66.1 kg" active />
            <Summary label="Thay đổi" value="-8.2 kg" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-fit-text">Mục tiêu tháng này</h2>
            <a className="text-sm font-semibold text-fit-primary" href="/member/body-metrics">Xem tất cả</a>
          </div>
          <Goal title="Giảm mỡ" value="-1.8 kg" progress={60} color="bg-fit-primary" />
          <Goal title="Tăng cơ" value="+0.6 kg" progress={40} color="bg-fit-blue" />
          <Goal title="Số ngày tập" value="12 / 20 ngày" progress={60} color="bg-fit-purple" />
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-xl font-bold text-fit-text">Gợi ý nhanh</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {["Tạo lịch tập", "Xem meal plan", "Đo BMI", "Hỏi AI"].map((item) => (
            <button className="flex items-center justify-between rounded-2xl border border-fit-border p-5 text-left hover:border-fit-primary hover:bg-fit-primarySoft" key={item} type="button">
              <span className="font-bold text-fit-text">{item}</span>
              <ArrowRight className="h-5 w-5 text-fit-muted" />
            </button>
          ))}
        </div>
      </Card>
    </>
  );
}

function MetricCard({ icon, label, value, progress, tone, footer }: { icon: ReactNode; label: string; value: string; progress?: number; tone: "green" | "blue" | "purple"; footer?: ReactNode }) {
  const tones = {
    green: "bg-fit-primarySoft text-fit-primary",
    blue: "bg-fit-blueSoft text-fit-blue",
    purple: "bg-fit-purpleSoft text-fit-purple",
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${tones[tone]}`}>{icon}</div>
        <div>
          <p className="text-sm text-fit-muted">{label}</p>
          <p className="mt-2 text-2xl font-black text-fit-text">{value}</p>
        </div>
      </div>
      {progress && <div className="mt-5 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-fit-primary" style={{ width: `${progress}%` }} /></div>}
      {footer && <div className="mt-4">{footer}</div>}
    </Card>
  );
}

function Summary({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return <div className={`rounded-xl border p-3 text-center ${active ? "border-fit-primary bg-fit-primarySoft" : "border-fit-border bg-white"}`}><p className="text-xs text-fit-muted">{label}</p><p className="mt-1 font-black text-fit-text">{value}</p></div>;
}

function Goal({ title, value, progress, color }: { title: string; value: string; progress: number; color: string }) {
  return (
    <div className="mb-4 rounded-2xl border border-fit-border p-5">
      <div className="flex items-center justify-between">
        <p className="font-bold text-fit-text">{title}</p>
        <p className="font-black text-fit-primary">{value}</p>
      </div>
      <div className="mt-4 h-3 rounded-full bg-slate-100"><div className={`h-3 rounded-full ${color}`} style={{ width: `${progress}%` }} /></div>
    </div>
  );
}
