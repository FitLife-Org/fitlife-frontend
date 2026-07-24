import apiClient from "./apiClient";

import type {
  SpringPage,
} from "../types/common.type";

import type {
  WorkoutPlan,
  WorkoutSession,
} from "../types/workout.type";

type WorkoutPlansResponse =
    | WorkoutPlan[]
    | SpringPage<WorkoutPlan>;

function normalizePlan(
    plan: WorkoutPlan,
): WorkoutPlan {
  return {
    ...plan,
    sessions: plan.sessions ?? [],
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
  async getWorkoutPlans():
      Promise<WorkoutPlan[]> {
    const response =
        await apiClient.get<
            WorkoutPlansResponse
        >("/workout-plans");

    return extractPlans(
        response.data,
    );
  },

  async getWorkoutPlanDetails(
      id: string | number,
  ): Promise<WorkoutPlan> {
    validateId(
        id,
        "Workout Plan ID",
    );

    const response =
        await apiClient.get<WorkoutPlan>(
            `/workout-plans/${id}`,
        );

    return normalizePlan(
        response.data,
    );
  },

  async createWorkoutPlan(
      data: Partial<WorkoutPlan>,
  ): Promise<WorkoutPlan> {
    const response =
        await apiClient.post<WorkoutPlan>(
            "/trainers/workout-plans",
            data,
        );

    return normalizePlan(
        response.data,
    );
  },

  async updateWorkoutPlan(
      id: string | number,
      data: Partial<WorkoutPlan>,
  ): Promise<WorkoutPlan> {
    validateId(
        id,
        "Workout Plan ID",
    );

    const response =
        await apiClient.put<WorkoutPlan>(
            `/trainers/workout-plans/${id}`,
            data,
        );

    return normalizePlan(
        response.data,
    );
  },

  async getMyWorkoutPlans():
      Promise<WorkoutPlan[]> {
    const response =
        await apiClient.get<
            WorkoutPlansResponse
        >("/workout-plans/me", {
          params: {
            page: 0,
            size: 20,
            sort: "createdAt,desc",
          },
        });

    return extractPlans(
        response.data,
    );
  },

  async completeSession(
      sessionId: string | number,
      data?: unknown,
  ): Promise<WorkoutSession> {
    validateId(
        sessionId,
        "Workout Session ID",
    );

    const response =
        await apiClient.patch<WorkoutSession>(
            `/workout-sessions/${sessionId}/complete`,
            data,
        );

    return response.data;
  },
};
