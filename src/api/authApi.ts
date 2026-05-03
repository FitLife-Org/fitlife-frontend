import axiosClient, { normalizeApiError } from './axiosClient';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  username: string;
  role: string;
}

const postAuth = async <TResponse, TRequest>(
  path: string,
  payload: TRequest,
): Promise<ApiResponse<TResponse>> => {
  try {
    const response = await axiosClient.post<ApiResponse<TResponse>>(path, payload);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const login = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponseData>> => {
  try {
    return await postAuth<LoginResponseData, LoginRequest>('/auth/login', credentials);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const register = async (payload: RegisterRequest): Promise<ApiResponse<string>> => {
  try {
    return await postAuth<string, RegisterRequest>('/auth/register', payload);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

