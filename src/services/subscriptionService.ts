import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { Subscription } from "../types/subscription.type";

export const subscriptionService = {
  async getMySubscription(): Promise<Subscription | null> {
    try {
      const response = await apiClient.get<ApiResponse<Subscription | null>>("/subscriptions/my/active");
      return (response.data.data as Subscription) || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Return null if no active subscription exists
      }
      throw error;
    }
  },
};
