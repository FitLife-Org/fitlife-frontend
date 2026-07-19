import { useState, useEffect } from "react";
import { CheckSquare, Clock, DollarSign, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { ReactNode } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { formatCurrency } from "../../utils/formatCurrency";
import { adminDashboardService } from "../../features/dashboard/services/adminDashboardService";
import type { DashboardStatsResponse } from "../../features/dashboard/types/dashboard.type";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stats = await adminDashboardService.getDashboardStats();
        setData(stats);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
      </div>
    );
  }

  const { overview, revenueChart, packageRatio, recentMembers, todaySchedule, recentPayments } = data;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader 
        title="Dashboard Quản trị" 
        description="Tổng quan hoạt động và doanh thu hệ thống phòng gym FitLife" 
      />
      
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetric 
          icon={<Users className="w-7 h-7" />} 
          label="Tổng hội viên" 
          value={overview.totalMembers.toLocaleString("vi-VN")} 
          growth={overview.membersGrowthPct} 
          tone="green" 
        />
        <AdminMetric 
          icon={<CheckSquare className="w-7 h-7" />} 
          label="Check-in hôm nay" 
          value={overview.todayCheckins.toLocaleString("vi-VN")} 
          growth={overview.checkinsGrowthPct} 
          tone="blue" 
        />
        <AdminMetric 
          icon={<DollarSign className="w-7 h-7" />} 
          label="Doanh thu tháng" 
          value={formatCurrency(overview.monthlyRevenue)} 
          growth={overview.revenueGrowthPct} 
          tone="purple" 
        />
        <AdminMetric 
          icon={<Clock className="w-7 h-7" />} 
          label="Gói sắp hết hạn" 
          value={overview.expiringPackages.toLocaleString("vi-VN")} 
          growth={0} 
          tone="orange" 
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-6 sm:p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Biểu đồ doanh thu</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">6 tháng gần nhất</p>
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +15.6%
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [formatCurrency(value as number), "Doanh thu"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent pointer-events-none" />
          <div className="relative">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tỷ lệ đăng ký gói tập</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium mb-4">Phân bổ theo thời hạn</p>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={packageRatio}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {packageRatio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, "Tỷ lệ"]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-sm font-semibold text-slate-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <ListCard title="Hội viên mới (24h)" items={recentMembers} />
        <ListCard title="Lịch PT sắp diễn ra" items={todaySchedule} />
        <ListCard title="Thanh toán gần đây" items={recentPayments} />
      </div>
    </div>
  );
}

interface AdminMetricProps {
  icon: ReactNode;
  label: string;
  value: string;
  growth: number;
  tone?: "green" | "blue" | "orange" | "purple";
}

function AdminMetric({ icon, label, value, growth, tone = "green" }: AdminMetricProps) {
  const tones = { 
    green: "bg-emerald-100 text-emerald-600 ring-emerald-500/20", 
    blue: "bg-blue-100 text-blue-600 ring-blue-500/20", 
    orange: "bg-orange-100 text-orange-600 ring-orange-500/20",
    purple: "bg-purple-100 text-purple-600 ring-purple-500/20"
  };

  const isPositive = growth > 0;
  const isNeutral = growth === 0;

  return (
    <Card className="p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${tones[tone].split(' ')[1].replace('text-', 'bg-')}`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${tones[tone]} shadow-inner`}>
          {icon}
        </div>
        
        {!isNeutral && (
          <div className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full ${
            isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          }`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(growth)}%</span>
          </div>
        )}
      </div>

      <div className="mt-6 relative z-10">
        <p className="text-sm font-semibold text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </Card>
  );
}

function ListCard({ title, items }: { title: string; items: any[] }) {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <a className="text-sm font-bold text-fit-primary hover:text-emerald-700 transition-colors" href="#">
          Xem tất cả
        </a>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div className="flex items-center justify-between group" key={item.id}>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-fit-primary transition-colors">{item.description}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{item.time}</p>
            </div>
            {item.status && (
              <Badge variant={item.status === "NEW" ? "success" : item.status === "PENDING" ? "warning" : "info"}>
                {item.status === "NEW" ? "Mới" : item.status === "PENDING" ? "Sắp tới" : "Hoàn tất"}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
