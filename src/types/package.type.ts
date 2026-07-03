import type { Status } from "./common.type";

export interface GymPackage {
  id: number;
  code: string;
  name: string;
  packageType: string;
  basePrice: number;
  hasAiWorkoutPlan: boolean;
  hasNutritionPlan: boolean;
  ptSessionsPerMonth: number;
  description?: string;
  benefits?: string;
  status: Status;
  thumbnailUrl?: string;
}

export interface PackageDuration {
  id: number;
  code: string;
  name: string;
  months: number;
  discountPercent: number;
  status: Status;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPackageCreateRequest {
  code: string;
  name: string;
  packageType: string;
  basePrice: number;
  hasAiWorkoutPlan: boolean;
  hasNutritionPlan: boolean;
  ptSessionsPerMonth: number;
  description?: string;
  benefits?: string;
  thumbnailUrl?: string;
  status?: string;
}

export interface AdminPackageUpdateRequest {
  name: string;
  packageType: string;
  basePrice: number;
  hasAiWorkoutPlan: boolean;
  hasNutritionPlan: boolean;
  ptSessionsPerMonth: number;
  description?: string;
  benefits?: string;
  thumbnailUrl?: string;
  status?: string;
}
