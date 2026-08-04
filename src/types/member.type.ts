import type {
  Status,
} from "./common.type";

export type Gender =
    | "MALE"
    | "FEMALE"
    | "OTHER";

export type FitnessGoal =
    | "LOSE_WEIGHT"
    | "GAIN_MUSCLE"
    | "MAINTAIN"
    | "IMPROVE_HEALTH"
    | "INCREASE_ENDURANCE";

export interface MemberProfile {
  id: number;
  userId: number;

  username: string;
  memberCode: string;

  fullName: string;
  email: string;

  phone?: string | null;
  avatarUrl?: string | null;

  gender?: Gender | null;
  dateOfBirth?: string | null;
  address?: string | null;

  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  joinDate?: string | null;

  fitnessGoal?: FitnessGoal | null;
  healthNote?: string | null;

  status: Status;
  isDeleted?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

/**
 * Dữ liệu Member được phép tự cập nhật.
 *
 * Không cho phép cập nhật:
 * - username
 * - email
 * - memberCode
 * - status
 * - avatarUrl
 * - joinDate
 */
export interface UpdateMyMemberProfileRequest {
  fullName: string;

  phone?: string | null;

  gender?: Gender | null;
  dateOfBirth?: string | null;
  address?: string | null;

  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  fitnessGoal?: FitnessGoal | null;
  healthNote?: string | null;
}

export interface AdminMemberCreateRequest {
  username: string;
  email: string;
  password: string;

  fullName: string;
  phone?: string | null;

  gender?: Gender | null;
  dateOfBirth?: string | null;
  address?: string | null;

  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  fitnessGoal?: FitnessGoal | null;
  healthNote?: string | null;
}

export interface AdminMemberUpdateRequest {
  email?: string;
  fullName?: string;

  phone?: string | null;

  gender?: Gender | null;
  dateOfBirth?: string | null;
  address?: string | null;

  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  fitnessGoal?: FitnessGoal | null;
  healthNote?: string | null;

  status?: Status;
}

export interface BodyMetric {
  id: number;
  memberId: number;

  memberCode: string;
  fullName: string;
  email: string;
  phone?: string | null;

  weightKg: number;
  heightCm: number;
  bmi: number;

  bodyFatPercent?: number | null;
  muscleMassKg?: number | null;

  note?: string | null;
  recordedAt: string;

  createdById?: number;
  createdByName?: string;

  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BodyMetricProgress {
  metric:
      | "weightKg"
      | "bmi"
      | "bodyFatPercent"
      | "muscleMassKg";

  startValue: number;
  currentValue: number;
  change: number;

  trend:
      | "up"
      | "down"
      | "stable";
}

export interface BodyMetricCreateRequest {
  memberId: number;

  weightKg: number;
  heightCm?: number;

  bodyFatPercent?: number;
  muscleMassKg?: number;

  note?: string;
  recordedAt?: string;
}

export interface BodyMetricUpdateRequest {
  weightKg?: number;
  heightCm?: number;

  bodyFatPercent?: number;
  muscleMassKg?: number;

  note?: string;
  recordedAt?: string;
}