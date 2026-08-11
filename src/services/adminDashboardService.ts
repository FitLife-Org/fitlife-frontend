import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { 
  DashboardFilterRequest,
  DashboardOverviewResponse,
  DashboardRevenueResponse,
  DashboardMemberResponse,
  DashboardCheckinResponse,
  DashboardPackageResponse,
  DashboardRecentActivityResponse,
  ChartDataDto,
  RecentActivityDto
} from "../types/dashboard.type";

export const adminDashboardService = {
  // Legacy / Mock Endpoints (Used by AdminDashboardPage.tsx)
  async getOverview(params?: DashboardFilterRequest): Promise<DashboardOverviewResponse> {
    const res = await apiClient.get<ApiResponse<DashboardOverviewResponse>>("/admin/reports/dashboard", { params });
    return res.data.data;
  },

  async getRevenueStats(params?: DashboardFilterRequest): Promise<DashboardRevenueResponse> {
    const res = await apiClient.get<ApiResponse<DashboardRevenueResponse>>("/admin/reports/revenue/trend", { params });
    return res.data.data;
  },

  async getMemberStats(params?: DashboardFilterRequest): Promise<DashboardMemberResponse> {
    const res = await apiClient.get<ApiResponse<DashboardMemberResponse>>("/admin/reports/members/summary", { params });
    return res.data.data;
  },

  async getCheckinStats(params?: DashboardFilterRequest): Promise<DashboardCheckinResponse> {
    const res = await apiClient.get<ApiResponse<DashboardCheckinResponse>>("/admin/reports/checkins/trend", { params });
    return res.data.data;
  },

  async getPackageStats(params?: DashboardFilterRequest): Promise<DashboardPackageResponse> {
    const res = await apiClient.get<ApiResponse<DashboardPackageResponse>>("/admin/reports/subscriptions/summary", { params });
    return res.data.data;
  },

  async getRecentActivities(params?: DashboardFilterRequest): Promise<DashboardRecentActivityResponse> {
    const res = await apiClient.get<ApiResponse<DashboardRecentActivityResponse>>("/admin/reports/recent-activities", { params });
    return res.data.data;
  },

  // Real Backend Endpoints (Used by ReportPage.tsx)
  async getRealOverview(): Promise<DashboardOverviewResponse> {
    const res = await apiClient.get<ApiResponse<DashboardOverviewResponse>>("/admin/dashboard/summary");
    return res.data.data;
  },

  async getRealRevenueStats(): Promise<ChartDataDto[]> {
    const res = await apiClient.get<ApiResponse<Array<{ month: string; revenue: number }>>>("/admin/dashboard/revenue-summary");
    return res.data.data.map(item => ({
      label: item.month,
      value: item.revenue
    }));
  },

  async getRealCheckinsToday(): Promise<RecentActivityDto[]> {
    const res = await apiClient.get<ApiResponse<RecentActivityDto[]>>("/admin/dashboard/checkins-today");
    return res.data.data;
  },

  async getRealExpiringSubscriptions(): Promise<RecentActivityDto[]> {
    const res = await apiClient.get<ApiResponse<RecentActivityDto[]>>("/admin/dashboard/expiring-subscriptions");
    return res.data.data;
  }
};
