export interface CheckinRecord {
  id: number;
  memberId: number;
  memberName?: string;
  memberCode?: string;
  checkInTime: string;
  checkOutTime?: string;
  note?: string;
  status: "SUCCESS" | "CANCELLED" | "FAILED";
  type?: "CHECK_IN" | "CHECK_OUT";
  isInside?: boolean;
}

export interface AdminCheckInQrResponse {
  id: number;
  name: string;
  token: string;
  location?: string;
  isActive?: boolean;
  active?: boolean;
  createdAt: string;
  regeneratedAt?: string;
}

export interface StaffManualCheckInRequest {
  memberId?: number;
  memberCode?: string;
  reason?: string;
}

export interface StaffMemberQrCheckInRequest {
  qrData: string;
  reason?: string;
}

export interface MemberCheckInRequest {
  qrToken: string;
}

export interface MemberCheckOutRequest {
  qrToken: string;
}

export interface MemberLookupResult {
  memberId: number;
  memberCode: string;
  fullName: string;
  email: string;
  phone: string;
  userStatus: string;
  currentSubscription?: {
    packageName: string;
    status: string;
  };
  canCheckIn: boolean;
  checkInMessage: string;
}

export interface CheckInCancelRequest {
  reason: string;
}

export interface CheckInTodayStatisticsResponse {
  totalCheckIns: number;
  successfulCheckIns: number;
  failedCheckIns: number;
}
