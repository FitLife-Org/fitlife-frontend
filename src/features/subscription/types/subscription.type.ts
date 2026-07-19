export type SubscriptionStatus =
    | "PENDING_PAYMENT"
    | "ACTIVE"
    | "EXPIRED"
    | "CANCELLED";

export interface Subscription {
  id: number;

  memberId?: number;
  memberCode?: string;
  memberName?: string;

  gymPackageId?: number;
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

  startDate?: string | null;
  endDate?: string | null;

  status: SubscriptionStatus;

  autoRenew?: boolean;
  note?: string;

  invoiceId?: number;
  invoiceCode?: string;
  invoiceFinalAmount?: number;
  invoiceStatus?: string;

  createdAt?: string;
  updatedAt?: string;

  // Giữ tạm field cũ nếu UI cũ còn dùng
  package?: {
    id: number;
    name?: string;
  };
  packageId?: number;
  packageName?: string;
  price?: number;
  paymentMethod?: string;
}

export interface PreviewPriceRequest {
  gymPackageId: number;
  packageDurationId: number;
}

export interface PreviewPriceResponse {
  gymPackageId: number;
  packageDurationId: number;

  gymPackageName?: string;
  packageDurationName?: string;

  basePrice?: number;
  months?: number;
  discountPercent?: number;

  originalPrice: number;
  discountAmount: number;
  finalPrice: number;

  ptSessionsTotal?: number;
}

export interface CreateSubscriptionRequest {
  gymPackageId: number;
  packageDurationId: number;
  autoRenew?: boolean;
  note?: string;
}