import apiClient from "./apiClient";
import type { PageResult, PageResponse, ApiResponse } from "../types/common.type";
import type { Equipment, AdminEquipmentCreateRequest, AdminEquipmentUpdateRequest, EquipmentSummary } from "../types/equipment.type";

const API_BASE = "/equipment";
const ADMIN_API_BASE = "/admin/equipment";

export const EquipmentService = {
  getAll: async (page: number = 1, size: number = 20, keyword?: string, status?: string): Promise<PageResult<Equipment>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (keyword) params.append('keyword', keyword);
    if (status && status !== 'ALL') params.append('status', status);

    const response = await apiClient.get<ApiResponse<PageResponse<Equipment>>>(`${API_BASE}?${params.toString()}`);
    const pageData = response.data.data;
    
    return {
      items: pageData.content || [],
      totalItems: pageData.totalElements || 0,
      totalPages: pageData.totalPages || 0,
      page: pageData.page !== undefined ? pageData.page + 1 : page,
      size: pageData.size || size
    };
  },

  getSummary: async (): Promise<EquipmentSummary> => {
    const response = await apiClient.get<ApiResponse<EquipmentSummary>>(`${ADMIN_API_BASE}/summary`);
    return response.data.data;
  },

  getById: async (id: string): Promise<Equipment> => {
    const response = await apiClient.get<ApiResponse<Equipment>>(`${ADMIN_API_BASE}/${id}`);
    return response.data.data;
  },

  create: async (data: AdminEquipmentCreateRequest): Promise<Equipment> => {
    const response = await apiClient.post<ApiResponse<Equipment>>(ADMIN_API_BASE, data);
    return response.data.data;
  },

  update: async (id: string, data: AdminEquipmentUpdateRequest): Promise<Equipment> => {
    const response = await apiClient.put<ApiResponse<Equipment>>(`${ADMIN_API_BASE}/${id}`, data);
    return response.data.data;
  },
  
  updateStatus: async (id: string, status: string): Promise<Equipment> => {
    const response = await apiClient.patch<ApiResponse<Equipment>>(`${ADMIN_API_BASE}/${id}/status`, { status });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`${ADMIN_API_BASE}/${id}`);
  },

  createMaintenance: async (id: string, data: object) => {
    const response = await apiClient.post<ApiResponse<unknown>>(`${ADMIN_API_BASE}/${id}/maintenance`, data);
    return response.data.data;
  },

  getMaintenanceSchedules: async (params?: Record<string, unknown>) => {
    const response = await apiClient.get<ApiResponse<unknown>>(`${ADMIN_API_BASE}/maintenance-schedules`, { params });
    return response.data.data;
  },
};