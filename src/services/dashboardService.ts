import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";

export interface DashboardSummary {
  totalMembers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  todayCheckins: number;
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>("/dashboard/summary");
    return response.data.data || {
      totalMembers: 0,
      activeSubscriptions: 0,
      monthlyRevenue: 0,
      todayCheckins: 0,
    };
  },
};
