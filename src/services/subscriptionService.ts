import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { Subscription, PreviewPriceRequest, PreviewPriceResponse, CreateSubscriptionRequest } from "../types/subscription.type";

export const subscriptionService = {
  async previewPrice(data: PreviewPriceRequest): Promise<PreviewPriceResponse> {
    const response = await apiClient.post<ApiResponse<PreviewPriceResponse>>("/subscriptions/preview-price", data);
    return response.data.data as PreviewPriceResponse;
  },

  async createSubscription(data: CreateSubscriptionRequest): Promise<Subscription> {
    const response = await apiClient.post<ApiResponse<Subscription>>("/subscriptions", data);
    return response.data.data as Subscription;
  },

  async getMySubscriptions(): Promise<Subscription[]> {
    const response = await apiClient.get<ApiResponse<Subscription[]>>("/subscriptions/my");
    return response.data.data as Subscription[];
  },

  async getSubscriptionById(id: number): Promise<Subscription> {
    const response = await apiClient.get<ApiResponse<Subscription>>(`/subscriptions/${id}`);
    return response.data.data as Subscription;
  },

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
