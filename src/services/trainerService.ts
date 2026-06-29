import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { Trainer } from "../types/trainer.type";

export const trainerService = {
  // TRAINER-01: Xem danh sách Trainer
  async getTrainers(): Promise<Trainer[]> {
    const response = await apiClient.get<ApiResponse<Trainer[]>>("/trainers");
    return response.data.data || [];
  },

  // TRAINER-02: Xem chi tiết Trainer
  async getTrainerById(id: number | string): Promise<Trainer> {
    const response = await apiClient.get<ApiResponse<Trainer>>(`/trainers/${id}`);
    return response.data.data!;
  },

  // TRAINER-03: Admin tạo hồ sơ Trainer
  async createTrainer(data: Partial<Trainer> | any): Promise<Trainer> {
    const response = await apiClient.post<ApiResponse<Trainer>>("/admin/trainers", data);
    return response.data.data!;
  },

  // TRAINER-04: Admin cập nhật hồ sơ Trainer
  async updateTrainer(id: number | string, data: Partial<Trainer> | any): Promise<Trainer> {
    const response = await apiClient.put<ApiResponse<Trainer>>(`/admin/trainers/${id}`, data);
    return response.data.data!;
  },

  // TRAINER-05: Gán Trainer cho hội viên
  async assignTrainerToMember(trainerId: number | string, memberId: number | string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/trainers/${trainerId}/members/${memberId}`);
    return response.data.data;
  },

  // TRAINER-06: Trainer xem danh sách hội viên được phân công
  async getMyMembers(): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>("/trainers/me/members");
    return response.data.data || [];
  },

  // TRAINER-07: Trainer xem hồ sơ Trainer của mình
  async getMyProfile(): Promise<Trainer> {
    const response = await apiClient.get<ApiResponse<Trainer>>("/trainers/me/profile");
    return response.data.data!;
  },

  // TRAINER-08: Trainer cập nhật hồ sơ chuyên môn của mình
  async updateMyProfile(data: Partial<Trainer> | any): Promise<Trainer> {
    const response = await apiClient.put<ApiResponse<Trainer>>("/trainers/me/profile", data);
    return response.data.data!;
  },
};
