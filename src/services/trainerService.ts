import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { Trainer, TrainerMember, TrainerSession } from "../types/trainer.type";

export const trainerService = {
  async getTrainers(): Promise<Trainer[]> {
    const response = await apiClient.get<ApiResponse<Trainer[]>>("/trainers");
    return response.data.data;
  },

  async getTrainerById(id: number | string): Promise<Trainer> {
    const response = await apiClient.get<ApiResponse<Trainer>>(`/trainers/${id}`);
    return response.data.data;
  },

  async getAdminTrainers(): Promise<Trainer[]> {
    const response = await apiClient.get<ApiResponse<Trainer[]>>("/admin/trainers");
    return response.data.data;
  },

  async createTrainer(data: Partial<Trainer> | Record<string, unknown>): Promise<Trainer> {
    const response = await apiClient.post<ApiResponse<Trainer>>("/admin/trainers", data);
    return response.data.data;
  },

  async updateTrainer(id: number | string, data: Partial<Trainer> | Record<string, unknown>): Promise<Trainer> {
    const response = await apiClient.put<ApiResponse<Trainer>>(`/admin/trainers/${id}`, data);
    return response.data.data;
  },

  async deleteTrainer(id: number | string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/trainers/${id}`);
  },

  async updateTrainerStatus(id: number | string, status: string): Promise<Trainer> {
    const response = await apiClient.patch<ApiResponse<Trainer>>(`/admin/trainers/${id}/status`, { status });
    return response.data.data;
  },

  async assignTrainerToMember(trainerId: number | string, memberId: number | string): Promise<unknown> {
    const response = await apiClient.post<ApiResponse<unknown>>(`/admin/trainers/${trainerId}/members`, { memberId });
    return response.data.data;
  },

  async getMe(): Promise<Trainer> {
    const response = await apiClient.get<ApiResponse<Trainer>>("/trainers/me");
    return response.data.data;
  },

  async updateMe(data: Partial<Trainer> | Record<string, unknown>): Promise<Trainer> {
    const response = await apiClient.put<ApiResponse<Trainer>>("/trainers/me", data);
    return response.data.data;
  },

  async getMyMembers(): Promise<TrainerMember[]> {
    const response = await apiClient.get<ApiResponse<TrainerMember[]>>("/trainers/me/members");
    return response.data.data;
  },

  async getMemberWorkoutProgress(memberId: string | number): Promise<unknown> {
    const response = await apiClient.get<ApiResponse<unknown>>(`/trainers/members/${memberId}/progress`);
    return response.data.data;
  },
  async getTrainerSchedule(): Promise<TrainerSession[]> {
    const response = await apiClient.get<ApiResponse<TrainerSession[]>>("/trainers/me/schedule");
    return response.data.data;
  }
};
