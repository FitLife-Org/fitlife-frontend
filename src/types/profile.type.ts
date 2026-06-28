export interface ProfileResponse {
  id: number;
  userId?: number;
  memberCode?: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  avatarUrl: string;
  height: number;
  weight: number;
  bmi?: number;
  fitnessGoal: string;
  status?: string;
  activityLevel?: string;
  address?: string;
  memberSince?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  height?: number;
  weight?: number;
  fitnessGoal?: string;
  activityLevel?: string;
  address?: string;
}

export interface MembershipResponse {
  packageName: string;
  status: string;
  startDate: string;
  endDate: string;
  remainingDays: number;
}
