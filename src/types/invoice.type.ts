import type {
  PaymentMethod,
  PaymentStatus,
} from "./common.type";

export type InvoiceStatus =
    | "UNPAID"
    | "PAID"
    | "CANCELLED"
    | "REFUNDED";

export type InvoiceActionType =
    | "CREATED"
    | "VIEWED"
    | "PAID"
    | "CANCELLED"
    | "REFUNDED"
    | "EMAIL_SENT"
    | "PRINTED"
    | "PDF_DOWNLOADED";

export interface Invoice {
  id: number;
  invoiceCode: string;

  // Member
  memberId: number;
  memberCode?: string;
  memberName?: string;
  memberEmail?: string;
  memberPhone?: string;

  // Subscription
  subscriptionId?: number;
  packageName?: string;
  packageDurationName?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;

  // Amount
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;

  // Status
  status: InvoiceStatus;

  issuedAt?: string;
  paidAt?: string;

  cancelledAt?: string;
  cancelReason?: string;

  refundedAt?: string;
  refundedById?: number;
  refundedByName?: string;
  refundReason?: string;

  note?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceQueryParams {
  page?: number;
  size?: number;

  keyword?: string;
  memberId?: number;

  status?: InvoiceStatus;

  fromDate?: string;
  toDate?: string;

  sort?: string;
}

export interface InvoiceCancelRequest {
  reason: string;
}

export interface InvoiceRefundRequest {
  reason: string;
}

export interface InvoiceGenerateRequest {
  subscriptionId: number;
  note?: string;
}

export interface InvoiceEmailRequest {
  email?: string;
}

export interface InvoiceHistory {
  id: number;
  invoiceId: number;

  oldStatus?: InvoiceStatus;
  newStatus?: InvoiceStatus;

  action: InvoiceActionType;

  changedById?: number;
  changedByName?: string;

  notes?: string;
  createdAt: string;
}

export interface InvoiceAuditLog {
  id: number;
  invoiceId: number;

  actorUserId?: number;
  actorName?: string;
  actorRoles?: string;

  action: InvoiceActionType;

  oldStatus?: InvoiceStatus;
  newStatus?: InvoiceStatus;

  description?: string;
  createdAt: string;
}

export interface InvoicePayment {
  id: number;
  paymentCode: string;

  invoiceId: number;
  invoiceCode?: string;

  subscriptionId?: number;
  memberId?: number;

  amount: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  transactionNo?: string;
  paidAt?: string;

  note?: string;

  refundedAt?: string;
  refundedById?: number;
  refundedByName?: string;
  refundReason?: string;

  createdAt?: string;
}