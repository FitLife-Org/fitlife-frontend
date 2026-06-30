import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { ProfileResponse, UpdateProfileRequest, MembershipResponse } from "../types/profile.type";

export const profileService = {
  async getProfile(): Promise<ProfileResponse> {
    const response = await apiClient.get<ApiResponse<ProfileResponse>>("/members/me");
    return (response.data.data !== undefined ? response.data.data : response.data) as ProfileResponse;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    const response = await apiClient.put<ApiResponse<ProfileResponse>>("/members/me", data);
    return (response.data.data !== undefined ? response.data.data : response.data) as ProfileResponse;
  }
};

