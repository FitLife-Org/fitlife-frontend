import axios from "axios";

import apiClient from "../lib/apiClient";

import type {
  ApiResponse,
  Role,
} from "../types/common.type";

import type {
  AuthResponsePayload,
  AuthSession,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResult,
  ResendVerificationEmailRequest,
  ResetPasswordRequest,
} from "../types/auth.type";

import { tokenStorage } from "../utils/token";

interface BackendErrorResponse {
  code?: number;
  message?: string;
  error?: string;
}

const normalizeRoles = (
    payload: AuthResponsePayload,
): Role[] => {
  if (
      Array.isArray(payload.roles) &&
      payload.roles.length > 0
  ) {
    return payload.roles;
  }

  if (
      Array.isArray(payload.authorities) &&
      payload.authorities.length > 0
  ) {
    return payload.authorities;
  }

  if (payload.role) {
    return [payload.role];
  }

  return [];
};

const normalizeSession = (
    payload?: AuthResponsePayload,
): AuthSession => {
  if (!payload) {
    throw new Error(
        "Máy chủ không trả về dữ liệu đăng nhập.",
    );
  }

  const accessToken =
      payload.accessToken || payload.token;

  const refreshToken =
      payload.refreshToken;

  if (!accessToken) {
    throw new Error(
        "Không nhận được access token từ máy chủ.",
    );
  }

  if (!refreshToken) {
    throw new Error(
        "Không nhận được refresh token từ máy chủ.",
    );
  }

  const roles = normalizeRoles(payload);

  if (roles.length === 0) {
    throw new Error(
        "Không nhận được quyền người dùng từ máy chủ.",
    );
  }

  return {
    accessToken,
    refreshToken,

    user: {
      userId:
          payload.userId ??
          payload.id ??
          0,

      username: payload.username,

      email: payload.email ?? "",

      fullName:
          payload.fullName ?? "User",

      roles,
    },
  };
};

const normalizeRegisterResult = (
    payload: AuthResponsePayload | undefined,
    fallbackEmail: string,
    fallbackFullName: string,
): RegisterResult => {
  const roles = payload
      ? normalizeRoles(payload)
      : [];

  return {
    userId:
        payload?.userId ??
        payload?.id ??
        0,

    email:
        payload?.email ??
        fallbackEmail,

    fullName:
        payload?.fullName ??
        fallbackFullName,

    roles,
  };
};

export const extractErrorCode = (
    error: unknown,
): number | undefined => {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  const responseData =
      error.response
          ?.data as
          | BackendErrorResponse
          | undefined;

  return responseData?.code;
};

export const extractErrorMessage = (
    error: unknown,
): string => {
  if (axios.isAxiosError(error)) {
    const responseData =
        error.response
            ?.data as
            | BackendErrorResponse
            | undefined;

    const backendCode =
        responseData?.code;

    const backendMessage =
        responseData?.message ||
        responseData?.error;

    if (
        backendCode === 5018 ||
        backendMessage ===
        "Email has not been verified"
    ) {
      return "Email chưa được xác minh. Vui lòng kiểm tra hộp thư hoặc gửi lại email xác minh.";
    }

    if (
        error.response?.status === 401
    ) {
      return "Email, tên đăng nhập hoặc mật khẩu không chính xác.";
    }

    if (
        error.response?.status === 403
    ) {
      return (
          backendMessage ||
          "Tài khoản hiện không thể đăng nhập."
      );
    }

    return (
        backendMessage ||
        "Có lỗi xảy ra. Vui lòng thử lại."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Có lỗi xảy ra. Vui lòng thử lại.";
};

export const authService = {
  async login(
      credentials: LoginRequest,
  ): Promise<AuthSession> {
    const response =
        await apiClient.post<
            ApiResponse<AuthResponsePayload>
        >(
            "/auth/login",
            credentials,
        );

    return normalizeSession(
        response.data.data,
    );
  },

  async register(
      data: RegisterRequest,
  ): Promise<RegisterResult> {
    try {
      const response =
          await apiClient.post<
              ApiResponse<AuthResponsePayload>
          >(
              "/auth/register",
              data,
          );

      return normalizeRegisterResult(
          response.data.data,
          data.email,
          data.fullName,
      );
    } catch (error: unknown) {
      throw new Error(
          extractErrorMessage(error),
      );
    }
  },

  async googleLogin(
      idToken: string,
  ): Promise<AuthSession> {
    const response =
        await apiClient.post<
            ApiResponse<AuthResponsePayload>
        >(
            "/auth/google-login",
            {
              idToken,
            },
        );

    return normalizeSession(
        response.data.data,
    );
  },

  async verifyEmail(
      token: string,
  ): Promise<string> {
    try {
      const response =
          await apiClient.get<
              ApiResponse<void>
          >(
              "/auth/verify-email",
              {
                params: {
                  token,
                },
              },
          );

      return (
          response.data.message ||
          "Xác minh email thành công."
      );
    } catch (error: unknown) {
      throw new Error(
          extractErrorMessage(error),
      );
    }
  },

  async resendVerificationEmail(
      data: ResendVerificationEmailRequest,
  ): Promise<string> {
    try {
      const response =
          await apiClient.post<
              ApiResponse<void>
          >(
              "/auth/resend-verification-email",
              data,
          );

      return (
          response.data.message ||
          "Email xác minh đã được gửi lại."
      );
    } catch (error: unknown) {
      throw new Error(
          extractErrorMessage(error),
      );
    }
  },

  async refreshToken(): Promise<AuthSession> {
    const refreshToken =
        tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error(
          "Không tìm thấy refresh token.",
      );
    }

    try {
      const response =
          await apiClient.post<
              ApiResponse<AuthResponsePayload>
          >(
              "/auth/refresh-token",
              {
                refreshToken,
              },
          );

      return normalizeSession(
          response.data.data,
      );
    } catch (error: unknown) {
      throw new Error(
          extractErrorMessage(error),
      );
    }
  },

  async forgotPassword(
      data: ForgotPasswordRequest,
  ): Promise<string> {
    try {
      const response =
          await apiClient.post<
              ApiResponse<void>
          >(
              "/auth/forgot-password",
              data,
          );

      return (
          response.data.message ||
          "OTP đã được gửi đến email của bạn."
      );
    } catch (error: unknown) {
      throw new Error(
          extractErrorMessage(error),
      );
    }
  },

  async resetPassword(
      data: ResetPasswordRequest,
  ): Promise<string> {
    try {
      const response =
          await apiClient.post<
              ApiResponse<void>
          >(
              "/auth/reset-password",
              data,
          );

      return (
          response.data.message ||
          "Đặt lại mật khẩu thành công."
      );
    } catch (error: unknown) {
      throw new Error(
          extractErrorMessage(error),
      );
    }
  },

  async logout(): Promise<void> {
    const refreshToken =
        tokenStorage.getRefreshToken();

    if (!refreshToken) {
      return;
    }

    await apiClient.post<ApiResponse<void>>(
        "/auth/logout",
        {
          refreshToken,
        },
    );
  },

  async logoutAll(): Promise<void> {
    await apiClient.post<ApiResponse<void>>(
        "/auth/logout-all",
    );
  },

  isAuthenticated(): boolean {
    return Boolean(
        tokenStorage.getAccessToken() &&
        tokenStorage.getRefreshToken(),
    );
  },
};