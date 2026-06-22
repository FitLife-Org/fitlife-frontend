import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { AiWorkoutPlan, AiWorkoutRequest } from "../types/ai.type";

export const aiService = {
  async generateWorkout(data: AiWorkoutRequest): Promise<AiWorkoutPlan> {
    const response = await apiClient.post<ApiResponse<AiWorkoutPlan>>(
        "/ai/workouts",
        data
    );

    if (!response.data.data) {
      throw new Error("Máy chủ không trả về kế hoạch tập luyện.");
    }

    return response.data.data;
  },
};