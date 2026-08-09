export interface DashboardOverview {
  totalMembers: number;
  membersGrowthPct: number;
  todayCheckins: number;
  checkinsGrowthPct: number;
  monthlyRevenue: number;
  revenueGrowthPct: number;
  expiringPackages: number;
}

export interface ChartDataDto {
  label: string;
  value: number;
}

export interface RecentActivityDto {
  id: string | number;
  description: string;
  time: string;
  status?: "NEW" | "OK" | "PENDING" | "WARNING";
}

// 2.1 Overview
export type DashboardOverviewResponse = DashboardOverview;

// 2.2 Revenue
export interface DashboardRevenueResponse {
  trendChart: ChartDataDto[];
  structurePieChart: ChartDataDto[];
}

// 2.3 Members
export interface DashboardMemberResponse {
  growthChart: ChartDataDto[];
  statusPieChart: ChartDataDto[];
}

// 2.4 Checkins
export interface DashboardCheckinResponse {
  trafficChart: ChartDataDto[];
  locationPieChart: ChartDataDto[];
}

// 2.5 Packages
export interface DashboardPackageResponse {
  packageRatioChart: ChartDataDto[];
}

// 2.6 Recent Activities
export interface DashboardRecentActivityResponse {
  recentMembers: RecentActivityDto[];
  todaySchedules: RecentActivityDto[];
  recentPayments: RecentActivityDto[];
}

export interface DashboardFilterRequest {
  startDate?: string;
  endDate?: string;
  groupBy?: "DAY" | "MONTH" | "YEAR";
}
