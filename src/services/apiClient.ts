import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

import { tokenStorage } from "../utils/token";

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api/v1";

const DEFAULT_TIMEOUT_MS = 30_000;
const REFRESH_TIMEOUT_MS = 15_000;

const apiClient = axios.create({
    baseURL: API_BASE_URL,

    headers: {
        "Content-Type": "application/json",
    },

    timeout: DEFAULT_TIMEOUT_MS,
});

/**
 * Axios instance riêng dùng để refresh token.
 *
 * Không dùng apiClient để tránh interceptor tự gọi lặp
 * khi refresh token hết hạn hoặc không hợp lệ.
 */
const refreshClient = axios.create({
    baseURL: API_BASE_URL,

    headers: {
        "Content-Type": "application/json",
    },

    timeout: REFRESH_TIMEOUT_MS,
});

interface RetryRequestConfig
    extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

interface BackendErrorResponse {
    code?: number;
    message?: string;
    error?: string;
}

/**
 * Các Auth API không cần access token.
 *
 * Không đưa /auth/logout và /auth/logout-all vào đây
 * vì backend yêu cầu access token cho hai endpoint này.
 */
const PUBLIC_AUTH_ENDPOINTS = [
    "/auth/login",
    "/auth/register",
    "/auth/google-login",
    "/auth/verify-email",
    "/auth/resend-verification-email",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/refresh-token",
];

const isPublicAuthEndpoint = (
    url?: string,
): boolean => {
    if (!url) {
        return false;
    }

    return PUBLIC_AUTH_ENDPOINTS.some(
        (endpoint) => url.includes(endpoint),
    );
};

const isPublicEndpoint = (
    url?: string,
): boolean => {
    if (!url) {
        return false;
    }

    return (
        isPublicAuthEndpoint(url) ||
        url === "/gym-packages" ||
        url.startsWith("/gym-packages/") ||
        url === "/package-durations" ||
        url.startsWith("/package-durations/") ||
        url.includes("/payments/vnpay/return") ||
        url.includes("/payments/vnpay/ipn")
    );
};

const isValidJwtFormat = (
    token: string,
): boolean => {
    return token.split(".").length === 3;
};

const clearAuthenticationAndRedirect =
    (): void => {
        tokenStorage.clear();
        localStorage.removeItem("authUser");

        if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/login")
        ) {
            window.location.href = "/login";
        }
    };

apiClient.interceptors.request.use(
    (config) => {
        const accessToken =
            tokenStorage.getAccessToken();

        /*
         * Không gửi access token vào các Auth API public.
         *
         * Các API protected, bao gồm AI, logout và logout-all,
         * sẽ tự động được gắn Bearer token.
         */
        if (
            accessToken &&
            !isPublicAuthEndpoint(config.url)
        ) {
            if (!isValidJwtFormat(accessToken)) {
                clearAuthenticationAndRedirect();

                return Promise.reject(
                    new Error("Access token không hợp lệ."),
                );
            }

            config.headers.Authorization =
                `Bearer ${accessToken}`;
        }

        return config;
    },

    (error: unknown) =>
        Promise.reject(error),
);

apiClient.interceptors.response.use(
    (response) => response,

    async (
        error: AxiosError<BackendErrorResponse>,
    ) => {
        const status = error.response?.status;
        const data = error.response?.data;

        const originalRequest =
            error.config as
                | RetryRequestConfig
                | undefined;

        const requestUrl =
            originalRequest?.url;

        if (import.meta.env.DEV) {
            console.error("API_ERROR:", {
                status,
                url: requestUrl,
                data,
            });
        }

        /*
         * Auth public API tự hiển thị lỗi tại page/hook.
         *
         * Ví dụ:
         * - EMAIL_NOT_VERIFIED
         * - INVALID_CREDENTIALS
         * - INVALID_REFRESH_TOKEN
         */
        if (isPublicAuthEndpoint(requestUrl)) {
            return Promise.reject(error);
        }

        /*
         * Protected API trả 401:
         *
         * 1. Lấy refresh token.
         * 2. Gọi /auth/refresh-token bằng refreshClient.
         * 3. Lưu access token mới.
         * 4. Gửi lại request ban đầu đúng một lần.
         */
        if (
            status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            const refreshToken =
                tokenStorage.getRefreshToken();

            if (!refreshToken) {
                clearAuthenticationAndRedirect();

                return Promise.reject(error);
            }

            try {
                const refreshResponse =
                    await refreshClient.post(
                        "/auth/refresh-token",
                        {
                            refreshToken,
                        },
                    );

                const newAccessToken =
                    refreshResponse.data?.data
                        ?.accessToken;

                const returnedRefreshToken =
                    refreshResponse.data?.data
                        ?.refreshToken;

                if (!newAccessToken) {
                    clearAuthenticationAndRedirect();

                    return Promise.reject(error);
                }

                tokenStorage.setAccessToken(
                    newAccessToken,
                );

                /*
                 * Backend có thể triển khai refresh-token rotation.
                 * Nếu response có refresh token mới thì lưu lại.
                 */
                if (returnedRefreshToken) {
                    tokenStorage.setRefreshToken(
                        returnedRefreshToken,
                    );
                }

                originalRequest.headers =
                    originalRequest.headers ?? {};

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return apiClient(originalRequest);
            } catch (refreshError) {
                clearAuthenticationAndRedirect();

                return Promise.reject(
                    refreshError,
                );
            }
        }

        /*
         * Fallback tạm thời cho backend cũ từng trả lỗi JWT dưới dạng 500.
         * Khi toàn backend đã chuẩn hóa 401 thì có thể xóa đoạn này.
         */
        const isLegacyJwtServerError =
            status === 500 &&
            typeof data?.message === "string" &&
            (
                data.message.includes("JWT") ||
                data.message.includes("Jwt") ||
                data.message.includes(
                    "MalformedJwtException",
                )
            );

        if (
            isLegacyJwtServerError &&
            !isPublicEndpoint(requestUrl)
        ) {
            clearAuthenticationAndRedirect();

            return Promise.reject(error);
        }

        /*
         * 403 của protected API chuyển sang trang Forbidden.
         *
         * Không áp dụng với Auth API public vì page Auth
         * cần tự hiển thị lỗi nghiệp vụ.
         */
        if (
            status === 403 &&
            !isPublicEndpoint(requestUrl) &&
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/403")
        ) {
            window.location.href = "/403";
        }

        return Promise.reject(error);
    },
);

export default apiClient;