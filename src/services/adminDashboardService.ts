import apiClient from "../lib/apiClient";
import type { ApiResponse } from "../types/common.type";
import type { DashboardStatsResponse } from "../types/dashboard.type";

export const adminDashboardService = {
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    try {
      const [summaryRes, revenueRes, checkinsRes, expiringRes] = await Promise.all([
        apiClient.get<ApiResponse<any>>("/admin/dashboard/summary"),
        apiClient.get<ApiResponse<any>>("/admin/dashboard/revenue-summary"),
        apiClient.get<ApiResponse<any>>("/admin/dashboard/checkins-today"),
        apiClient.get<ApiResponse<any>>("/admin/dashboard/expiring-subscriptions")
      ]);

      return {
        overview: summaryRes.data.data,
        revenueChart: revenueRes.data.data || [],
        packageRatio: [], // If backend provides this later, we can map it
        recentMembers: [], 
        todaySchedule: checkinsRes.data.data || [],
        recentPayments: expiringRes.data.data || []
      };
    } catch (e) {
      console.warn("Backend not fully implemented for dashboard stats, falling back to empty/mock data structure", e);
      return {
        overview: {
          totalMembers: 0,
          membersGrowthPct: 0,
          todayCheckins: 0,
          checkinsGrowthPct: 0,
          monthlyRevenue: 0,
          revenueGrowthPct: 0,
          expiringPackages: 0,
        },
        revenueChart: [],
        packageRatio: [],
        recentMembers: [],
        todaySchedule: [],
        recentPayments: []
      };
    }
  }
};
