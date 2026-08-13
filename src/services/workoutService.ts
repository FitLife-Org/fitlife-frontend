import apiClient from "./apiClient";

import type {
  SpringPage,
  ApiResponse,
} from "../types/common.type";

import type {
  WorkoutPlan,
  WorkoutPlanCreateRequest,
} from "../types/workout.type";

type WorkoutPlansResponse =
    | WorkoutPlan[]
    | SpringPage<WorkoutPlan>;

function normalizePlan(
    plan: WorkoutPlan,
): WorkoutPlan {
  return {
    ...plan,
    days: plan.days ?? [],
  };
}

function extractPlans(
    response: WorkoutPlansResponse,
): WorkoutPlan[] {
  if (Array.isArray(response)) {
    return response.map(normalizePlan);
  }

  return (
      response.content?.map(
          normalizePlan,
      ) ?? []
  );
}

function validateId(
    id: string | number,
    fieldName: string,
): void {
  const numericId = Number(id);

  if (
      !Number.isInteger(numericId) ||
      numericId <= 0
  ) {
    throw new Error(
        `${fieldName} không hợp lệ.`,
    );
  }
}

export const workoutService = {
  async getWorkoutPlanDetails(
      id: string | number,
  ): Promise<WorkoutPlan> {
    validateId(
        id,
        "Workout Plan ID",
    );

    const response =
        await apiClient.get<
            ApiResponse<WorkoutPlan>
        >(
            `/workout-plans/${id}`,
        );

    return normalizePlan(
        response.data.data,
    );
  },

  async getTrainerWorkoutPlans(
      memberId: string | number,
  ): Promise<WorkoutPlan[]> {
    validateId(
        memberId,
        "Member ID",
    );

    const response =
        await apiClient.get<
            ApiResponse<WorkoutPlansResponse>
        >(
            `/trainer/members/${memberId}/workout-plans`,
        );

    return extractPlans(
        response.data.data,
    );
  },

  async createTrainerWorkoutPlan(
      memberId: string | number,
      data: WorkoutPlanCreateRequest,
  ): Promise<WorkoutPlan> {
    const response =
        await apiClient.post<
            ApiResponse<WorkoutPlan>
        >(
            `/trainer/members/${memberId}/workout-plans`,
            data,
        );

    return normalizePlan(
        response.data.data,
    );
  },

  async updateTrainerWorkoutPlan(
      planId: string | number,
      memberId: string | number,
      data: Partial<WorkoutPlanCreateRequest>,
  ): Promise<WorkoutPlan> {
    validateId(
        planId,
        "Workout Plan ID",
    );
    validateId(
        memberId,
        "Member ID",
    );

    const response =
        await apiClient.patch<
            ApiResponse<WorkoutPlan>
        >(
            `/trainer/members/${memberId}/workout-plans/${planId}`,
            data,
        );

    return normalizePlan(
        response.data.data,
    );
  },

  async getMyWorkoutPlans():
      Promise<WorkoutPlan[]> {
    const response =
        await apiClient.get<
            ApiResponse<WorkoutPlansResponse>
        >("/workout-plans/me", {
          params: {
            page: 0,
            size: 20,
            sort: "createdAt,desc",
          },
        });

    return extractPlans(
        response.data.data,
    );
  },

  async completeSession(
      sessionId: string | number,
      data?: unknown,
  ): Promise<any> {
    validateId(
        sessionId,
        "Workout Session ID",
    );

    const response =
        await apiClient.post<
            ApiResponse<any>
        >(
            `/workout-plans/${sessionId}/complete`,
            data,
        );

    return response.data.data;
  },
};
