import axios from "axios";

import apiClient from "./apiClient";

import type {
    ApiResponse,
    SpringPage,
} from "../types/common.type";

import type {
    WorkoutPlan,
    WorkoutPlanCreateRequest,
    WorkoutPlanDay,
    WorkoutPlanUpdateRequest,
} from "../types/workout.type";

type WorkoutPlansResponse =
    | WorkoutPlan[]
    | SpringPage<WorkoutPlan>;

function validateId(
    id: string | number,
    fieldName: string,
): number {
    const numericId = Number(id);

    if (
        !Number.isInteger(numericId) ||
        numericId <= 0
    ) {
        throw new Error(
            `${fieldName} không hợp lệ.`,
        );
    }

    return numericId;
}

function normalizeDay(
    day: WorkoutPlanDay,
): WorkoutPlanDay {
    return {
        ...day,
        exercises: day.exercises ?? [],
    };
}

function normalizePlan(
    plan: WorkoutPlan,
): WorkoutPlan {
    return {
        ...plan,
        days:
            plan.days?.map(normalizeDay) ??
            [],
    };
}

function extractPlans(
    response: WorkoutPlansResponse,
): WorkoutPlan[] {
    if (Array.isArray(response)) {
        return response.map(
            normalizePlan,
        );
    }

    return (
        response.content?.map(
            normalizePlan,
        ) ?? []
    );
}

function isNotFound(
    error: unknown,
): boolean {
    return (
        axios.isAxiosError(error) &&
        error.response?.status === 404
    );
}

export const workoutService = {
    // =====================================================
    // MEMBER
    // =====================================================

    async getMyWorkoutPlans():
        Promise<WorkoutPlan[]> {
        try {
            const response =
                await apiClient.get<
                    ApiResponse<WorkoutPlansResponse>
                >(
                    "/workout-plans/me",
                );

            return extractPlans(
                response.data.data,
            );
        } catch (error) {
            /*
             * Chưa có giáo án không phải lỗi UI.
             * Trả [] để page render empty-state.
             */
            if (isNotFound(error)) {
                return [];
            }

            throw error;
        }
    },

    async getActiveWorkoutPlan():
        Promise<WorkoutPlan | null> {
        try {
            const response =
                await apiClient.get<
                    ApiResponse<WorkoutPlan>
                >(
                    "/workout-plans/me/active",
                );

            return normalizePlan(
                response.data.data,
            );
        } catch (error) {
            /*
             * Member chưa có plan ACTIVE.
             */
            if (isNotFound(error)) {
                return null;
            }

            throw error;
        }
    },

    async getTodayWorkoutDay():
        Promise<WorkoutPlanDay | null> {
        try {
            const response =
                await apiClient.get<
                    ApiResponse<WorkoutPlanDay>
                >(
                    "/workout-plans/me/today",
                );

            return normalizeDay(
                response.data.data,
            );
        } catch (error) {
            /*
             * Có ACTIVE nhưng hôm nay
             * không nằm trong lịch tập.
             */
            if (isNotFound(error)) {
                return null;
            }

            throw error;
        }
    },

    async getWorkoutPlanDetails(
        id: string | number,
    ): Promise<WorkoutPlan> {
        const planId =
            validateId(
                id,
                "Workout Plan ID",
            );

        const response =
            await apiClient.get<
                ApiResponse<WorkoutPlan>
            >(
                `/workout-plans/${planId}`,
            );

        return normalizePlan(
            response.data.data,
        );
    },

    async createWorkoutPlan(
        request:
        WorkoutPlanCreateRequest,
    ): Promise<WorkoutPlan> {
        const response =
            await apiClient.post<
                ApiResponse<WorkoutPlan>
            >(
                "/workout-plans",
                request,
            );

        return normalizePlan(
            response.data.data,
        );
    },

    async updateWorkoutPlan(
        planId:
            string | number,

        request:
        WorkoutPlanUpdateRequest,
    ): Promise<WorkoutPlan> {
        const numericPlanId =
            validateId(
                planId,
                "Workout Plan ID",
            );

        const response =
            await apiClient.patch<
                ApiResponse<WorkoutPlan>
            >(
                `/workout-plans/${numericPlanId}`,
                request,
            );

        return normalizePlan(
            response.data.data,
        );
    },

    async updateWorkoutPlanStructure(
        planId:
            string | number,

        days:
        WorkoutPlanDay[],
    ): Promise<WorkoutPlan> {
        const numericPlanId =
            validateId(
                planId,
                "Workout Plan ID",
            );

        const response =
            await apiClient.put<
                ApiResponse<WorkoutPlan>
            >(
                `/workout-plans/${numericPlanId}/structure`,
                days,
            );

        return normalizePlan(
            response.data.data,
        );
    },

    async activateWorkoutPlan(
        planId:
            string | number,
    ): Promise<WorkoutPlan> {
        const numericPlanId =
            validateId(
                planId,
                "Workout Plan ID",
            );

        const response =
            await apiClient.post<
                ApiResponse<WorkoutPlan>
            >(
                `/workout-plans/${numericPlanId}/activate`,
            );

        return normalizePlan(
            response.data.data,
        );
    },

    async completeWorkoutPlan(
        planId:
            string | number,
    ): Promise<WorkoutPlan> {
        const numericPlanId =
            validateId(
                planId,
                "Workout Plan ID",
            );

        const response =
            await apiClient.post<
                ApiResponse<WorkoutPlan>
            >(
                `/workout-plans/${numericPlanId}/complete`,
            );

        return normalizePlan(
            response.data.data,
        );
    },

    async archiveWorkoutPlan(
        planId:
            string | number,
    ): Promise<WorkoutPlan> {
        const numericPlanId =
            validateId(
                planId,
                "Workout Plan ID",
            );

        const response =
            await apiClient.post<
                ApiResponse<WorkoutPlan>
            >(
                `/workout-plans/${numericPlanId}/archive`,
            );

        return normalizePlan(
            response.data.data,
        );
    },

    async cloneWorkoutPlan(
        planId:
            string | number,
    ): Promise<WorkoutPlan> {
        const numericPlanId =
            validateId(
                planId,
                "Workout Plan ID",
            );

        const response =
            await apiClient.post<
                ApiResponse<WorkoutPlan>
            >(
                `/workout-plans/${numericPlanId}/clone`,
            );

        return normalizePlan(
            response.data.data,
        );
    },

    // =====================================================
    // TRAINER
    // =====================================================

    async getTrainerWorkoutPlans(
        memberId:
            string | number,
    ): Promise<WorkoutPlan[]> {
        const numericMemberId =
            validateId(
                memberId,
                "Member ID",
            );

        const response =
            await apiClient.get<
                ApiResponse<WorkoutPlansResponse>
            >(
                `/trainer/members/${numericMemberId}/workout-plans`,
            );

        return extractPlans(
            response.data.data,
        );
    },

    async createTrainerWorkoutPlan(
        memberId:
            string | number,

        request:
        WorkoutPlanCreateRequest,
    ): Promise<WorkoutPlan> {
        const numericMemberId =
            validateId(
                memberId,
                "Member ID",
            );

        const response =
            await apiClient.post<
                ApiResponse<WorkoutPlan>
            >(
                `/trainer/members/${numericMemberId}/workout-plans`,
                request,
            );

        return normalizePlan(
            response.data.data,
        );
    },

    async updateTrainerWorkoutPlan(
        planId:
            string | number,

        memberId:
            string | number,

        request:
        WorkoutPlanUpdateRequest,
    ): Promise<WorkoutPlan> {
        const numericPlanId =
            validateId(
                planId,
                "Workout Plan ID",
            );

        const numericMemberId =
            validateId(
                memberId,
                "Member ID",
            );

        const response =
            await apiClient.patch<
                ApiResponse<WorkoutPlan>
            >(
                `/trainer/members/${numericMemberId}/workout-plans/${numericPlanId}`,
                request,
            );

        return normalizePlan(
            response.data.data,
        );
    },
};