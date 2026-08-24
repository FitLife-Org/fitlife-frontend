import axios, {
    AxiosHeaders,
    type AxiosError,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from "axios";

import { env } from "../config/env";

import type {
    ApiResponse,
} from "../types/common.type";

import type {
    AuthResponsePayload,
} from "../types/auth.type";

import { tokenStorage } from "../utils/token";

const DEFAULT_TIMEOUT_MS = 30_000;
const REFRESH_TIMEOUT_MS = 15_000;

const AUTH_USER_KEY =
    "fitlife.authUser";

interface RetryRequestConfig
    extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

interface RefreshResult {
    accessToken: string;
    refreshToken?: string | null;
}

/**
 * Các API không yêu cầu đăng nhập.
 */
const PUBLIC_API_ENDPOINTS = [
    // Auth
    "/auth/register",
    "/auth/login",
    "/auth/google-login",
    "/auth/refresh-token",
    "/auth/verify-email",
    "/auth/resend-verification",
    "/auth/forgot-password",
    "/auth/reset-password",

    // Public website
    "/public/home",
    "/public/packages",
    "/public/trainers",
    "/public/contact-requests",

    "/gym-packages",
] as const;

/**
 * Các trang frontend không yêu cầu đăng nhập.
 */
const PUBLIC_PAGE_PATHS = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/check-email",
    "/verify-email",
] as const;

const apiClient = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: DEFAULT_TIMEOUT_MS,

    headers: {
        Accept: "application/json",
    },
});

const refreshClient = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: REFRESH_TIMEOUT_MS,

    headers: {
        Accept: "application/json",
        "Content-Type":
            "application/json",
    },
});

let refreshPromise:
    | Promise<RefreshResult>
    | null = null;

function normalizeRequestPath(
    url?: string,
): string {
    if (!url) {
        return "";
    }

    try {
        const parsedUrl =
            new URL(
                url,
                env.apiBaseUrl,
            );

        return parsedUrl.pathname.replace(
            /^\/api\/v1/,
            "",
        );
    } catch {
        return url.split("?")[0];
    }
}

function isPublicApiEndpoint(
    url?: string,
): boolean {
    const requestPath =
        normalizeRequestPath(url);

    return PUBLIC_API_ENDPOINTS.some(
        (endpoint) =>
            requestPath === endpoint ||
            requestPath.startsWith(
                `${endpoint}/`,
            ),
    );
}

function isRefreshEndpoint(
    url?: string,
): boolean {
    return (
        normalizeRequestPath(url) ===
        "/auth/refresh-token"
    );
}

function isPublicPage(
    pathname: string,
): boolean {
    return PUBLIC_PAGE_PATHS.some(
        (publicPath) => {
            if (publicPath === "/") {
                return pathname === "/";
            }

            return (
                pathname === publicPath ||
                pathname.startsWith(
                    `${publicPath}/`,
                )
            );
        },
    );
}

function isValidJwtFormat(
    token: string,
): boolean {
    return token.split(".").length === 3;
}

function clearAuthentication(): void {
    tokenStorage.clear();

    if (
        typeof window === "undefined"
    ) {
        return;
    }

    window.localStorage.removeItem(
        AUTH_USER_KEY,
    );

    window.localStorage.removeItem(
        "authUser",
    );

    window.dispatchEvent(
        new CustomEvent(
            "fitlife:session-cleared",
        ),
    );
}

function redirectToLogin(): void {
    if (
        typeof window === "undefined"
    ) {
        return;
    }

    const pathname =
        window.location.pathname;

    /*
     * Không redirect từ trang public.
     */
    if (
        isPublicPage(pathname) ||
        pathname === "/login"
    ) {
        return;
    }

    const currentPath =
        `${pathname}${window.location.search}`;

    const loginUrl =
        `/login?from=${encodeURIComponent(
            currentPath,
        )}`;

    window.location.replace(
        loginUrl,
    );
}

function clearSessionAndRedirect(): void {
    clearAuthentication();
    redirectToLogin();
}

function setAuthorizationHeader(
    config: InternalAxiosRequestConfig,
    accessToken: string,
): void {
    if (
        config.headers instanceof
        AxiosHeaders
    ) {
        config.headers.set(
            "Authorization",
            `Bearer ${accessToken}`,
        );

        return;
    }

    config.headers =
        new AxiosHeaders(
            config.headers,
        );

    config.headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
    );
}

async function requestNewAccessToken():
    Promise<RefreshResult> {
    const refreshToken =
        tokenStorage.getRefreshToken();

    if (!refreshToken) {
        throw new Error(
            "Không tìm thấy refresh token.",
        );
    }

    const response =
        await refreshClient.post<
            ApiResponse<AuthResponsePayload>
        >(
            "/auth/refresh-token",
            {
                refreshToken,
            },
        );

    const payload =
        response.data.data;

    const newAccessToken =
        payload?.accessToken ??
        payload?.token;

    if (!newAccessToken) {
        throw new Error(
            "Máy chủ không trả về access token mới.",
        );
    }

    if (
        !isValidJwtFormat(
            newAccessToken,
        )
    ) {
        throw new Error(
            "Access token mới không đúng định dạng.",
        );
    }

    return {
        accessToken:
        newAccessToken,

        refreshToken:
        payload?.refreshToken,
    };
}

async function refreshAccessToken():
    Promise<RefreshResult> {
    if (!refreshPromise) {
        refreshPromise =
            requestNewAccessToken()
                .then((result) => {
                    tokenStorage.setAccessToken(
                        result.accessToken,
                    );

                    if (
                        result.refreshToken
                    ) {
                        tokenStorage.setRefreshToken(
                            result.refreshToken,
                        );
                    }

                    return result;
                })
                .finally(() => {
                    refreshPromise = null;
                });
    }

    return refreshPromise;
}

/**
 * Request interceptor
 */
apiClient.interceptors.request.use(
    (
        config:
        InternalAxiosRequestConfig,
    ) => {
        /*
         * Luôn chuẩn hóa headers thành AxiosHeaders.
         */
        if (
            !(config.headers instanceof AxiosHeaders)
        ) {
            config.headers =
                new AxiosHeaders(
                    config.headers,
                );
        }

        /*
         * Nếu body là FormData:
         * phải xóa Content-Type để browser tự sinh:
         *
         * multipart/form-data; boundary=...
         */
        if (
            typeof FormData !== "undefined" &&
            config.data instanceof FormData
        ) {
            config.headers.delete(
                "Content-Type",
            );
        } else if (
            config.data !== undefined &&
            config.data !== null &&
            !config.headers.has(
                "Content-Type",
            )
        ) {
            /*
             * Body thông thường sử dụng JSON.
             */
            config.headers.set(
                "Content-Type",
                "application/json",
            );
        }

        /*
         * Public API không cần token.
         */
        if (
            isPublicApiEndpoint(
                config.url,
            )
        ) {
            config.headers.delete(
                "Authorization",
            );

            return config;
        }

        const accessToken =
            tokenStorage.getAccessToken();

        if (!accessToken) {
            return config;
        }

        if (
            !isValidJwtFormat(
                accessToken,
            )
        ) {
            clearAuthentication();
            redirectToLogin();

            return config;
        }

        setAuthorizationHeader(
            config,
            accessToken,
        );

        return config;
    },

    (error: unknown) =>
        Promise.reject(error),
);

/**
 * Response interceptor
 */
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        const data = response.data;
        if (data && typeof data === "object" && !("code" in data && "message" in data)) {
            response.data = {
                code: response.status || 200,
                message: "Success (Auto-wrapped)",
                data: data,
            };
        }
        return response;
    },

    async (
        error: AxiosError,
    ) => {
        const status =
            error.response?.status;

        const originalRequest =
            error.config as
                | RetryRequestConfig
                | undefined;

        const requestUrl =
            originalRequest?.url;

        const publicApiRequest =
            isPublicApiEndpoint(
                requestUrl,
            );

        if (env.isDevelopment && status !== 404) {
            console.error("FITLIFE_API_ERROR_DETAILS:", JSON.stringify(error.response?.data));
            console.error(
                "FITLIFE_API_ERROR",
                {
                    method:
                    originalRequest?.method,

                    url:
                    requestUrl,

                    status,

                    publicApiRequest,

                    response:
                    error.response?.data,
                },
            );
        }

        /*
         * API public trả 401:
         * chỉ trả lỗi cho HomePage xử lý,
         * tuyệt đối không redirect login.
         */
        if (
            status === 401 &&
            publicApiRequest
        ) {
            return Promise.reject(
                error,
            );
        }

        /*
         * Không xử lý refresh nếu:
         * - không phải 401;
         * - không có request config;
         * - request đã retry;
         * - chính refresh endpoint.
         */
        if (
            status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            isRefreshEndpoint(
                requestUrl,
            )
        ) {
            if (status === 401) {
                clearSessionAndRedirect();
            }

            return Promise.reject(
                error,
            );
        }

        const refreshToken =
            tokenStorage.getRefreshToken();

        /*
         * Người dùng chưa có phiên:
         * không thử refresh.
         */
        if (!refreshToken) {
            clearAuthentication();
            redirectToLogin();

            return Promise.reject(
                error,
            );
        }

        originalRequest._retry = true;

        try {
            const refreshResult =
                await refreshAccessToken();

            setAuthorizationHeader(
                originalRequest,
                refreshResult.accessToken,
            );

            return apiClient(
                originalRequest,
            );
        } catch (
            refreshError: unknown
            ) {
            clearSessionAndRedirect();

            return Promise.reject(
                refreshError,
            );
        }
    },
);

export default apiClient;
