import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { subscriptionService } from "../services/subscriptionService";
import { memberService } from "../services/memberService";
import type { Subscription } from "../types/subscription.type";
import type { BodyMetric } from "../types/bodyMetric.type";

export function useMemberHome() {
  const { user } = useAuthStore();
  const [activeSub, setActiveSub] = useState<Subscription | null>(null);
  const [latestMetric, setLatestMetric] = useState<BodyMetric | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [sub, metrics] = await Promise.all([
          subscriptionService.getMySubscription().catch(() => null),
          memberService.getBodyMetrics().catch(() => []),
        ]);
        setActiveSub(sub);
        if (metrics && metrics.length > 0) {
          setLatestMetric(metrics[0]);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  return {
    user,
    activeSub,
    latestMetric,
    loading,
    calculateDaysLeft
  };
}
