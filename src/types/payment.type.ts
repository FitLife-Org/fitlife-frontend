export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "VNPAY";

export type PaymentStatus =
    | "PENDING"
    | "SUCCESS"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";

export interface PaymentRequest {
  invoiceId: number;
  paymentMethod: "CASH" | "BANK_TRANSFER";
  note?: string;
}

export interface VnpayCreateUrlRequest {
  invoiceId: number;
}

export interface VnpayCreateUrlResponse {
  paymentId: number;
  paymentCode: string;
  paymentUrl: string;
  amount: number;
}

export interface PaymentResult {
  id: number;
  paymentCode?: string;

  invoiceId: number;
  invoiceCode?: string;

  subscriptionId?: number;
  memberId?: number;
  memberCode?: string;
  memberName?: string;

  amount: number;
  paymentMethod: PaymentMethod;

  paymentStatus?: PaymentStatus;

  status?: PaymentStatus;

  transactionNo?: string;
  paidAt?: string;
  note?: string;
  failedReason?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

