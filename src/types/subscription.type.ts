export type SubscriptionStatus =
    | "PENDING_PAYMENT"
    | "ACTIVE"
    | "FROZEN"
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
  packageLevel?: string;

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

  // Quyền lợi & Vòng đời gói (Phần 6)
  isFreezable?: boolean;
  isTransferable?: boolean;
  freezeDaysTotal?: number;
  freezeDaysUsed?: number;
  freezeStartDate?: string | null;
  freezeEndDate?: string | null;
  transfersLeft?: number;

  autoRenew?: boolean;
  note?: string;

  invoiceId?: number;
  invoiceCode?: string;
  invoiceFinalAmount?: number;
  invoiceStatus?: string;

  createdAt?: string;
  updatedAt?: string;

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
  promotionCode?: string;
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

  promotionCode?: string;
  promotionDiscount?: number;

  ptSessionsTotal?: number;
}

export interface CreateSubscriptionRequest {
  gymPackageId: number;
  packageDurationId: number;
  promotionCode?: string;
  paidCash?: boolean;
  autoRenew?: boolean;
  note?: string;
}

// =====================================================
// LIFECYCLE REQUESTS (Phần 6)
// =====================================================
export interface UpgradeSubscriptionRequest {
  currentSubscriptionId: number;
  targetPackageDurationId: number;
}

export interface UpgradeCalculationResult {
  currentSubscriptionId: number;
  currentPackageName: string;
  daysRemaining: number;
  remainingValueCredit: number;
  targetPackageName: string;
  targetPackagePrice: number;
  finalAmountToPay: number;
}

export interface FreezeSubscriptionRequest {
  subscriptionId: number;
  freezeDays: number;
  reason: string;
}

export interface TransferSubscriptionRequest {
  subscriptionId: number;
  recipientMemberCode: string;
  note?: string;
}
