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

const normalizeSession = (payload?: AuthResponsePayload): AuthSession => {
  if (!payload) {
    throw new Error("Máy chủ không trả về dữ liệu đăng nhập.");
  }

  const token = payload.accessToken || payload.token;

  if (!token) {
    throw new Error("Không nhận được token từ máy chủ.");
  }

  const rawRoles: string[] = payload?.roles || ["MEMBER"];
  const normalizedRoles = rawRoles.map(role => role.replace(/^ROLE_/, ''));

  return {
    token,
    user: {
      userId: payload.userId ?? 0,
      email: payload.email ?? "unknown@email.com",
      fullName: payload.fullName ?? "User",
      roles: payload.roles ?? (["ROLE_MEMBER"] as Role[]),
    },
  };
};

const extractErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
        };
      };
    };

    return (
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  logout(): void {
    tokenStorage.clear();
  },

  isAuthenticated(): boolean {
    return Boolean(tokenStorage.get());
  },
};