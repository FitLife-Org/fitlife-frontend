import apiClient from "../lib/apiClient";
import type { ApiResponse, PageResponse } from "../types/common.type";
import type { BodyMetric, BodyMetricProgress } from "../types/member.type";

export const bodyMetricService = {
  // Guest / Demo
  demoBmi: async (data: { heightCm: number; weightKg: number }): Promise<number> => {
    // Frontend calculates BMI locally for guest
    return Number((data.weightKg / ((data.heightCm / 100) ** 2)).toFixed(1));
  },

  // Member
  getMyMetrics: async (page = 0, size = 10): Promise<BodyMetric[]> => {
    // Fixed: Call GET /body-metrics/me instead of /history for pagination
    const response = await apiClient.get<ApiResponse<PageResponse<BodyMetric>>>(`/body-metrics/me?page=${page}&size=${size}`);
    return response.data.data.content;
  },

  createMyMetric: async (data: { weightKg: number; heightCm?: number; bodyFatPercent?: number; muscleMassKg?: number }): Promise<BodyMetric> => {
    const response = await apiClient.post<ApiResponse<BodyMetric>>(`/body-metrics/me`, data);
    return response.data.data;
  },

  getMyProgress: async (): Promise<BodyMetricProgress[]> => {
    const response = await apiClient.get<ApiResponse<PageResponse<BodyMetric>>>(`/body-metrics/me?page=0&size=2`);
    const metrics = response.data.data.content;
    
    if (metrics.length < 2) {
      return []; // Not enough data to calculate progress
    }

    const current = metrics[0];
    const previous = metrics[1];

    const calcTrend = (change: number): "up" | "down" | "stable" => {
      if (Math.abs(change) < 0.1) return "stable";
      return change > 0 ? "up" : "down";
    };

    return [
      { 
        metric: "weightKg", 
        startValue: previous.weightKg, 
        currentValue: current.weightKg, 
        change: Number((current.weightKg - previous.weightKg).toFixed(1)), 
        trend: calcTrend(current.weightKg - previous.weightKg) 
      },
      { 
        metric: "bodyFatPercent", 
        startValue: previous.bodyFatPercent || 0, 
        currentValue: current.bodyFatPercent || 0, 
        change: Number(((current.bodyFatPercent || 0) - (previous.bodyFatPercent || 0)).toFixed(1)), 
        trend: calcTrend((current.bodyFatPercent || 0) - (previous.bodyFatPercent || 0)) 
      },
      { 
        metric: "muscleMassKg", 
        startValue: previous.muscleMassKg || 0, 
        currentValue: current.muscleMassKg || 0, 
        change: Number(((current.muscleMassKg || 0) - (previous.muscleMassKg || 0)).toFixed(1)), 
        trend: calcTrend((current.muscleMassKg || 0) - (previous.muscleMassKg || 0)) 
      },
      { 
        metric: "bmi", 
        startValue: previous.bmi || 0, 
        currentValue: current.bmi || 0, 
        change: Number(((current.bmi || 0) - (previous.bmi || 0)).toFixed(1)), 
        trend: calcTrend((current.bmi || 0) - (previous.bmi || 0)) 
      },
    ];
  },

  // Admin/Trainer
  getMetrics: async (params?: any): Promise<BodyMetric[]> => {
    const response = await apiClient.get<ApiResponse<PageResponse<BodyMetric>>>("/admin/body-metrics", { params });
    return response.data.data.content;
  },

  getMetricById: async (id: number): Promise<BodyMetric> => {
    const response = await apiClient.get<ApiResponse<BodyMetric>>(`/admin/body-metrics/${id}`);
    return response.data.data;
  },

  getMetricsByMemberId: async (memberId: string, page = 0, size = 10): Promise<BodyMetric[]> => {
    const response = await apiClient.get<ApiResponse<PageResponse<BodyMetric>>>(`/admin/body-metrics/member/${memberId}?page=${page}&size=${size}`);
    return response.data.data.content;
  },

  getLatestMetricByMemberId: async (memberId: string): Promise<BodyMetric> => {
    const response = await apiClient.get<ApiResponse<BodyMetric>>(`/admin/body-metrics/member/${memberId}/latest`);
    return response.data.data;
  },

  createMetricForMember: async (data: import("../types/member.type").BodyMetricCreateRequest): Promise<BodyMetric> => {
    const response = await apiClient.post<ApiResponse<BodyMetric>>(`/admin/body-metrics`, data);
    return response.data.data;
  },

  updateMetric: async (id: number, data: import("../types/member.type").BodyMetricUpdateRequest): Promise<BodyMetric> => {
    const response = await apiClient.put<ApiResponse<BodyMetric>>(`/admin/body-metrics/${id}`, data);
    return response.data.data;
  },

  deleteMetric: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/body-metrics/${id}`);
  },
  async getAdminLatestMetric(memberId: number): Promise<BodyMetric | null> {
    const response = await apiClient.get<ApiResponse<BodyMetric | null>>(`/admin/body-metrics/member/${memberId}/latest`);
    return response.data.data;
  }
};
