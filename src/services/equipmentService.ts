import apiClient from "./apiClient";

const API_BASE = "/equipment";

export const EquipmentService = {
  getAll: (params?: any) => apiClient.get(API_BASE, { params }),

  getById: (id: string) => apiClient.get(`${API_BASE}/${id}`),

  create: (data: FormData | object) => apiClient.post(API_BASE, data),

  update: (id: string, data: FormData | object) => apiClient.put(`${API_BASE}/${id}`, data),
  
  updateStatus: (id: string, status: string) => apiClient.patch(`${API_BASE}/${id}/status`, { status }),

  createMaintenance: (id: string, data: object) => apiClient.post(`${API_BASE}/${id}/maintenance`, data),

  getMaintenanceSchedules: (params?: any) => apiClient.get(`${API_BASE}/maintenance-schedules`, { params }),
};