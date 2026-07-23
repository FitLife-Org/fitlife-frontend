import apiClient from "./apiClient";

import type {
    SpringPage,
} from "../types/common.type";

import type {
    NutritionPlan,
    NutritionPlanRequest,
} from "../types/nutrition.type";

const NUTRITION_BASE_URL =
    "/nutrition-plans";

function validatePositiveId(
    value: number,
    fieldName: string,
): void {
    if (
        !Number.isInteger(value) ||
        value <= 0
    ) {
        throw new Error(
            `${fieldName} không hợp lệ.`,
        );
    }
}

export const nutritionService = {
    async getPlansByMember(
        memberId: number,
        page = 0,
        size = 10,
    ): Promise<SpringPage<NutritionPlan>> {
        validatePositiveId(
            memberId,
            "Member ID",
        );

        const response =
            await apiClient.get<
                SpringPage<NutritionPlan>
            >(NUTRITION_BASE_URL, {
                params: {
                    memberId,
                    page,
                    size,
                    sort: "createdAt,desc",
                },
            });

        return {
            ...response.data,
            content:
                response.data.content ?? [],
        };
    },

    async getPlanById(
        planId: number,
        memberId: number,
    ): Promise<NutritionPlan> {
        validatePositiveId(
            planId,
            "Nutrition Plan ID",
        );

        validatePositiveId(
            memberId,
            "Member ID",
        );

        const response =
            await apiClient.get<NutritionPlan>(
                `${NUTRITION_BASE_URL}/${planId}`,
                {
                    params: {
                        memberId,
                    },
                },
            );

        return {
            ...response.data,
            meals:
                response.data.meals ?? [],
        };
    },

    async getActivePlan(
        memberId: number,
    ): Promise<NutritionPlan> {
        validatePositiveId(
            memberId,
            "Member ID",
        );

        const response =
            await apiClient.get<NutritionPlan>(
                `${NUTRITION_BASE_URL}/me/active`,
                {
                    params: {
                        memberId,
                    },
                },
            );

        return {
            ...response.data,
            meals:
                response.data.meals ?? [],
        };
    },

    async getTodayPlan(
        memberId: number,
    ): Promise<NutritionPlan> {
        validatePositiveId(
            memberId,
            "Member ID",
        );

        const response =
            await apiClient.get<NutritionPlan>(
                `${NUTRITION_BASE_URL}/me/today`,
                {
                    params: {
                        memberId,
                    },
                },
            );

        return {
            ...response.data,
            meals:
                response.data.meals ?? [],
        };
    },

    async createPlan(
        memberId: number,
        request: NutritionPlanRequest,
    ): Promise<NutritionPlan> {
        validatePositiveId(
            memberId,
            "Member ID",
        );

        const response =
            await apiClient.post<NutritionPlan>(
                NUTRITION_BASE_URL,
                request,
                {
                    params: {
                        memberId,
                    },
                },
            );

        return {
            ...response.data,
            meals:
                response.data.meals ?? [],
        };
    },

    async updatePlan(
        planId: number,
        memberId: number,
        request: NutritionPlanRequest,
    ): Promise<NutritionPlan> {
        validatePositiveId(
            planId,
            "Nutrition Plan ID",
        );

        validatePositiveId(
            memberId,
            "Member ID",
        );

        const response =
            await apiClient.put<NutritionPlan>(
                `${NUTRITION_BASE_URL}/${planId}`,
                request,
                {
                    params: {
                        memberId,
                    },
                },
            );

        return {
            ...response.data,
            meals:
                response.data.meals ?? [],
        };
    },

    async activatePlan(
        planId: number,
        memberId: number,
    ): Promise<void> {
        validatePositiveId(
            planId,
            "Nutrition Plan ID",
        );

        validatePositiveId(
            memberId,
            "Member ID",
        );

        await apiClient.post(
            `${NUTRITION_BASE_URL}/${planId}/activate`,
            undefined,
            {
                params: {
                    memberId,
                },
            },
        );
    },

    async archivePlan(
        planId: number,
        memberId: number,
    ): Promise<void> {
        validatePositiveId(
            planId,
            "Nutrition Plan ID",
        );

        validatePositiveId(
            memberId,
            "Member ID",
        );

        await apiClient.post(
            `${NUTRITION_BASE_URL}/${planId}/archive`,
            undefined,
            {
                params: {
                    memberId,
                },
            },
        );
    },

    async completePlan(
        planId: number,
        memberId: number,
    ): Promise<void> {
        validatePositiveId(
            planId,
            "Nutrition Plan ID",
        );

        validatePositiveId(
            memberId,
            "Member ID",
        );

        await apiClient.post(
            `${NUTRITION_BASE_URL}/${planId}/complete`,
            undefined,
            {
                params: {
                    memberId,
                },
            },
        );
    },

    async clonePlan(
        planId: number,
        memberId: number,
    ): Promise<NutritionPlan> {
        validatePositiveId(
            planId,
            "Nutrition Plan ID",
        );

        validatePositiveId(
            memberId,
            "Member ID",
        );

        const response =
            await apiClient.post<NutritionPlan>(
                `${NUTRITION_BASE_URL}/${planId}/clone`,
                undefined,
                {
                    params: {
                        memberId,
                    },
                },
            );

        return {
            ...response.data,
            meals:
                response.data.meals ?? [],
        };
    },

    async deletePlan(
        planId: number,
        memberId: number,
    ): Promise<void> {
        validatePositiveId(
            planId,
            "Nutrition Plan ID",
        );

        validatePositiveId(
            memberId,
            "Member ID",
        );

        await apiClient.delete(
            `${NUTRITION_BASE_URL}/${planId}`,
            {
                params: {
                    memberId,
                },
            },
        );
    },
};