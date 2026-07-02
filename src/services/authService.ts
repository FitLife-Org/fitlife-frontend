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

  const roles: Role[] =
      payload.roles && payload.roles.length > 0
          ? payload.roles
          : ["ROLE_MEMBER"];

  return {
    token,
    user: {
      userId: payload.userId ?? 0,
      email: payload.email ?? "unknown@email.com",
      fullName: payload.fullName ?? "User",
      roles,
    },
  };
};

const extractErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: {
          message?: string;
          error?: string;
        };
      };
    };

    if (axiosError.response?.status === 401) {
      return "Email, tên đăng nhập hoặc mật khẩu không chính xác.";
    }

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
      // Nếu có backend trả về lỗi 4xx
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 401) {
            throw new Error("Email, tên đăng nhập hoặc mật khẩu không chính xác.");
        }
      }

      // MOCK FALLBACK: Nếu không có backend, giả lập login
      const id = credentials.identifier;
      const pwd = credentials.password;
      
      if (id === "admin@fitlife.com" && pwd === "123456") {
          const mockSession: AuthSession = { token: "mock-admin-token", user: { userId: 1, email: id, fullName: "Admin System", roles: ["ROLE_ADMIN"] } };
          tokenStorage.set(mockSession.token);
          return mockSession;
      } else if (id === "member@fitlife.com" && pwd === "123456") {
          const mockSession: AuthSession = { token: "mock-member-token", user: { userId: 2, email: id, fullName: "Member User", roles: ["ROLE_MEMBER"] } };
          tokenStorage.set(mockSession.token);
          return mockSession;
      } else if (id === "staff@fitlife.com" && pwd === "123456") {
          const mockSession: AuthSession = { token: "mock-staff-token", user: { userId: 3, email: id, fullName: "Staff User", roles: ["ROLE_STAFF"] } };
          tokenStorage.set(mockSession.token);
          return mockSession;
      }

      throw new Error("Email, tên đăng nhập hoặc mật khẩu không chính xác.");
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

  async googleLogin(token: string): Promise<AuthSession> {
    try {
      // Đầu tiên thử gửi token (access_token hoặc id_token) lên backend
      const response = await apiClient.post<ApiResponse<AuthResponsePayload>>(
          "/auth/google-login",
          { idToken: token }
      );

      const session = normalizeSession(response.data.data);
      tokenStorage.set(session.token);

      return session;
    } catch (error) {
      console.warn("Backend google-login failed, falling back to mock session...", error);
      
      try {
        // Fetch user info từ Google bằng access_token
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!userInfoRes.ok) throw new Error("Invalid access token");
        
        const userInfo = await userInfoRes.json();
        
        // Tạo mock session
        const mockSession: AuthSession = {
          token: "mock-google-jwt-token-" + Date.now(),
          user: {
            userId: 999,
            email: userInfo.email,
            fullName: userInfo.name,
            roles: ["ROLE_MEMBER"]
          }
        };
        
        tokenStorage.set(mockSession.token);
        
        // Lưu cả thông tin user vào localStorage để các màn hình khác có thể hiển thị
        localStorage.setItem("user", JSON.stringify({
          userId: mockSession.user.userId,
          email: mockSession.user.email,
          roles: mockSession.user.roles,
          fullName: mockSession.user.fullName
        }));

        return mockSession;
      } catch (fallbackError) {
        console.error("Mock fallback also failed:", fallbackError);
        throw error; // Throw original error
      }
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