import type { Role } from "./common.type";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthUser {
  id?: number;
  username: string;
  fullName?: string;
  email?: string;
  role: Role;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}
