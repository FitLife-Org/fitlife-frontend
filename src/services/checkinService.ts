import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { CheckinRecord, GenerateQrResponse, ManualCheckinRequest, ScanCheckinRequest } from "../types/checkin.type";

const MOCK_CHECKINS: CheckinRecord[] = [
  { id: 1, memberId: 1, memberName: "Nguyễn Văn A", checkedInAt: "2026-07-02T08:30:00Z", status: "SUCCESS" },
  { id: 2, memberId: 1, memberName: "Nguyễn Văn A", checkedInAt: "2026-07-01T17:15:00Z", status: "SUCCESS" },
  { id: 3, memberId: 2, memberName: "Trần Thị B", checkedInAt: "2026-07-01T16:00:00Z", status: "SUCCESS" },
];

export const checkinService = {
  // CHK-01: Member generate QR
  async generateQr(): Promise<GenerateQrResponse> {
    try {
      const response = await apiClient.post<ApiResponse<GenerateQrResponse>>("/checkin/qr/generate");
      return response.data.data;
    } catch (error) {
      console.warn("API POST /checkin/qr/generate failed, using mock data", error);
      // Giả lập QR code dạng chuỗi
      return {
        qrCodeData: "MOCK_QR_CODE_MEMBER_1_" + Date.now(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Hết hạn sau 5 phút
      };
    }
  },

  // CHK-02: Get History
  async getHistory(): Promise<CheckinRecord[]> {
    try {
      const response = await apiClient.get<ApiResponse<CheckinRecord[]>>("/checkin/history");
      return response.data.data;
    } catch (error) {
      console.warn("API GET /checkin/history failed, using mock data", error);
      return MOCK_CHECKINS;
    }
  },
  
  // Lấy lịch sử của bản thân (Member dùng chung Endpoint GET /checkins/me hoặc /checkin/history)
  async getMyCheckins(): Promise<CheckinRecord[]> {
    try {
      const response = await apiClient.get<ApiResponse<CheckinRecord[]>>("/checkins/me");
      return response.data.data;
    } catch (error) {
      console.warn("API GET /checkins/me failed, using mock data", error);
      return MOCK_CHECKINS.filter(c => c.memberId === 1);
    }
  },

  // CHK-03: Get Detail
  async getCheckinDetail(id: number): Promise<CheckinRecord> {
    try {
      const response = await apiClient.get<ApiResponse<CheckinRecord>>(`/checkin/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn(`API GET /checkin/${id} failed, using mock data`, error);
      return MOCK_CHECKINS.find(c => c.id === id) || MOCK_CHECKINS[0];
    }
  },

  // CHK-04: Manual Check-in
  async manualCheckin(data: ManualCheckinRequest): Promise<CheckinRecord> {
    try {
      const response = await apiClient.post<ApiResponse<CheckinRecord>>("/admin/checkin/manual", data);
      return response.data.data;
    } catch (error) {
      console.warn("API POST /admin/checkin/manual failed, using mock data", error);
      await new Promise(r => setTimeout(r, 800)); // Giả lập độ trễ mạng
      return {
        id: Math.floor(Math.random() * 1000) + 10,
        memberId: data.memberId,
        memberName: "Hội viên #" + data.memberId,
        checkedInAt: new Date().toISOString(),
        note: data.note,
        status: "SUCCESS"
      };
    }
  },

  // CHK-05: Scan Check-in
  async scanCheckin(data: ScanCheckinRequest): Promise<CheckinRecord> {
    try {
      const response = await apiClient.post<ApiResponse<CheckinRecord>>("/checkin/scan", data);
      return response.data.data;
    } catch (error) {
      console.warn("API POST /checkin/scan failed, using mock data", error);
      await new Promise(r => setTimeout(r, 800));
      return {
        id: Math.floor(Math.random() * 1000) + 10,
        memberId: 1, // Giả lập tìm được member 1
        memberName: "Nguyễn Văn A (Từ QR)",
        checkedInAt: new Date().toISOString(),
        status: "SUCCESS"
      };
    }
  }
};
