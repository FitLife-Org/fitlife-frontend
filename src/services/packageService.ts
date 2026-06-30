import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { GymPackage } from "../types/package.type";

export const packageService = {
  async getPublicPackages(params?: any): Promise<GymPackage[]> {
    const response = await apiClient.get<ApiResponse<any>>("/public/packages", { params });
    const responseData = response.data.data;
    if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    } else if (Array.isArray(responseData)) {
      return responseData;
    }
    return [];
  },

  async getPublicPackageById(id: number): Promise<GymPackage> {
    const response = await apiClient.get<ApiResponse<GymPackage>>(`/public/packages/${id}`);
    return response.data.data as GymPackage;
  },

  async getAdminPackages(params?: any): Promise<GymPackage[]> {
    const response = await apiClient.get<ApiResponse<any>>("/admin/packages", { params });
    const responseData = response.data.data;
    if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    } else if (Array.isArray(responseData)) {
      return responseData;
    }
    return [];
  },

  async getAdminPackageById(id: number): Promise<GymPackage> {
    const response = await apiClient.get<ApiResponse<GymPackage>>(`/admin/packages/${id}`);
    return response.data.data as GymPackage;
  },

  async createPackage(data: Omit<GymPackage, "id">): Promise<GymPackage> {
    const response = await apiClient.post<ApiResponse<GymPackage>>("/admin/packages", data);
    return response.data.data as GymPackage;
  },

  async updatePackage(id: number, data: Partial<GymPackage>): Promise<GymPackage> {
    const response = await apiClient.put<ApiResponse<GymPackage>>(`/admin/packages/${id}`, data);
    return response.data.data as GymPackage;
  },

  async updatePackageVisibility(id: number, isVisible: boolean): Promise<GymPackage> {
    const response = await apiClient.patch<ApiResponse<GymPackage>>(`/admin/packages/${id}/visibility`, { isVisible });
    return response.data.data as GymPackage;
  },

  async deletePackage(id: number): Promise<void> {
    await apiClient.delete(`/admin/packages/${id}`);
  }
};
