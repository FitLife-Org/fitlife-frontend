import axios from "axios";

import apiClient from "./apiClient";

import type {
    ApiResponse,
    PageResponse,
} from "../types/common.type";

import type {
    NutritionFood,
    NutritionMeal,
    NutritionPlan,
    NutritionPlanApiRequest,
    NutritionPlanRequest,
} from "../types/nutrition.type";

import {
    requireApiData,
} from "../utils/apiResponse";

const BASE_URL = "/nutrition-plans";
const ADMIN_BASE_URL = "/admin/nutrition-plans";

function validatePositiveId(
    value: number,
    fieldName: string,
): number {
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`${fieldName} không hợp lệ.`);
    }
    return value;
}

function isNotFound(error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 404;
}

function normalizeFood(food: NutritionFood): NutritionFood {
    return {
        ...food,
        sortOrder: food.sortOrder ?? 0,
    };
}

function normalizeMeal(meal: NutritionMeal): NutritionMeal {
    return {
        ...meal,
        foods: meal.foods?.map(normalizeFood) ?? [],
    };
}

function normalizePlan(plan: NutritionPlan): NutritionPlan {
    return {
        ...plan,
        meals: plan.meals?.map(normalizeMeal) ?? [],
    };
}

function normalizePage(
    page: PageResponse<NutritionPlan>,
): PageResponse<NutritionPlan> {
    return {
        ...page,
        content: page.content?.map(normalizePlan) ?? [],
    };
}

/**
 * FE keeps a nested meal editor because it is easier to use.
 * Backend V19 stores flat nutrition_plan_items with meal_name,
 * so flatten exactly once at the service boundary.
 */
function toApiRequest(
    request: NutritionPlanRequest,
): NutritionPlanApiRequest {
    let sortOrder = 0;

    return {
        name: request.name.trim(),
        description: request.description?.trim() || undefined,
        goal: request.goal.trim(),
        durationWeeks: request.durationWeeks,
        dailyCalories: request.dailyCalories,
        proteinGrams: request.proteinGrams,
        carbohydrateGrams: request.carbohydrateGrams,
        fatGrams: request.fatGrams,
        fiberGrams: request.fiberGrams,
        mealsPerDay: request.mealsPerDay ?? (request.meals.length || undefined),
        waterMlPerDay: request.waterMlPerDay,
        startDate: request.startDate || undefined,
        expectedEndDate: request.expectedEndDate || undefined,
        foodsToLimit: request.foodsToLimit?.trim() || undefined,
        substitutionNote: request.substitutionNote?.trim() || undefined,
        trainerNote: request.trainerNote?.trim() || undefined,
        memberNote: request.memberNote?.trim() || undefined,
        warningMessage: request.warningMessage?.trim() || undefined,
        items: request.meals.flatMap((meal) => {
            const mealName = meal.mealName.trim();

            return meal.foods.map((food) => ({
                mealName,
                foodName: food.foodName.trim(),
                quantity: food.quantity,
                unit: food.unit?.trim() || undefined,
                portionText: food.portionText?.trim() || undefined,
                calories: food.calories,
                proteinGrams: food.proteinGrams,
                carbohydrateGrams: food.carbohydrateGrams,
                fatGrams: food.fatGrams,
                preparation: food.preparation?.trim() || undefined,
                substitution: food.substitution?.trim() || undefined,
                note: food.note?.trim() || undefined,
                sortOrder: sortOrder++,
            }));
        }),
    };
}

export const nutritionService = {
    // =====================================================
    // MEMBER
    // =====================================================

    async getMyPlans(
        page = 0,
        size = 10,
    ): Promise<PageResponse<NutritionPlan>> {
        const response = await apiClient.get<
            ApiResponse<PageResponse<NutritionPlan>>
        >(`${BASE_URL}/me`, {
            params: {
                page,
                size,
                sort: "createdAt,desc",
            },
        });

        return normalizePage(
            requireApiData(response.data, "Không thể tải kế hoạch dinh dưỡng."),
        );
    },

    async getPlanById(planId: number): Promise<NutritionPlan> {
        const id = validatePositiveId(planId, "Nutrition Plan ID");
        const response = await apiClient.get<ApiResponse<NutritionPlan>>(
            `${BASE_URL}/${id}`,
        );
        return normalizePlan(
            requireApiData(response.data, "Không thể tải chi tiết kế hoạch dinh dưỡng."),
        );
    },

    async getActivePlan(): Promise<NutritionPlan | null> {
        try {
            const response = await apiClient.get<ApiResponse<NutritionPlan | null>>(
                `${BASE_URL}/me/active`,
            );
            const plan = response.data.data;
            return plan ? normalizePlan(plan) : null;
        } catch (error) {
            if (isNotFound(error)) return null;
            throw error;
        }
    },

    async getTodayPlan(): Promise<NutritionPlan | null> {
        try {
            const response = await apiClient.get<ApiResponse<NutritionPlan | null>>(
                `${BASE_URL}/me/today`,
            );
            const plan = response.data.data;
            return plan ? normalizePlan(plan) : null;
        } catch (error) {
            if (isNotFound(error)) return null;
            throw error;
        }
    },

    async createPlan(request: NutritionPlanRequest): Promise<NutritionPlan> {
        const response = await apiClient.post<ApiResponse<NutritionPlan>>(
            BASE_URL,
            toApiRequest(request),
        );
        return normalizePlan(
            requireApiData(response.data, "Không thể tạo kế hoạch dinh dưỡng."),
        );
    },

    async updatePlan(
        planId: number,
        request: NutritionPlanRequest,
    ): Promise<NutritionPlan> {
        const id = validatePositiveId(planId, "Nutrition Plan ID");
        const response = await apiClient.put<ApiResponse<NutritionPlan>>(
            `${BASE_URL}/${id}`,
            toApiRequest(request),
        );
        return normalizePlan(
            requireApiData(response.data, "Không thể cập nhật kế hoạch dinh dưỡng."),
        );
    },

    async activatePlan(planId: number): Promise<void> {
        const id = validatePositiveId(planId, "Nutrition Plan ID");
        await apiClient.post<ApiResponse<void>>(`${BASE_URL}/${id}/activate`);
    },

    async archivePlan(planId: number): Promise<void> {
        const id = validatePositiveId(planId, "Nutrition Plan ID");
        await apiClient.post<ApiResponse<void>>(`${BASE_URL}/${id}/archive`);
    },

    async completePlan(planId: number): Promise<void> {
        const id = validatePositiveId(planId, "Nutrition Plan ID");
        await apiClient.post<ApiResponse<void>>(`${BASE_URL}/${id}/complete`);
    },

    async clonePlan(planId: number): Promise<NutritionPlan> {
        const id = validatePositiveId(planId, "Nutrition Plan ID");
        const response = await apiClient.post<ApiResponse<NutritionPlan>>(
            `${BASE_URL}/${id}/clone`,
        );
        return normalizePlan(
            requireApiData(response.data, "Không thể sao chép kế hoạch dinh dưỡng."),
        );
    },

    async deletePlan(planId: number): Promise<void> {
        const id = validatePositiveId(planId, "Nutrition Plan ID");
        await apiClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
    },

    // =====================================================
    // TRAINER
    // =====================================================

    async getTrainerPlans(
        memberId: number,
        page = 0,
        size = 10,
    ): Promise<PageResponse<NutritionPlan>> {
        const id = validatePositiveId(memberId, "Member ID");
        const response = await apiClient.get<
            ApiResponse<PageResponse<NutritionPlan>>
        >(`/trainer/members/${id}/nutrition-plans`, {
            params: {
                page,
                size,
                sort: "createdAt,desc",
            },
        });

        return normalizePage(
            requireApiData(response.data, "Không thể tải kế hoạch dinh dưỡng của hội viên."),
        );
    },

    async createTrainerPlan(
        memberId: number,
        request: NutritionPlanRequest,
    ): Promise<NutritionPlan> {
        const id = validatePositiveId(memberId, "Member ID");
        const response = await apiClient.post<ApiResponse<NutritionPlan>>(
            `/trainer/members/${id}/nutrition-plans`,
            toApiRequest(request),
        );
        return normalizePlan(
            requireApiData(response.data, "Không thể tạo kế hoạch dinh dưỡng cho hội viên."),
        );
    },

    async updateTrainerPlan(
        planId: number,
        memberId: number,
        request: NutritionPlanRequest,
    ): Promise<NutritionPlan> {
        const numericPlanId = validatePositiveId(planId, "Nutrition Plan ID");
        const numericMemberId = validatePositiveId(memberId, "Member ID");
        const response = await apiClient.put<ApiResponse<NutritionPlan>>(
            `/trainer/members/${numericMemberId}/nutrition-plans/${numericPlanId}`,
            toApiRequest(request),
        );
        return normalizePlan(
            requireApiData(response.data, "Không thể cập nhật kế hoạch dinh dưỡng cho hội viên."),
        );
    },

    // =====================================================
    // ADMIN
    // =====================================================

    async getAdminPlans(
        page = 0,
        size = 10,
    ): Promise<PageResponse<NutritionPlan>> {
        const response = await apiClient.get<
            ApiResponse<PageResponse<NutritionPlan>>
        >(ADMIN_BASE_URL, {
            params: { page, size, sort: "createdAt,desc" },
        });

        return normalizePage(
            requireApiData(response.data, "Không thể tải danh sách kế hoạch dinh dưỡng."),
        );
    },

    async getAdminPlanById(planId: number): Promise<NutritionPlan> {
        const id = validatePositiveId(planId, "Nutrition Plan ID");
        const response = await apiClient.get<ApiResponse<NutritionPlan>>(
            `${ADMIN_BASE_URL}/${id}`,
        );
        return normalizePlan(
            requireApiData(response.data, "Không thể tải chi tiết kế hoạch dinh dưỡng."),
        );
    },
};
