import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { Subscription } from "../types/subscription.type";

export const subscriptionService = {
  async getMySubscription(): Promise<Subscription | null> {
    const response = await apiClient.get<ApiResponse<Subscription | null>>("/subscriptions/me");
    return response.data.data;
  },
};
