import type { Status } from "./common.type";

export interface GymPackage {
  id: number;
  code: string;
  name: string;
  packageType: string;
  price: number;
  durationDays: number;
  description?: string;
  status: Status;
  thumbnailUrl?: string;
}

export interface PackageDuration {
  id: number;
  durationMonths: number;
  durationDays: number;
  discountPercentage: number;
  status: Status;
}

export interface AdminPackageCreateRequest {
  code: string;
  name: string;
  packageType: string;
  price: number;
  durationDays: number;
  description?: string;
  benefits?: string;
  thumbnailUrl?: string;
  status?: string;
}

export interface AdminPackageUpdateRequest {
  name: string;
  packageType: string;
  price: number;
  durationDays: number;
  description?: string;
  benefits?: string;
  thumbnailUrl?: string;
  status?: string;
}
