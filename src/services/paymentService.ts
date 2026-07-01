import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { PaymentRequest, PaymentResult } from "../types/payment.type";

export const paymentService = {
  async createPayment(data: PaymentRequest): Promise<PaymentResult> {
    const response = await apiClient.post<ApiResponse<PaymentResult>>("/payments", data);
    return response.data.data as PaymentResult;
  },

  async getMyPayments(): Promise<PaymentResult[]> {
    try {
      const response = await apiClient.get<ApiResponse<any>>("/payments/my");
      const data = response.data.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.content)) return data.content;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    } catch (e) {
      return [];
    }
  },

  async getPaymentById(id: number): Promise<PaymentResult> {
    const response = await apiClient.get<ApiResponse<PaymentResult>>(`/payments/${id}`);
    return response.data.data as PaymentResult;
  },
};
