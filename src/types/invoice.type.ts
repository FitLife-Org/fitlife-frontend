export interface Invoice {
  id: number;
  invoiceCode: string;
  memberId: number;
  memberName: string;
  subscriptionId: number;
  amount: number;
  status: string; // UNPAID, PAID, CANCELLED, REFUNDED
  createdAt: string;
  updatedAt: string;
  note?: string;
}

export interface InvoiceGenerateRequest {
  subscriptionId: number;
  note?: string;
}
