export interface DashboardOverview {
  totalMembers: number;
  membersGrowthPct: number;
  todayCheckins: number;
  checkinsGrowthPct: number;
  monthlyRevenue: number;
  revenueGrowthPct: number;
  expiringPackages: number;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
}

export interface PackageRatioDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface RecentActivity {
  id: string | number;
  description: string;
  time: string;
  status?: "NEW" | "OK" | "PENDING";
}

export interface DashboardStatsResponse {
  overview: DashboardOverview;
  revenueChart: RevenueDataPoint[];
  packageRatio: PackageRatioDataPoint[];
  recentMembers: RecentActivity[];
  todaySchedule: RecentActivity[];
  recentPayments: RecentActivity[];
}
