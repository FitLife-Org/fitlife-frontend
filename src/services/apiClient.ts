import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { env } from "../config/env";
import { tokenStorage } from "../utils/token";

export interface ApiError extends Error {
  status?: number;
  code?: number;
  data?: unknown;
}

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

const toApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ code?: number; message?: string; data?: unknown }>;
    const payload = axiosError.response?.data;
    const normalized = new Error(payload?.message || axiosError.message || "Request failed") as ApiError;
    normalized.status = axiosError.response?.status;
    normalized.code = payload?.code;
    normalized.data = payload?.data;
    return normalized;
  }

  return new Error("Unexpected error") as ApiError;
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get();

  // Do not send token for authentication endpoints
  const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register') || config.url?.includes('/auth/google-login');

  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
    }

    return Promise.reject(toApiError(error));
  },
);

export default apiClient;
