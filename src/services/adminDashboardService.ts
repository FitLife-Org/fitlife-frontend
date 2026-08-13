import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { 
  DashboardFilterRequest,
  DashboardOverviewResponse,
  ChartDataDto,
  RecentActivityDto
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
  }
};
