import type { Role, Status } from "../../../types/common.type";

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  roles: string[];
  status: Status;
  avatarUrl?: string;
  authProvider?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserCreateRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  roleCode: string;
  status?: string;
}

export interface AdminUserUpdateRequest {
  fullName?: string;
  phone?: string;
  status?: string;
}
