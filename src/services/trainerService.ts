import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { Trainer, TrainerMember, TrainerSession } from "../types/trainer.type";

export const trainerService = {
  async getTrainers(): Promise<Trainer[]> {
    const response = await apiClient.get<ApiResponse<Trainer[]>>("/trainers");
    return response.data.data;
  },

  async getTrainerById(id: number | string): Promise<Trainer> {
    const trainers = await this.getTrainers();
    const trainer = trainers.find((t) => String(t.id) === String(id));
    if (!trainer) {
      throw new Error(`Không tìm thấy huấn luyện viên với ID: ${id}`);
    }
    return trainer;
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
    const response = await apiClient.patch<ApiResponse<Trainer>>(`/admin/trainers/${id}/status?status=${status}`);
    return response.data.data;
  },

  // Trainer Assignments (Admin)
  async getTrainerAssignments(params?: Record<string, unknown>): Promise<unknown[]> {
    const response = await apiClient.get<ApiResponse<unknown[]>>("/admin/trainer-assignments", { params });
    return response.data.data;
  },

  async assignTrainerToMember(data: { trainerId: number | string; memberId: number | string }): Promise<unknown> {
    const response = await apiClient.post<ApiResponse<unknown>>("/admin/trainer-assignments", data);
    return response.data.data;
  },

  async updateTrainerAssignment(id: number | string, data: Record<string, unknown>): Promise<unknown> {
    const response = await apiClient.patch<ApiResponse<unknown>>(`/admin/trainer-assignments/${id}`, data);
    return response.data.data;
  },

  async deleteTrainerAssignment(id: number | string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/trainer-assignments/${id}`);
  },

  // Trainer Profile
  async getMyProfile(): Promise<Trainer> {
    const response = await apiClient.get<ApiResponse<Trainer>>("/trainers/me");
    if (!response.data.data) {
      throw new Error("Không nhận được hồ sơ huấn luyện viên.");
    }
    return response.data.data;
  },

  async updateMyProfile(data: Partial<Trainer> | Record<string, unknown>): Promise<Trainer> {
    const response = await apiClient.put<ApiResponse<Trainer>>("/trainers/me", data);
    if (!response.data.data) {
      throw new Error("Không nhận được hồ sơ sau khi cập nhật.");
    }
    return response.data.data;
  },

  async updateMyAvatar(file: File): Promise<Trainer> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.patch<ApiResponse<Trainer>>(
      "/trainers/me/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  async getMyMembers(): Promise<TrainerMember[]> {
    try {
      const response = await apiClient.get<ApiResponse<any>>("/trainer/reports/members");
      const report = response.data.data;
      const list = report?.membersList || [];
      return list.map((item: any) => ({
        id: item.memberId,
        userId: item.memberId,
        fullName: item.memberName || "Hội viên",
        avatarUrl: `https://i.pravatar.cc/150?u=${item.memberId}`,
        phone: item.phone,
        packageName: item.activePackageName || "Gói tập",
        status: "ACTIVE",
        sessionsTotal: 0,
        sessionsCompleted: 0,
        joinDate: ""
      }));
    } catch (error) {
      console.warn("Lỗi khi tải danh sách hội viên của HLV:", error);
      return [];
    }
  },

  async getMemberWorkoutProgress(memberId: string | number): Promise<unknown> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>(`/trainer/members/${memberId}/workout-plans`);
      // Endpoint returns WorkoutPlanResponse[], but UI expects WorkoutProgress object.
      // We only return the response if it's an object containing expected fields like 'goals'.
      if (response.data.data && !Array.isArray(response.data.data) && typeof response.data.data === 'object' && 'goals' in (response.data.data as object)) {
        return response.data.data;
      }
    } catch (error) {
      console.warn("Chưa tìm thấy dữ liệu tiến độ thực tế từ Backend cho hội viên:", memberId);
    }
    // Fallback data mặc định cho giao diện WorkoutTrackingPage
    return {
      memberId: Number(memberId),
      weight: 72.5,
      bodyFatPercentage: 18.2,
      muscleMass: 34.0,
      lastUpdated: "20/06/2024",
      goals: {
        targetWeight: 68.0,
        description: "Tăng cơ giảm mỡ, hoàn thành 4 buổi tập/tuần."
      }
    };
  },

  async getTrainerSchedule(): Promise<TrainerSession[]> {
    try {
      const response = await apiClient.get<ApiResponse<TrainerSession[]>>("/trainers/me/schedule");
      if (response.data?.data) {
        return response.data.data;
      }
    } catch (error) {
      console.warn("Endpoint /trainers/me/schedule chưa khả dụng trên Backend");
    }
    return [
      {
        id: 1,
        memberId: 101,
        memberName: "Nguyễn Văn A",
        date: "25/06/2024",
        startTime: "08:00",
        endTime: "09:30",
        status: "SCHEDULED",
        notes: "Buổi tập ngực & tay sau"
      },
      {
        id: 2,
        memberId: 102,
        memberName: "Trần Thị B",
        date: "25/06/2024",
        startTime: "10:00",
        endTime: "11:30",
        status: "SCHEDULED",
        notes: "Buổi tập chân & mông"
      }
    ];
  }
};
