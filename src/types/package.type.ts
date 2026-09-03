export type GymPackageStatus = "ACTIVE" | "INACTIVE";
export type PackageDurationStatus = "ACTIVE" | "INACTIVE";
export type PackageLevel = "BASIC" | "STANDARD" | "PREMIUM" | "VIP";
export type AccessType = "LIMITED_TIME" | "FULL_TIME";
export type DiscountType = "PERCENT" | "FIXED_AMOUNT";

export interface PackageQueryParams {
  page?: number;
  size?: number;
  keyword?: string;
  packageType?: string;
  status?: GymPackageStatus | string;
}

// =====================================================
// PACKAGE BENEFIT (Phần 12)
// =====================================================
export interface PackageBenefit {
  id?: number;
  benefitName: string;
  benefitCode: string;
  description?: string | null;
  quantity?: number | null;
  unit?: string | null;
  usagePeriod?: "PER_MONTH" | "PER_WEEK" | "TOTAL" | "DAILY" | string | null;
  included: boolean;
  displayOrder?: number | null;
}

// =====================================================
// GYM PACKAGE (Phần 12)
// =====================================================
export interface GymPackage {
  id: number;
  code: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  targetAudience?: string | null;
  packageLevel?: PackageLevel | string | null;
  accessType?: AccessType | string | null;
  packageType: string; // Tương thích dữ liệu cũ
  basePrice: number;
  thumbnailUrl?: string | null;
  themeColor?: string | null;
  featured?: boolean;
  active?: boolean;
  visible?: boolean;
  
  benefits?: string | null; // Chuỗi benefits phân tách bằng dấu phẩy
  benefitItems?: PackageBenefit[]; // Danh sách benefit chi tiết
  
  hasAiWorkoutPlan: boolean;
  hasNutritionPlan: boolean;
  ptSessionsPerMonth: number;
  status: GymPackageStatus | string;
  
  createdAt?: string | null;
  updatedAt?: string | null;
}

// =====================================================
// PACKAGE DURATION (Phần 12)
// =====================================================
export interface PackageDuration {
  id: number;
  code: string;
  name: string;
  months: number; // Tương thích FE
  durationMonths?: number; // Backend đặt tên durationMonths
  discountPercent: number;
  gymPackageId: number;
  gymPackageName?: string | null;
  
  price?: number | null;
  originalPrice?: number | null;
  sellingPrice?: number | null;
  discountPrice?: number | null;
  
  bonusDays?: number;
  freezeDays?: number;
  transferAllowed?: boolean;
  maxCheckins?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  active?: boolean;
  
  status: PackageDurationStatus | string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// =====================================================
// PROMOTION (Phần 12)
// =====================================================
export interface Promotion {
  id: number;
  promotionCode: string;
  promotionName: string;
  discountType: DiscountType;
  discountValue: number;
  maximumDiscount?: number | null;
  minimumOrderValue?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  usageLimit?: number | null;
  usageLimitPerMember?: number | null;
  applicablePackageIds?: number[];
  stackable?: boolean;
  active: boolean;
}

// =====================================================
// SEPARATE PT PACKAGES (Phần 3)
// =====================================================
export interface PTPackage {
  id: number;
  code: string;
  name: string;
  sessions: number;
  durationDays: number;
  price: number;
  description: string;
  perSessionPrice: number;
  sessionDurationMinutes: number;
}

// =====================================================
// ADDITIONAL SERVICES (Phần 4 Add-ons)
// =====================================================
export interface AddonService {
  id: number;
  code: string;
  name: string;
  price: number;
  unit: string; // "lần", "tháng", "7 ngày"
  category: "METRICS" | "FACILITIES" | "TICKETS" | "COACHING" | "OTHER";
  description: string;
}

// =====================================================
// ADMIN - PACKAGE REQUESTS
// =====================================================
export interface AdminPackageCreateRequest {
  code: string;
  name: string;
  shortDescription?: string;
  description?: string;
  targetAudience?: string;
  packageLevel?: PackageLevel | string;
  accessType?: AccessType | string;
  packageType: string;
  basePrice: number;
  ptSessionsPerMonth: number;
  hasAiWorkoutPlan: boolean;
  hasNutritionPlan: boolean;
  thumbnailUrl?: string;
  themeColor?: string;
  featured?: boolean;
  active?: boolean;
  visible?: boolean;
  benefits?: string;
  status?: GymPackageStatus | string;
}

export interface AdminPackageUpdateRequest {
  name: string;
  shortDescription?: string;
  description?: string;
  targetAudience?: string;
  packageLevel?: PackageLevel | string;
  accessType?: AccessType | string;
  packageType: string;
  basePrice: number;
  ptSessionsPerMonth: number;
  hasAiWorkoutPlan: boolean;
  hasNutritionPlan: boolean;
  thumbnailUrl?: string;
  themeColor?: string;
  featured?: boolean;
  active?: boolean;
  visible?: boolean;
  benefits?: string;
  status?: GymPackageStatus | string;
}

// =====================================================
// ADMIN - PACKAGE DURATION REQUESTS
// =====================================================
export interface AdminPackageDurationCreateRequest {
  code: string;
  name: string;
  months: number;
  durationMonths?: number;
  discountPercent: number;
  gymPackageId: number;
  price: number;
  originalPrice?: number;
  sellingPrice?: number;
  discountPrice?: number;
  bonusDays?: number;
  freezeDays?: number;
  transferAllowed?: boolean;
  maxCheckins?: number;
  startDate?: string;
  endDate?: string;
  active?: boolean;
  status?: PackageDurationStatus | string;
}

export interface AdminPackageDurationUpdateRequest {
  name: string;
  months: number;
  durationMonths?: number;
  discountPercent: number;
  price: number;
  originalPrice?: number;
  sellingPrice?: number;
  discountPrice?: number;
  bonusDays?: number;
  freezeDays?: number;
  transferAllowed?: boolean;
  maxCheckins?: number;
  startDate?: string;
  endDate?: string;
  active?: boolean;
  status?: PackageDurationStatus | string;
}