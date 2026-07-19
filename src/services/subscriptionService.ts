import apiClient from "../lib/apiClient";
import type { ApiResponse, PageResponse } from "../types/common.type";
import type {
    Subscription,
    PreviewPriceRequest,
    PreviewPriceResponse,
    CreateSubscriptionRequest,
} from "../types/subscription.type";
import axios from "axios";

const extractPageContent = <T>(data: PageResponse<T> | T[]): T[] => {
    if (Array.isArray(data)) {
        return data;
    }

    return data.content ?? [];
};

export const subscriptionService = {
    async previewPrice(
        data: PreviewPriceRequest
    ): Promise<PreviewPriceResponse> {
        const response = await apiClient.post<ApiResponse<PreviewPriceResponse>>(
            "/subscriptions/preview-price",
            data
        );

        return response.data.data;
    },

    async createSubscription(
        data: CreateSubscriptionRequest
    ): Promise<Subscription> {
        const response = await apiClient.post<ApiResponse<Subscription>>(
            "/subscriptions",
            data
        );

        return response.data.data;
    },

    async getMySubscriptions(): Promise<Subscription[]> {
        try {
            const response = await apiClient.get<
                ApiResponse<PageResponse<Subscription> | Subscription[]>
            >("/subscriptions/my");

            return extractPageContent<Subscription>(response.data.data);
        } catch (error: unknown) {
            console.error("GET_MY_SUBSCRIPTIONS_ERROR:", error);
            return [];
        }
    },

    async getSubscriptionById(id: number): Promise<Subscription> {
        const response = await apiClient.get<ApiResponse<Subscription>>(
            `/subscriptions/${id}`
        );

        return response.data.data;
    },

    async getMySubscription(): Promise<Subscription | null> {
        try {
            const response = await apiClient.get<ApiResponse<Subscription | null>>(
                "/subscriptions/my/active"
            );

            return response.data.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }

            console.error("GET_MY_ACTIVE_SUBSCRIPTION_ERROR:", error);
            return null;
        }
    },
  async getAdminSubscriptions(params?: { page?: number; size?: number; status?: string; memberId?: number; gymPackageId?: number; }): Promise<Subscription[]> {
    const response = await apiClient.get<ApiResponse<PageResponse<Subscription> | Subscription[]>>('/admin/subscriptions', { params });
    return extractPageContent<Subscription>(response.data.data);
  },

  async getAdminSubscriptionById(id: number): Promise<Subscription> {
    const response = await apiClient.get<ApiResponse<Subscription>>(`/admin/subscriptions/${id}`);
    return response.data.data;
  },

  async expireSubscription(id: number, reason: string): Promise<Subscription> {
    const response = await apiClient.patch<ApiResponse<Subscription>>(`/admin/subscriptions/${id}/expire`, { reason });
    return response.data.data;
  },

  async cancelSubscriptionAdmin(id: number, reason: string): Promise<Subscription> {
    const response = await apiClient.patch<ApiResponse<Subscription>>(`/admin/subscriptions/${id}/cancel`, { reason });
    return response.data.data;
  }
};
