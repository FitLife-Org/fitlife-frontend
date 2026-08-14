import { useEffect, useState, useRef } from "react";
import { 
  Users, 
  CreditCard, 
  Calendar, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Bot,
  Settings,
  Download,
  Package
} from "lucide-react";
import D3AreaChart from "../../components/common/charts/D3AreaChart";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import toast from "react-hot-toast";

import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import { adminDashboardService } from "../../services/adminDashboardService";
import type { 
  DashboardOverview, 
  ChartDataDto, 
  RecentActivityDto,
  RevenueSummaryDto,
  PaymentStatusStatsDto,
  SubscriptionSummaryDto,
  MemberSummaryDto,
  EquipmentStatusStatsDto,
  AiSummaryDto,
  MaintenanceSummaryDto,
  CheckinTrendDto,
  CheckinPeakHourDto,
  PlanSummaryDto
} from "../../types/dashboard.type";
import { getApiErrorMessage } from "../../utils/apiError";

export default function ReportPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenueData, setRevenueData] = useState<ChartDataDto[]>([]);
  const [checkins, setCheckins] = useState<RecentActivityDto[]>([]);
  const [expiringSubs, setExpiringSubs] = useState<RecentActivityDto[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummaryDto | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusStatsDto | null>(null);
  const [subSummary, setSubSummary] = useState<SubscriptionSummaryDto | null>(null);
  const [memberSummary, setMemberSummary] = useState<MemberSummaryDto | null>(null);
  const [equipmentStatus, setEquipmentStatus] = useState<EquipmentStatusStatsDto | null>(null);
  const [aiSummary, setAiSummary] = useState<AiSummaryDto | null>(null);
  const [maintenanceSummary, setMaintenanceSummary] = useState<MaintenanceSummaryDto | null>(null);
  
  const [checkinTrend, setCheckinTrend] = useState<CheckinTrendDto[]>([]);
  const [peakHours, setPeakHours] = useState<CheckinPeakHourDto[]>([]);
  const [plansSummary, setPlansSummary] = useState<PlanSummaryDto[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          overviewRes, revenueRes, checkinsRes, expiringRes,
          revSumRes, payStatRes, subSumRes, memSumRes, eqStatRes, aiSumRes, maintSumRes,
          checkinTrendRes, peakHoursRes, plansSummaryRes
        ] = await Promise.all([
          adminDashboardService.getOverview(),
          adminDashboardService.getRevenueStats(),
          adminDashboardService.getCheckinsToday(),
          adminDashboardService.getExpiringSubscriptions(),
          adminDashboardService.getRevenueSummary(),
          adminDashboardService.getPaymentStatusStats(),
          adminDashboardService.getSubscriptionSummary(),
          adminDashboardService.getMemberSummary(),
          adminDashboardService.getEquipmentStatusStats(),
          adminDashboardService.getAiSummary(),
          adminDashboardService.getMaintenanceSummary(),
          adminDashboardService.getCheckinTrend(),
          adminDashboardService.getCheckinPeakHours(),
          adminDashboardService.getPlansSummary()
        ]);
        setOverview(overviewRes);
        setRevenueData(revenueRes);
        setCheckins(checkinsRes);
        setExpiringSubs(expiringRes);
        setRevenueSummary(revSumRes);
        setPaymentStatus(payStatRes);
        setSubSummary(subSumRes);
        setMemberSummary(memSumRes);
        setEquipmentStatus(eqStatRes);
        setAiSummary(aiSumRes);
        setMaintenanceSummary(maintSumRes);
        setCheckinTrend(checkinTrendRes);
        setPeakHours(peakHoursRes);
        setPlansSummary(plansSummaryRes);
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
      // Intro animations for stats
      gsap.fromTo(".gsap-stat-card", 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "back.out(1.2)" }
      );

      gsap.fromTo(".gsap-chart-card", 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" }
      );

      gsap.fromTo(".gsap-table-card", 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, delay: 0.4, stagger: 0.1, ease: "power3.out" }
      );
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

  const handleExport = async () => {
    try {
      const blob = await adminDashboardService.exportReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FitLife_Report_${new Date().getTime()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Đã xuất báo cáo thành công");
    } catch (error) {
      toast.error("Xuất báo cáo thất bại");
    }
  };

  if (loading) return <Loading />;

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader 
        title="Báo cáo & Thống kê" 
        description="Theo dõi doanh thu, sự phát triển hội viên và hiệu suất vận hành hệ thống" 
        action={
          <Button onClick={handleExport}>
            <Download className="h-5 w-5" />
            Xuất báo cáo
          </Button>
        }
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
          {revenueData && revenueData.length > 0 ? (
            <D3AreaChart 
              data={revenueData} 
              height={320} 
              color="#3b82f6"
              yAxisFormatter={formatShortVND}
            />
          ) : (
            <div className="flex flex-col h-full items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <DollarSign className="w-10 h-10 mb-2 text-slate-300" />
              <p className="font-medium">Chưa có dữ liệu doanh thu</p>
            </div>
          )}
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

      {/* Detailed Report Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card className="gsap-stat-card p-6 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Chi tiết Doanh thu</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-slate-500">Tổng thu:</span> <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{revenueSummary ? formatVND(revenueSummary.totalRevenue) : "0 ₫"}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Chờ xử lý:</span> <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{revenueSummary ? formatVND(revenueSummary.pendingRevenue) : "0 ₫"}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Hoàn trả:</span> <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{revenueSummary ? formatVND(revenueSummary.refundedRevenue) : "0 ₫"}</span></div>
          </div>
        </Card>
        
        <Card className="gsap-stat-card p-6 border-t-4 border-t-indigo-500 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Trạng thái Giao dịch</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-slate-500">Hoàn tất:</span> <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{paymentStatus?.completed ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Đang chờ:</span> <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{paymentStatus?.pending ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Thất bại:</span> <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{paymentStatus?.failed ?? 0}</span></div>
          </div>
        </Card>

        <Card className="gsap-stat-card p-6 border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Thống kê Gói tập</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-slate-500">Đang HĐ:</span> <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{subSummary?.active ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Hết hạn:</span> <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{subSummary?.expired ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Đã hủy:</span> <span className="font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{subSummary?.cancelled ?? 0}</span></div>
          </div>
        </Card>

        <Card className="gsap-stat-card p-6 border-t-4 border-t-pink-500 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Tình trạng Hội viên</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-slate-500">Đang tập:</span> <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{memberSummary?.active ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Không HĐ:</span> <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{memberSummary?.inactive ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Khách mới:</span> <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">+{memberSummary?.newThisMonth ?? 0}</span></div>
          </div>
        </Card>

        <Card className="gsap-stat-card p-6 border-t-4 border-t-amber-500 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Trạng thái Thiết bị</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-slate-500">Sẵn sàng:</span> <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{equipmentStatus?.available ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Bảo trì:</span> <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{equipmentStatus?.maintenance ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Hỏng:</span> <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{equipmentStatus?.broken ?? 0}</span></div>
          </div>
        </Card>

        <Card className="gsap-stat-card p-6 border-t-4 border-t-teal-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Sử dụng FitLife AI</h3>
            <Bot className="w-5 h-5 text-teal-500" />
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-slate-500">Tổng yêu cầu:</span> <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{aiSummary?.totalUsage ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Thành công:</span> <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{aiSummary?.successfulGenerations ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Thất bại:</span> <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{aiSummary?.failedGenerations ?? 0}</span></div>
          </div>
        </Card>

        <Card className="gsap-stat-card p-6 border-t-4 border-t-cyan-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Vận hành & Bảo trì</h3>
            <Settings className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-slate-500">Tổng số yêu cầu:</span> <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{maintenanceSummary?.totalRequests ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Đang xử lý:</span> <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{maintenanceSummary?.inProgress ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">Hoàn tất:</span> <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{maintenanceSummary?.completed ?? 0}</span></div>
          </div>
        </Card>
      </div>

      {/* Grid: Additional Reports (Checkin Trends, Peak Hours, Plans) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        <Card className="gsap-stat-card p-6 lg:col-span-2 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Xu hướng Check-in</h3>
          <div className="h-72">
            {checkinTrend && checkinTrend.length > 0 ? (
              <D3AreaChart 
                data={checkinTrend.map(d => ({ label: d.date, value: d.count }))} 
                color="#3b82f6" 
              />
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Activity className="w-10 h-10 mb-2 text-slate-300" />
                <p className="font-medium">Chưa có dữ liệu check-in</p>
              </div>
            )}
          </div>
        </Card>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <Card className="gsap-stat-card p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Giờ cao điểm</h3>
            <div className="space-y-4">
              {peakHours.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-14 text-sm font-semibold text-slate-600">{h.hour}</div>
                  <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (h.count / (Math.max(...peakHours.map(p => p.count)) || 1)) * 100)}%` }} 
                    />
                  </div>
                  <div className="w-8 text-right text-xs font-bold text-indigo-600">{h.count}</div>
                </div>
              ))}
              {peakHours.length === 0 && (
                <p className="text-sm text-slate-500 italic">Chưa có dữ liệu.</p>
              )}
            </div>
          </Card>
          
          <Card className="gsap-stat-card p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Thống kê Gói tập</h3>
            <div className="space-y-3">
              {plansSummary.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{p.planName}</span>
                  </div>
                  <Badge variant="success" className="font-bold">{p.totalSubscribers}</Badge>
                </div>
              ))}
              {plansSummary.length === 0 && (
                <p className="text-sm text-slate-500 italic">Chưa có dữ liệu.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
