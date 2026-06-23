import type { Role } from "./common.type";

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface AuthResponsePayload {
  accessToken?: string;
  token?: string;
  tokenType?: string;
  userId?: number;
  email?: string;
  fullName?: string;
  roles?: Role[];
}

export interface AuthUser {
  userId: number;
  email: string;
  fullName: string;
  roles: Role[];
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}