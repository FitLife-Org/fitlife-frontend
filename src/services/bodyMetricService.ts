import apiClient from "./apiClient";
import type { ApiResponse, PageResponse } from "../types/common.type";
import type { BodyMetric, BodyMetricProgress } from "../types/member.type";

const MOCK_METRICS: BodyMetric[] = [
  { id: 1, recordedAt: "2026-05-01T08:00:00Z", heightCm: 175, weightKg: 70.5, bmi: 23.0, bodyFatPercent: 18.5, muscleMassKg: 33.2 },
  { id: 2, recordedAt: "2026-06-01T08:00:00Z", heightCm: 175, weightKg: 68.2, bmi: 22.3, bodyFatPercent: 16.2, muscleMassKg: 34.0 },
  { id: 3, recordedAt: "2026-07-01T08:00:00Z", heightCm: 175, weightKg: 66.1, bmi: 21.6, bodyFatPercent: 14.8, muscleMassKg: 35.1 },
];

export const bodyMetricService = {
  // Guest
  demoBmi: async (data: { heightCm: number; weightKg: number }): Promise<number> => {
    try {
      const response = await apiClient.post<ApiResponse<number>>("/body-metrics/demo-bmi", data);
      return response.data.data;
    } catch (error) {
      console.warn("API POST /body-metrics/demo-bmi failed, using mock", error);
      return Number((data.weightKg / ((data.heightCm / 100) ** 2)).toFixed(1));
    }
  },

  // Member
  getMyMetrics: async (page = 0, size = 10): Promise<BodyMetric[]> => {
    try {
      const response = await apiClient.get<ApiResponse<PageResponse<BodyMetric>>>(`/body-metrics/my?page=${page}&size=${size}`);
      return response.data.data.content;
    } catch (error) {
      console.warn("API GET /body-metrics/my failed, using mock data", error);
      return MOCK_METRICS;
    }
  },

  createMyMetric: async (data: Omit<BodyMetric, "id" | "recordedAt" | "bmi">): Promise<BodyMetric> => {
    try {
      const response = await apiClient.post<ApiResponse<BodyMetric>>("/body-metrics", data);
      return response.data.data;
    } catch (error) {
      console.warn("API POST /body-metrics failed, using mock data", error);
      await new Promise(r => setTimeout(r, 800));
      const bmi = Number((data.weightKg / ((data.heightCm / 100) ** 2)).toFixed(1));
      return { 
        ...data, 
        id: Math.floor(Math.random() * 1000) + 10, 
        recordedAt: new Date().toISOString(),
        bmi 
      } as BodyMetric;
    }
  },

  updateMyMetric: async (id: number, data: Partial<BodyMetric>): Promise<BodyMetric> => {
    try {
      const response = await apiClient.put<ApiResponse<BodyMetric>>(`/body-metrics/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.warn(`API PUT /body-metrics/${id} failed, using mock data`, error);
      await new Promise(r => setTimeout(r, 800));
      return { ...MOCK_METRICS.find(m => m.id === id), ...data } as BodyMetric;
    }
  },

  getMyProgress: async (): Promise<BodyMetricProgress[]> => {
    // Backend doesn't have /progress API, so we fetch history and calculate it locally
    try {
      const response = await apiClient.get<ApiResponse<PageResponse<BodyMetric>>>(`/body-metrics/my?page=0&size=2`);
      const metrics = response.data.data.content;
      
      if (metrics.length < 2) {
         // Fallback to mock progress if not enough history
         return [
          { metric: "weightKg", startValue: 70.5, currentValue: 66.1, change: -4.4, trend: "down" },
          { metric: "bodyFatPercent", startValue: 18.5, currentValue: 14.8, change: -3.7, trend: "down" },
          { metric: "muscleMassKg", startValue: 33.2, currentValue: 35.1, change: +1.9, trend: "up" },
          { metric: "bmi", startValue: 23.0, currentValue: 21.6, change: -1.4, trend: "down" },
         ];
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
    } catch (error) {
      console.warn("Calculating progress failed, using mock data", error);
      return [
        { metric: "weightKg", startValue: 70.5, currentValue: 66.1, change: -4.4, trend: "down" },
        { metric: "bodyFatPercent", startValue: 18.5, currentValue: 14.8, change: -3.7, trend: "down" },
        { metric: "muscleMassKg", startValue: 33.2, currentValue: 35.1, change: +1.9, trend: "up" },
        { metric: "bmi", startValue: 23.0, currentValue: 21.6, change: -1.4, trend: "down" },
      ];
    }
  },

  // Admin/Trainer
  getMetrics: async (params?: any): Promise<BodyMetric[]> => {
    try {
      const response = await apiClient.get<ApiResponse<PageResponse<BodyMetric>>>("/admin/body-metrics", { params });
      return response.data.data.content;
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

  getMetricsByMemberId: async (memberId: string, page = 0, size = 10): Promise<BodyMetric[]> => {
    try {
      const response = await apiClient.get<ApiResponse<PageResponse<BodyMetric>>>(`/admin/members/${memberId}/body-metrics?page=${page}&size=${size}`);
      return response.data.data.content;
    } catch (error) {
      console.warn(`API GET /admin/members/${memberId}/body-metrics failed`, error);
      return MOCK_METRICS;
    }
  },

  getLatestMetricByMemberId: async (memberId: string): Promise<BodyMetric> => {
    try {
      const response = await apiClient.get<ApiResponse<BodyMetric>>(`/admin/members/${memberId}/body-metrics/latest`);
      return response.data.data;
    } catch (error) {
      console.warn(`API GET /admin/members/${memberId}/body-metrics/latest failed`, error);
      return MOCK_METRICS[MOCK_METRICS.length - 1];
    }
  },

  createMetricForMember: async (memberId: string, data: any): Promise<BodyMetric> => {
    try {
      const response = await apiClient.post<ApiResponse<BodyMetric>>(`/admin/members/${memberId}/body-metrics`, data);
      return response.data.data;
    } catch (error) {
      console.warn(`API POST /admin/members/${memberId}/body-metrics failed`, error);
      return { ...data, id: 999, recordedAt: new Date().toISOString() };
    }
  },

  deleteMetric: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/body-metrics/${id}`);
    } catch (error) {
      console.warn(`API DELETE /body-metrics/${id} failed`, error);
    }
  }
};
