import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    profileService,
} from "../services/profileService";

import {
    useAuthStore,
} from "../store/authStore";

import {
    showAlert,
} from "../utils/alert";

import {
    getApiErrorMessage,
} from "../utils/apiError";

import {
    validateAvatarFile,
} from "../utils/validateAvatarFile";

import type {
    MemberProfile,
    UpdateMyMemberProfileRequest,
} from "../types/member.type";

function mapProfileToForm(
    profile: MemberProfile,
): UpdateMyMemberProfileRequest {
    return {
        fullName:
            profile.fullName ?? "",

        phone:
            profile.phone ?? null,

        gender:
            profile.gender ?? null,

        dateOfBirth:
            profile.dateOfBirth ?? null,

        address:
            profile.address ?? null,

        emergencyContactName:
            profile.emergencyContactName ??
            null,

        emergencyContactPhone:
            profile.emergencyContactPhone ??
            null,

        fitnessGoal:
            profile.fitnessGoal ?? null,

        healthNote:
            profile.healthNote ?? null,
    };
}

export function useMemberProfile() {
    const [
        profile,
        setProfile,
    ] =
        useState<MemberProfile | null>(
            null,
        );

    const [
        formData,
        setFormData,
    ] =
        useState<UpdateMyMemberProfileRequest>({
            fullName: "",
            phone: null,
            gender: null,
            dateOfBirth: null,
            address: null,
            emergencyContactName: null,
            emergencyContactPhone: null,
            fitnessGoal: null,
            healthNote: null,
        });

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        uploadingAvatar,
        setUploadingAvatar,
    ] = useState(false);

    const [
        avatarPreview,
        setAvatarPreview,
    ] =
        useState<string | null>(
            null,
        );

    /**
     * Không lấy user bằng selector ở đây.
     *
     * synchronizeProfile sẽ dùng getState()
     * để tránh dependency user thay đổi liên tục.
     */
    const synchronizeProfile =
        useCallback(
            (
                updatedProfile:
                MemberProfile,
            ): void => {
                setProfile(
                    updatedProfile,
                );

                setFormData(
                    mapProfileToForm(
                        updatedProfile,
                    ),
                );

                const authState =
                    useAuthStore.getState();

                const currentUser =
                    authState.user;

                if (!currentUser) {
                    return;
                }

                const nextFullName =
                    updatedProfile.fullName ??
                    currentUser.fullName;

                const nextAvatarUrl =
                    updatedProfile.avatarUrl ??
                    null;

                const currentAvatarUrl =
                    currentUser.avatarUrl ??
                    null;

                /**
                 * Không update Zustand khi dữ liệu không đổi.
                 * Tránh render lại toàn bộ layout không cần thiết.
                 */
                if (
                    currentUser.fullName ===
                    nextFullName &&
                    currentAvatarUrl ===
                    nextAvatarUrl
                ) {
                    return;
                }

                authState.updateUser({
                    ...currentUser,

                    fullName:
                    nextFullName,

                    avatarUrl:
                    nextAvatarUrl,
                });
            },
            [],
        );

    const loadProfile =
        useCallback(
            async (): Promise<void> => {
                try {
                    setLoading(true);

                    const data =
                        await profileService
                            .getProfile();

                    synchronizeProfile(
                        data,
                    );
                } catch (
                    error: unknown
                    ) {
                    console.error(
                        "LOAD_MEMBER_PROFILE_ERROR:",
                        error,
                    );

                    await showAlert.error(
                        "Không thể tải hồ sơ",
                        getApiErrorMessage(
                            error,
                        ),
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                synchronizeProfile,
            ],
        );

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(
                    avatarPreview,
                );
            }
        };
    }, [avatarPreview]);

    const setField = <
        K extends keyof UpdateMyMemberProfileRequest,
    >(
        field: K,
        value:
        UpdateMyMemberProfileRequest[K],
    ): void => {
        setFormData(
            (
                previous:
                UpdateMyMemberProfileRequest,
            ) => ({
                ...previous,
                [field]: value,
            }),
        );
    };

    const validateProfile =
        useCallback(
            (): string | null => {
                const fullName =
                    formData.fullName.trim();

                if (
                    fullName.length < 2
                ) {
                    return "Họ và tên phải có ít nhất 2 ký tự.";
                }

                if (
                    formData.phone &&
                    !/^(0|\+84)[0-9]{9,10}$/.test(
                        formData.phone,
                    )
                ) {
                    return "Số điện thoại không hợp lệ.";
                }

                if (
                    formData
                        .emergencyContactPhone &&
                    !/^(0|\+84)[0-9]{9,10}$/.test(
                        formData
                            .emergencyContactPhone,
                    )
                ) {
                    return "Số điện thoại khẩn cấp không hợp lệ.";
                }

                if (
                    formData.dateOfBirth
                ) {
                    const birthDate =
                        new Date(
                            `${formData.dateOfBirth}T00:00:00`,
                        );

                    if (
                        Number.isNaN(
                            birthDate.getTime(),
                        )
                    ) {
                        return "Ngày sinh không hợp lệ.";
                    }

                    const today =
                        new Date();

                    today.setHours(
                        23,
                        59,
                        59,
                        999,
                    );

                    if (
                        birthDate > today
                    ) {
                        return "Ngày sinh không được ở tương lai.";
                    }

                    const tenYearsAgo = new Date();
                    tenYearsAgo.setFullYear(today.getFullYear() - 10);
                    if (birthDate > tenYearsAgo) {
                        return "Hội viên phải từ 10 tuổi trở lên.";
                    }
                }

                return null;
            },
            [
                formData,
            ],
        );

    const normalizePayload =
        useCallback(
            (): UpdateMyMemberProfileRequest => ({
                fullName:
                    formData.fullName.trim(),

                phone:
                    formData.phone?.trim() ||
                    null,

                gender:
                    formData.gender || null,

                dateOfBirth:
                    formData.dateOfBirth ||
                    null,

                address:
                    formData.address?.trim() ||
                    null,

                emergencyContactName:
                    formData
                        .emergencyContactName
                        ?.trim() ||
                    null,

                emergencyContactPhone:
                    formData
                        .emergencyContactPhone
                        ?.trim() ||
                    null,

                fitnessGoal:
                    formData.fitnessGoal ||
                    null,

                healthNote:
                    formData.healthNote?.trim() ||
                    null,
            }),
            [
                formData,
            ],
        );

    const saveProfile =
        useCallback(
            async (): Promise<void> => {
                const validationMessage =
                    validateProfile();

                if (
                    validationMessage
                ) {
                    await showAlert.warning(
                        "Dữ liệu chưa hợp lệ",
                        validationMessage,
                    );

                    return;
                }

                try {
                    setSaving(true);

                    const updatedProfile =
                        await profileService
                            .updateProfile(
                                normalizePayload(),
                            );

                    synchronizeProfile(
                        updatedProfile,
                    );

                    await showAlert.success(
                        "Thành công",
                        "Đã cập nhật hồ sơ.",
                    );
                } catch (
                    error: unknown
                    ) {
                    console.error(
                        "UPDATE_MEMBER_PROFILE_ERROR:",
                        error,
                    );

                    await showAlert.error(
                        "Không thể cập nhật",
                        getApiErrorMessage(
                            error,
                        ),
                    );
                } finally {
                    setSaving(false);
                }
            },
            [
                normalizePayload,
                synchronizeProfile,
                validateProfile,
            ],
        );

    const uploadAvatar =
        useCallback(
            async (
                file: File,
            ): Promise<void> => {
                const validationMessage =
                    validateAvatarFile(
                        file,
                    );

                if (
                    validationMessage
                ) {
                    await showAlert.warning(
                        "Ảnh không hợp lệ",
                        validationMessage,
                    );

                    return;
                }

                const objectUrl =
                    URL.createObjectURL(
                        file,
                    );

                setAvatarPreview(
                    (
                        previousPreview,
                    ) => {
                        if (
                            previousPreview
                        ) {
                            URL.revokeObjectURL(
                                previousPreview,
                            );
                        }

                        return objectUrl;
                    },
                );

                try {
                    setUploadingAvatar(
                        true,
                    );

                    const updatedProfile =
                        await profileService
                            .updateAvatar(
                                file,
                            );

                    synchronizeProfile(
                        updatedProfile,
                    );

                    URL.revokeObjectURL(
                        objectUrl,
                    );

                    setAvatarPreview(
                        null,
                    );

                    await showAlert.success(
                        "Thành công",
                        "Đã cập nhật ảnh đại diện.",
                    );
                } catch (
                    error: unknown
                    ) {
                    console.error(
                        "UPLOAD_MEMBER_AVATAR_ERROR:",
                        error,
                    );

                    URL.revokeObjectURL(
                        objectUrl,
                    );

                    setAvatarPreview(
                        null,
                    );

                    await showAlert.error(
                        "Không thể tải ảnh",
                        getApiErrorMessage(
                            error,
                        ),
                    );
                } finally {
                    setUploadingAvatar(
                        false,
                    );
                }
            },
            [
                synchronizeProfile,
            ],
        );

    const avatarUrl =
        useMemo(
            () =>
                avatarPreview ??
                profile?.avatarUrl ??
                null,
            [
                avatarPreview,
                profile?.avatarUrl,
            ],
        );

    return {
        profile,
        formData,

        loading,
        saving,
        uploadingAvatar,

        avatarUrl,

        setField,
        saveProfile,
        uploadAvatar,

        reloadProfile:
        loadProfile,
    };
}