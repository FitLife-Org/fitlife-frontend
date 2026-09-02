import apiClient from "./apiClient";

import {
  getApiErrorCode,
  getApiErrorMessage,
} from "../utils/apiError";

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

/* ============================================================
 * HELPERS
 * ============================================================ */

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
      payload.accessToken ??
      payload.token;

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

  const roles =
      normalizeRoles(payload);

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

      username:
      payload.username,

      email:
          payload.email ??
          "",

      fullName:
          payload.fullName ??
          "User",

      avatarUrl:
          payload.avatarUrl ??
          null,

      roles,
    },
  };
};

const normalizeRegisterResult = (
    payload: AuthResponsePayload | undefined,
    fallbackEmail: string,
    fallbackFullName: string,
): RegisterResult => {
  const roles =
      payload
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

/* ============================================================
 * ERROR HELPERS
 * ============================================================ */

/**
 * Cho component sử dụng khi cần lấy
 * code/message từ AxiosError.
 *
 * QUAN TRỌNG:
 * authService không wrap AxiosError thành Error mới,
 * vì sẽ làm mất:
 *
 * error.response.status
 * error.response.data
 * error.response.data.data
 */
export const extractErrorCode =
    getApiErrorCode;

export const extractErrorMessage =
    getApiErrorMessage;

/* ============================================================
 * AUTH SERVICE
 * ============================================================ */

export const authService = {
  // ==========================================================
  // LOGIN
  // ==========================================================

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

  // ==========================================================
  // REGISTER
  // ==========================================================

  /**
   * Không catch + throw new Error ở đây.
   *
   * Nếu Backend trả:
   *
   * {
   *   code: 1001,
   *   message: "Validation failed",
   *   data: {
   *     phone: "Phone number is invalid"
   *   }
   * }
   *
   * component cần giữ nguyên AxiosError để đọc data.phone.
   */
  async register(
      data: RegisterRequest,
  ): Promise<RegisterResult> {
    const normalizedRequest:
        RegisterRequest = {
      ...data,

      username:
          data.username
              .trim()
              .toLowerCase(),

      email:
          data.email
              .trim()
              .toLowerCase(),

      fullName:
          data.fullName
              .trim(),

      phone:
          data.phone
              ?.trim() ||
          undefined,
    };

    const response =
        await apiClient.post<
            ApiResponse<AuthResponsePayload>
        >(
            "/auth/register",
            normalizedRequest,
        );

    return normalizeRegisterResult(
        response.data.data,
        normalizedRequest.email,
        normalizedRequest.fullName,
    );
  },

  // ==========================================================
  // GOOGLE LOGIN
  // ==========================================================

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

  // ==========================================================
  // VERIFY EMAIL
  // ==========================================================

  /**
   * Public endpoint:
   *
   * GET /auth/verify-email?token=...
   */
  async verifyEmail(
      token: string,
  ): Promise<string> {
    const normalizedToken =
        token.trim();

    if (!normalizedToken) {
      throw new Error(
          "Token xác minh email không hợp lệ.",
      );
    }

    const response =
        await apiClient.get<
            ApiResponse<void>
        >(
            "/auth/verify-email",
            {
              params: {
                token:
                normalizedToken,
              },
            },
        );

    return (
        response.data.message ||
        "Xác minh email thành công."
    );
  },

  // ==========================================================
  // RESEND VERIFICATION EMAIL
  // ==========================================================

  /**
   * Public endpoint:
   *
   * POST /auth/resend-verification
   *
   * {
   *   "email": "member@gmail.com"
   * }
   */
  async resendVerificationEmail(
      data:
      ResendVerificationEmailRequest,
  ): Promise<string> {
    const email =
        data.email
            ?.trim()
            .toLowerCase();

    if (!email) {
      throw new Error(
          "Email không được để trống.",
      );
    }

    const response =
        await apiClient.post<
            ApiResponse<void>
        >(
            "/auth/resend-verification",
            {
              ...data,
              email,
            },
        );

    return (
        response.data.message ||
        "Email xác minh đã được gửi lại."
    );
  },

  // ==========================================================
  // REFRESH TOKEN
  // ==========================================================

  async refreshToken():
      Promise<AuthSession> {
    const refreshToken =
        tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error(
          "Không tìm thấy refresh token.",
      );
    }

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
  },

  // ==========================================================
  // FORGOT PASSWORD
  // ==========================================================

  async forgotPassword(
      data: ForgotPasswordRequest,
  ): Promise<string> {
    const response =
        await apiClient.post<
            ApiResponse<void>
        >(
            "/auth/forgot-password",
            {
              ...data,

              email:
                  data.email
                      .trim()
                      .toLowerCase(),
            },
        );

    return (
        response.data.message ||
        "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn."
    );
  },

  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  async resetPassword(
      data: ResetPasswordRequest,
  ): Promise<string> {
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
  },

  // ==========================================================
  // LOGOUT
  // ==========================================================

  async logout():
      Promise<void> {
    const refreshToken =
        tokenStorage.getRefreshToken();

    /*
     * Không có refresh token thì client
     * đã không còn session để revoke.
     */
    if (!refreshToken) {
      return;
    }

    await apiClient.post<
        ApiResponse<void>
    >(
        "/auth/logout",
        {
          refreshToken,
        },
    );
  },

  // ==========================================================
  // LOGOUT ALL
  // ==========================================================

  async logoutAll():
      Promise<void> {
    await apiClient.post<
        ApiResponse<void>
    >(
        "/auth/logout-all",
    );
  },

  // ==========================================================
  // AUTH STATE
  // ==========================================================

  isAuthenticated():
      boolean {
    return Boolean(
        tokenStorage.getAccessToken() &&
        tokenStorage.getRefreshToken(),
    );
  },
};