export interface ProfileResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  avatarUrl: string;
  height: number;
  weight: number;
  target: string;
  activityLevel: string;
  memberSince: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  height?: number;
  weight?: number;
  target?: string;
  activityLevel?: string;
}

export interface MembershipResponse {
  packageName: string;
  status: string;
  startDate: string;
  endDate: string;
  remainingDays: number;
}
