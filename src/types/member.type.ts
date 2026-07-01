import type { Status } from "./common.type";

export interface MemberProfile {
  id: number;
  userId?: number;
  username?: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  status: Status;
  avatarUrl?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  healthNote?: string;
  fitnessGoal?: string;
  activityLevel?: string;
  memberCode?: string;
  memberSince?: string;
  joinDate?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BodyMetric {
  id: number;
  measuredAt: string;
  height: number;
  weight: number;
  bmi?: number;
  bodyFat?: number;
}

export interface AdminMemberCreateRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  fitnessGoal?: string;
  healthNote?: string;
}

export interface AdminMemberUpdateRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  fitnessGoal?: string;
  healthNote?: string;
  status?: string;
}
