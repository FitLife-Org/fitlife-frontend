import apiClient from "./apiClient";
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
    async renewSubscription(id: number): Promise<Subscription> {
        const response = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/renew`);
        return response.data.data;
    },

    async upgradeSubscription(id: number, newPackageDurationId: number): Promise<Subscription> {
        const response = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/upgrade`, { newPackageDurationId });
        return response.data.data;
    },
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
            >("/subscriptions/me");

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
                "/subscriptions/me/active"
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
  async getAdminSubscriptions(params?: { page?: number; size?: number; status?: string; memberId?: number; gymPackageId?: number; }): Promise<PageResponse<Subscription>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Subscription> | Subscription[]>>('/admin/subscriptions', { params });
    const data = response.data.data;

    if (Array.isArray(data)) {
      return {
        content: data,
        page: 0,
        size: data.length,
        totalElements: data.length,
        totalPages: data.length > 0 ? 1 : 0,
        first: true,
        last: true,
        empty: data.length === 0,
      };
    }

    return data;
  },

  async getAdminSubscriptionById(id: number): Promise<Subscription> {
    const response = await apiClient.get<ApiResponse<Subscription>>(`/admin/subscriptions/${id}`);
    return response.data.data;
  },

  async expireSubscription(id: number): Promise<Subscription> {
    const response = await apiClient.patch<ApiResponse<Subscription>>(`/admin/subscriptions/${id}/expire`);
    return response.data.data;
  },

  async cancelSubscriptionAdmin(id: number): Promise<Subscription> {
    const response = await apiClient.patch<ApiResponse<Subscription>>(`/admin/subscriptions/${id}/cancel`);
    return response.data.data;
  },

  async adminTransferSubscription(id: number, targetMemberId: number): Promise<Subscription> {
    // MOCK: Giả lập gọi API chuyển nhượng vì backend chưa có endpoint này
    console.log(`[MOCK] Transferring subscription ${id} to member ${targetMemberId}`);
    return new Promise((resolve) => setTimeout(() => resolve({ id } as Subscription), 1000));
  },

  async adminUpgradeSubscription(id: number, data: { gymPackageId: number; packageDurationId: number }): Promise<Subscription> {
    // MOCK: Giả lập gọi API nâng cấp
    console.log(`[MOCK] Upgrading subscription ${id} with data`, data);
    return new Promise((resolve) => setTimeout(() => resolve({ id } as Subscription), 1000));
  },

    async createSubscriptionForMemberByStaff(
        memberId: number,
        data: CreateSubscriptionRequest
    ): Promise<Subscription> {
        const response = await apiClient.post<ApiResponse<Subscription>>(
            `/staff/members/${memberId}/subscriptions`,
            data
        );

        return response.data.data;
    }
};
