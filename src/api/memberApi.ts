import axiosClient, { normalizeApiError } from './axiosClient';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
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

export const getMyProfile = async () => {
  try {
    const response = await axiosClient.get<ApiResponse<MemberProfileResponse>>('/members/me');
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

