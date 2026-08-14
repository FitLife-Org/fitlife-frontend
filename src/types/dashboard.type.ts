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

export interface RevenueSummaryDto {
  totalRevenue: number;
  pendingRevenue: number;
  refundedRevenue: number;
}

export interface PaymentStatusStatsDto {
  completed: number;
  pending: number;
  failed: number;
}

export interface SubscriptionSummaryDto {
  active: number;
  expired: number;
  cancelled: number;
}

export interface MemberSummaryDto {
  active: number;
  inactive: number;
  newThisMonth: number;
}

export interface EquipmentStatusStatsDto {
  available: number;
  maintenance: number;
  broken: number;
}

export interface AiSummaryDto {
  totalUsage: number;
  successfulGenerations: number;
  failedGenerations: number;
}

export interface MaintenanceSummaryDto {
  totalRequests: number;
  pending: number;
  inProgress: number;
  completed: number;
}
