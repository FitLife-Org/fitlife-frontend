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
  hasAiWorkoutPlan: boolean;
  hasNutritionPlan: boolean;
  ptSessionsPerMonth: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PackageDuration {
  id: number;
  code: string;
  name: string;
  months: number;
  discountPercent: number;
  gymPackageId?: number;
  gymPackageName?: string;
  price?: number;
  discountPrice?: number;
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
  gymPackageId: number;
  price: number;
  discountPrice?: number;
  status?: string;
}

export interface AdminPackageDurationUpdateRequest {
  name: string;
  months: number;
  discountPercent: number;
  price: number;
  discountPrice?: number;
  status?: string;
}