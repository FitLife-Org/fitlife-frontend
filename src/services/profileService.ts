import apiClient from "./apiClient";

import type {
    ProfileResponse,
    UpdateProfileRequest,
    MembershipResponse,
} from "../types/profile.type";

export const profileService = {
    async getProfile():
        Promise<ProfileResponse> {
        const response =
            await apiClient.get<
                ProfileResponse
            >("/members/me");

        return response.data;
    },

    async updateProfile(
        data: UpdateProfileRequest,
    ): Promise<ProfileResponse> {
        const response =
            await apiClient.put<
                ProfileResponse
            >(
                "/members/me",
                data,
            );

        return response.data;
    },

    /**
     * Chỉ giữ khi backend có endpoint thật.
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
                ProfileResponse
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

        return response.data;
    },

    /**
     * Chỉ giữ khi backend đã xác nhận endpoint.
     */
    async getMyMembership():
        Promise<MembershipResponse> {
        const response =
            await apiClient.get<
                MembershipResponse
            >(
                "/subscriptions/me/active",
            );

        return response.data;
    },
};