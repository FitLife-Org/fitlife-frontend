import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { HomeData, PublicPackage, PublicTrainer, ContactRequestForm } from "../types/public.type";

export const publicService = {
  getHomeData: async (): Promise<HomeData> => {
    const response = await apiClient.get<ApiResponse<HomeData>>("/public/home");
    return response.data.data;
  },

  getPackages: async (): Promise<PublicPackage[]> => {
    const response = await apiClient.get<ApiResponse<PublicPackage[]>>("/public/packages");
    return response.data.data;
  },

  getPackageDetails: async (id: string): Promise<PublicPackage> => {
    const response = await apiClient.get<ApiResponse<PublicPackage>>(`/public/packages/${id}`);
    return response.data.data;
  },

  getTrainers: async (): Promise<PublicTrainer[]> => {
    const response = await apiClient.get<ApiResponse<PublicTrainer[]>>("/public/trainers");
    return response.data.data;
  },

  submitContactRequest: async (data: ContactRequestForm): Promise<void> => {
    await apiClient.post<ApiResponse<void>>("/public/contact-requests", data);
  }
};
