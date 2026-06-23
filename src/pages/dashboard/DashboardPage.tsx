import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Activity, ArrowRight, CalendarDays, Dumbbell, Flame, TrendingUp, Trophy, ChevronRight, Apple, Sparkles, Target } from "lucide-react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

// Dữ liệu mẫu cho biểu đồ
const progressData = [
  { week: "Tuần 1", weight: 74.3, fat: 22.5 },
  { week: "Tuần 2", weight: 73.1, fat: 21.8 },
  { week: "Tuần 3", weight: 71.5, fat: 21.0 },
  { week: "Tuần 4", weight: 70.2, fat: 20.1 },
  { week: "Tuần 5", weight: 68.8, fat: 19.5 },
  { week: "Tuần 6", weight: 67.5, fat: 18.8 },
  { week: "Tuần 7", weight: 66.8, fat: 18.2 },
  { week: "Tuần 8", weight: 66.1, fat: 17.5 },
];

const workouts = [
  ["Bench Press", "4 x 10-12"],
  ["Shoulder Press", "3 x 10-12"],
  ["Incline Dumbbell Press", "3 x 10-12"],
  ["Triceps Pushdown", "3 x 12-15"],
];

const quickActions = [
  { name: "Tạo lịch tập", icon: CalendarDays, color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Xem meal plan", icon: Apple, color: "text-green-500", bg: "bg-green-50" },
  { name: "Đo chỉ số cơ thể", icon: Target, color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Hỏi FitAI", icon: Sparkles, color: "text-rose-500", bg: "bg-rose-50" },
];

// Component Tooltip tùy chỉnh cho biểu đồ
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
        <div className="rounded-xl border border-slate-100 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
          <p className="mb-1 text-sm font-semibold text-slate-500">{label}</p>
          <p className="text-base font-bold text-emerald-600">
            {payload[0].value} {payload[0].dataKey === 'weight' ? 'kg' : '%'}
          </p>
        </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<"weight" | "fat">("weight");

  useGSAP(() => {
    gsap.fromTo(
        ".gsap-animate",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
    );
  }, { scope: containerRef });

  return (
      <div ref={containerRef} className="pb-10">
        <div className="gsap-animate">
          <PageHeader title="Dashboard" description="Tổng quan hành trình tập luyện và sức khỏe của bạn" />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="gsap-animate">
            <MetricCard icon={<Trophy className="h-7 w-7" />} label="Gói hiện tại" value="Premium 6 tháng" tone="green" footer={<Badge variant="success">Thành viên Premium</Badge>} />
          </div>
          <div className="gsap-animate">
            <MetricCard icon={<Dumbbell className="h-7 w-7" />} label="Buổi tập tuần này" value="4 / 6 buổi" progress={67} tone="blue" />
          </div>
          <div className="gsap-animate">
            <MetricCard icon={<Flame className="h-7 w-7" />} label="Calories hôm nay" value="1.850 / 2.200" progress={84} tone="green" />
          </div>
          <div className="gsap-animate">
            <MetricCard icon={<CalendarDays className="h-7 w-7" />} label="Ngày hết hạn" value="01/08/2025" tone="purple" footer={<span className="text-sm font-medium text-fit-muted">Còn 12 ngày</span>} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.2fr_1fr]">
          <div className="gsap-animate">
            <Card className="flex h-full flex-col p-6 transition-shadow duration-300 hover:shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-fit-text">Lịch tập hôm nay</h2>
                <a className="group flex items-center gap-1 text-sm font-semibold text-fit-primary transition-colors hover:text-green-600" href="/member/booking">
                  Xem lịch <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-fit-primary">18:00 - 19:15</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="font-bold text-fit-text">Push (Ngực - Vai - Tay sau)</p>
                  <Badge variant="success">Phòng Gym 1</Badge>
                </div>
              </div>

              <div className="mt-6 flex-1 space-y-2">
                {workouts.map(([name, reps], index) => (
                    <div className="group flex items-center justify-between rounded-xl p-2 -mx-2 text-sm transition-all hover:bg-slate-50" key={name}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-500 transition-colors group-hover:bg-fit-primary group-hover:text-white">{index + 1}</div>
                        <span className="font-medium text-fit-text">{name}</span>
                      </div>
                      <span className="font-medium text-fit-muted">{reps}</span>
                    </div>
                ))}
              </div>
              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-fit-primary/20 bg-fit-primarySoft py-3 font-bold text-fit-primary transition-all hover:bg-fit-primary hover:text-white" type="button">
                Bắt đầu buổi tập <ArrowRight className="h-4 w-4" />
              </button>
            </Card>
          </div>

          {/* --- Phần Biểu Đồ Nâng Cấp --- */}
          <div className="gsap-animate">
            <Card className="flex h-full flex-col p-6 transition-shadow duration-300 hover:shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-fit-text">Tiến độ 8 tuần</h2>
                <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as "weight" | "fat")}
                    className="cursor-pointer rounded-xl border border-fit-border bg-slate-50 px-3 py-2 text-sm font-medium text-fit-text outline-none transition-colors hover:border-fit-primary focus:border-fit-primary focus:ring-2 focus:ring-fit-primarySoft"
                >
                  <option value="weight">Cân nặng (kg)</option>
                  <option value="fat">Mỡ cơ thể (%)</option>
                </select>
              </div>

              <div className="relative flex-1 min-h-[250px] rounded-2xl border border-emerald-100/50 bg-white p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="week"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey={chartType}
                        stroke="#10b981"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Summary label="Bắt đầu" value={chartType === "weight" ? "74.3 kg" : "22.5 %"} />
                <Summary label="Hiện tại" value={chartType === "weight" ? "66.1 kg" : "17.5 %"} active />
                <Summary label="Thay đổi" value={chartType === "weight" ? "-8.2 kg" : "-5.0 %"} trend="down" />
              </div>
            </Card>
          </div>
          {/* --- Hết Phần Biểu Đồ Nâng Cấp --- */}

          <div className="gsap-animate">
            <Card className="flex h-full flex-col p-6 transition-shadow duration-300 hover:shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-fit-text">Mục tiêu tháng này</h2>
                <a className="group flex items-center gap-1 text-sm font-semibold text-fit-primary transition-colors hover:text-green-600" href="/member/body-metrics">
                  Chi tiết <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
              <div className="flex-1 space-y-4">
                <Goal title="Giảm mỡ" value="-1.8 kg" target="Mục tiêu: -3.0 kg" progress={60} color="bg-fit-primary" bg="bg-fit-primarySoft" />
                <Goal title="Tăng cơ" value="+0.6 kg" target="Mục tiêu: +1.5 kg" progress={40} color="bg-fit-blue" bg="bg-fit-blueSoft" />
                <Goal title="Số ngày tập" value="12 ngày" target="Mục tiêu: 20 ngày" progress={60} color="bg-fit-purple" bg="bg-fit-purpleSoft" />
              </div>
            </Card>
          </div>
        </div>

        <div className="gsap-animate mt-6">
          <Card className="p-6 transition-shadow duration-300 hover:shadow-xl">
            <div className="mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-fit-primary" />
              <h2 className="text-xl font-bold tracking-tight text-fit-text">Gợi ý nhanh cho bạn</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((item) => (
                  <button className="group relative flex flex-col items-start justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-1 hover:border-fit-primary hover:shadow-lg" key={item.name} type="button">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${item.bg} ${item.color}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <ArrowRight className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-fit-primary" />
                    </div>
                  </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
  );
}

// Giữ nguyên các function MetricCard, Summary, Goal của bạn ở dưới đây...
function MetricCard({ icon, label, value, progress, tone, footer }: { icon: ReactNode; label: string; value: string; progress?: number; tone: "green" | "blue" | "purple"; footer?: ReactNode }) {
  const tones = {
    green: "from-emerald-50 to-emerald-100/50 text-fit-primary border-emerald-100",
    blue: "from-blue-50 to-blue-100/50 text-fit-blue border-blue-100",
    purple: "from-purple-50 to-purple-100/50 text-fit-purple border-purple-100",
  };

  const progressColors = {
    green: "bg-fit-primary",
    blue: "bg-fit-blue",
    purple: "bg-fit-purple",
  };

  return (
      <Card className="group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative z-10 flex items-center gap-4">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br shadow-sm transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110 ${tones[tone]}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-fit-muted">{label}</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-fit-text">{value}</p>
          </div>
        </div>
        {progress !== undefined && (
            <div className="relative z-10 mt-6">
              <div className="mb-2 flex justify-between text-xs font-semibold text-fit-muted">
                <span>Tiến độ</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColors[tone]}`} style={{ width: `${progress}%` }} />
              </div>
            </div>
        )}
        {footer && <div className="relative z-10 mt-5 flex items-center">{footer}</div>}

        <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-30 ${progressColors[tone]}`} />
      </Card>
  );
}

function Summary({ label, value, active, trend }: { label: string; value: string; active?: boolean; trend?: "up" | "down" }) {
  return (
      <div className={`relative overflow-hidden rounded-2xl border p-4 text-center transition-all ${active ? "border-fit-primary bg-fit-primarySoft shadow-sm" : "border-slate-200 bg-white"}`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-fit-muted">{label}</p>
        <div className="mt-2 flex items-center justify-center gap-1">
          <p className={`text-lg font-black tracking-tight ${active ? "text-fit-primary" : "text-fit-text"}`}>{value}</p>
          {trend === "down" && <TrendingUp className="h-4 w-4 rotate-180 text-fit-primary" />}
          {trend === "up" && <TrendingUp className="h-4 w-4 text-rose-500" />}
        </div>
      </div>
  );
}

function Goal({ title, value, target, progress, color, bg }: { title: string; value: string; target: string; progress: number; color: string; bg: string }) {
  return (
      <div className="group rounded-2xl border border-slate-100 bg-white p-5 transition-all hover:border-slate-200 hover:shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800">{title}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{target}</p>
          </div>
          <p className="text-xl font-black tracking-tight text-slate-800">{value}</p>
        </div>
        <div className={`h-3 w-full overflow-hidden rounded-full ${bg}`}>
          <div className={`relative h-full rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: `${progress}%` }}>
            <div className="absolute inset-0 bg-white/20 hover:translate-x-full transition-transform duration-700 ease-in-out" />
          </div>
        </div>
      </div>
  );
}