export interface ApiResponse<T> {
  code?: number;
  message?: string;
  data: T;
}

export interface PageResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  size: number;
}

export type Role = "ADMIN" | "STAFF" | "TRAINER" | "MEMBER";

export type Status = "ACTIVE" | "INACTIVE" | "PENDING" | "EXPIRED";
