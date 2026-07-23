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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ResendVerificationEmailRequest {
  email: string;
}

export interface AuthResponsePayload {
  accessToken?: string | null;
  refreshToken?: string | null;

  token?: string | null;
  tokenType?: string;

  userId?: number;
  id?: number;

  username?: string;
  email?: string;
  fullName?: string;

  role?: Role;
  roles?: Role[];
  authorities?: Role[];
}

export interface AuthUser {
  userId: number;
  username?: string;
  email: string;
  fullName: string;
  roles: Role[];
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RegisterResult {
  userId: number;
  email: string;
  fullName: string;
  roles: Role[];
}