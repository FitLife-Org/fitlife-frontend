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
    const response = await apiClient.get<MemberProfile>("/members/me");
    return response.data;
  },

  async updateMyProfile(data: Partial<MemberProfile>): Promise<MemberProfile> {
    const response = await apiClient.put<MemberProfile>("/members/me", data);
    return response.data;
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

    const response = await apiClient.get<MemberProfile>(`/admin/members/${id}`);
    return response.data;
  },

  async getMemberByCode(memberCode: string): Promise<MemberProfile> {
    const response = await apiClient.get<MemberProfile>(`/admin/members/code/${memberCode}`);
    return response.data;
  },

  async createMember(data: Omit<MemberProfile, "id">): Promise<MemberProfile> {
    const response = await apiClient.post<MemberProfile>("/admin/members", data);
    return response.data;
  },

  async updateMember(id: number, data: Partial<MemberProfile>): Promise<MemberProfile> {
    const response = await apiClient.put<MemberProfile>(`/admin/members/${id}`, data);
    return response.data;
  },

  async updateMemberStatus(id: number, status: Status): Promise<MemberProfile> {
    const response = await apiClient.patch<MemberProfile>(`/admin/members/${id}/status`, { status });
    return response.data;
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

