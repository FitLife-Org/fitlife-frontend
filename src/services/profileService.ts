import apiClient from "./apiClient";

import type {
    ApiResponse,
} from "../types/common.type";

import type {
    MemberProfile,
    UpdateMyMemberProfileRequest,
} from "../types/member.type";

import type { User } from "../types/user.type";
import type { Trainer } from "../types/trainer.type";

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
        Promise<MemberProfile> {
        const response =
            await apiClient.get<
                ApiResponse<MemberProfile>
            >("/members/me");

        return requireData(
            response.data,
            "Không nhận được hồ sơ hội viên.",
        );
    },

    async updateProfile(
        request:
        UpdateMyMemberProfileRequest,
    ): Promise<MemberProfile> {
        const response =
            await apiClient.put<
                ApiResponse<MemberProfile>
            >(
                "/members/me",
                request,
            );

        return requireData(
            response.data,
            "Không nhận được hồ sơ sau khi cập nhật.",
        );
    },

    async updateAvatar(
        file: File,
    ): Promise<MemberProfile> {
        const formData =
            new FormData();

        formData.append(
            "file",
            file,
            file.name,
        );

        const response =
            await apiClient.patch<
                ApiResponse<MemberProfile>
            >(
                "/members/me/avatar",
                formData,
            );

        return requireData(
            response.data,
            "Không nhận được hồ sơ sau khi cập nhật ảnh.",
        );
    },

    async getUserProfile(): Promise<User> {
        const response = await apiClient.get<ApiResponse<User>>("/users/me");
        return requireData(response.data, "Không nhận được hồ sơ người dùng.");
    },

    async updateUserProfile(request: { fullName: string; phone: string }): Promise<User> {
        const response = await apiClient.put<ApiResponse<User>>("/users/me", request);
        return requireData(response.data, "Không nhận được hồ sơ sau khi cập nhật.");
    },

    async updateUserAvatar(file: File): Promise<User> {
        const formData = new FormData();
        formData.append("file", file, file.name);
        const response = await apiClient.patch<ApiResponse<User>>("/users/me/avatar", formData);
        return requireData(response.data, "Không nhận được hồ sơ sau khi cập nhật ảnh.");
    },

    async getTrainerProfile(): Promise<Trainer> {
        const response = await apiClient.get<ApiResponse<Trainer>>("/trainers/me");
        return requireData(response.data, "Không nhận được hồ sơ huấn luyện viên.");
    },

    async updateTrainerProfile(request: Partial<Trainer>): Promise<Trainer> {
        const response = await apiClient.put<ApiResponse<Trainer>>("/trainers/me", request);
        return requireData(response.data, "Không nhận được hồ sơ sau khi cập nhật.");
    },
};