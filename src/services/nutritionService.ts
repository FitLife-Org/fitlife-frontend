import apiClient from "./apiClient";

import type { SpringPage } from "../types/common.type";
import type {
    NutritionPlan,
    NutritionPlanRequest,
} from "../types/nutrition.type";

const MY_NUTRITION_BASE_URL = "/nutrition-plans/me";

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
            SpringPage<NutritionPlan>
        >(MY_NUTRITION_BASE_URL, {
            params: {
                page,
                size,
                sort: "createdAt,desc",
            },
        });

        return {
            ...response.data,
            content:
                response.data.content?.map(normalizePlan) ?? [],
        };
    },

    async getPlanById(planId: number): Promise<NutritionPlan> {
        validatePositiveId(planId, "Nutrition Plan ID");

        const response = await apiClient.get<NutritionPlan>(
            `${MY_NUTRITION_BASE_URL}/${planId}`,
        );

        return normalizePlan(response.data);
    },

    async getActivePlan(): Promise<NutritionPlan> {
        const response = await apiClient.get<NutritionPlan>(
            `${MY_NUTRITION_BASE_URL}/active`,
        );

        return normalizePlan(response.data);
    },

    async getTodayPlan(): Promise<NutritionPlan> {
        const response = await apiClient.get<NutritionPlan>(
            `${MY_NUTRITION_BASE_URL}/today`,
        );

        return normalizePlan(response.data);
    },

    async createPlan(
        request: NutritionPlanRequest,
    ): Promise<NutritionPlan> {
        const response = await apiClient.post<NutritionPlan>(
            MY_NUTRITION_BASE_URL,
            request,
        );

        return normalizePlan(response.data);
    },

    async updatePlan(
        planId: number,
        request: NutritionPlanRequest,
    ): Promise<NutritionPlan> {
        validatePositiveId(planId, "Nutrition Plan ID");

        const response = await apiClient.put<NutritionPlan>(
            `${MY_NUTRITION_BASE_URL}/${planId}`,
            request,
        );

        return normalizePlan(response.data);
    },

    async activatePlan(planId: number): Promise<void> {
        validatePositiveId(planId, "Nutrition Plan ID");

        await apiClient.post(
            `${MY_NUTRITION_BASE_URL}/${planId}/activate`,
        );
    },

    async archivePlan(planId: number): Promise<void> {
        validatePositiveId(planId, "Nutrition Plan ID");

        await apiClient.post(
            `${MY_NUTRITION_BASE_URL}/${planId}/archive`,
        );
    },

    async completePlan(planId: number): Promise<void> {
        validatePositiveId(planId, "Nutrition Plan ID");

        await apiClient.post(
            `${MY_NUTRITION_BASE_URL}/${planId}/complete`,
        );
    },

    async clonePlan(planId: number): Promise<NutritionPlan> {
        validatePositiveId(planId, "Nutrition Plan ID");

        const response = await apiClient.post<NutritionPlan>(
            `${MY_NUTRITION_BASE_URL}/${planId}/clone`,
        );

        return normalizePlan(response.data);
    },

    async deletePlan(planId: number): Promise<void> {
        validatePositiveId(planId, "Nutrition Plan ID");

        await apiClient.delete(
            `${MY_NUTRITION_BASE_URL}/${planId}`,
        );
    },
};
