import type { Role } from "./common.type";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthUser {
  userId: number;
  email: string;
  fullName: string;
  roles: string[];
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface GoogleLoginRequest {
  token: string;
}
