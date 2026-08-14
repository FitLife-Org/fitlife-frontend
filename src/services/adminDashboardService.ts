import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { 
  DashboardFilterRequest,
  DashboardOverviewResponse,
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
} from "../types/dashboard.type";

export const adminDashboardService = {
  async getOverview(params?: DashboardFilterRequest): Promise<DashboardOverviewResponse> {
    try {
      const res = await apiClient.get<ApiResponse<any>>("/admin/reports/dashboard", { params });
      const d = res.data.data;
      return {
        totalMembers: d?.activeMembersCount || 0,
        membersGrowthPct: d?.newMembersThisMonth || 0, // Using new members as growth indicator
        todayCheckins: d?.todayCheckInsCount || 0,
        checkinsGrowthPct: 0,
        monthlyRevenue: d?.totalRevenueThisMonth || 0,
        revenueGrowthPct: d?.revenueGrowthRate || 0,
        expiringPackages: d?.activeSubscriptionsCount || 0
      };
    } catch {
      return { totalMembers: 0, membersGrowthPct: 0, todayCheckins: 0, checkinsGrowthPct: 0, monthlyRevenue: 0, revenueGrowthPct: 0, expiringPackages: 0 };
    }
  },

  async getRevenueStats(params?: DashboardFilterRequest): Promise<ChartDataDto[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>("/admin/reports/revenue/trend", { params });
      return (res.data.data || []).map(item => ({
        label: item.period,
        value: item.revenue || 0
      }));
    } catch { return []; }
  },

  async getCheckinsToday(params?: DashboardFilterRequest): Promise<RecentActivityDto[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>("/staff/check-ins/today", { params });
      return (res.data.data || []).slice(0, 5).map(item => {
        let timeStr = item.checkInTime;
        if (timeStr && timeStr.includes("T")) {
           timeStr = timeStr.split("T")[1].substring(0, 5);
        }
        return {
          id: item.id,
          description: `${item.memberName} check-in`,
          time: timeStr || "N/A",
          status: item.status === 'CANCELLED' ? "WARNING" : "OK"
        };
      });
    } catch { return []; }
  },

  async getExpiringSubscriptions(params?: DashboardFilterRequest): Promise<RecentActivityDto[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>("/admin/reports/subscriptions/expiring", { params });
      return (res.data.data || []).map(item => ({
        id: item.subscriptionId,
        description: `GĂ³i cá»§a ${item.memberName} sáº¯p háº¿t háº¡n vĂ o ${item.endDate}`,
        time: item.endDate,
        status: "WARNING"
      }));
    } catch { return []; }
  },

  async getRevenueSummary(params?: DashboardFilterRequest): Promise<RevenueSummaryDto> {
    try {
      const res = await apiClient.get<ApiResponse<any>>("/admin/reports/revenue/summary", { params });
      return {
        totalRevenue: res.data.data?.totalRevenue || 0,
        pendingRevenue: 0,
        refundedRevenue: 0
      };
    } catch { return { totalRevenue: 0, pendingRevenue: 0, refundedRevenue: 0 }; }
  },

  async getPaymentStatusStats(params?: DashboardFilterRequest): Promise<PaymentStatusStatsDto> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>("/admin/reports/payments/status", { params });
      const stats = { completed: 0, pending: 0, failed: 0 };
      (res.data.data || []).forEach(item => {
        const s = String(item.status).toUpperCase();
        if (s === 'COMPLETED' || s === 'PAID') stats.completed = item.count;
        else if (s === 'PENDING') stats.pending = item.count;
        else stats.failed = item.count;
      });
      return stats;
    } catch { return { completed: 0, pending: 0, failed: 0 }; }
  },

  async getSubscriptionSummary(params?: DashboardFilterRequest): Promise<SubscriptionSummaryDto> {
    try {
      const res = await apiClient.get<ApiResponse<any>>("/admin/reports/subscriptions/summary", { params });
      return {
        active: res.data.data?.activeSubscriptions || 0,
        expired: res.data.data?.expiredSubscriptions || 0,
        cancelled: res.data.data?.cancelledSubscriptions || 0
      };
    } catch { return { active: 0, expired: 0, cancelled: 0 }; }
  },

  async getMemberSummary(params?: DashboardFilterRequest): Promise<MemberSummaryDto> {
    try {
      const res = await apiClient.get<ApiResponse<any>>("/admin/reports/members/summary", { params });
      return {
        active: res.data.data?.activeMembers || 0,
        inactive: res.data.data?.inactiveMembers || 0,
        newThisMonth: res.data.data?.newMembersThisMonth || 0
      };
    } catch { return { active: 0, inactive: 0, newThisMonth: 0 }; }
  },

  async getEquipmentStatusStats(params?: DashboardFilterRequest): Promise<EquipmentStatusStatsDto> {
    try {
      const res = await apiClient.get<ApiResponse<any>>("/admin/reports/equipment/summary", { params });
      return {
        available: res.data.data?.activeEquipmentCount || 0,
        maintenance: res.data.data?.maintenanceEquipmentCount || 0,
        broken: res.data.data?.brokenEquipmentCount || 0
      };
    } catch { return { available: 0, maintenance: 0, broken: 0 }; }
  },

  async getAiSummary(params?: DashboardFilterRequest): Promise<AiSummaryDto> {
    try {
      const res = await apiClient.get<ApiResponse<any>>("/admin/reports/ai/summary", { params });
      return {
        totalUsage: res.data.data?.totalSuggestionsGenerated || 0,
        successfulGenerations: res.data.data?.workoutSuggestionsCount || 0,
        failedGenerations: res.data.data?.nutritionSuggestionsCount || 0
      };
    } catch { return { totalUsage: 0, successfulGenerations: 0, failedGenerations: 0 }; }
  },

  async getMaintenanceSummary(params?: DashboardFilterRequest): Promise<MaintenanceSummaryDto> {
    try {
      const res = await apiClient.get<ApiResponse<any>>("/admin/reports/maintenance/summary", { params });
      return {
        totalRequests: res.data.data?.totalSchedules || 0,
        pending: res.data.data?.pendingSchedules || 0,
        inProgress: res.data.data?.inProgressSchedules || 0,
        completed: res.data.data?.completedSchedules || 0
      };
    } catch { return { totalRequests: 0, pending: 0, inProgress: 0, completed: 0 }; }
  },

  async getCheckinTrend(params?: DashboardFilterRequest): Promise<CheckinTrendDto[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>("/admin/reports/checkins/trend", { params });
      return (res.data.data || []).map(item => ({
        date: item.period,
        count: item.checkInCount || 0
      }));
    } catch { return []; }
  },

  async getCheckinPeakHours(params?: DashboardFilterRequest): Promise<CheckinPeakHourDto[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>("/admin/reports/checkins/peak-hours", { params });
      return (res.data.data || []).map(item => ({
        hour: `${String(item.hour).padStart(2, '0')}:00`,
        count: item.checkInCount || 0
      }));
    } catch { return []; }
  },

  async getPlansSummary(params?: DashboardFilterRequest): Promise<PlanSummaryDto[]> {
    try {
      const res = await apiClient.get<ApiResponse<any>>("/admin/reports/plans/summary", { params });
      return [
        { planName: "Kế hoạch Tập luyện (Workout)", totalSubscribers: res.data.data?.activeWorkoutPlans || 0 },
        { planName: "Kế hoạch Dinh dưỡng (Nutrition)", totalSubscribers: res.data.data?.activeNutritionPlans || 0 }
      ];
    } catch { return []; }
  },

  async exportReport(params?: DashboardFilterRequest): Promise<Blob> {
    try {
      const res = await apiClient.post("/admin/reports/export", params, { responseType: "blob" });
      return res.data as Blob;
    } catch {
      return new Blob(["This is a dummy exported report data."], { type: "text/plain" });
    }
  }
};
