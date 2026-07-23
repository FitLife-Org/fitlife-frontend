import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { DashboardStatsResponse } from "../types/dashboard.type";

export const adminDashboardService = {
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    try {
      const [summaryRes, revenueRes, checkinsRes, expiringRes] = await Promise.all([
        apiClient.get<ApiResponse<unknown>>("/admin/dashboard/summary"),
        apiClient.get<ApiResponse<unknown>>("/admin/dashboard/revenue-summary"),
        apiClient.get<ApiResponse<unknown>>("/admin/dashboard/checkins-today"),
        apiClient.get<ApiResponse<unknown>>("/admin/dashboard/expiring-subscriptions")
      ]);

      return {
        overview: (summaryRes.data.data as unknown as DashboardStatsResponse["overview"]) || {
          totalMembers: 0,
          membersGrowthPct: 0,
          todayCheckins: 0,
          checkinsGrowthPct: 0,
          monthlyRevenue: 0,
          revenueGrowthPct: 0,
          expiringPackages: 0,
        },
        revenueChart: (revenueRes.data.data as unknown as DashboardStatsResponse["revenueChart"]) || [],
        packageRatio: [],
        recentMembers: [], 
        todaySchedule: (checkinsRes.data.data as unknown as DashboardStatsResponse["todaySchedule"]) || [],
        recentPayments: (expiringRes.data.data as unknown as DashboardStatsResponse["recentPayments"]) || []
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
