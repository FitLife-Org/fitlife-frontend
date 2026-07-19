import apiClient from "../lib/apiClient";
import type { ApiResponse, PageResponse } from "../types/common.type";
import type { 
  CheckinRecord, 
  AdminCheckInQrResponse, 
  StaffManualCheckInRequest, 
  StaffMemberQrCheckInRequest, 
  MemberCheckInRequest,
  MemberCheckOutRequest,
  MemberLookupResult,
  CheckInCancelRequest,
  CheckInTodayStatisticsResponse
} from "../types/checkin.type";

// ==========================================
export const adminQrService = {
  async getAllGymQrs(): Promise<AdminCheckInQrResponse[]> {
    const response = await apiClient.get<ApiResponse<AdminCheckInQrResponse[]>>("/admin/check-in-qrs");
    return response.data.data;
  },

  async regenerateGymQrToken(id: number): Promise<AdminCheckInQrResponse> {
    const response = await apiClient.post<ApiResponse<AdminCheckInQrResponse>>(`/admin/check-in-qrs/${id}/regenerate`);
    return response.data.data;
  }
};

// ==========================================
export const staffCheckinService = {
  async lookupMember(query: string): Promise<MemberLookupResult> {
    const response = await apiClient.get<ApiResponse<MemberLookupResult>>(`/check-ins/lookup?keyword=${query}`);
    return response.data.data;
  },

  async manualCheckin(data: StaffManualCheckInRequest): Promise<CheckinRecord> {
    const response = await apiClient.post<ApiResponse<CheckinRecord>>("/check-ins/manual", data);
    return response.data.data;
  },

  async scanMemberQr(data: StaffMemberQrCheckInRequest): Promise<CheckinRecord> {
    const response = await apiClient.post<ApiResponse<CheckinRecord>>("/check-ins/member-qr", data);
    return response.data.data;
  },

  async manualCheckout(id: number): Promise<CheckinRecord> {
    const response = await apiClient.post<ApiResponse<CheckinRecord>>(`/check-ins/${id}/check-out`);
    return response.data.data;
  },

  async getMembersCurrentlyInside(page = 0, size = 10): Promise<CheckinRecord[]> {
    const response = await apiClient.get<ApiResponse<PageResponse<CheckinRecord>>>(`/check-ins/current?page=${page}&size=${size}`);
    return response.data.data.content;
  },

  async getCheckinHistory(params?: any): Promise<CheckinRecord[]> {
    const response = await apiClient.get<ApiResponse<PageResponse<CheckinRecord>>>("/check-ins", { params });
    return response.data.data.content;
  },

  async cancelCheckin(id: number, data: CheckInCancelRequest): Promise<CheckinRecord> {
    const response = await apiClient.patch<ApiResponse<CheckinRecord>>(`/check-ins/${id}/cancel`, data);
    return response.data.data;
  },

  async getTodayStatistics(): Promise<CheckInTodayStatisticsResponse> {
    const response = await apiClient.get<ApiResponse<CheckInTodayStatisticsResponse>>("/check-ins/statistics/today");
    return response.data.data;
  }
};

// ==========================================
export const memberCheckinService = {
  async selfCheckin(data: MemberCheckInRequest): Promise<CheckinRecord> {
    const response = await apiClient.post<ApiResponse<CheckinRecord>>("/member/check-ins/qr", data);
    return response.data.data;
  },

  async selfCheckout(data: MemberCheckOutRequest): Promise<CheckinRecord> {
    const response = await apiClient.post<ApiResponse<CheckinRecord>>("/member/check-outs/qr", data);
    return response.data.data;
  },

  async getMyCurrentStatus(): Promise<CheckinRecord> {
    const response = await apiClient.get<ApiResponse<CheckinRecord>>("/member/check-ins/current");
    return response.data.data;
  },

  async getMyHistory(params?: any): Promise<CheckinRecord[]> {
    const response = await apiClient.get<ApiResponse<PageResponse<CheckinRecord>>>("/member/check-ins/history", { params });
    return response.data.data.content;
  }
};

export const checkinService = {
  ...staffCheckinService,
  ...memberCheckinService,
  ...adminQrService
};
