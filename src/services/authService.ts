import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { AuthSession, LoginRequest, RegisterRequest, GoogleLoginRequest } from "../types/auth.type";
import { tokenStorage } from "../utils/token";

const normalizeSession = (payload: any): AuthSession => {
  const token = payload?.token || payload?.accessToken;

  if (!token) {
    throw new Error("Không nhận được token từ máy chủ.");
  }

  return {
    token,
    user: {
      userId: payload?.userId || 0,
      email: payload?.email || "unknown@email.com",
      fullName: payload?.fullName || "User",
      roles: payload?.roles || ["MEMBER"],
    },
  };
};

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthSession> {
    const response = await apiClient.post<ApiResponse<AuthSession> | AuthSession>("/auth/login", credentials);
    const payload = "data" in response.data && response.data.data ? response.data.data : response.data;
    const session = normalizeSession(payload);
    tokenStorage.set(session.token);
    return session;
  },

  async register(data: RegisterRequest): Promise<AuthSession> {
    const response = await apiClient.post<ApiResponse<AuthSession> | AuthSession>("/auth/register", data);
    const payload = "data" in response.data && response.data.data ? response.data.data : response.data;
    const session = normalizeSession(payload);
    tokenStorage.set(session.token);
    return session;
  },

  async googleLogin(requestData: GoogleLoginRequest): Promise<AuthSession> {
    const response = await apiClient.post<ApiResponse<AuthSession>>(
      "/auth/google-login", requestData);

    const payload =
        "data" in response.data && response.data.data
            ? response.data.data
            : response.data;

    const session = normalizeSession(payload);
    tokenStorage.set(session.token);
    return session;
  },

  logout(): void {
    tokenStorage.clear();
  },

  isAuthenticated(): boolean {
    return Boolean(tokenStorage.get());
  },
};
