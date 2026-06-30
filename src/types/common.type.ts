export interface ApiResponse<T = unknown> {
  code?: number;
  message?: string;
  data?: T;
}

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
    | "EXPIRED";