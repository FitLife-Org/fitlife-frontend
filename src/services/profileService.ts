import apiClient from "./apiClient";
import type { ApiResponse, PageResult } from "../types/common.type";
import type { ProfileResponse, UpdateProfileRequest, MembershipResponse } from "../types/profile.type";

export const profileService = {
  async getProfile(): Promise<ProfileResponse> {
    const response = await apiClient.get<ApiResponse<ProfileResponse>>("/members/me");
    return (response.data.data !== undefined ? response.data.data : response.data) as ProfileResponse;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    const response = await apiClient.put<ApiResponse<ProfileResponse>>("/members/me", data);
    return (response.data.data !== undefined ? response.data.data : response.data) as ProfileResponse;
  },

  async updateAvatar(file: File): Promise<ProfileResponse> {
    try {
      const formData = new FormData();
      formData.append("avatarUrl", file);
      const response = await apiClient.patch<ApiResponse<ProfileResponse>>("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data.data;
    } catch (error) {
      console.warn("API /profile/avatar failed, using mock base64", error);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          setTimeout(() => {
            resolve({
              avatarUrl: reader.result as string,
            } as ProfileResponse);
          }, 800);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  },

  async getMyMembership(): Promise<MembershipResponse> {
    const response = await apiClient.get<ApiResponse<MembershipResponse>>("/profile/membership");
    return response.data.data;
  }
};
