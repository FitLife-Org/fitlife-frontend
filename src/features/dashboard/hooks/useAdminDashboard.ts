import { useState, useEffect } from "react";
import { adminDashboardService } from "../services/adminDashboardService";
import type { DashboardStatsResponse } from "../types/dashboard.type";

export function useAdminDashboard() {
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stats = await adminDashboardService.getDashboardStats();
        setData(stats);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return {
    data,
    loading
  };
}
