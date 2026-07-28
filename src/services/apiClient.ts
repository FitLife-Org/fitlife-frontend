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

const PUBLIC_AUTH_ENDPOINTS = [
    "/auth/register",
    "/auth/login",
    "/auth/google-login",
    "/auth/refresh-token",
    "/auth/verify-email",
    "/auth/resend-verification-email",
    "/auth/forgot-password",
    "/auth/reset-password",
];

const apiClient = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: DEFAULT_TIMEOUT_MS,

    headers: {
        Accept: "application/json",
        "Content-Type":
            "application/json",
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

/*
 * Chỉ cho phép một request refresh chạy tại một thời điểm.
 *
 * Khi nhiều API cùng trả 401, các request còn lại sẽ chờ
 * cùng refreshPromise thay vì gửi nhiều refresh request.
 */
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
        const parsedUrl = new URL(
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

function isPublicAuthEndpoint(
    url?: string,
): boolean {
    const requestPath =
        normalizeRequestPath(url);

    return PUBLIC_AUTH_ENDPOINTS.some(
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

function isValidJwtFormat(
    token: string,
): boolean {
    const tokenParts =
        token.split(".");

    return tokenParts.length === 3;
}

function clearAuthentication(): void {
    tokenStorage.clear();

    if (
        typeof window !== "undefined"
    ) {
        window.localStorage.removeItem(
            AUTH_USER_KEY,
        );

        /*
         * Xóa key authUser cũ.
         */
        window.localStorage.removeItem(
            "authUser",
        );

        window.dispatchEvent(
            new CustomEvent(
                "fitlife:session-cleared",
            ),
        );
    }
}

function redirectToLogin(): void {
    if (
        typeof window === "undefined"
    ) {
        return;
    }

    const currentPath =
        `${window.location.pathname}${window.location.search}`;

    if (
        window.location.pathname ===
        "/login"
    ) {
        return;
    }

    const loginUrl =
        `/login?from=${encodeURIComponent(
            currentPath,
        )}`;

    window.location.replace(loginUrl);
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
                        tokenStorage
                            .setRefreshToken(
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

apiClient.interceptors.request.use(
    (
        config:
        InternalAxiosRequestConfig,
    ) => {
        const accessToken =
            tokenStorage.getAccessToken();

        if (
            !accessToken ||
            isPublicAuthEndpoint(
                config.url,
            )
        ) {
            return config;
        }

        if (
            !isValidJwtFormat(
                accessToken,
            )
        ) {
            clearSessionAndRedirect();

            return Promise.reject(
                new Error(
                    "Access token không đúng định dạng.",
                ),
            );
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

apiClient.interceptors.response.use(
    (
        response: AxiosResponse,
    ) => response,

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

        if (env.isDevelopment) {
            console.error(
                "FITLIFE_API_ERROR",
                {
                    method:
                    originalRequest
                        ?.method,
                    url: requestUrl,
                    status,
                    response:
                    error.response?.data,
                },
            );
        }

        /*
         * Không refresh cho:
         * - public auth API;
         * - chính refresh endpoint;
         * - request đã retry.
         */
        if (
            status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            isPublicAuthEndpoint(
                requestUrl,
            ) ||
            isRefreshEndpoint(
                requestUrl,
            )
        ) {
            if (
                status === 401 &&
                !isPublicAuthEndpoint(
                    requestUrl,
                )
            ) {
                clearSessionAndRedirect();
            }

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