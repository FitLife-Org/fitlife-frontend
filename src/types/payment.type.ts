export interface PaymentRequest {
  invoiceId: number;
  paymentMethod: "VNPAY" | "MOMO" | "CASH" | string;
  note?: string;
}

export interface PaymentResult {
  id: number;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | string;
  paymentUrl?: string;
  transactionId?: string;
  createdAt?: string;
  note?: string;
}
