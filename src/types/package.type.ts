export interface PackageQueryParams {
  page?: number;
  size?: number;
  keyword?: string;
  packageType?: string;
  status?: string;
}

export interface GymPackage {
  id: number;
  code: string;
  name: string;
  packageType: string;
  basePrice: number;
  description?: string;
  benefits?: string;
  thumbnailUrl?: string;
  hasPtService?: boolean;
  hasAiWorkoutPlan: boolean;
  hasNutritionPlan: boolean;
  ptSessionsPerMonth: number;
  status: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PackageDuration {
  id: number;
  code: string;
  name: string;
  months: number;
  discountPercent: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

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
  status?: string;
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
  status?: string;
}

export interface AdminPackageDurationCreateRequest {
  code: string;
  name: string;
  months: number;
  discountPercent: number;
  status?: string;
}

export interface AdminPackageDurationUpdateRequest {
  name: string;
  months: number;
  discountPercent: number;
  status?: string;
}