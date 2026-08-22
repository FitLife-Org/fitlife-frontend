import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { subscriptionService } from "../services/subscriptionService";
import type { Subscription } from "../types/subscription.type";

export function useMemberHome() {
  const { user } = useAuthStore();
  const [activeSub, setActiveSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const sub = await subscriptionService.getMySubscription();
        setActiveSub(sub);
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
    loading,
    calculateDaysLeft
  };
}
