import apiClient from "./apiClient";

import type { SpringPage, ApiResponse } from "../types/common.type";
import type {
    NutritionPlan,
    NutritionPlanRequest,
} from "../types/nutrition.type";

const BASE_URL = "/nutrition-plans";
const TRAINER_BASE_URL = "/trainer/members";

function validatePositiveId(
    value: number,
    fieldName: string,
): void {
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`${fieldName} không hợp lệ.`);
    }
}

function normalizePlan(plan: NutritionPlan): NutritionPlan {
    return {
        ...plan,
        meals: plan.meals ?? [],
    };
}

export const nutritionService = {
    async getMyPlans(
        page = 0,
        size = 10,
    ): Promise<SpringPage<NutritionPlan>> {
        const response = await apiClient.get<
            ApiResponse<SpringPage<NutritionPlan>>
        >(`${BASE_URL}/me`, {
            params: {
                page,
                size,
                sort: "createdAt,desc",
            },
        });

        const data = response.data.data;

        return {
            ...data,
            content:
                data.content?.map(normalizePlan) ?? [],
        };
    },

    async getPlanById(planId: number): Promise<NutritionPlan> {
        validatePositiveId(planId, "Nutrition Plan ID");

        const response = await apiClient.get<ApiResponse<NutritionPlan>>(
            `${BASE_URL}/${planId}`,
        );

        return normalizePlan(response.data.data);
    },

    async getActivePlan(): Promise<NutritionPlan> {
        const response = await apiClient.get<ApiResponse<NutritionPlan>>(
            `${BASE_URL}/me/active`,
        );

        return normalizePlan(response.data.data);
    },

    async getTodayPlan(): Promise<NutritionPlan> {
        const response = await apiClient.get<ApiResponse<NutritionPlan>>(
            `${BASE_URL}/me/today`,
        );

        return normalizePlan(response.data.data);
    },

    async createPlan(
        request: NutritionPlanRequest,
    ): Promise<NutritionPlan> {
        const response = await apiClient.post<ApiResponse<NutritionPlan>>(
            BASE_URL,
            request,
        );

        return normalizePlan(response.data.data);
    },

    async updatePlan(
        planId: number,
        request: NutritionPlanRequest,
    ): Promise<NutritionPlan> {
        validatePositiveId(planId, "Nutrition Plan ID");

        const response = await apiClient.put<ApiResponse<NutritionPlan>>(
            `${BASE_URL}/${planId}`,
            request,
        );

        return normalizePlan(response.data.data);
    },

    async activatePlan(planId: number): Promise<void> {
        validatePositiveId(planId, "Nutrition Plan ID");

        await apiClient.post(
            `${BASE_URL}/${planId}/activate`,
        );
    },

    async archivePlan(planId: number): Promise<void> {
        validatePositiveId(planId, "Nutrition Plan ID");

        await apiClient.post(
            `${BASE_URL}/${planId}/archive`,
        );
    },

    async completePlan(planId: number): Promise<void> {
        validatePositiveId(planId, "Nutrition Plan ID");

        await apiClient.post(
            `${BASE_URL}/${planId}/complete`,
        );
    },

    async clonePlan(planId: number): Promise<NutritionPlan> {
        validatePositiveId(planId, "Nutrition Plan ID");

        const response = await apiClient.post<ApiResponse<NutritionPlan>>(
            `${BASE_URL}/${planId}/clone`,
        );

        return normalizePlan(response.data.data);
    },

    async deletePlan(planId: number): Promise<void> {
        validatePositiveId(planId, "Nutrition Plan ID");

        await apiClient.delete(
            `${BASE_URL}/${planId}`,
        );
    },

    // ==========================================
    // TRAINER ENDPOINTS
    // ==========================================

    async getTrainerPlans(
        memberId: number,
        page = 0,
        size = 10,
    ): Promise<SpringPage<NutritionPlan>> {
        validatePositiveId(memberId, "Member ID");

        const response = await apiClient.get<
            ApiResponse<SpringPage<NutritionPlan>>
        >(`${TRAINER_BASE_URL}/${memberId}/nutrition-plans`, {
            params: {
                page,
                size,
                sort: "createdAt,desc",
            },
        });

        const data = response.data.data;
        return {
            ...data,
            content: data.content?.map(normalizePlan) ?? [],
        };
    },

    async createTrainerPlan(
        memberId: number,
        request: NutritionPlanRequest,
    ): Promise<NutritionPlan> {
        validatePositiveId(memberId, "Member ID");

        const response = await apiClient.post<ApiResponse<NutritionPlan>>(
            `${TRAINER_BASE_URL}/${memberId}/nutrition-plans`,
            request,
        );

        return normalizePlan(response.data.data);
    },

    async updateTrainerPlan(
        planId: number,
        memberId: number,
        request: NutritionPlanRequest,
    ): Promise<NutritionPlan> {
        validatePositiveId(planId, "Nutrition Plan ID");
        validatePositiveId(memberId, "Member ID");

        const response = await apiClient.patch<ApiResponse<NutritionPlan>>(
            `${TRAINER_BASE_URL}/${memberId}/nutrition-plans/${planId}`,
            request,
        );

        return normalizePlan(response.data.data);
    },
};
