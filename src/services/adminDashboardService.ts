import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { DashboardStatsResponse } from "../types/dashboard.type";

const MOCK_DASHBOARD_DATA: DashboardStatsResponse = {
  overview: {
    totalMembers: 2456,
    membersGrowthPct: 8.2,
    todayCheckins: 348,
    checkinsGrowthPct: 12.4,
    monthlyRevenue: 1250000000,
    revenueGrowthPct: 15.6,
    expiringPackages: 86,
  },
  revenueChart: [
    { month: "Tháng 1", revenue: 850000000 },
    { month: "Tháng 2", revenue: 920000000 },
    { month: "Tháng 3", revenue: 1150000000 },
    { month: "Tháng 4", revenue: 1050000000 },
    { month: "Tháng 5", revenue: 1100000000 },
    { month: "Tháng 6", revenue: 1250000000 },
  ],
  packageRatio: [
    { name: "1 Tháng", value: 34, color: "#10b981" },
    { name: "3 Tháng", value: 28, color: "#3b82f6" },
    { name: "6 Tháng", value: 23, color: "#8b5cf6" },
    { name: "12 Tháng", value: 15, color: "#f97316" },
  ],
  recentMembers: [
    { id: 1, description: "Nguyễn Minh Anh", time: "10 phút trước", status: "NEW" },
    { id: 2, description: "Trần Quang Huy", time: "35 phút trước", status: "OK" },
    { id: 3, description: "Lê Thị Thu Trang", time: "1 giờ trước", status: "OK" },
    { id: 4, description: "Phạm Hoàng Nam", time: "2 giờ trước", status: "OK" },
  ],
  todaySchedule: [
    { id: 1, description: "09:00 - Nguyễn Minh Anh", time: "Nguyễn Tuấn Khoa", status: "PENDING" },
    { id: 2, description: "10:00 - Trần Quang Huy", time: "Lê Minh Tuấn", status: "OK" },
    { id: 3, description: "14:00 - Lê Thị Thu Trang", time: "Trần Anh Đức", status: "NEW" },
  ],
  recentPayments: [
    { id: 1, description: "GD250601-0012", time: "15:30 - Gói 3 Tháng", status: "OK" },
    { id: 2, description: "GD250601-0011", time: "14:15 - Gói 6 Tháng", status: "OK" },
    { id: 3, description: "GD250531-0056", time: "Hôm qua - Gói 1 Tháng", status: "OK" },
  ],
};

export const adminDashboardService = {
  getStats: async (): Promise<DashboardStatsResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<DashboardStatsResponse>>("/admin/dashboard/stats");
      return response.data.data;
    } catch (error) {
      console.warn("API /admin/dashboard/stats failed, using mock data", error);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_DASHBOARD_DATA;
    }
  },
};
