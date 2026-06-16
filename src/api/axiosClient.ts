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
  if (!isBrowser) return null
  const userStorage = localStorage.getItem('user');
  
  if (userStorage) {
    try {
      const parsed = JSON.parse(userStorage);

      if (typeof parsed === 'string') return parsed;
      return parsed?.state?.token || parsed?.token || null;
    } catch (e) {
      return userStorage !== 'null' && userStorage !== 'undefined' ? userStorage : null;
    }
  }

  return null;
};

export const clearStoredAuth = (): void => {
  if (!isBrowser) return;
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('auth_token');
};

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return ['/login', '/register', '/forgot-password', '/reset-password'].some((path) => url.includes(path));
};

export const normalizeApiError = (error: unknown): FitLifeApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const payload = axiosError.response?.data;
    const fallbackMessage = status === 401 ? 'Phiên đăng nhập hết hạn.' : status === 403 ? 'Bạn không có quyền truy cập.' : 'Đã xảy ra lỗi.';
    const normalizedError = new Error(payload?.message || axiosError.message || fallbackMessage) as FitLifeApiError;
    normalizedError.status = status;
    return normalizedError;
  }
  return new Error('Đã xảy ra lỗi.') as FitLifeApiError;
};

axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const isPublic = isAuthEndpoint(config.url) || config.url?.includes('/auth/google');

      if (!isPublic) {
        const token = getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.log(" Trạng thái: KHÔNG TÌM THẤY TOKEN - Request vẫn được gửi (Public endpoint hoặc chưa login)");
        }
      } else {
        console.log(" Trạng thái: Request công khai, bỏ qua chèn token.");
      }

      return config;
    },
    (error) => Promise.reject(normalizeApiError(error))
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) clearStoredAuth();
    return Promise.reject(normalizeApiError(error));
  }
);

export default axiosClient;