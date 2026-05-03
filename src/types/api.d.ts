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

export interface MemberProfileResponse {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  email: string;
  status: string;
  avatarUrl: string | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  fitnessGoal: string | null;
}

export interface ApiErrorResponse {
  code?: number;
  message?: string;
  data?: unknown;
}

