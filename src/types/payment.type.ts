export interface PaymentRequest {
  packageId: number;
  method: "VNPAY" | "MOMO" | "CASH";
}

export interface PaymentResult {
  id: number;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  paymentUrl?: string;
}
