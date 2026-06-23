import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { PaymentRequest, PaymentResult } from "../types/payment.type";

export const paymentService = {
  async createPayment(data: PaymentRequest): Promise<PaymentResult> {
    const response = await apiClient.post<ApiResponse<PaymentResult>>("/payments", data);
    return response.data.data;
  },
};
