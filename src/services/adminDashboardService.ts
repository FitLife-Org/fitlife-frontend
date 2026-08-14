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
  MaintenanceSummaryDto
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
    const res = await apiClient.get<ApiResponse<EquipmentStatusStatsDto>>("/admin/reports/equipment/status", { params });
    return res.data.data;
  },

  async getAiSummary(params?: DashboardFilterRequest): Promise<AiSummaryDto> {
    const res = await apiClient.get<ApiResponse<AiSummaryDto>>("/admin/reports/ai/summary", { params });
    return res.data.data;
  },

  async getMaintenanceSummary(params?: DashboardFilterRequest): Promise<MaintenanceSummaryDto> {
    const res = await apiClient.get<ApiResponse<MaintenanceSummaryDto>>("/admin/reports/maintenance/summary", { params });
    return res.data.data;
  }
};