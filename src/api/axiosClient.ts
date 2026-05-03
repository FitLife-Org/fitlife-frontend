import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

export interface ApiErrorResponse {
  code?: number;
  message?: string;
  data?: unknown;
}

export interface FitLifeApiError extends Error {
  status?: number;
  code?: number;
  data?: unknown;
}

const AUTH_STORAGE_KEYS = ['token', 'auth_token'] as const;
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';
const isBrowser = typeof window !== 'undefined';

const axiosClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStoredToken = (): string | null => {
  if (!isBrowser) {
    return null;
  }

  for (const key of AUTH_STORAGE_KEYS) {
    const token = localStorage.getItem(key);
    if (token) {
      return token;
    }
  }

  return null;
};

export const clearStoredAuth = (): void => {
  if (!isBrowser) {
    return;
  }

  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem('user');
};

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) {
    return false;
  }

  return AUTH_PATHS.some((path) => url.includes(path));
};

export const normalizeApiError = (error: unknown): FitLifeApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const payload = axiosError.response?.data;

    const fallbackMessage =
      status === 401
        ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
        : status === 403
          ? 'Bạn không có quyền truy cập tài nguyên này.'
          : status === 404
            ? 'Không tìm thấy tài nguyên yêu cầu.'
            : status === 500
              ? 'Máy chủ đang gặp lỗi. Vui lòng thử lại sau.'
              : 'Đã xảy ra lỗi. Vui lòng thử lại.';

    const normalizedError = new Error(payload?.message || axiosError.message || fallbackMessage) as FitLifeApiError;
    normalizedError.name = 'FitLifeApiError';
    normalizedError.status = status;
    normalizedError.code = payload?.code ?? status;
    normalizedError.data = payload?.data ?? payload;

    return normalizedError;
  }

  if (error instanceof Error) {
    return error as FitLifeApiError;
  }

  return new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.') as FitLifeApiError;
};

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url;

    if (status === 401 && !isAuthEndpoint(requestUrl)) {
      clearStoredAuth();

      if (isBrowser && window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);

export default axiosClient;

