import type { GymPackage } from "./package.type";
import type { Status } from "./common.type";

export interface Subscription {
  id: number;
  memberId?: number;
  gymPackageId: number;
  gymPackageName?: string;
  startDate: string;
  endDate: string;
  status: string;
  invoiceId?: number;
  package?: GymPackage; // For legacy UI compatibility
}

export interface PreviewPriceRequest {
  gymPackageId: number;
  packageDurationId: number;
}

export interface PreviewPriceResponse {
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
}

export interface CreateSubscriptionRequest {
  gymPackageId: number;
  packageDurationId: number;
  startDate?: string;
  autoRenew?: boolean;
}
