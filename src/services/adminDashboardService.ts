import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { 
  DashboardFilterRequest,
  DashboardOverviewResponse,
  DashboardRevenueResponse,
  DashboardMemberResponse,
  DashboardCheckinResponse,
  DashboardPackageResponse,
  DashboardRecentActivityResponse
} from "../types/dashboard.type";

/**
 * Mock Service cho Admin Dashboard
 * TODO: Thay thế bằng API thực tế khi Backend code xong
 */
export const adminDashboardService = {
  async getOverview(params?: DashboardFilterRequest): Promise<DashboardOverviewResponse> {
    const res = await apiClient.get<ApiResponse<DashboardOverviewResponse>>("/admin/reports/dashboard", { params });
    return res.data.data;
  },

  // 2. Revenue Stats
  async getRevenueStats(params?: DashboardFilterRequest): Promise<DashboardRevenueResponse> {
    const res = await apiClient.get<ApiResponse<DashboardRevenueResponse>>("/admin/reports/revenue/trend", { params });
    return res.data.data;
  },

  // 3. Member Stats
  async getMemberStats(params?: DashboardFilterRequest): Promise<DashboardMemberResponse> {
    const res = await apiClient.get<ApiResponse<DashboardMemberResponse>>("/admin/reports/members/summary", { params });
    return res.data.data;
  },

  // 4. Checkin Stats
  async getCheckinStats(params?: DashboardFilterRequest): Promise<DashboardCheckinResponse> {
    const res = await apiClient.get<ApiResponse<DashboardCheckinResponse>>("/admin/reports/checkins/trend", { params });
    return res.data.data;
  },

  // 5. Package Stats
  async getPackageStats(params?: DashboardFilterRequest): Promise<DashboardPackageResponse> {
    const res = await apiClient.get<ApiResponse<DashboardPackageResponse>>("/admin/reports/subscriptions/summary", { params });
    return res.data.data;
  },

  // 6. Recent Activities
  async getRecentActivities(params?: DashboardFilterRequest): Promise<DashboardRecentActivityResponse> {
    const res = await apiClient.get<ApiResponse<DashboardRecentActivityResponse>>("/admin/reports/recent-activities", { params });
    return res.data.data;
  }
};
