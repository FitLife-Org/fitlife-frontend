import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { WorkoutPlan, WorkoutSession } from "../types/workout.type";

export const workoutService = {
  // Lấy danh sách kế hoạch tập (Trainer/Admin)
  getWorkoutPlans: async (): Promise<WorkoutPlan[]> => {
    const response = await apiClient.get<ApiResponse<WorkoutPlan[]>>("/workout-plans");
    return response.data.data;
  },

  // Chi tiết kế hoạch tập
  getWorkoutPlanDetails: async (id: string): Promise<WorkoutPlan> => {
    const response = await apiClient.get<ApiResponse<WorkoutPlan>>(`/workout-plans/${id}`);
    return response.data.data;
  },

  // Trainer tạo kế hoạch tập
  createWorkoutPlan: async (data: Partial<WorkoutPlan>): Promise<WorkoutPlan> => {
    const response = await apiClient.post<ApiResponse<WorkoutPlan>>("/trainers/workout-plans", data);
    return response.data.data;
  },

  // Trainer cập nhật kế hoạch
  updateWorkoutPlan: async (id: string, data: Partial<WorkoutPlan>): Promise<WorkoutPlan> => {
    const response = await apiClient.put<ApiResponse<WorkoutPlan>>(`/trainers/workout-plans/${id}`, data);
    return response.data.data;
  },

  // Lấy danh sách kế hoạch của member hiện tại
  getMyWorkoutPlans: async (): Promise<WorkoutPlan[]> => {
    const response = await apiClient.get<ApiResponse<WorkoutPlan[]>>("/workout-plans/me");
    return response.data.data;
  },

  // Đánh dấu hoàn thành buổi tập
  completeSession: async (sessionId: string, data?: Record<string, unknown>): Promise<WorkoutSession> => {
    const response = await apiClient.patch<ApiResponse<WorkoutSession>>(`/workout-sessions/${sessionId}/complete`, data);
    return response.data.data;
  }
};
