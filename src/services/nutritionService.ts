import axios from "axios";

import apiClient from "./apiClient";

import type {
    ApiResponse,
    SpringPage,
} from "../types/common.type";

import type {
    NutritionFood,
    NutritionMeal,
    NutritionPlan,
    NutritionPlanRequest,
} from "../types/nutrition.type";

const BASE_URL =
    "/nutrition-plans";

function validatePositiveId(
    value: number,
    fieldName: string,
): number {
    if (
        !Number.isInteger(value) ||
        value <= 0
    ) {
        throw new Error(
            `${fieldName} không hợp lệ.`,
        );
    }

    return value;
}

function isNotFound(
    error: unknown,
): boolean {
    return (
        axios.isAxiosError(error) &&
        error.response?.status === 404
    );
}

function normalizeFood(
    food: NutritionFood,
): NutritionFood {
    return {
        ...food,
    };
}

function normalizeMeal(
    meal: NutritionMeal,
): NutritionMeal {
    return {
        ...meal,

        foods:
            meal.foods?.map(
                normalizeFood,
            ) ?? [],
    };
}

function normalizePlan(
    plan: NutritionPlan,
): NutritionPlan {
    return {
        ...plan,

        meals:
            plan.meals?.map(
                normalizeMeal,
            ) ?? [],
    };
}

function normalizePage(
    page:
    SpringPage<NutritionPlan>,
): SpringPage<NutritionPlan> {
    return {
        ...page,

        content:
            page.content?.map(
                normalizePlan,
            ) ?? [],
    };
}

export const nutritionService = {
    // =====================================================
    // MEMBER
    // =====================================================

    async getMyPlans(
        page = 0,
        size = 10,
    ): Promise<
        SpringPage<NutritionPlan>
    > {
        const response =
            await apiClient.get<
                ApiResponse<
                    SpringPage<NutritionPlan>
                >
            >(
                `${BASE_URL}/me`,
                {
                    params: {
                        page,
                        size,
                        sort:
                            "createdAt,desc",
                    },
                },
            );

        return normalizePage(
            response.data.data,
        );
    },

    async getPlanById(
        planId: number,
    ): Promise<NutritionPlan> {
        const id =
            validatePositiveId(
                planId,
                "Nutrition Plan ID",
            );

        const response =
            await apiClient.get<
                ApiResponse<NutritionPlan>
            >(
                `${BASE_URL}/${id}`,
            );

        return normalizePlan(
            response.data.data,
        );
    },

    async getActivePlan():
        Promise<NutritionPlan | null> {
        try {
            const response =
                await apiClient.get<
                    ApiResponse<NutritionPlan>
                >(
                    `${BASE_URL}/me/active`,
                );

            return normalizePlan(
                response.data.data,
            );
        } catch (error) {
            /*
             * Member chưa có plan ACTIVE
             * là empty state, không phải
             * lỗi giao diện.
             */
            if (
                isNotFound(error)
            ) {
                return null;
            }

            throw error;
        }
    },

    async getTodayPlan():
        Promise<NutritionPlan | null> {
        try {
            const response =
                await apiClient.get<
                    ApiResponse<NutritionPlan>
                >(
                    `${BASE_URL}/me/today`,
                );

            return normalizePlan(
                response.data.data,
            );
        } catch (error) {
            if (
                isNotFound(error)
            ) {
                return null;
            }

            throw error;
        }
    },

    async createPlan(
        request:
        NutritionPlanRequest,
    ): Promise<NutritionPlan> {
        const response =
            await apiClient.post<
                ApiResponse<NutritionPlan>
            >(
                BASE_URL,
                request,
            );

        return normalizePlan(
            response.data.data,
        );
    },

    async updatePlan(
        planId: number,

        request:
        NutritionPlanRequest,
    ): Promise<NutritionPlan> {
        const id =
            validatePositiveId(
                planId,
                "Nutrition Plan ID",
            );

        /*
         * Backend NutritionPlanController:
         * PUT /nutrition-plans/{id}
         */
        const response =
            await apiClient.put<
                ApiResponse<NutritionPlan>
            >(
                `${BASE_URL}/${id}`,
                request,
            );

        return normalizePlan(
            response.data.data,
        );
    },

    async activatePlan(
        planId: number,
    ): Promise<void> {
        const id =
            validatePositiveId(
                planId,
                "Nutrition Plan ID",
            );

        await apiClient.post(
            `${BASE_URL}/${id}/activate`,
        );
    },

    async archivePlan(
        planId: number,
    ): Promise<void> {
        const id =
            validatePositiveId(
                planId,
                "Nutrition Plan ID",
            );

        await apiClient.post(
            `${BASE_URL}/${id}/archive`,
        );
    },

    async completePlan(
        planId: number,
    ): Promise<void> {
        const id =
            validatePositiveId(
                planId,
                "Nutrition Plan ID",
            );

        await apiClient.post(
            `${BASE_URL}/${id}/complete`,
        );
    },

    async clonePlan(
        planId: number,
    ): Promise<NutritionPlan> {
        const id =
            validatePositiveId(
                planId,
                "Nutrition Plan ID",
            );

        const response =
            await apiClient.post<
                ApiResponse<NutritionPlan>
            >(
                `${BASE_URL}/${id}/clone`,
            );

        return normalizePlan(
            response.data.data,
        );
    },

    async deletePlan(
        planId: number,
    ): Promise<void> {
        const id =
            validatePositiveId(
                planId,
                "Nutrition Plan ID",
            );

        await apiClient.delete(
            `${BASE_URL}/${id}`,
        );
    },

    // =====================================================
    // TRAINER
    // =====================================================

    async getTrainerPlans(
        memberId: number,
        trainerId?: number,
        page = 0,
        size = 10,
    ): Promise<
        SpringPage<NutritionPlan>
    > {
        const id =
            validatePositiveId(
                memberId,
                "Member ID",
            );

        const response =
            await apiClient.get<
                ApiResponse<
                    SpringPage<NutritionPlan>
                >
            >(
                `/trainer/nutrition-plans/members/${id}`,
                {
                    params: {
                        ...(trainerId ? { trainerId } : {}),
                        page,
                        size,
                        sort:
                            "createdAt,desc",
                    },
                },
            );

        return normalizePage(
            response.data.data,
        );
    },

    async createTrainerPlan(
        memberId: number,
        request: NutritionPlanRequest,
        trainerId?: number,
    ): Promise<NutritionPlan> {
        const id =
            validatePositiveId(
                memberId,
                "Member ID",
            );

        const response =
            await apiClient.post<
                ApiResponse<NutritionPlan>
            >(
                `/trainer/nutrition-plans/members/${id}`,
                request,
                {
                    params: trainerId ? { trainerId } : undefined,
                },
            );

        return normalizePlan(
            response.data.data,
        );
    },

    async updateTrainerPlan(
        planId: number,
        memberId: number,
        request: NutritionPlanRequest,
        trainerId?: number,
    ): Promise<NutritionPlan> {
        const numericPlanId =
            validatePositiveId(
                planId,
                "Nutrition Plan ID",
            );

        const numericMemberId =
            validatePositiveId(
                memberId,
                "Member ID",
            );

        const response =
            await apiClient.put<
                ApiResponse<NutritionPlan>
            >(
                `/trainer/nutrition-plans/${numericPlanId}/members/${numericMemberId}`,
                request,
                {
                    params: trainerId ? { trainerId } : undefined,
                },
            );

        return normalizePlan(
            response.data.data,
        );
    },
};