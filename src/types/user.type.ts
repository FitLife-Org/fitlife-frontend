import type { Role } from "./common.type";

export type UserStatus =
    | "PENDING"
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | "LOCKED";

export type AuthProvider =
    | "LOCAL"
    | "GOOGLE";

export interface User {
  id: number;

  username: string;
  fullName: string;
  email: string;

  phone?: string | null;

  roles: Role[];

  status: UserStatus;

  avatarUrl?: string | null;

  authProvider?: AuthProvider;

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

  roleCode: Role;

  status?: UserStatus;
}

export interface AdminUserUpdateRequest {
  username: string;

  email: string;

  fullName: string;

  phone: string;

  status: UserStatus;
}

export interface AdminUpdateUserStatusRequest {
  status: UserStatus;
}

export interface AdminUpdateUserRolesRequest {
  roleCodes: Role[];
}