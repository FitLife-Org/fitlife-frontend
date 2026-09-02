export type GymPackageStatus =
    | "ACTIVE"
    | "INACTIVE";

export type PackageDurationStatus =
    | "ACTIVE"
    | "INACTIVE";

export interface PackageQueryParams {
  page?: number;
  size?: number;

  keyword?: string;

  packageType?: string;

  status?: GymPackageStatus | string;
}

// =====================================================
// GYM PACKAGE
// =====================================================

export interface GymPackage {
  id: number;

  code: string;

  name: string;

  packageType: string;

  /**
   * Giá cơ sở của package.
   *
   * Giá cuối cùng khi mua theo thời hạn
   * ưu tiên lấy từ PackageDuration.
   */
  basePrice: number;

  description?: string | null;

  benefits?: string | null;

  thumbnailUrl?: string | null;

  hasAiWorkoutPlan: boolean;

  hasNutritionPlan: boolean;

  ptSessionsPerMonth: number;

  status: GymPackageStatus | string;

  createdAt?: string | null;

  updatedAt?: string | null;
}

// =====================================================
// PACKAGE DURATION
// =====================================================

export interface PackageDuration {
  id: number;

  code: string;

  name: string;

  months: number;

  discountPercent: number;

  /**
   * Quan hệ bắt buộc về nghiệp vụ:
   *
   * PackageDuration phải thuộc đúng GymPackage.
   *
   * FE dùng field này để tránh:
   *
   * Package A
   * + Duration của Package B
   * -> tạo sai Subscription / Invoice.
   */
  gymPackageId: number;

  gymPackageName?: string | null;

  /**
   * Giá trước giảm của thời hạn.
   *
   * Ví dụ:
   * Standard 3 tháng = 1.500.000
   */
  price?: number | null;

  /**
   * Giá cuối sau giảm.
   *
   * Nếu Backend trả field này,
   * FE ưu tiên dùng trực tiếp.
   */
  discountPrice?: number | null;

  status: PackageDurationStatus | string;

  createdAt?: string | null;

  updatedAt?: string | null;
}

// =====================================================
// ADMIN - PACKAGE
// =====================================================

export interface AdminPackageCreateRequest {
  code: string;

  name: string;

  packageType: string;

  basePrice: number;

  ptSessionsPerMonth: number;

  hasAiWorkoutPlan: boolean;

  hasNutritionPlan: boolean;

  description?: string;

  benefits?: string;

  thumbnailUrl?: string;

  status?: GymPackageStatus | string;
}

export interface AdminPackageUpdateRequest {
  name: string;

  packageType: string;

  basePrice: number;

  ptSessionsPerMonth: number;

  hasAiWorkoutPlan: boolean;

  hasNutritionPlan: boolean;

  description?: string;

  benefits?: string;

  thumbnailUrl?: string;

  status?: GymPackageStatus | string;
}

// =====================================================
// ADMIN - PACKAGE DURATION
// =====================================================

export interface AdminPackageDurationCreateRequest {
  code: string;

  name: string;

  months: number;

  discountPercent: number;

  gymPackageId: number;

  price: number;

  discountPrice?: number;

  status?: PackageDurationStatus | string;
}

export interface AdminPackageDurationUpdateRequest {
  name: string;

  months: number;

  discountPercent: number;

  price: number;

  discountPrice?: number;

  status?: PackageDurationStatus | string;
}