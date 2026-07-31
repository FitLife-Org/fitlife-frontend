export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse<
    T = unknown,
> {
  code?: number;
  message?: string;
  data?: T;
  error?: string;
  timestamp?: string;
  path?: string;
}

export interface ValidationErrorData {
  [fieldName: string]: string;
}

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
 * Tương thích tạm với các màn hình cũ.
 * Service mới nên dùng PageResponse<T>.
 */
export interface PageResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  size: number;
}

/**
 * Tương thích với Spring Page trả trực tiếp.
 */
export interface SpringPage<T> {
  content: T[];

  pageable?: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };

  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;

  sort?: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
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
    | "PAUSED"
    | "EXPIRED"
    | "CANCELLED";