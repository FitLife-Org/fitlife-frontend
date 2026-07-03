import type { GymPackage } from "./package.type";
import type { Status } from "./common.type";

export interface Subscription {
  id: number;
  memberId?: number;
  memberCode?: string;
  memberName?: string;
  gymPackageId: number;
  gymPackageCode?: string;
  gymPackageName?: string;
  packageDurationId?: number;
  packageDurationCode?: string;
  packageDurationName?: string;
  months?: number;
  basePrice?: number;
  originalPrice?: number;
  discountAmount?: number;
  finalPrice?: number;
  ptSessionsTotal?: number;
  ptSessionsUsed?: number;
  startDate?: string;
  endDate?: string;
  status: string;
  autoRenew?: boolean;
  note?: string;
  invoiceId?: number;
  invoiceCode?: string;
  invoiceFinalAmount?: number;
  invoiceStatus?: string;
  createdAt?: string;
  updatedAt?: string;
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
