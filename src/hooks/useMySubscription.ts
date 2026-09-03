import { useState, useEffect } from "react";
import { subscriptionService } from "../services/subscriptionService";
import type { Subscription } from "../types/subscription.type";

export function useMySubscription() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getMySubscriptions();
      setSubscriptions(data || []);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = (endDate?: string | null) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

    const handleRenew = async (id: number) => {
    try {
      setLoading(true);
      const newSub = await subscriptionService.renewSubscription(id);
      await fetchSubscriptions();
      return newSub;
    } catch (error) {
      console.error("Failed to renew subscription:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const activeSubscription = subscriptions.find((s) => s.status === "ACTIVE");

  return {
    subscriptions,
    loading,
    activeSubscription,
    calculateDaysLeft,
    handleRenew,
    refreshSubscription: fetchSubscriptions,
  };
}
