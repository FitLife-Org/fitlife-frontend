import apiClient from "./apiClient";
import type { SpringPage } from "../types/common.type";
import type { NutritionPlan } from "../types/nutrition.type";

const BASE_URL = "/admin/nutrition-plans";

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

export const adminNutritionService = {
    async getAllNutritionPlans(
        page = 0,
        size = 10,
    ): Promise<SpringPage<NutritionPlan>> {
        const response = await apiClient.get<
            SpringPage<NutritionPlan>
        >(BASE_URL, {
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

    async getNutritionPlanById(planId: number): Promise<NutritionPlan> {
        validatePositiveId(planId, "Nutrition Plan ID");

        const response = await apiClient.get<NutritionPlan>(
            `${BASE_URL}/${planId}`,
        );

        return normalizePlan(response.data);
    }
};
