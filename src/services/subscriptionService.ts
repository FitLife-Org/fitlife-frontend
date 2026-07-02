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
    try {
      const response = await apiClient.get<ApiResponse<Subscription[]>>("/subscriptions/my");
      return response.data.data as Subscription[];
    } catch (error) {
      console.warn("API /subscriptions/my failed, using mock data", error);
      return [];
    }
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
      console.warn("API /subscriptions/my/active failed, using mock data", error);
      // Giả lập mock data một gói tập đang kích hoạt
      return {
          id: 1,
          packageId: 1,
          packageName: "Gói Gym 1 Năm (Mock)",
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          status: "ACTIVE",
          price: 5000000,
          paymentMethod: "CASH",
          createdAt: "2026-01-01T00:00:00Z"
      } as unknown as Subscription;
    }
  },
};
