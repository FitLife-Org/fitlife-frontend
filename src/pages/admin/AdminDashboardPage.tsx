import { useState, useEffect, useRef } from "react";
import {
  CheckSquare, Clock, DollarSign, Users, ArrowUpRight, ArrowDownRight,
  Filter, RefreshCw, Phone, MessageSquare, Search, Info,
  TrendingUp, TrendingDown, AlertCircle, BarChart4, AreaChart, LineChart
} from "lucide-react";
import type { ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { toast } from "react-hot-toast";

import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import { formatCurrency } from "../../utils/formatCurrency";
import { adminDashboardService } from "../../services/adminDashboardService";
import type {
  DashboardOverviewResponse, DashboardFilterRequest, ChartDataDto, RecentActivityDto
} from "../../types/dashboard.type";

import D3BarChart from "../../components/common/charts/D3BarChart";

// Compact Currency Formatter
const formatCompactCurrency = (value: number) => {
  if (value >= 1000000000) return (value / 1000000000).toFixed(1).replace(/\.0$/, "") + " Tỷ";
  if (value >= 1000000) return (value / 1000000).toFixed(1).replace(/\.0$/, "") + " Tr";
  if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, "") + " K";
  return value.toString();
};

export default function AdminDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartSectionRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Chart Filter state
  const [chartTimeRange, setChartTimeRange] = useState<"7d" | "30d" | "all">("all");

  const [filters, setFilters] = useState<DashboardFilterRequest>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    groupBy: "MONTH"
  });

  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [revenue, setRevenue] = useState<ChartDataDto[] | null>(null);
  const [checkinsToday, setCheckinsToday] = useState<RecentActivityDto[] | null>(null);
  const [expiring, setExpiring] = useState<RecentActivityDto[] | null>(null);

  const [checkinSearch, setCheckinSearch] = useState("");
  const [expiringSearch, setExpiringSearch] = useState("");

  const fetchAllData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [o, r, ct, exp] = await Promise.all([
        adminDashboardService.getOverview(filters),
        adminDashboardService.getRevenueStats(filters),
        adminDashboardService.getCheckinsToday(filters),
        adminDashboardService.getExpiringSubscriptions(filters)
      ]);

      setOverview(o); setRevenue(r); setCheckinsToday(ct); setExpiring(exp);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useEffect(() => { fetchAllData(); }, [filters]);

  useGSAP(() => {
    if (!loading && overview) {
      gsap.fromTo(".gsap-reveal",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, { dependencies: [loading, overview], scope: containerRef });

  useGSAP(() => {
    if (!loading && overview) {
      gsap.fromTo(chartSectionRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, { dependencies: [overview, loading], scope: containerRef });

  const handleQuickFilter = (days: number) => {
    const start = new Date();
    start.setDate(start.getDate() - days);
    setFilters({
      startDate: start.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      groupBy: days <= 7 ? "DAY" : "MONTH"
    });
    toast.success(`Đã cập nhật dữ liệu ${days} ngày qua`);
  };

  return (
      <div className="space-y-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/30" ref={containerRef}>

        {/* 1. Header & Filters Toolbar */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pt-6">
          <PageHeader
              title="Dashboard Quản trị"
              description="Khám phá và phân tích các chỉ số vận hành phòng tập FitLife."
          />

          <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-full ring-1 ring-slate-900/5 shadow-sm">
            <div className="flex items-center bg-slate-50 rounded-full p-1">
              <button onClick={() => handleQuickFilter(7)} className="px-4 py-1.5 text-xs font-semibold rounded-full text-slate-600 hover:bg-white hover:shadow-sm hover:text-fit-primary transition-all">
                7 ngày
              </button>
              <button onClick={() => handleQuickFilter(30)} className="px-4 py-1.5 text-xs font-semibold rounded-full text-slate-600 hover:bg-white hover:shadow-sm hover:text-fit-primary transition-all">
                30 ngày
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-2 px-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <input
                  type="date" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))}
                  className="text-xs font-medium border-none bg-transparent cursor-pointer focus:ring-0 p-0 text-slate-700 outline-none"
              />
              <span className="text-slate-300">-</span>
              <input
                  type="date" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))}
                  className="text-xs font-medium border-none bg-transparent cursor-pointer focus:ring-0 p-0 text-slate-700 outline-none"
              />
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <select
                value={filters.groupBy} onChange={e => setFilters(p => ({ ...p, groupBy: e.target.value as any }))}
                className="text-xs font-semibold border-none bg-transparent cursor-pointer focus:ring-0 text-slate-700 pl-2 pr-8 outline-none appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5NDkzYjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[right_4px_center] bg-[length:16px]"
            >
              <option value="DAY">Theo Ngày</option>
              <option value="MONTH">Theo Tháng</option>
              <option value="YEAR">Theo Năm</option>
            </select>

            <button
                onClick={() => fetchAllData(true)} disabled={refreshing}
                className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-fit-primary/10 text-fit-primary hover:bg-fit-primary hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {loading ? (
            <Loading label="Đang đồng bộ dữ liệu..." />
        ) : error || !overview ? (
            <div className="flex flex-col h-64 items-center justify-center text-slate-500 bg-white rounded-3xl ring-1 ring-slate-900/5 shadow-sm">
              <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-lg font-semibold text-slate-700">{error || "Chưa có dữ liệu thống kê"}</p>
              <Button onClick={() => fetchAllData()} className="mt-4 bg-slate-900 text-white rounded-full px-6">Thử lại</Button>
            </div>
        ) : (
            <>
              {/* 2. Overview Metrics Grid */}
              <div className="flex flex-col xl:flex-row gap-6">

                {/* Thẻ Doanh Thu Nổi Bật (Hero Metric) */}
                <div className="xl:w-1/3 gsap-reveal h-full">
                  <div className="relative p-8 rounded-3xl transition-all duration-300 h-full flex flex-col justify-between overflow-hidden group bg-slate-900 text-white shadow-xl ring-1 ring-white/10">
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-fit-primary/40 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100"></div>

                    <div className="relative z-10 flex items-start justify-between mb-8">
                      <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl ring-1 ring-white/20 text-white">
                        <DollarSign className="w-7 h-7" />
                      </div>
                      <div className="flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>{overview.revenueGrowthPct}%</span>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <p className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-2">Tổng Doanh Thu</p>
                      <p className="text-4xl font-bold text-white tracking-tight truncate">
                        {formatCurrency(Number(overview.monthlyRevenue))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Khối 3 thẻ thống kê còn lại */}
                <div className="xl:w-2/3 grid gap-6 sm:grid-cols-3">
                  <div className="gsap-reveal h-full">
                    <AdminMetric
                        icon={<Users className="w-5 h-5" />} label="Tổng hội viên"
                        value={overview.totalMembers.toLocaleString("vi-VN")} growth={overview.membersGrowthPct}
                        tone="blue"
                    />
                  </div>
                  <div className="gsap-reveal h-full">
                    <AdminMetric
                        icon={<CheckSquare className="w-5 h-5" />} label="Check-in hôm nay"
                        value={overview.todayCheckins.toLocaleString("vi-VN")} growth={overview.checkinsGrowthPct}
                        tone="orange"
                    />
                  </div>
                  <div className="gsap-reveal h-full">
                    <AdminMetric
                        icon={<Clock className="w-5 h-5" />} label="Gói sắp hết hạn"
                        value={overview.expiringPackages.toLocaleString("vi-VN")} growth={0}
                        tone="rose"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Main Chart Panel (Biểu Đồ Cột) */}
              <div ref={chartSectionRef} className="gsap-reveal w-full">
                <Card className="w-full p-6 sm:p-8 bg-white ring-1 ring-slate-900/5 shadow-sm rounded-3xl flex flex-col min-h-[500px]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-fit-primary" />
                        Xu hướng doanh thu
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">Biểu diễn dưới dạng biểu đồ cột (Bar Chart)</p>
                    </div>

                    <div className="flex items-center bg-slate-50 p-1 rounded-full ring-1 ring-slate-200 shrink-0">
                      <button
                          onClick={() => setChartTimeRange("7d")}
                          className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                              chartTimeRange === "7d" ? "bg-white text-fit-primary shadow-sm ring-1 ring-slate-900/5" : "text-slate-500 hover:text-slate-800"
                          }`}
                      >
                        7 Ngày
                      </button>
                      <button
                          onClick={() => setChartTimeRange("30d")}
                          className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                              chartTimeRange === "30d" ? "bg-white text-fit-primary shadow-sm ring-1 ring-slate-900/5" : "text-slate-500 hover:text-slate-800"
                          }`}
                      >
                        30 Ngày
                      </button>
                      <button
                          onClick={() => setChartTimeRange("all")}
                          className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                              chartTimeRange === "all" ? "bg-white text-fit-primary shadow-sm ring-1 ring-slate-900/5" : "text-slate-500 hover:text-slate-800"
                          }`}
                      >
                        Toàn bộ
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 w-full flex items-center justify-center">
                    {revenue && revenue.length > 0 ? (
                        <D3BarChart
                            data={revenue}
                            height={350}
                            color="#10b981"
                            yAxisFormatter={formatCompactCurrency}
                        />
                    ) : (
                        <div className="flex flex-col items-center text-slate-400 bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-200">
                          <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-sm font-medium">Chưa đủ dữ liệu biểu diễn khoảng thời gian này</span>
                        </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* 4. Lists & Operations */}
              <div className="grid gap-6 xl:grid-cols-2 mt-6">
                <div className="gsap-reveal h-full">
                  <ListCard
                      title="Lượt Check-in Gần Đây"
                      placeholder="Tìm tên học viên..."
                      searchValue={checkinSearch} onSearchChange={setCheckinSearch}
                      items={checkinsToday || []} type="checkin"
                  />
                </div>
                <div className="gsap-reveal h-full">
                  <ListCard
                      title="Cần Gia Hạn Sớm"
                      placeholder="Tìm theo gói/tên..."
                      searchValue={expiringSearch} onSearchChange={setExpiringSearch}
                      items={expiring || []} type="expiring"
                  />
                </div>
              </div>
            </>
        )}
      </div>
  );
}

// ==========================================
// THÀNH PHẦN: ADMIN METRIC (CÁC THẺ PHỤ)
// ==========================================
interface AdminMetricProps {
  icon: ReactNode; label: string; value: string; growth: number;
  tone: "green" | "blue" | "orange" | "rose";
}

function AdminMetric({ icon, label, value, growth, tone }: AdminMetricProps) {
  const tones = {
    green: "bg-emerald-50 text-emerald-600 ring-emerald-500/20",
    blue: "bg-blue-50 text-blue-600 ring-blue-500/20",
    orange: "bg-orange-50 text-orange-600 ring-orange-500/20",
    rose: "bg-rose-50 text-rose-600 ring-rose-500/20"
  };

  const isPositive = growth > 0;
  const isNeutral = growth === 0;

  return (
      <div className="relative p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between h-full group bg-white ring-1 ring-slate-900/5 hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-start justify-between mb-8">
          <div className={`p-3 rounded-2xl ${tones[tone]}`}>
            {icon}
          </div>
          {!isNeutral && (
              <div className={`flex items-center gap-0.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                  isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              }`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{Math.abs(growth)}%</span>
              </div>
          )}
        </div>

        <div>
          <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-fit-primary transition-colors truncate">
            {value}
          </p>
        </div>
      </div>
  );
}

// ==========================================
// THÀNH PHẦN: LIST CARD
// ==========================================
function getAvatarStyle(name: string) {
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  const palettes = [
    "bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700",
    "bg-indigo-100 text-indigo-700", "bg-purple-100 text-purple-700",
    "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700"
  ];
  return palettes[code % palettes.length];
}

interface ListCardProps {
  title: string; placeholder: string; searchValue: string;
  onSearchChange: (v: string) => void; items: RecentActivityDto[]; type: "checkin" | "expiring";
}

function ListCard({ title, placeholder, searchValue, onSearchChange, items, type }: ListCardProps) {
  const filtered = items.filter(item =>
      item.description.toLowerCase().includes(searchValue.toLowerCase()) || item.time.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
      <Card className="p-6 h-[420px] flex flex-col bg-white rounded-3xl ring-1 ring-slate-900/5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
                type="text" placeholder={placeholder} value={searchValue} onChange={(e) => onSearchChange(e.target.value)}
                className="w-full text-sm bg-slate-50 border-none rounded-full pl-9 pr-4 py-2 focus:ring-2 focus:ring-fit-primary/20 transition-all text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {filtered.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Search className="w-6 h-6 mb-2 opacity-50" />
                <p className="text-sm">Không có dữ liệu</p>
              </div>
          ) : (
              filtered.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group cursor-default">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarStyle(item.description)}`}>
                        {item.description.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-fit-primary transition-colors">{item.description}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {type === "expiring" ? (
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 rounded-full bg-slate-100 hover:bg-fit-primary hover:text-white text-slate-600 transition-colors"><Phone className="w-3.5 h-3.5" /></button>
                            <button className="p-2 rounded-full bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-600 transition-colors"><MessageSquare className="w-3.5 h-3.5" /></button>
                          </div>
                      ) : (
                          <Badge variant={item.status === "NEW" ? "success" : item.status === "PENDING" ? "warning" : "info"} className="rounded-full px-2.5">
                            {item.status === "NEW" ? "Thành công" : item.status === "PENDING" ? "Chờ xử lý" : "Khác"}
                          </Badge>
                      )}
                    </div>
                  </div>
              ))
          )}
        </div>
      </Card>
  );
}