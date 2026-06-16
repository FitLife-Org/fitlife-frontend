import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { BodyMetric, MemberProfile } from "../types/member.type";

export const memberService = {
  async getMyProfile(): Promise<MemberProfile> {
    const response = await apiClient.get<ApiResponse<MemberProfile>>("/members/me");
    return response.data.data;
  },

  async updateMyProfile(data: Partial<MemberProfile>): Promise<MemberProfile> {
    const response = await apiClient.put<ApiResponse<MemberProfile>>("/members/me", data);
    return response.data.data;
  },

  async getBodyMetrics(): Promise<BodyMetric[]> {
    const response = await apiClient.get<ApiResponse<BodyMetric[]>>("/members/me/body-metrics");
    return response.data.data;
  },
};
