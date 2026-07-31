import apiClient from "./apiClient";

import type {
  ApiResponse,
} from "../types/common.type";

import type {
  ProfileResponse,
  UpdateProfileRequest,
  MembershipResponse,
} from "../types/profile.type";

function requireData<T>(
    response: ApiResponse<T>,
    message: string,
): T {
  if (
      response.data === null ||
      response.data === undefined
  ) {
    throw new Error(message);
  }

  return response.data;
}

export const profileService = {
  async getProfile():
      Promise<ProfileResponse> {
    const response =
        await apiClient.get<
            ApiResponse<ProfileResponse>
        >("/members/me");

    return requireData(
        response.data,
        "Không nhận được hồ sơ hội viên.",
    );
  },

  async updateProfile(
      data: UpdateProfileRequest,
  ): Promise<ProfileResponse> {
    const response =
        await apiClient.put<
            ApiResponse<ProfileResponse>
        >(
            "/members/me",
            data,
        );

    return requireData(
        response.data,
        "Không nhận được hồ sơ sau khi cập nhật.",
    );
  },

  /**
   * Chỉ giữ method này khi backend có:
   * PATCH /members/me/avatar
   *
   * Nếu Controller chưa có endpoint,
   * hãy ẩn nút upload avatar trên giao diện.
   */
  async updateAvatar(
      file: File,
  ): Promise<ProfileResponse> {
    const formData =
        new FormData();

    formData.append(
        "avatar",
        file,
    );

    const response =
        await apiClient.patch<
            ApiResponse<ProfileResponse>
        >(
            "/members/me/avatar",
            formData,
            {
              headers: {
                "Content-Type":
                    "multipart/form-data",
              },
            },
        );

    return requireData(
        response.data,
        "Không nhận được ảnh đại diện sau khi cập nhật.",
    );
  },

  /**
   * Membership thuộc module Subscription,
   * không thuộc Profile.
   */
  async getMyMembership():
      Promise<MembershipResponse> {
    const response =
        await apiClient.get<
            ApiResponse<MembershipResponse>
        >(
            "/subscriptions/me/active",
        );

    return requireData(
        response.data,
        "Không nhận được gói tập hiện tại.",
    );
  },
};