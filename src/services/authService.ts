import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { AuthSession, LoginRequest, RegisterRequest } from "../types/auth.type";
import { tokenStorage } from "../utils/token";

const normalizeSession = (payload: AuthSession | { token?: string; accessToken?: string; user?: AuthSession["user"] }): AuthSession => {
  const token = payload.token || payload.accessToken;

  if (!token) {
    throw new Error("Không nhận được token từ máy chủ.");
  }

  return {
    token,
    user: payload.user || {
      username: "fitlife-user",
      role: "MEMBER",
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

  async register(data: RegisterRequest): Promise<AuthSession | null> {
    const response = await apiClient.post<ApiResponse<AuthSession | null> | AuthSession>("/auth/register", data);
    const payload = "data" in response.data ? response.data.data : response.data;

    if (!payload) return null;

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
