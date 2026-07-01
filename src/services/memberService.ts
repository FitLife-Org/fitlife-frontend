import apiClient from "./apiClient";
import type { ApiResponse, Status, PageResult } from "../types/common.type";
import type { BodyMetric, MemberProfile, AdminMemberCreateRequest, AdminMemberUpdateRequest } from "../types/member.type";
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
  async getMembers(page: number = 1, size: number = 20, keyword?: string, status?: string): Promise<PageResult<MemberProfile>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (keyword) params.append('keyword', keyword);
    if (status && status !== 'ALL') params.append('status', status);

    const response = await apiClient.get<any>(`/admin/members?${params.toString()}`);
    // Backend returns PageResponse directly (not wrapped in ApiResponse)
    const pageData = response.data;
    
    return {
      items: pageData.content || [],
      totalItems: pageData.totalElements || 0,
      totalPages: pageData.totalPages || 0,
      page: pageData.page || page,
      size: pageData.size || size
    };
  },

  async getMemberById(id: number): Promise<MemberProfile> {
    const response = await apiClient.get<ApiResponse<MemberProfile>>(`/admin/members/${id}`);
    return response.data.data as MemberProfile;
  },

  async getMemberByCode(memberCode: string): Promise<MemberProfile> {
    const response = await apiClient.get<ApiResponse<MemberProfile>>(`/admin/members/code/${memberCode}`);
    return response.data.data as MemberProfile;
  },

  async createMember(data: AdminMemberCreateRequest): Promise<MemberProfile> {
    const response = await apiClient.post<ApiResponse<MemberProfile>>("/admin/members", data);
    return response.data.data as MemberProfile;
  },

  async updateMember(id: number, data: AdminMemberUpdateRequest): Promise<MemberProfile> {
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

