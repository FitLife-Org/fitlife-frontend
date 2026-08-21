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

/**
 * Trạng thái nghiệp vụ của Member.
 *
 * Lưu ý:
 * - ACTIVE: hội viên đang hoạt động.
 * - INACTIVE: hội viên không hoạt động.
 * - SUSPENDED: hội viên bị tạm khóa.
 *
 * Không sử dụng LOCKED ở MemberStatus.
 * LOCKED nếu có thuộc UserStatus.
 */
export type MemberStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED";

// =====================================================
// MEMBER PROFILE
// =====================================================

export interface MemberProfile {
  id: number;
  userId: number;

  username: string;
  memberCode: string;

  fullName: string;
  email: string;

  phone?: string | null;
  avatarUrl?: string | null;

  /**
   * Trạng thái xác thực email của User liên kết.
   *
   * Backend MemberResponse cần trả field này
   * nếu FE sử dụng.
   */
  emailVerified?: boolean | null;

  gender?: Gender | null;
  dateOfBirth?: string | null;
  address?: string | null;

  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  joinDate?: string | null;

  fitnessGoal?: FitnessGoal | null;
  healthNote?: string | null;

  status: MemberStatus;

  isDeleted?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

// =====================================================
// MEMBER SELF UPDATE
// =====================================================

/**
 * Member tự cập nhật hồ sơ.
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

// =====================================================
// ADMIN MEMBER CREATE
// =====================================================

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

// =====================================================
// ADMIN MEMBER UPDATE
// =====================================================

/**
 * Admin cập nhật thông tin hồ sơ Member.
 *
 * status KHÔNG được gửi qua request này.
 *
 * Status sử dụng endpoint riêng:
 *
 * PATCH /admin/members/{id}/status
 */
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
}

// =====================================================
// ADMIN MEMBER STATUS
// =====================================================

export interface AdminMemberStatusUpdateRequest {
  status: MemberStatus;
}

// =====================================================
// BODY METRIC
// =====================================================

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