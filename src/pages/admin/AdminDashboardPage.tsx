import { useState, useEffect, useRef } from "react";
import { CheckSquare, Clock, DollarSign, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import type { ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { formatCurrency } from "../../utils/formatCurrency";
import { adminDashboardService } from "../../services/adminDashboardService";
import type { 
  DashboardOverviewResponse,
  DashboardRevenueResponse,
  DashboardMemberResponse,
  DashboardCheckinResponse,
  DashboardPackageResponse,
  DashboardRecentActivityResponse,
  DashboardFilterRequest
} from "../../types/dashboard.type";

import D3BarChart from "../../components/common/charts/D3BarChart";
import D3PieChart from "../../components/common/charts/D3PieChart";

export default function AdminDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<DashboardFilterRequest>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], // 1 tháng trước
    endDate: new Date().toISOString().split('T')[0],
    groupBy: "MONTH"
  });

  // Data States
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [revenue, setRevenue] = useState<DashboardRevenueResponse | null>(null);
  const [members, setMembers] = useState<DashboardMemberResponse | null>(null);
  const [checkins, setCheckins] = useState<DashboardCheckinResponse | null>(null);
  const [packages, setPackages] = useState<DashboardPackageResponse | null>(null);
  const [recent, setRecent] = useState<DashboardRecentActivityResponse | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [o, r, m, c, p, rec] = await Promise.all([
          adminDashboardService.getOverview(filters),
          adminDashboardService.getRevenueStats(filters),
          adminDashboardService.getMemberStats(filters),
          adminDashboardService.getCheckinStats(filters),
          adminDashboardService.getPackageStats(filters),
          adminDashboardService.getRecentActivities(filters)
        ]);
        
        setOverview(o);
        setRevenue(r);
        setMembers(m);
        setCheckins(c);
        setPackages(p);
        setRecent(rec);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [filters]);

  // GSAP Stagger Animation
  useGSAP(() => {
    if (!loading && overview) {
      gsap.from(".gsap-reveal", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all"
      });
    }
  }, { dependencies: [loading, overview], scope: containerRef });

  return (
    <div className="space-y-8 pb-8" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Dashboard Quản trị" 
          description="Tổng quan hoạt động và doanh thu hệ thống phòng gym FitLife" 
        />
        
        {/* Filter Form */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center px-2 text-slate-500">
            <Filter className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold">Bộ lọc</span>
          </div>
          <input 
            type="date" 
            value={filters.startDate}
            onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))}
            className="text-sm border-slate-200 rounded-lg focus:ring-fit-primary"
          />
          <span className="text-slate-400">-</span>
          <input 
            type="date" 
            value={filters.endDate}
            onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))}
            className="text-sm border-slate-200 rounded-lg focus:ring-fit-primary"
          />
          <select 
            value={filters.groupBy}
            onChange={e => setFilters(p => ({ ...p, groupBy: e.target.value as "DAY" | "MONTH" | "YEAR" }))}
            className="text-sm border-slate-200 rounded-lg focus:ring-fit-primary bg-slate-50"
          >
            <option value="DAY">Theo Ngày</option>
            <option value="MONTH">Theo Tháng</option>
            <option value="YEAR">Theo Năm</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
        </div>
      ) : error || !overview ? (
        <div className="flex flex-col h-64 items-center justify-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <p className="text-lg font-medium">{error || "Không có dữ liệu báo cáo"}</p>
          <p className="text-sm mt-1 text-slate-400">Hệ thống có thể đang bảo trì hoặc chưa sẵn sàng.</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="gsap-reveal">
              <AdminMetric 
                icon={<Users className="w-7 h-7" />} 
                label="Tổng hội viên" 
                value={overview.totalMembers.toLocaleString("vi-VN")} 
                growth={overview.membersGrowthPct} 
                tone="green" 
              />
            </div>
            <div className="gsap-reveal">
              <AdminMetric 
                icon={<CheckSquare className="w-7 h-7" />} 
                label="Check-in hôm nay" 
                value={overview.todayCheckins.toLocaleString("vi-VN")} 
                growth={overview.checkinsGrowthPct} 
                tone="blue" 
              />
            </div>
            <div className="gsap-reveal">
              <AdminMetric 
                icon={<DollarSign className="w-7 h-7" />} 
                label="Doanh thu" 
                value={formatCurrency(Number(overview.monthlyRevenue))} 
                growth={overview.revenueGrowthPct} 
                tone="purple" 
              />
            </div>
            <div className="gsap-reveal">
              <AdminMetric 
                icon={<Clock className="w-7 h-7" />} 
                label="Gói sắp hết hạn" 
                value={overview.expiringPackages.toLocaleString("vi-VN")} 
                growth={0} 
                tone="orange" 
              />
            </div>
          </div>

          {/* Revenue Section */}
          {revenue && (
            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <Card className="p-6 sm:p-8 relative overflow-hidden group gsap-reveal">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">Biểu đồ doanh thu</h2>
                      <p className="text-sm text-slate-500 mt-1 font-medium">Theo {filters.groupBy === 'DAY' ? 'Ngày' : filters.groupBy === 'MONTH' ? 'Tháng' : 'Năm'}</p>
                    </div>
                  </div>
                  <D3BarChart 
                    data={revenue.trendChart} 
                    height={300} 
                    color="#10b981" 
                    yAxisFormatter={(v) => formatCurrency(v)} 
                  />
                </div>
              </Card>

              <Card className="p-6 sm:p-8 relative overflow-hidden gsap-reveal">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent pointer-events-none" />
                <div className="relative">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cơ cấu doanh thu</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium mb-4">Theo gói tập</p>
                  <D3PieChart data={revenue.structurePieChart} height={250} donut={true} />
                </div>
              </Card>
            </div>
          )}

          {/* Members & Checkins Section */}
          <div className="grid gap-6 xl:grid-cols-2">
            {members && (
              <Card className="p-6 sm:p-8 gsap-reveal">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Tăng trưởng Hội viên</h2>
                <D3BarChart data={members.growthChart} height={250} color="#3b82f6" />
              </Card>
            )}
            
            {checkins && (
              <Card className="p-6 sm:p-8 gsap-reveal">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Lưu lượng Check-in</h2>
                <D3BarChart data={checkins.trafficChart} height={250} color="#f59e0b" />
              </Card>
            )}
          </div>

          {/* Packages & Lists Section */}
          <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
            {packages && (
              <Card className="p-6 sm:p-8 gsap-reveal">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Tỷ lệ đăng ký Gói tập</h2>
                <D3PieChart data={packages.packageRatioChart} height={250} donut={false} />
              </Card>
            )}
            
            {recent && (
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="gsap-reveal h-full">
                  <ListCard title="Hội viên mới" items={recent.recentMembers} />
                </div>
                <div className="gsap-reveal h-full">
                  <ListCard title="Lịch PT sắp tới" items={recent.todaySchedules} />
                </div>
                <div className="gsap-reveal h-full">
                  <ListCard title="Thanh toán" items={recent.recentPayments} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
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
    <Card className="p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group h-full">
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

interface ListCardItem {
  id: number | string;
  description: string;
  time: string;
  status?: string;
}

function ListCard({ title, items }: { title: string; items: ListCardItem[] }) {
  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-4 flex-1">
        {items.map((item) => (
          <div className="flex items-center justify-between group" key={item.id}>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-fit-primary transition-colors">{item.description}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{item.time}</p>
            </div>
            {item.status && (
              <Badge variant={item.status === "NEW" ? "success" : item.status === "PENDING" ? "warning" : item.status === "WARNING" ? "danger" : "info"}>
                {item.status === "NEW" ? "Mới" : item.status === "PENDING" ? "Sắp tới" : item.status === "WARNING" ? "Chú ý" : "Hoàn tất"}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
