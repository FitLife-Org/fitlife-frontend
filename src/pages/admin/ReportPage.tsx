import { useEffect, useState, useRef } from "react";
import { 
  Users, 
  CreditCard, 
  Calendar, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  DollarSign
} from "lucide-react";
import D3AreaChart from "../../components/common/charts/D3AreaChart";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import toast from "react-hot-toast";

import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import { adminDashboardService } from "../../services/adminDashboardService";
import type { 
  DashboardOverview, 
  ChartDataDto, 
  RecentActivityDto 
} from "../../types/dashboard.type";
import { getApiErrorMessage } from "../../utils/apiError";

export default function ReportPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenueData, setRevenueData] = useState<ChartDataDto[]>([]);
  const [checkins, setCheckins] = useState<RecentActivityDto[]>([]);
  const [expiringSubs, setExpiringSubs] = useState<RecentActivityDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewRes, revenueRes, checkinsRes, expiringRes] = await Promise.all([
          adminDashboardService.getRealOverview(),
          adminDashboardService.getRealRevenueStats(),
          adminDashboardService.getRealCheckinsToday(),
          adminDashboardService.getRealExpiringSubscriptions()
        ]);
        setOverview(overviewRes);
        setRevenueData(revenueRes);
        setCheckins(checkinsRes);
        setExpiringSubs(expiringRes);
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  useGSAP(() => {
    if (!loading) {
      // Intro animations
      gsap.from(".gsap-stat-card", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out"
      });

      gsap.from(".gsap-chart-card", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out"
      });

      gsap.from(".gsap-table-card", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.4,
        stagger: 0.1,
        ease: "power3.out"
      });
    }
  }, [loading]);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatShortVND = (value: number) => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(1)}B`;
    }
    if (value >= 1e6) {
      return `${(value / 1e6).toFixed(0)}M`;
    }
    return value.toString();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-fit-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang tải báo cáo thống kê...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader 
        title="Báo cáo & Thống kê" 
        description="Theo dõi doanh thu, sự phát triển hội viên và hiệu suất vận hành hệ thống" 
      />

      {/* Grid: 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Members */}
        <Card className="gsap-stat-card p-6 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tổng hội viên</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">
                {overview?.totalMembers.toLocaleString() ?? 0}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              +{overview?.membersGrowthPct}%
            </span>
            <span className="text-xs text-slate-400">so với tháng trước</span>
          </div>
        </Card>

        {/* Today's Checkins */}
        <Card className="gsap-stat-card p-6 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Check-in hôm nay</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">
                {overview?.todayCheckins.toLocaleString() ?? 0}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              +{overview?.checkinsGrowthPct}%
            </span>
            <span className="text-xs text-slate-400">tăng trưởng ngày</span>
          </div>
        </Card>

        {/* Monthly Revenue */}
        <Card className="gsap-stat-card p-6 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Doanh thu tháng</p>
              <h3 className="text-2xl font-black text-slate-800 mt-2.5">
                {formatVND(overview?.monthlyRevenue ?? 0)}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              +{overview?.revenueGrowthPct}%
            </span>
            <span className="text-xs text-slate-400">so với mục tiêu</span>
          </div>
        </Card>

        {/* Expiring Subscriptions */}
        <Card className="gsap-stat-card p-6 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Gói sắp hết hạn</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">
                {overview?.expiringPackages ?? 0}
              </h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              Cần chăm sóc
            </span>
            <span className="text-xs text-slate-400">trong 7 ngày tới</span>
          </div>
        </Card>
      </div>

      {/* Main Chart Section: Revenue Trend */}
      <Card className="gsap-chart-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Biểu đồ Doanh thu</h3>
            <p className="text-xs text-slate-500 mt-1">Xu hướng doanh thu theo các tháng gần nhất</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Năm 2026
          </span>
        </div>

        <div className="w-full h-[320px]">
          <D3AreaChart 
            data={revenueData} 
            height={320} 
            color="#3b82f6"
            yAxisFormatter={formatShortVND}
          />
        </div>
      </Card>

      {/* Two operational tables side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Checkins Table */}
        <Card className="gsap-table-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Check-in Hôm nay</h3>
              <p className="text-xs text-slate-500 mt-1">Danh sách lượt quét thẻ vào phòng tập gần nhất</p>
            </div>
            <Badge variant="success">Thời gian thực</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-medium">Thời gian & Học viên</th>
                  <th className="pb-3 font-medium">Huấn luyện viên phụ trách</th>
                  <th className="pb-3 font-medium text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {checkins.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-semibold text-slate-700">
                      {item.description}
                    </td>
                    <td className="py-3 text-slate-500">
                      {item.time}
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant={item.status === "OK" ? "success" : item.status === "PENDING" ? "warning" : "default"}>
                        {item.status === "OK" ? "Đã duyệt" : item.status === "PENDING" ? "Chờ xử lý" : "Mới quét"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Expiring Subscriptions Table */}
        <Card className="gsap-table-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Cảnh báo hết hạn gói tập</h3>
              <p className="text-xs text-slate-500 mt-1">Các mã hóa đơn/đăng ký sắp tới hạn gia hạn</p>
            </div>
            <Badge variant="danger">Cảnh báo</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-medium">Mã đăng ký</th>
                  <th className="pb-3 font-medium">Chi tiết thời hạn & Gói tập</th>
                  <th className="pb-3 font-medium text-right">Mức độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {expiringSubs.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-700">
                      {item.description}
                    </td>
                    <td className="py-3 text-slate-500">
                      {item.time}
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant="warning">Sắp hết hạn</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
