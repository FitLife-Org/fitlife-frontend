import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

import { tokenStorage } from "../utils/token";

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api/v1";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

/**
 * Axios instance riêng để refresh token.
 * Không dùng apiClient để tránh interceptor gọi lặp vô hạn.
 */
const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
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

const PUBLIC_AUTH_ENDPOINTS = [
    "/auth/login",
    "/auth/register",
    "/auth/google-login",
    "/auth/verify-email",
    "/auth/resend-verification-email",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/refresh-token",
    "/auth/logout",
];

const isPublicAuthEndpoint = (
    url?: string,
): boolean => {
    if (!url) {
        return false;
    }

    return PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
        url.includes(endpoint),
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
        url.includes("/public/") ||
        url.includes("/gym-packages") ||
        url.includes("/package-durations") ||
        url.includes("/payments/vnpay/return") ||
        url.includes("/payments/vnpay/ipn")
    );
};

const isValidJwtFormat = (
    token: string,
): boolean => {
    return token.split(".").length === 3;
};

const clearAuthenticationAndRedirect = (): void => {
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
         * Không gửi access token tới các Auth API public.
         */
        if (
            accessToken &&
            !isPublicAuthEndpoint(config.url)
        ) {
            if (isValidJwtFormat(accessToken)) {
                config.headers.Authorization =
                    `Bearer ${accessToken}`;
            } else {
                clearAuthenticationAndRedirect();
            }
        }

        return config;
    },
    (error: unknown) => Promise.reject(error),
);

apiClient.interceptors.response.use(
    (response) => response,

    async (
        error: AxiosError<BackendErrorResponse>,
    ) => {
        const status = error.response?.status;
        const data = error.response?.data;

        const originalRequest =
            error.config as RetryRequestConfig | undefined;

        const requestUrl = originalRequest?.url;

        console.error("API_ERROR:", {
            status,
            url: requestUrl,
            data,
        });

        /*
         * Auth API tự xử lý lỗi ở page/hook.
         *
         * Ví dụ login trả EMAIL_NOT_VERIFIED 403 thì không được
         * tự chuyển người dùng sang /403.
         */
        if (isPublicAuthEndpoint(requestUrl)) {
            return Promise.reject(error);
        }

        /*
         * Nếu API protected trả 401:
         * - lấy refresh token;
         * - gọi refresh-token;
         * - lưu access token mới;
         * - gửi lại request cũ.
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
                    refreshResponse.data?.data?.accessToken;

                const returnedRefreshToken =
                    refreshResponse.data?.data?.refreshToken;

                if (!newAccessToken) {
                    clearAuthenticationAndRedirect();
                    return Promise.reject(error);
                }

                tokenStorage.setAccessToken(
                    newAccessToken,
                );

                /*
                 * Backend MVP có thể trả lại refresh token cũ.
                 * Sau này nếu có token rotation thì lưu token mới.
                 */
                if (returnedRefreshToken) {
                    tokenStorage.setRefreshToken(
                        returnedRefreshToken,
                    );
                }

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return apiClient(originalRequest);
            } catch (refreshError) {
                clearAuthenticationAndRedirect();

                return Promise.reject(refreshError);
            }
        }

        /*
         * Token malformed phía backend phải trả 401.
         * Giữ fallback này trong giai đoạn chuyển đổi.
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
         * 403 của API protected mới chuyển Forbidden.
         * Không áp dụng với Auth API.
         */
        if (
            status === 403 &&
            !isPublicEndpoint(requestUrl) &&
            !window.location.pathname.includes("/403")
        ) {
            window.location.href = "/403";
        }

        return Promise.reject(error);
    },
);

export default apiClient;