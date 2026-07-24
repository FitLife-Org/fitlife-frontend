import apiClient from "./apiClient";
import type { PageResult, PageResponse, ApiResponse } from "../types/common.type";
import type { Equipment, AdminEquipmentCreateRequest, AdminEquipmentUpdateRequest, EquipmentSummary } from "../types/equipment.type";

const API_BASE = "/admin/equipment";

export const EquipmentService = {
  getAll: async (page: number = 0, size: number = 20, keyword?: string, status?: string): Promise<PageResult<Equipment>> => {
    try {
      const params = new URLSearchParams();
      // Spring Boot PageRequest is 1-indexed in EquipmentManagmentController
      params.append('page', (page + 1).toString());
      params.append('size', size.toString());
      if (keyword) params.append('keyword', keyword);
      if (status && status !== 'ALL') params.append('status', status);

      const response = await apiClient.get<ApiResponse<PageResponse<Equipment>>>(`/equipment?${params.toString()}`);
      const pageData = response.data.data;
      
      return {
        items: pageData.content || [],
        totalItems: pageData.totalElements || 0,
        totalPages: pageData.totalPages || 0,
        page: pageData.page ?? page,
        size: pageData.size || size
      };
    } catch {
      return { items: [], totalItems: 0, totalPages: 0, page: 0, size };
    }
  },

  getSummary: async (): Promise<EquipmentSummary> => {
    try {
      const response = await apiClient.get<ApiResponse<EquipmentSummary>>(`${API_BASE}/summary`);
      return response.data.data;
    } catch {
      return { totalCount: 0, activeCount: 0, maintenanceCount: 0, brokenCount: 0 };
    }
  },

  getById: async (id: string): Promise<Equipment> => {
    const response = await apiClient.get<ApiResponse<Equipment>>(`${API_BASE}/${id}`);
    return response.data.data;
  },

  create: async (data: AdminEquipmentCreateRequest): Promise<Equipment> => {
    const response = await apiClient.post<ApiResponse<Equipment>>(API_BASE, data);
    return response.data.data;
  },

  update: async (id: string, data: AdminEquipmentUpdateRequest): Promise<Equipment> => {
    const response = await apiClient.put<ApiResponse<Equipment>>(`${API_BASE}/${id}`, data);
    return response.data.data;
  },
  
  updateStatus: async (id: string, status: string): Promise<Equipment> => {
    const response = await apiClient.patch<ApiResponse<Equipment>>(`${API_BASE}/${id}/status`, { status });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`${API_BASE}/${id}`);
  },

  createMaintenance: async (id: string, data: object) => {
    const response = await apiClient.post<ApiResponse<unknown>>(`${API_BASE}/${id}/maintenance`, data);
    return response.data.data;
  },

  getMaintenanceSchedules: async (params?: Record<string, unknown>) => {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>(`${API_BASE}/maintenance-schedules`, { params });
      return response.data.data;
    } catch {
      return [];
    }
  },
};