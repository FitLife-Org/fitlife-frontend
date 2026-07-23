import apiClient from "./apiClient";
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

import {
  getStoredCheckinHistory,
  addCheckinRecordToStorage,
  checkoutMemberInStorage,
  getMembersCurrentlyInsideFromStorage,
  getTodayStatisticsFromStorage,
  saveCheckinHistoryToStorage
} from "../utils/validators/checkinStorageUtil";

// ==========================================
export const adminQrService = {
  async getAllGymQrs(): Promise<AdminCheckInQrResponse[]> {
    try {
      const response = await apiClient.get<ApiResponse<AdminCheckInQrResponse[]>>("/admin/check-in-qrs");
      return response.data.data;
    } catch {
      return [
        {
          id: 1,
          name: "Cổng Lễ Tân - Phòng Tập 1",
          token: "GYM_MAIN_GATE_01",
          location: "Tầng 1 - Quầy Lễ Tân",
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
    }
  },

  async regenerateGymQrToken(id: number): Promise<AdminCheckInQrResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AdminCheckInQrResponse>>(`/admin/check-in-qrs/${id}/regenerate`);
      return response.data.data;
    } catch {
      return {
        id,
        name: "Cổng Lễ Tân - Phòng Tập 1",
        token: `GYM_REGEN_${Date.now()}`,
        location: "Tầng 1 - Quầy Lễ Tân",
        isActive: true,
        createdAt: new Date().toISOString(),
        regeneratedAt: new Date().toISOString()
      };
    }
  }
};

// ==========================================
export const staffCheckinService = {
  async lookupMember(query: string): Promise<MemberLookupResult> {
    try {
      const response = await apiClient.get<ApiResponse<MemberLookupResult>>(`/check-ins/lookup?keyword=${encodeURIComponent(query)}`);
      return response.data.data;
    } catch {
      return {
        memberId: 1,
        memberCode: query.toUpperCase() || "MEM001",
        fullName: "Hội Viên Trực Tuyến",
        email: "member@fitlife.com",
        phone: query,
        userStatus: "ACTIVE",
        currentSubscription: {
          packageName: "Gói VIP Gym & Spa",
          status: "ACTIVE"
        },
        canCheckIn: true,
        checkInMessage: "Đủ điều kiện check-in"
      };
    }
  },

  async manualCheckin(data: StaffManualCheckInRequest): Promise<CheckinRecord> {
    try {
      const response = await apiClient.post<ApiResponse<CheckinRecord>>("/check-ins/manual", data);
      const record = response.data.data;
      addCheckinRecordToStorage(record);
      return record;
    } catch {
      return addCheckinRecordToStorage({
        memberId: data.memberId || 1,
        memberName: "Hội Viên (Checkin Thủ Công)",
        memberCode: data.memberCode || "MEM001",
        checkInTime: new Date().toISOString(),
        status: "SUCCESS",
        type: "CHECK_IN",
        note: data.reason || "Manual Check-in via Staff UI"
      });
    }
  },

  async scanMemberQr(data: StaffMemberQrCheckInRequest): Promise<CheckinRecord> {
    try {
      const response = await apiClient.post<ApiResponse<CheckinRecord>>("/check-ins/member-qr", data);
      const record = response.data.data;
      addCheckinRecordToStorage(record);
      return record;
    } catch {
      return addCheckinRecordToStorage({
        memberId: 1,
        memberName: "Hội Viên Quét Thẻ QR",
        memberCode: "MEM001",
        checkInTime: new Date().toISOString(),
        status: "SUCCESS",
        type: "CHECK_IN",
        note: data.reason || "Staff scanned QR"
      });
    }
  },

  async manualCheckout(id: number): Promise<CheckinRecord> {
    try {
      const response = await apiClient.post<ApiResponse<CheckinRecord>>(`/check-ins/${id}/check-out`);
      return response.data.data;
    } catch {
      const updated = checkoutMemberInStorage(id);
      if (updated) return updated;
      return {
        id,
        memberId: id,
        checkInTime: new Date().toISOString(),
        checkOutTime: new Date().toISOString(),
        status: "SUCCESS",
        type: "CHECK_OUT"
      };
    }
  },

  async getMembersCurrentlyInside(page = 0, size = 10): Promise<CheckinRecord[]> {
    try {
      const response = await apiClient.get<ApiResponse<PageResponse<CheckinRecord> | CheckinRecord[]>>(`/check-ins/current?page=${page}&size=${size}`);
      const data = response.data?.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as PageResponse<CheckinRecord>).content)) {
        return (data as PageResponse<CheckinRecord>).content;
      }
      return [];
    } catch {
      return getMembersCurrentlyInsideFromStorage();
    }
  },

  async getCheckinHistory(params?: Record<string, unknown>): Promise<CheckinRecord[]> {
    try {
      const response = await apiClient.get<ApiResponse<PageResponse<CheckinRecord> | CheckinRecord[]>>("/check-ins", { params });
      const data = response.data?.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as PageResponse<CheckinRecord>).content)) {
        return (data as PageResponse<CheckinRecord>).content;
      }
      return [];
    } catch {
      return getStoredCheckinHistory();
    }
  },

  async cancelCheckin(id: number, data: CheckInCancelRequest): Promise<CheckinRecord> {
    try {
      const response = await apiClient.patch<ApiResponse<CheckinRecord>>(`/check-ins/${id}/cancel`, data);
      return response.data.data;
    } catch {
      const history = getStoredCheckinHistory();
      const idx = history.findIndex(r => r.id === id);
      if (idx !== -1) {
        history[idx].status = "CANCELLED";
        history[idx].note = data.reason;
        saveCheckinHistoryToStorage(history);
        return history[idx];
      }
      throw new Error("Không tìm thấy lượt check-in");
    }
  },

  async getTodayStatistics(): Promise<CheckInTodayStatisticsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<CheckInTodayStatisticsResponse>>("/check-ins/statistics/today");
      return response.data.data;
    } catch {
      return getTodayStatisticsFromStorage();
    }
  }
};

// ==========================================
export const memberCheckinService = {
  async selfCheckin(data: MemberCheckInRequest): Promise<CheckinRecord> {
    try {
      const response = await apiClient.post<ApiResponse<CheckinRecord>>("/member/check-ins/qr", data);
      const record = response.data.data;
      addCheckinRecordToStorage(record);
      return record;
    } catch {
      return addCheckinRecordToStorage({
        memberId: 1,
        memberName: "Hội Viên FitLife",
        memberCode: "MEM001",
        checkInTime: new Date().toISOString(),
        status: "SUCCESS",
        type: "CHECK_IN",
        note: `Self check-in via QR (${data.qrToken})`
      });
    }
  },

  async selfCheckout(data: MemberCheckOutRequest): Promise<CheckinRecord> {
    try {
      const response = await apiClient.post<ApiResponse<CheckinRecord>>("/member/check-outs/qr", data);
      return response.data.data;
    } catch {
      const updated = checkoutMemberInStorage(1);
      if (updated) return updated;
      return addCheckinRecordToStorage({
        memberId: 1,
        memberName: "Hội Viên FitLife",
        memberCode: "MEM001",
        checkInTime: new Date(Date.now() - 3600000).toISOString(),
        checkOutTime: new Date().toISOString(),
        status: "SUCCESS",
        type: "CHECK_OUT",
        note: `Self check-out via QR (${data.qrToken})`
      });
    }
  },

  async getMyCurrentStatus(): Promise<CheckinRecord> {
    try {
      const response = await apiClient.get<ApiResponse<CheckinRecord>>("/member/check-ins/current");
      return response.data.data;
    } catch {
      const active = getMembersCurrentlyInsideFromStorage();
      if (active.length > 0) return active[0];
      throw new Error("Hiện không trong phòng tập");
    }
  },

  async getMyHistory(params?: Record<string, unknown>): Promise<CheckinRecord[]> {
    try {
      const response = await apiClient.get<ApiResponse<PageResponse<CheckinRecord> | CheckinRecord[]>>("/member/check-ins/history", { params });
      const data = response.data?.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as PageResponse<CheckinRecord>).content)) {
        return (data as PageResponse<CheckinRecord>).content;
      }
      return [];
    } catch {
      return getStoredCheckinHistory();
    }
  }
};

export const checkinService = {
  ...staffCheckinService,
  ...memberCheckinService,
  ...adminQrService
};
