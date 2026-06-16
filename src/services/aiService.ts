import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { AiWorkoutPlan, AiWorkoutRequest } from "../types/ai.type";

export const aiService = {
  async generateWorkout(data: AiWorkoutRequest): Promise<AiWorkoutPlan> {
    const response = await apiClient.post<ApiResponse<AiWorkoutPlan>>("/ai/workouts", data);
    return response.data.data;
  },
};
