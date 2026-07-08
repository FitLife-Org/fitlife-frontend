import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { Trainer, TrainerMember, TrainerSession, WorkoutProgress } from "../types/trainer.type";

export const trainerService = {
 async getTrainers(): Promise<Trainer[]> {
    const response = await apiClient.get<ApiResponse<Trainer[]>>("/trainers");
    return response.data.data || [];
  },

  async getTrainerById(id: number | string): Promise<Trainer> {
    const response = await apiClient.get<ApiResponse<Trainer>>(`/trainers/${id}`);
    return response.data.data!;
  },

  async createTrainer(data: Partial<Trainer> | any): Promise<Trainer> {
    const response = await apiClient.post<ApiResponse<Trainer>>("/admin/trainers", data);
    return response.data.data!;
  },

  async updateTrainer(id: number | string, data: Partial<Trainer> | any): Promise<Trainer> {
    const response = await apiClient.put<ApiResponse<Trainer>>(`/admin/trainers/${id}`, data);
    return response.data.data!;
  },

  async assignTrainerToMember(trainerId: number | string, memberId: number | string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/trainers/${trainerId}/members/${memberId}`);
    return response.data.data;
  },

  // ==========================================
  // MOCK APIs for TRAINER ROLE
  // ==========================================

  async getMyMembers(): Promise<TrainerMember[]> {
    // Mock Data
    return new Promise((resolve) => setTimeout(() => resolve([
      { id: 1, userId: 101, fullName: "Nguyễn Văn A", phone: "0901234567", packageName: "VIP 1 Năm", status: "ACTIVE", sessionsTotal: 20, sessionsCompleted: 5, joinDate: "2026-06-01" },
      { id: 2, userId: 102, fullName: "Trần Thị B", phone: "0912345678", packageName: "BASIC 3 Tháng", status: "ACTIVE", sessionsTotal: 10, sessionsCompleted: 8, joinDate: "2026-06-15" },
      { id: 3, userId: 103, fullName: "Lê Minh C", phone: "0923456789", packageName: "Premium 6 Tháng", status: "INACTIVE", sessionsTotal: 30, sessionsCompleted: 30, joinDate: "2025-12-01" }
    ]), 800));
  },

  async getTrainerSchedule(): Promise<TrainerSession[]> {
    // Mock Data
    const today = new Date().toISOString().split('T')[0];
    return new Promise((resolve) => setTimeout(() => resolve([
      { id: 1, memberId: 101, memberName: "Nguyễn Văn A", date: today, startTime: "08:00", endTime: "09:00", status: "COMPLETED", notes: "Tập ngực, đẩy tạ 50kg" },
      { id: 2, memberId: 102, memberName: "Trần Thị B", date: today, startTime: "14:00", endTime: "15:00", status: "SCHEDULED" },
      { id: 3, memberId: 104, memberName: "Phạm Văn D", date: today, startTime: "16:00", endTime: "17:00", status: "CANCELLED", notes: "Khách bận đột xuất" },
      { id: 4, memberId: 101, memberName: "Nguyễn Văn A", date: "2026-07-09", startTime: "08:00", endTime: "09:00", status: "SCHEDULED" },
    ]), 600));
  },

  async getMemberWorkoutProgress(memberId: number): Promise<WorkoutProgress> {
    // Mock Data
    return new Promise((resolve) => setTimeout(() => resolve({
      memberId,
      weight: 75.5,
      bodyFatPercentage: 18.2,
      muscleMass: 35.4,
      lastUpdated: "2026-07-05",
      goals: { targetWeight: 70, description: "Giảm mỡ, tăng cơ ngực" }
    }), 500));
  },

  async getMyProfile(): Promise<Trainer> {
    const response = await apiClient.get<ApiResponse<Trainer>>("/trainers/me/profile");
    return response.data.data!;
  },

  async updateMyProfile(data: Partial<Trainer> | any): Promise<Trainer> {
    const response = await apiClient.put<ApiResponse<Trainer>>("/trainers/me/profile", data);
    return response.data.data!;
  },
};
