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
    const response = await apiClient.get<MemberProfile>("/members/me/profile");
    return response.data;
  },

  async updateMyProfile(data: Partial<MemberProfile>): Promise<MemberProfile> {
    const response = await apiClient.put<MemberProfile>("/members/me/profile", data);
    return response.data;
  },

  async getBodyMetrics(): Promise<BodyMetric[]> {
    const response = await apiClient.get<ApiResponse<BodyMetric[]>>("/members/me/body-metrics");
    return response.data.data || [];
  },

  // Admin APIs
  async getMembers(): Promise<MemberProfile[]> {
    // Backend AdminMemberController.getAllMembers returns PageResponse<MemberResponse> directly
    const response = await apiClient.get<PageResponse<MemberProfile>>("/admin/members");
    return response.data.data || [];
  },

  async getMemberById(id: number): Promise<MemberProfile> {
    // Backend AdminMemberController.getMemberDetail returns MemberDetailResponse directly
    const response = await apiClient.get<MemberProfile>(`/admin/members/${id}`);
    return response.data;
  },

  async createMember(data: Omit<MemberProfile, "id">): Promise<MemberProfile> {
    // A member is created as a user with ROLE_MEMBER role.
    const requestData = {
      username: data.email ? data.email.split("@")[0] + "_" + data.phone.slice(-4) : "mem_" + Date.now(),
      email: data.email,
      password: "DefaultPassword123", // required for user creation DTO
      fullName: data.fullName,
      phone: data.phone,
      roleCode: "ROLE_MEMBER",
      status: data.status || "ACTIVE"
    };
    // Backend AdminUserController.createInternalUser wraps response in ApiResponse
    const response = await apiClient.post<ApiResponse<any>>("/admin/users", requestData);
    const user = response.data.data;
    return {
      ...data,
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      memberCode: user.username || data.memberCode,
      memberSince: new Date().toISOString().split("T")[0]
    };
  },

  async updateMember(id: number, data: Partial<MemberProfile>): Promise<MemberProfile> {
    const requestData = {
      username: data.email ? data.email.split("@")[0] : undefined,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      status: data.status
    };
    // Backend AdminUserController.updateUser wraps response in ApiResponse
    const response = await apiClient.put<ApiResponse<any>>(`/admin/users/${id}`, requestData);
    const user = response.data.data;
    return {
      ...data,
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      status: user.status
    } as MemberProfile;
  },

  async updateMemberStatus(id: number, status: Status): Promise<MemberProfile> {
    // Backend AdminUserController.updateUserStatus wraps response in ApiResponse
    const response = await apiClient.patch<ApiResponse<any>>(`/admin/users/${id}/status`, { status });
    const user = response.data.data;
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      status: user.status
    } as MemberProfile;
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

