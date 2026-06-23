import type { Role } from "./common.type";

export interface LoginRequest {
  identifier: string;
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
  idToken?: string;
  code?: string;
}
