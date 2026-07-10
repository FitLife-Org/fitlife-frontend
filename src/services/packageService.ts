import apiClient from "./apiClient";
import type { ApiResponse, Status } from "../types/common.type";
import type { GymPackage, PackageDuration, AdminPackageCreateRequest, AdminPackageUpdateRequest, AdminPackageDurationCreateRequest, AdminPackageDurationUpdateRequest } from "../types/package.type";

export const packageService = {
  async getPublicPackages(params?: any): Promise<GymPackage[]> {
    const response = await apiClient.get<ApiResponse<any>>("/gym-packages", { params });
    const responseData = response.data.data;
    if (responseData && Array.isArray(responseData.content)) {
      return responseData.content;
    } else if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    } else if (Array.isArray(responseData)) {
      return responseData;
    }
    return [];
  },

  async getPublicPackageById(id: number): Promise<GymPackage> {
    const response = await apiClient.get<ApiResponse<GymPackage>>(`/gym-packages/${id}`);
    return response.data.data as GymPackage;
  },

  async getAdminPackages(params?: any): Promise<GymPackage[]> {
    const response = await apiClient.get<ApiResponse<any>>("/admin/gym-packages", { params });
    const responseData = response.data.data;
    if (responseData && Array.isArray(responseData.content)) {
      return responseData.content;
    } else if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    } else if (Array.isArray(responseData)) {
      return responseData;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  async getAdminPackageById(id: number): Promise<GymPackage> {
    const response = await apiClient.get<ApiResponse<GymPackage>>(`/admin/gym-packages/${id}`);
    if (response.data.data) {
       return response.data.data as GymPackage;
    }
    return response.data as unknown as GymPackage;
  },

  async createPackage(data: AdminPackageCreateRequest): Promise<GymPackage> {
    const response = await apiClient.post<ApiResponse<GymPackage>>("/admin/gym-packages", data);
    return response.data.data;
  },

  async updatePackage(id: number, data: AdminPackageUpdateRequest): Promise<GymPackage> {
    const response = await apiClient.put<ApiResponse<GymPackage>>(`/admin/gym-packages/${id}`, data);
    return response.data.data;
  },

  async updatePackageStatus(id: number, status: Status): Promise<GymPackage> {
    const response = await apiClient.patch<ApiResponse<GymPackage>>(`/admin/gym-packages/${id}/status`, { status });
    return response.data.data;
  },

  async deletePackage(id: number): Promise<void> {
    await apiClient.delete(`/admin/gym-packages/${id}`);
  },

  async getPackageDurations(): Promise<PackageDuration[]> {
    const response = await apiClient.get<ApiResponse<any>>("/package-durations");
    const responseData = response.data.data;
    if (responseData && Array.isArray(responseData.content)) {
      return responseData.content;
    } else if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    } else if (Array.isArray(responseData)) {
      return responseData;
    }
    return [];
  },

  async getAdminPackageDurations(): Promise<PackageDuration[]> {
    const response = await apiClient.get<ApiResponse<any>>("/admin/package-durations");
    const responseData = response.data.data;
    if (responseData && Array.isArray(responseData.content)) {
      return responseData.content;
    } else if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    } else if (Array.isArray(responseData)) {
      return responseData;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  async getAdminPackageDurationById(id: number): Promise<PackageDuration> {
    const response = await apiClient.get<ApiResponse<PackageDuration>>(`/admin/package-durations/${id}`);
    if (response.data.data) {
      return response.data.data as PackageDuration;
    }
    return response.data as unknown as PackageDuration;
  },

  async createPackageDuration(data: AdminPackageDurationCreateRequest): Promise<PackageDuration> {
    const response = await apiClient.post<ApiResponse<PackageDuration>>("/admin/package-durations", data);
    return response.data.data;
  },

  async updatePackageDuration(id: number, data: AdminPackageDurationUpdateRequest): Promise<PackageDuration> {
    const response = await apiClient.put<ApiResponse<PackageDuration>>(`/admin/package-durations/${id}`, data);
    return response.data.data;
  },

  async updatePackageDurationStatus(id: number, status: Status): Promise<PackageDuration> {
    const response = await apiClient.patch<ApiResponse<PackageDuration>>(`/admin/package-durations/${id}/status`, { status });
    return response.data.data;
  },

  async deletePackageDuration(id: number): Promise<void> {
    await apiClient.delete(`/admin/package-durations/${id}`);
  }
};
