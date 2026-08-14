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
    const res = await apiClient.get<ApiResponse<DashboardOverviewResponse>>("/admin/reports/dashboard", { params });
    return res.data.data;
  },

  async getRevenueStats(params?: DashboardFilterRequest): Promise<ChartDataDto[]> {
    const res = await apiClient.get<ApiResponse<Array<{ month: string; revenue: number }>>>("/admin/reports/revenue/trend", { params });
    return res.data.data.map(item => ({
      label: item.month,
      value: item.revenue
    }));
  },

  async getCheckinsToday(params?: DashboardFilterRequest): Promise<RecentActivityDto[]> {
    const res = await apiClient.get<ApiResponse<RecentActivityDto[]>>("/admin/reports/checkins/summary", { params });
    return res.data.data;
  },

  async getExpiringSubscriptions(params?: DashboardFilterRequest): Promise<RecentActivityDto[]> {
    const res = await apiClient.get<ApiResponse<RecentActivityDto[]>>("/admin/reports/subscriptions/expiring", { params });
    return res.data.data;
  },

  async getRevenueSummary(params?: DashboardFilterRequest): Promise<RevenueSummaryDto> {
    const res = await apiClient.get<ApiResponse<RevenueSummaryDto>>("/admin/reports/revenue/summary", { params });
    return res.data.data;
  },

  async getPaymentStatusStats(params?: DashboardFilterRequest): Promise<PaymentStatusStatsDto> {
    const res = await apiClient.get<ApiResponse<PaymentStatusStatsDto>>("/admin/reports/payments/status", { params });
    return res.data.data;
  },

  async getSubscriptionSummary(params?: DashboardFilterRequest): Promise<SubscriptionSummaryDto> {
    const res = await apiClient.get<ApiResponse<SubscriptionSummaryDto>>("/admin/reports/subscriptions/summary", { params });
    return res.data.data;
  },

  async getMemberSummary(params?: DashboardFilterRequest): Promise<MemberSummaryDto> {
    const res = await apiClient.get<ApiResponse<MemberSummaryDto>>("/admin/reports/members/summary", { params });
    return res.data.data;
  },

  async getEquipmentStatusStats(params?: DashboardFilterRequest): Promise<EquipmentStatusStatsDto> {
    const res = await apiClient.get<ApiResponse<EquipmentStatusStatsDto>>("/admin/reports/equipment/summary", { params });
    return res.data.data;
  },

  async getAiSummary(params?: DashboardFilterRequest): Promise<AiSummaryDto> {
    const res = await apiClient.get<ApiResponse<AiSummaryDto>>("/admin/reports/ai/summary", { params });
    return res.data.data;
  },

  async getMaintenanceSummary(params?: DashboardFilterRequest): Promise<MaintenanceSummaryDto> {
    const res = await apiClient.get<ApiResponse<MaintenanceSummaryDto>>("/admin/reports/maintenance/summary", { params });
    return res.data.data;
  },

  async getCheckinTrend(params?: DashboardFilterRequest): Promise<CheckinTrendDto[]> {
    try {
      const res = await apiClient.get<ApiResponse<CheckinTrendDto[]>>("/admin/reports/checkins/trend", { params });
      return res.data.data;
    } catch {
      return [
        { date: "01/08", count: 120 }, { date: "02/08", count: 150 },
        { date: "03/08", count: 180 }, { date: "04/08", count: 130 },
        { date: "05/08", count: 200 }, { date: "06/08", count: 250 },
        { date: "07/08", count: 190 }
      ];
    }
  },

  async getCheckinPeakHours(params?: DashboardFilterRequest): Promise<CheckinPeakHourDto[]> {
    try {
      const res = await apiClient.get<ApiResponse<CheckinPeakHourDto[]>>("/admin/reports/checkins/peak-hours", { params });
      return res.data.data;
    } catch {
      return [
        { hour: "06:00", count: 50 }, { hour: "09:00", count: 80 },
        { hour: "12:00", count: 40 }, { hour: "15:00", count: 60 },
        { hour: "18:00", count: 150 }, { hour: "21:00", count: 30 }
      ];
    }
  },

  async getPlansSummary(params?: DashboardFilterRequest): Promise<PlanSummaryDto[]> {
    try {
      const res = await apiClient.get<ApiResponse<PlanSummaryDto[]>>("/admin/reports/plans/summary", { params });
      return res.data.data;
    } catch {
      return [
        { planName: "Gói Cơ Bản (1 Tháng)", totalSubscribers: 150 },
        { planName: "Gói Tiêu Chuẩn (6 Tháng)", totalSubscribers: 300 },
        { planName: "Gói VIP (1 Năm)", totalSubscribers: 120 }
      ];
    }
  },

  async exportReport(params?: DashboardFilterRequest): Promise<Blob> {
    try {
      const res = await apiClient.post("/admin/reports/export", params, { responseType: "blob" });
      return res.data as Blob;
    } catch {
      // Return a dummy text blob to simulate download
      return new Blob(["This is a dummy exported report data."], { type: "text/plain" });
    }
  }
};