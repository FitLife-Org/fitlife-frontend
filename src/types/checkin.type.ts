export interface CheckinRecord {
  id: number;
  memberId: number;
  memberName?: string;
  checkedInAt: string;
  note?: string;
  status: "SUCCESS" | "FAILED";
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
