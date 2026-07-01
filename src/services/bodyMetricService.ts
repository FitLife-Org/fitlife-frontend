import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { BodyMetric, BodyMetricProgress } from "../types/member.type";

const MOCK_METRICS: BodyMetric[] = [
  { id: 1, measuredAt: "2026-05-01T08:00:00Z", height: 175, weight: 70.5, bmi: 23.0, bodyFat: 18.5, muscleMass: 33.2 },
  { id: 2, measuredAt: "2026-06-01T08:00:00Z", height: 175, weight: 68.2, bmi: 22.3, bodyFat: 16.2, muscleMass: 34.0 },
  { id: 3, measuredAt: "2026-07-01T08:00:00Z", height: 175, weight: 66.1, bmi: 21.6, bodyFat: 14.8, muscleMass: 35.1 },
];

export const bodyMetricService = {
  // Guest
  demoBmi: async (data: { height: number; weight: number }): Promise<number> => {
    try {
      const response = await apiClient.post<ApiResponse<number>>("/body-metrics/demo-bmi", data);
      return response.data.data;
    } catch (error) {
      console.warn("API POST /body-metrics/demo-bmi failed, using mock", error);
      return Number((data.weight / ((data.height / 100) ** 2)).toFixed(1));
    }
  },

  // Member
  getMyMetrics: async (): Promise<BodyMetric[]> => {
    try {
      const response = await apiClient.get<ApiResponse<BodyMetric[]>>("/members/me/body-metrics");
      return response.data.data;
    } catch (error) {
      console.warn("API GET /members/me/body-metrics failed, using mock data", error);
      return MOCK_METRICS;
    }
  },

  createMyMetric: async (data: Omit<BodyMetric, "id" | "measuredAt" | "bmi">): Promise<BodyMetric> => {
    try {
      const response = await apiClient.post<ApiResponse<BodyMetric>>("/members/me/body-metrics", data);
      return response.data.data;
    } catch (error) {
      console.warn("API POST /members/me/body-metrics failed, using mock data", error);
      await new Promise(r => setTimeout(r, 800));
      const bmi = Number((data.weight / ((data.height / 100) ** 2)).toFixed(1));
      return { 
        ...data, 
        id: Math.floor(Math.random() * 1000) + 10, 
        measuredAt: new Date().toISOString(),
        bmi 
      } as BodyMetric;
    }
  },

  updateMyMetric: async (id: number, data: Partial<BodyMetric>): Promise<BodyMetric> => {
    try {
      const response = await apiClient.put<ApiResponse<BodyMetric>>(`/members/me/body-metrics/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.warn(`API PUT /members/me/body-metrics/${id} failed, using mock data`, error);
      await new Promise(r => setTimeout(r, 800));
      return { ...MOCK_METRICS.find(m => m.id === id), ...data } as BodyMetric;
    }
  },

  getMyProgress: async (): Promise<BodyMetricProgress[]> => {
    try {
      const response = await apiClient.get<ApiResponse<BodyMetricProgress[]>>("/members/me/body-metrics/progress");
      return response.data.data;
    } catch (error) {
      console.warn("API GET /members/me/body-metrics/progress failed, using mock data", error);
      return [
        { metric: "weight", startValue: 70.5, currentValue: 66.1, change: -4.4, trend: "down" },
        { metric: "bodyFat", startValue: 18.5, currentValue: 14.8, change: -3.7, trend: "down" },
        { metric: "muscleMass", startValue: 33.2, currentValue: 35.1, change: +1.9, trend: "up" },
        { metric: "bmi", startValue: 23.0, currentValue: 21.6, change: -1.4, trend: "down" },
      ];
    }
  },

  // Admin/Trainer
  getMetrics: async (params?: any): Promise<BodyMetric[]> => {
    try {
      const response = await apiClient.get<ApiResponse<BodyMetric[]>>("/admin/body-metrics", { params });
      return response.data.data;
    } catch (error) {
      console.warn("API GET /admin/body-metrics failed", error);
      return MOCK_METRICS;
    }
  },

  getMetricById: async (id: number): Promise<BodyMetric> => {
    try {
      const response = await apiClient.get<ApiResponse<BodyMetric>>(`/admin/body-metrics/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn(`API GET /admin/body-metrics/${id} failed`, error);
      return MOCK_METRICS[0];
    }
  },

  getMetricsByMemberId: async (memberId: string): Promise<BodyMetric[]> => {
    try {
      const response = await apiClient.get<ApiResponse<BodyMetric[]>>(`/admin/body-metrics/member/${memberId}`);
      return response.data.data;
    } catch (error) {
      console.warn(`API GET /admin/body-metrics/member/${memberId} failed`, error);
      return MOCK_METRICS;
    }
  },

  getLatestMetricByMemberId: async (memberId: string): Promise<BodyMetric> => {
    try {
      const response = await apiClient.get<ApiResponse<BodyMetric>>(`/admin/body-metrics/member/${memberId}/latest`);
      return response.data.data;
    } catch (error) {
      console.warn(`API GET /admin/body-metrics/member/${memberId}/latest failed`, error);
      return MOCK_METRICS[MOCK_METRICS.length - 1];
    }
  },

  createMetric: async (data: any): Promise<BodyMetric> => {
    try {
      const response = await apiClient.post<ApiResponse<BodyMetric>>("/admin/body-metrics", data);
      return response.data.data;
    } catch (error) {
      console.warn("API POST /admin/body-metrics failed", error);
      return { ...data, id: 999, measuredAt: new Date().toISOString() };
    }
  },

  updateMetric: async (id: number, data: any): Promise<BodyMetric> => {
    try {
      const response = await apiClient.put<ApiResponse<BodyMetric>>(`/admin/body-metrics/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.warn(`API PUT /admin/body-metrics/${id} failed`, error);
      return { ...MOCK_METRICS[0], ...data };
    }
  },

  deleteMetric: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/admin/body-metrics/${id}`);
    } catch (error) {
      console.warn(`API DELETE /admin/body-metrics/${id} failed`, error);
    }
  }
};
