import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { GymPackage } from "../types/package.type";

export const packageService = {
  async getPackages(): Promise<GymPackage[]> {
    const response = await apiClient.get<ApiResponse<GymPackage[]>>("/packages");
    return response.data.data;
  },

  async createPackage(data: Omit<GymPackage, "id">): Promise<GymPackage> {
    const response = await apiClient.post<ApiResponse<GymPackage>>("/packages", data);
    return response.data.data;
  },
};
