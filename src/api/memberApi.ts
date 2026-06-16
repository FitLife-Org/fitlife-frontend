import axiosInstance from './axiosClient';

export interface MemberProfileResponse {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  email: string;
  status: string;
  avatarUrl: string;
  height: number;
  weight: number;
  bmi: number;
  fitnessGoal: string;
}


export const memberApi = {


  getMyProfile: () => {
    return axiosInstance.get<any, { data: { data: MemberProfileResponse } }>('/members/me');
  },

  updateMyProfile: (data: any) => {
    return axiosInstance.put('/members/me', data);
  },

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/members/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  
};