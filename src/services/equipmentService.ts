import apiClient from "./apiClient";
import type { PageResult } from "../types/common.type";
import type { Equipment, AdminEquipmentCreateRequest, AdminEquipmentUpdateRequest } from "../types/equipment.type";

const API_BASE = "/admin/equipment";

export const EquipmentService = {
  getAll: async (page: number = 1, size: number = 20, keyword?: string, status?: string): Promise<PageResult<Equipment>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (keyword) params.append('keyword', keyword);
    if (status && status !== 'ALL') params.append('status', status);

    const response = await apiClient.get<any>(`${API_BASE}?${params.toString()}`);
    const pageData = response.data;
    
    return {
      items: pageData.content || [],
      totalItems: pageData.totalElements || 0,
      totalPages: pageData.totalPages || 0,
      page: pageData.page || page,
      size: pageData.size || size
    };
  },

  getById: async (id: string): Promise<Equipment> => {
    const response = await apiClient.get(`${API_BASE}/${id}`);
    return response.data;
  },

  create: async (data: AdminEquipmentCreateRequest): Promise<Equipment> => {
    const response = await apiClient.post(API_BASE, data);
    return response.data;
  },

  update: async (id: string, data: AdminEquipmentUpdateRequest): Promise<Equipment> => {
    const response = await apiClient.put(`${API_BASE}/${id}`, data);
    return response.data;
  },
  
  updateStatus: async (id: string, status: string): Promise<Equipment> => {
    const response = await apiClient.patch(`${API_BASE}/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/${id}`);
  },

  createMaintenance: async (id: string, data: object) => {
    const response = await apiClient.post(`${API_BASE}/${id}/maintenance`, data);
    return response.data;
  },

  getMaintenanceSchedules: async (params?: any) => {
    const response = await apiClient.get(`${API_BASE}/maintenance-schedules`, { params });
    return response.data;
  },
};