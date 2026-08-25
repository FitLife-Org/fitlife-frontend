import { useState, useEffect, ChangeEvent } from "react";
import { Mail, Phone, Briefcase, Award, Clock, FileText, Lock, Camera } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { useTrainerProfile } from "../../hooks/useTrainerProfile";
import { showAlert } from "../../utils/alert";
import { getApiErrorMessage } from "../../utils/apiError";
import type { Trainer } from "../../types/trainer.type";

export default function TrainerProfilePage() {
    const { profile, loading, error, uploadingAvatar, fetchProfile, updateProfile, uploadAvatar } = useTrainerProfile();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Trainer>>({});

    useEffect(() => {
        void fetchProfile();
    }, [fetchProfile]);

    const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        void uploadAvatar(file);
        event.target.value = "";
    };

    const handleOpenEdit = () => {
        if (profile) {
            setFormData({
                fullName: profile.fullName,
                phone: profile.phone,
                specialty: profile.specialty,
                specialization: profile.specialization,
                experienceYears: profile.experienceYears,
                certifications: profile.certifications,
                bio: profile.bio,
            });
            setIsEditModalOpen(true);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateProfile(formData);
            await showAlert.success("Thành công", "Đã cập nhật hồ sơ cá nhân.");
            setIsEditModalOpen(false);
        } catch (err) {
            await showAlert.error("Cập nhật thất bại", getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    if (loading && !profile) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="rounded-2xl bg-red-50 p-8 text-center font-medium text-red-600">
                {error}
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Hồ sơ cá nhân"
                description="Quản lý thông tin huấn luyện viên của bạn"
            />

            <div className="grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                {/* TRÁI: Avatar & Tóm tắt */}
                <Card className="overflow-hidden border-none bg-white p-0 shadow-xl">
                    <div className="flex flex-col items-center border-b border-slate-100 px-6 pb-8">
                        <div className="relative mb-4 mt-6 h-32 w-32">
                            <div className="group relative h-full w-full overflow-hidden rounded-full border-4 border-slate-100 bg-slate-50 shadow-sm">
                                {uploadingAvatar && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
                                    </div>
                                )}
                                
                                {profile.avatarUrl ? (
                                    <img
                                        src={profile.avatarUrl}
                                        alt={profile.fullName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                                        <span className="text-4xl font-bold">
                                            {profile.fullName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                    <Camera className="h-8 w-8" />
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                        disabled={uploadingAvatar}
                                    />
                                </label>
                            </div>
                        </div>

                        <h2 className="text-center text-xl font-bold text-slate-900">
                            {profile.fullName}
                        </h2>
                        {profile.trainerCode && (
                            <p className="mt-1 font-medium text-fit-primary">
                                {profile.trainerCode}
                            </p>
                        )}
                        <p className="mt-1 text-sm font-medium text-slate-500">
                            Huấn Luyện Viên
                        </p>
                    </div>

                    <div className="p-6">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                            Liên hệ
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Mail className="h-5 w-5 text-slate-400" />
                                <span>{profile.email || "Chưa cập nhật"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <Phone className="h-5 w-5 text-slate-400" />
                                <span>{profile.phone || "Chưa cập nhật"}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* PHẢI: Thông tin chi tiết */}
                <Card className="border-none bg-white p-8 shadow-xl">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Thông tin chuyên môn</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Thông tin hiển thị cho hội viên khi đăng ký tập luyện
                            </p>
                        </div>
                        <Button onClick={handleOpenEdit}>Cập nhật hồ sơ</Button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                            <div className="mb-2 flex items-center gap-2 text-slate-500">
                                <Briefcase className="h-5 w-5" />
                                <span className="font-semibold">Chuyên môn (Specialty)</span>
                            </div>
                            <p className="text-lg font-medium text-slate-900">
                                {profile.specialty || "Chưa cập nhật"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                            <div className="mb-2 flex items-center gap-2 text-slate-500">
                                <Briefcase className="h-5 w-5" />
                                <span className="font-semibold">Lĩnh vực (Specialization)</span>
                            </div>
                            <p className="text-lg font-medium text-slate-900">
                                {profile.specialization || "Chưa cập nhật"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                            <div className="mb-2 flex items-center gap-2 text-slate-500">
                                <Clock className="h-5 w-5" />
                                <span className="font-semibold">Kinh nghiệm</span>
                            </div>
                            <p className="text-lg font-medium text-slate-900">
                                {profile.experienceYears != null ? `${profile.experienceYears} năm` : "Chưa cập nhật"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                            <div className="mb-2 flex items-center gap-2 text-slate-500">
                                <Award className="h-5 w-5" />
                                <span className="font-semibold">Chứng chỉ</span>
                            </div>
                            <p className="text-lg font-medium text-slate-900">
                                {profile.certifications || "Chưa cập nhật"}
                            </p>
                        </div>

                        <div className="col-span-1 rounded-xl border border-slate-100 bg-slate-50 p-5 sm:col-span-2">
                            <div className="mb-2 flex items-center gap-2 text-slate-500">
                                <FileText className="h-5 w-5" />
                                <span className="font-semibold">Tiểu sử (Bio)</span>
                            </div>
                            <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-slate-900">
                                {profile.bio || "Chưa cập nhật"}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Cập nhật hồ sơ"
                size="xl"
            >
                <div className="space-y-4 p-6">
                    <Input
                        label="Họ và tên"
                        value={formData.fullName || ""}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                    />
                    <Input
                        label="Số điện thoại"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <Input
                        label="Chuyên môn (Specialty)"
                        value={formData.specialty || ""}
                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    />
                    <Input
                        label="Lĩnh vực (Specialization)"
                        value={formData.specialization || ""}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    />
                    <Input
                        label="Số năm kinh nghiệm"
                        type="number"
                        min="0"
                        value={formData.experienceYears?.toString() || ""}
                        onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                        label="Chứng chỉ"
                        value={formData.certifications || ""}
                        onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    />
                    
                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-slate-700">Tiểu sử (Bio)</label>
                        <textarea
                            className="w-full rounded-xl border-2 border-slate-200 p-3 text-slate-900 outline-none transition-colors focus:border-fit-primary"
                            rows={4}
                            value={formData.bio || ""}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={saving}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSave}
                            isLoading={saving}
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
