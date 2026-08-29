import apiClient from "./apiClient";

import type {
  ApiResponse,
  PageResponse,
} from "../types/common.type";

import type {
  AdminPaymentFilter,
  ConfirmPaymentRequest,
  OfflinePaymentRequest,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  VnpayCreateUrlRequest,
  VnpayCreateUrlResponse,
} from "../types/payment.type";

import {
  requireApiData,
} from "../utils/apiResponse";

const PAYMENT_BASE_URL =
    "/payments";

const ADMIN_PAYMENT_BASE_URL =
    "/admin/payments";

// =====================================================
// HELPERS
// =====================================================

function validateId(
    id: number,
    fieldName: string,
): void {
  if (
      !Number.isInteger(id) ||
      id <= 0
  ) {
    throw new Error(
        `${fieldName} không hợp lệ.`,
    );
  }
}

function validateInvoiceId(
    invoiceId: number,
): void {
  validateId(
      invoiceId,
      "Invoice ID",
  );
}

function normalizePayment(
    payment: PaymentResult,
): PaymentResult {
  const paymentStatus:
      PaymentStatus | undefined =
      payment.paymentStatus ??
      payment.status;

  if (!paymentStatus) {
    throw new Error(
        "Payment response không có trạng thái thanh toán.",
    );
  }

  return {
    ...payment,
    paymentStatus,
  };
}

function extractPageContent<T>(
    data:
        PageResponse<T> |
        T[],
): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  return (
      data.content ??
      []
  );
}

// =====================================================
// PAYMENT SERVICE
// =====================================================

export const paymentService = {
  // =================================================
  // MEMBER - CASH / BANK TRANSFER
  // =================================================

  async createPayment(
      data: PaymentRequest,
  ): Promise<PaymentResult> {
    validateInvoiceId(
        data.invoiceId,
    );

    /*
     * VNPay có endpoint riêng.
     *
     * CASH / BANK_TRANSFER:
     * POST /payments
     */
    if (
        data.paymentMethod ===
        "VNPAY"
    ) {
      throw new Error(
          "Thanh toán VNPay phải sử dụng createVnpayPaymentUrl().",
      );
    }

    const response =
        await apiClient.post<
            ApiResponse<PaymentResult>
        >(
            PAYMENT_BASE_URL,
            data,
        );

    const payment =
        requireApiData(
            response.data,
            "Máy chủ không trả về thông tin thanh toán.",
        );

    return normalizePayment(
        payment,
    );
  },

  // =================================================
  // ADMIN / STAFF - OFFLINE PAYMENT
  // =================================================

  async createOfflinePayment(
      data: OfflinePaymentRequest,
  ): Promise<PaymentResult> {
    validateInvoiceId(
        data.invoiceId,
    );

    const response =
        await apiClient.post<
            ApiResponse<PaymentResult>
        >(
            `${ADMIN_PAYMENT_BASE_URL}/offline`,
            data,
        );

    const payment =
        requireApiData(
            response.data,
            "Không thể tạo thanh toán tại quầy.",
        );

    return normalizePayment(
        payment,
    );
  },

  // =================================================
  // MEMBER - VNPAY
  // =================================================

  async createVnpayPaymentUrl(
      data:
      VnpayCreateUrlRequest,
  ): Promise<VnpayCreateUrlResponse> {
    validateInvoiceId(
        data.invoiceId,
    );

    const response =
        await apiClient.post<
            ApiResponse<VnpayCreateUrlResponse>
        >(
            `${PAYMENT_BASE_URL}/vnpay/create-url`,
            data,
        );

    const result =
        requireApiData(
            response.data,
            "Không thể tạo đường dẫn thanh toán VNPay.",
        );

    if (
        !result.paymentUrl
    ) {
      throw new Error(
          "Backend không trả về đường dẫn thanh toán VNPay.",
      );
    }

    if (
        !Number.isInteger(
            result.paymentId,
        ) ||
        result.paymentId <= 0
    ) {
      throw new Error(
          "Backend không trả về Payment ID hợp lệ.",
      );
    }

    return result;
  },

  // =================================================
  // MEMBER - PAYMENT HISTORY
  // =================================================

  async getMyPayments(
      page = 0,
      size = 20,
  ): Promise<PaymentResult[]> {
    const response =
        await apiClient.get<
            ApiResponse<
                PageResponse<PaymentResult> |
                PaymentResult[]
            >
        >(
            `${PAYMENT_BASE_URL}/my`,
            {
              params: {
                page,
                size,
              },
            },
        );

    const data =
        requireApiData(
            response.data,
            "Không thể tải lịch sử thanh toán.",
        );

    return extractPageContent(
        data,
    ).map(
        normalizePayment,
    );
  },

  // =================================================
  // MEMBER - PAYMENT DETAIL
  // =================================================

  async getPaymentById(
      id: number,
  ): Promise<PaymentResult> {
    validateId(
        id,
        "Payment ID",
    );

    const response =
        await apiClient.get<
            ApiResponse<PaymentResult>
        >(
            `${PAYMENT_BASE_URL}/${id}`,
        );

    const payment =
        requireApiData(
            response.data,
            "Không thể tải chi tiết thanh toán.",
        );

    return normalizePayment(
        payment,
    );
  },

  // =================================================
  // ADMIN - PAYMENT LIST
  // =================================================

  async getAdminPayments(
      params?:
      AdminPaymentFilter,
  ): Promise<
      PageResponse<PaymentResult>
  > {
    const response =
        await apiClient.get<
            ApiResponse<
                PageResponse<PaymentResult>
            >
        >(
            ADMIN_PAYMENT_BASE_URL,
            {
              params,
            },
        );

    const page =
        requireApiData(
            response.data,
            "Không thể tải danh sách thanh toán.",
        );

    return {
      ...page,

      content:
          page.content?.map(
              normalizePayment,
          ) ?? [],
    };
  },

  // =================================================
  // ADMIN / STAFF - CONFIRM PAYMENT
  // =================================================

  async confirmPayment(
      id: number,
      payload:
      ConfirmPaymentRequest,
  ): Promise<PaymentResult> {
    validateId(
        id,
        "Payment ID",
    );

    const response =
        await apiClient.patch<
            ApiResponse<PaymentResult>
        >(
            `${ADMIN_PAYMENT_BASE_URL}/${id}/confirm`,
            payload,
        );

    const payment =
        requireApiData(
            response.data,
            "Không thể xác nhận thanh toán.",
        );

    return normalizePayment(
        payment,
    );
  },

  // =================================================
  // ADMIN / STAFF - FAIL PAYMENT
  // =================================================

  async failPayment(
      id: number,
      reason: string,
  ): Promise<PaymentResult> {
    validateId(
        id,
        "Payment ID",
    );

    const normalizedReason =
        reason.trim();

    if (!normalizedReason) {
      throw new Error(
          "Vui lòng nhập lý do thanh toán thất bại.",
      );
    }

    const response =
        await apiClient.patch<
            ApiResponse<PaymentResult>
        >(
            `${ADMIN_PAYMENT_BASE_URL}/${id}/fail`,
            {
              reason:
              normalizedReason,
            },
        );

    const payment =
        requireApiData(
            response.data,
            "Không thể cập nhật thanh toán thất bại.",
        );

    return normalizePayment(
        payment,
    );
  },
};