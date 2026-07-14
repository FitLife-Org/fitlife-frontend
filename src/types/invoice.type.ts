export type InvoiceStatus =
    | "UNPAID"
    | "PAID"
    | "CANCELLED"
    | "REFUNDED";

export interface Invoice {
  id: number;
  invoiceCode: string;

  memberId: number;
  memberCode?: string;
  memberName?: string;

  subscriptionId?: number;
  packageName?: string;

  totalAmount: number;
  discountAmount: number;
  finalAmount: number;

  amount?: number;

  status: InvoiceStatus;

  issuedAt?: string;
  paidAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  note?: string;

  createdAt?: string;
  updatedAt?: string;
}