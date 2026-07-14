import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { CheckinRecord, GenerateQrResponse, ManualCheckinRequest, ScanCheckinRequest, MemberLookupResult } from "../types/checkin.type";

export const checkinService = {
  async generateQr(): Promise<GenerateQrResponse> {
    const response = await apiClient.post<ApiResponse<GenerateQrResponse>>("/check-ins/qr");
    return response.data.data;
  },

  async getCheckinHistory(params?: any): Promise<CheckinRecord[]> {
    const response = await apiClient.get<ApiResponse<CheckinRecord[]>>("/check-ins", { params });
    return response.data.data;
  },

  async scanQr(data: ScanCheckinRequest): Promise<CheckinRecord> {
    const response = await apiClient.post<ApiResponse<CheckinRecord>>("/check-ins/qr", data);
    return response.data.data;
  },

  async manualCheckin(data: ManualCheckinRequest): Promise<CheckinRecord> {
    const response = await apiClient.post<ApiResponse<CheckinRecord>>("/check-ins/manual", data);
    return response.data.data;
  },

  // Lookup for manual checkin
  async lookupMember(query: string): Promise<MemberLookupResult[]> {
    const response = await apiClient.get<ApiResponse<MemberLookupResult[]>>(`/check-ins/lookup?query=${query}`);
    return response.data.data;
  },

  async getCheckinById(id: number): Promise<CheckinRecord> {
    const response = await apiClient.get<ApiResponse<CheckinRecord>>(`/check-ins/${id}`);
    return response.data.data;
  },

  async cancelCheckin(id: number, reason: string): Promise<CheckinRecord> {
    const response = await apiClient.patch<ApiResponse<CheckinRecord>>(`/check-ins/${id}/cancel`, { reason });
    return response.data.data;
  },

  async getMyCheckins(): Promise<CheckinRecord[]> {
    const response = await apiClient.get<ApiResponse<CheckinRecord[]>>("/check-ins/my");
    return response.data.data;
  },

  async selfCheckin(data: { gymCode: string }): Promise<CheckinRecord> {
    const response = await apiClient.post<ApiResponse<CheckinRecord>>("/check-ins/self", data);
    return response.data.data;
  },

  async getTodayStatistics(): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>("/check-ins/statistics/today");
    return response.data.data;
  },

  async getActiveMembers(): Promise<CheckinRecord[]> {
    // Tạm thời mock API vì backend chưa có API trả về danh sách hội viên đang trong phòng tập
    return [
      { id: 101, memberId: 1, memberName: "Nguyễn Văn A", memberCode: "MEM001", checkInTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: "SUCCESS" },
      { id: 102, memberId: 2, memberName: "Trần Thị B", memberCode: "MEM002", checkInTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(), status: "SUCCESS" },
      { id: 103, memberId: 3, memberName: "Lê Hoàng C", memberCode: "MEM003", checkInTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: "SUCCESS" },
    ];
  }
};
