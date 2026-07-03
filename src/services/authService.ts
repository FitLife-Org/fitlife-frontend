import axios from "axios";
import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type {
  AuthResponsePayload,
  AuthSession,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "../types/auth.type";
import { tokenStorage } from "../utils/token";
import type { Role } from "../types/common.type";

const normalizeRoles = (payload: AuthResponsePayload): Role[] => {
  if (Array.isArray(payload.roles) && payload.roles.length > 0) {
    return payload.roles;
  }

  if (Array.isArray(payload.authorities) && payload.authorities.length > 0) {
    return payload.authorities;
  }

  if (payload.role) {
    return [payload.role];
  }

  return [];
};

const normalizeSession = (payload?: AuthResponsePayload): AuthSession => {
  if (!payload) {
    throw new Error("Máy chủ không trả về dữ liệu đăng nhập.");
  }

  const token = payload.accessToken || payload.token;

  if (!token) {
    throw new Error("Không nhận được token từ máy chủ.");
  }

  const roles = normalizeRoles(payload);

  if (roles.length === 0) {
    throw new Error("Không nhận được quyền người dùng từ máy chủ.");
  }

  return {
    token,
    user: {
      userId: payload.userId ?? payload.id ?? 0,
      username: payload.username,
      email: payload.email ?? "",
      fullName: payload.fullName ?? "User",
      roles,
    },
  };
};

const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return "Email, tên đăng nhập hoặc mật khẩu không chính xác.";
    }

    if (error.response?.status === 403) {
      return "Tài khoản không có quyền truy cập chức năng này.";
    }

    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Có lỗi xảy ra. Vui lòng thử lại."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Có lỗi xảy ra. Vui lòng thử lại.";
};

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthSession> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponsePayload>>(
          "/auth/login",
          credentials
      );

      const session = normalizeSession(response.data.data);
      tokenStorage.set(session.token);

      return session;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async register(data: RegisterRequest): Promise<AuthSession> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponsePayload>>(
          "/auth/register",
          data
      );

      const session = normalizeSession(response.data.data);
      tokenStorage.set(session.token);

      return session;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async googleLogin(idToken: string): Promise<AuthSession> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponsePayload>>(
          "/auth/google-login",
          { idToken }
      );

      const session = normalizeSession(response.data.data);
      tokenStorage.set(session.token);

      return session;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<string> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
          "/auth/forgot-password",
          data
      );

      return response.data.message || "OTP đã được gửi đến email của bạn.";
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<string> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
          "/auth/reset-password",
          data
      );

      return response.data.message || "Đặt lại mật khẩu thành công.";
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error));
    }
  },

  logout(): void {
    tokenStorage.clear();
    localStorage.removeItem("authUser");
  },

  isAuthenticated(): boolean {
    return Boolean(tokenStorage.get());
  },
};