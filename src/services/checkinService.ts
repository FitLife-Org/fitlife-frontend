import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { CheckinRecord, GenerateQrResponse, ManualCheckinRequest, ScanCheckinRequest } from "../types/checkin.type";

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
  async lookupMember(query: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/check-ins/lookup?query=${query}`);
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

  async getTodayStatistics(): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>("/check-ins/statistics/today");
    return response.data.data;
  }
};
