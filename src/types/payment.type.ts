export type PaymentMethod =
    | "CASH"
    | "BANK_TRANSFER"
    | "VNPAY";

export type OfflinePaymentMethod =
    Exclude<
        PaymentMethod,
        "VNPAY"
    >;

export type PaymentStatus =
    | "PENDING"
    | "SUCCESS"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";

// =====================================================
// MEMBER - CREATE PAYMENT
// =====================================================

export interface PaymentRequest {
  invoiceId: number;

  paymentMethod:
      PaymentMethod;

  note?: string;
}

// =====================================================
// ADMIN / STAFF - OFFLINE PAYMENT
// =====================================================

export interface OfflinePaymentRequest {
  invoiceId: number;

  paymentMethod:
      OfflinePaymentMethod;

  /**
   * Giữ lại để tương thích endpoint offline
   * nếu Backend cho phép Admin/Staff nhập số tiền.
   *
   * Nếu DTO Backend không có amount,
   * có thể bỏ field này sau khi audit Backend.
   */
  amount?: number;

  note?: string;
}

// =====================================================
// VNPAY
// =====================================================

export interface VnpayCreateUrlRequest {
  invoiceId: number;
}

export interface VnpayCreateUrlResponse {
  paymentId: number;

  paymentCode: string;

  paymentUrl: string;

  amount: number;
}

// =====================================================
// PAYMENT RESPONSE
// =====================================================

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

  paymentMethod:
      PaymentMethod;

  /**
   * Field chuẩn phía FE.
   */
  paymentStatus:
      PaymentStatus;

  /**
   * Compatibility cho response Backend cũ
   * nếu một số endpoint vẫn trả "status".
   *
   * Service sẽ normalize status
   * -> paymentStatus.
   */
  status?: PaymentStatus;

  /**
   * Mã giao dịch từ payment gateway /
   * giao dịch offline.
   */
  transactionNo?: string;

  paidAt?: string;

  note?: string;

  failedReason?: string;

  cancelledAt?: string;

  createdAt?: string;

  updatedAt?: string;
}

// =====================================================
// ADMIN FILTER
// =====================================================

export interface AdminPaymentFilter {
  page?: number;

  size?: number;

  status?: PaymentStatus;

  method?: PaymentMethod;

  memberId?: number;

  invoiceId?: number;
}

// =====================================================
// ADMIN CONFIRM
// =====================================================

export interface ConfirmPaymentRequest {
  transactionNo?: string;

  note?: string;
}