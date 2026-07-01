import type { Role, Status } from "./common.type";

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  status: Status;
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
