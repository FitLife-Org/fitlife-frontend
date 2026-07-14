export interface CheckinRecord {
  id: number;
  memberId: number;
  memberName?: string;
  memberCode?: string;
  checkInTime: string;
  note?: string;
  status: "SUCCESS" | "CANCELLED" | "FAILED";
  type?: "CHECK_IN" | "CHECK_OUT"; // For frontend mock
}

export interface GenerateQrResponse {
  qrCodeData: string; // Base64 image data or token string
  expiresAt: string;
}

export interface ManualCheckinRequest {
  memberId: number;
  note?: string;
}

export interface ScanCheckinRequest {
  qrToken: string;
}

export interface MemberLookupResult {
  id: number;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  packageName: string;
  packageStatus: "ACTIVE" | "EXPIRED" | "NONE";
}
