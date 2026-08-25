import { useState, useCallback } from "react";
import { trainerService } from "../services/trainerService";
import type { Trainer } from "../types/trainer.type";

export function useTrainerProfile() {
    const [profile, setProfile] = useState<Trainer | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await trainerService.getMyProfile();
            setProfile(data);
        } catch (err: any) {
            setError(err.message || "Lỗi khi tải hồ sơ huấn luyện viên.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProfile = async (data: Partial<Trainer>) => {
        try {
            setLoading(true);
            setError(null);
            const updatedProfile = await trainerService.updateMyProfile(data);
            setProfile(updatedProfile);
            return updatedProfile;
        } catch (err: any) {
            setError(err.message || "Lỗi khi cập nhật hồ sơ huấn luyện viên.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const uploadAvatar = async (file: File) => {
        try {
            setUploadingAvatar(true);
            setError(null);
            const updatedProfile = await trainerService.updateMyAvatar(file);
            setProfile(updatedProfile);
            return updatedProfile;
        } catch (err: any) {
            setError(err.message || "Lỗi khi cập nhật ảnh đại diện.");
            throw err;
        } finally {
            setUploadingAvatar(false);
        }
    };

    return {
        profile,
        loading,
        error,
        uploadingAvatar,
        fetchProfile,
        updateProfile,
        uploadAvatar,
    };
}
