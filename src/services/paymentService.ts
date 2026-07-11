import apiClient from "./apiClient";
import type { ApiResponse, PageResponse } from "../types/common.type";
import type {
  PaymentRequest,
  PaymentResult,
  VnpayCreateUrlRequest,
  VnpayCreateUrlResponse,
} from "../types/payment.type";

const extractPageContent = <T>(data: PageResponse<T> | T[]): T[] => {
  if (Array.isArray(data)) {
    return data;
  }

  return data.content ?? [];
};

export const paymentService = {
  async createPayment(data: PaymentRequest): Promise<PaymentResult> {
    const response = await apiClient.post<ApiResponse<PaymentResult>>(
        "/payments",
        data
    );

    return response.data.data;
  },

  async createVnpayPaymentUrl(data: {
    invoiceId: number;
  }): Promise<{
    paymentId: number;
    paymentCode: string;
    paymentUrl: string;
    amount: number;
  }> {
    const response = await apiClient.post<
        ApiResponse<{
          paymentId: number;
          paymentCode: string;
          paymentUrl: string;
          amount: number;
        }>
    >("/payments/vnpay/create-url", data);

    return response.data.data;
  },

  async getMyPayments(): Promise<PaymentResult[]> {
    try {
      const response = await apiClient.get<
          ApiResponse<PageResponse<PaymentResult> | PaymentResult[]>
      >("/payments/my");

      return extractPageContent<PaymentResult>(response.data.data);
    } catch (error: unknown) {
      console.error("GET_MY_PAYMENTS_ERROR:", error);
      return [];
    }
  },

  async getPaymentById(id: number): Promise<PaymentResult> {
    const response = await apiClient.get<ApiResponse<PaymentResult>>(
        `/payments/${id}`
    );

    return response.data.data;
  },

  async getAdminPayments(params?: {
    page?: number;
    size?: number;
    status?: string;
    method?: string;
    memberId?: number;
    invoiceId?: number;
  }): Promise<PaymentResult[]> {
    const response = await apiClient.get<
        ApiResponse<PageResponse<PaymentResult> | PaymentResult[]>
    >("/admin/payments", { params });

    return extractPageContent<PaymentResult>(response.data.data);
  },

  async confirmPayment(
      id: number,
      payload: { transactionNo?: string; note?: string }
  ): Promise<PaymentResult> {
    const response = await apiClient.patch<ApiResponse<PaymentResult>>(
        `/admin/payments/${id}/confirm`,
        payload
    );

    return response.data.data;
  },

  async failPayment(id: number, reason: string): Promise<PaymentResult> {
    const response = await apiClient.patch<ApiResponse<PaymentResult>>(
        `/admin/payments/${id}/fail`,
        { reason }
    );

    return response.data.data;
  },

  async cancelPayment(id: number, reason: string): Promise<PaymentResult> {
    const response = await apiClient.patch<ApiResponse<PaymentResult>>(
        `/admin/payments/${id}/cancel`,
        { reason }
    );

    return response.data.data;
  },
};