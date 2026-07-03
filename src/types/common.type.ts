export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/**
 * Backend PageResponse hiện tại:
 * {
 *   content: T[],
 *   page: number,
 *   size: number,
 *   totalElements: number,
 *   totalPages: number,
 *   first: boolean,
 *   last: boolean,
 *   empty: boolean
 * }
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Giữ lại PageResult để không làm vỡ các màn cũ nếu Khoa đang dùng.
 * Nhưng từ giờ các service mới nên ưu tiên dùng PageResponse<T>.
 */
export interface PageResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  size: number;
}

export type Role =
    | "ROLE_ADMIN"
    | "ROLE_STAFF"
    | "ROLE_TRAINER"
    | "ROLE_MEMBER";

export type Status =
    | "ACTIVE"
    | "INACTIVE"
    | "LOCKED"
    | "PENDING"
    | "EXPIRED"
    | "CANCELLED";

export type InvoiceStatus =
    | "UNPAID"
    | "PAID"
    | "CANCELLED"
    | "REFUNDED";

export type PaymentStatus =
    | "PENDING"
    | "SUCCESS"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";

export type PaymentMethod =
    | "CASH"
    | "BANK_TRANSFER"
    | "VNPAY";

export type SubscriptionStatus =
    | "PENDING_PAYMENT"
    | "ACTIVE"
    | "EXPIRED"
    | "CANCELLED";