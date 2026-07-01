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
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  joinDate?: string;
  fitnessGoal: string;
  healthNote?: string;
  status?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  authProvider?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  fitnessGoal?: string;
  healthNote?: string;
}

export interface MembershipResponse {
  packageName: string;
  status: string;
  startDate: string;
  endDate: string;
  remainingDays: number;
}
