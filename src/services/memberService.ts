import apiClient from "./apiClient";
import type { ApiResponse, Status } from "../types/common.type";
import type { BodyMetric, MemberProfile } from "../types/member.type";
import type { Subscription } from "../types/subscription.type";
import type { CheckinRecord } from "../types/checkin.type";

interface PageResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}

export const memberService = {
  async getMyProfile(): Promise<MemberProfile> {
    const response = await apiClient.get<ApiResponse<MemberProfile>>("/members/me");
    return response.data.data as MemberProfile;
  },

  async updateMyProfile(data: Partial<MemberProfile>): Promise<MemberProfile> {
    const response = await apiClient.put<ApiResponse<MemberProfile>>("/members/me", data);
    return response.data.data as MemberProfile;
  },

  async getBodyMetrics(): Promise<BodyMetric[]> {
    const response = await apiClient.get<ApiResponse<BodyMetric[]>>("/members/me/body-metrics");
    return response.data.data || [];
  },

  // Admin APIs
  async getMembers(page: number = 0, size: number = 20): Promise<MemberProfile[]> {
    const response = await apiClient.get<PageResponse<MemberProfile>>(`/admin/members?page=${page}&size=${size}`);
    return response.data.data || [];
  },

  async getMemberById(id: number): Promise<MemberProfile> {
    const response = await apiClient.get<ApiResponse<MemberProfile>>(`/admin/members/${id}`);
    return response.data.data as MemberProfile;
  },

  async getMemberByCode(memberCode: string): Promise<MemberProfile> {
    const response = await apiClient.get<ApiResponse<MemberProfile>>(`/admin/members/code/${memberCode}`);
    return response.data.data as MemberProfile;
  },

  async createMember(data: Omit<MemberProfile, "id">): Promise<MemberProfile> {
    const response = await apiClient.post<ApiResponse<MemberProfile>>("/admin/members", data);
    return response.data.data as MemberProfile;
  },

  async updateMember(id: number, data: Partial<MemberProfile>): Promise<MemberProfile> {
    const response = await apiClient.put<ApiResponse<MemberProfile>>(`/admin/members/${id}`, data);
    return response.data.data as MemberProfile;
  },

  async updateMemberStatus(id: number, status: Status): Promise<MemberProfile> {
    const response = await apiClient.patch<ApiResponse<MemberProfile>>(`/admin/members/${id}/status`, { status });
    return response.data.data as MemberProfile;
  },

  async deleteMember(id: number): Promise<void> {
    await apiClient.delete(`/admin/members/${id}`);
  },

  async getMemberSubscriptions(id: number): Promise<Subscription[]> {
    const response = await apiClient.get<ApiResponse<Subscription[]>>(`/admin/members/${id}/subscriptions`);
    return response.data.data || [];
  },

  async getMemberCheckins(id: number): Promise<CheckinRecord[]> {
    const response = await apiClient.get<ApiResponse<CheckinRecord[]>>(`/admin/members/${id}/checkins`);
    return response.data.data || [];
  },
};

