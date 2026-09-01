import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  Activity,
  User,
} from "lucide-react";

import toast from "react-hot-toast";

import Input from "../../../components/common/Input";
import Modal from "../../../components/common/Modal";

import {
  trainerService,
} from "../../../services/trainerService";

import {
  userService,
} from "../../../services/userService";

import {
  validateTrainerForm,
  type TrainerFormData,
} from "../../../utils/validators/trainerValidator";

import {
  getApiErrorMessage,
} from "../../../utils/apiError";

import type {
  Trainer,
} from "../../../types/trainer.type";

interface TrainerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trainer: Trainer | null;
}

const EMPTY_FORM: TrainerFormData = {
  trainerCode: "",
  specialty: "",
  experienceYears: "",
  certifications: "",
  bio: "",

  username: "",
  email: "",
  password: "123456",
  fullName: "",
  phone: "",
};

export function TrainerFormModal({
                                   open,
                                   onClose,
                                   onSuccess,
                                   trainer,
                                 }: TrainerFormModalProps) {
  const isEditing = trainer !== null;

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    formData,
    setFormData,
  ] = useState<TrainerFormData>(
      EMPTY_FORM,
  );

  const [
    formErrors,
    setFormErrors,
  ] = useState<
      Partial<
          Record<
              keyof TrainerFormData,
              string
          >
      >
  >({});

  // =====================================================
  // INITIALIZE FORM
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!trainer) {
      setFormData({
        ...EMPTY_FORM,
      });

      setFormErrors({});
      return;
    }

    setFormData({
      trainerCode:
          trainer.trainerCode ?? "",

      specialty:
          trainer.specialization ??
          trainer.specialty ??
          "",

      experienceYears:
          trainer.experienceYears !==
          undefined
              ? String(
                  trainer.experienceYears,
              )
              : "",

      certifications:
          trainer.certifications ?? "",

      bio:
          trainer.bio ?? "",

      username:
          trainer.username ?? "",

      email:
          trainer.email ?? "",

      // Không submit password khi edit.
      password: "",

      fullName:
          trainer.fullName ?? "",

      phone:
          trainer.phone ?? "",
    });

    setFormErrors({});
  }, [
    open,
    trainer,
  ]);

  if (!open) {
    return null;
  }

  // =====================================================
  // CHANGE
  // =====================================================

  const handleFormChange = (
      event: ChangeEvent<HTMLInputElement>,
  ) => {
    const {
      name,
      value,
    } = event.target;

    const field =
        name as keyof TrainerFormData;

    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (formErrors[field]) {
      setFormErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    }
  };

  const handleBioChange = (
      event: ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setFormData((previous) => ({
      ...previous,
      bio: event.target.value,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (
      event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validation =
        validateTrainerForm(
            formData,
            isEditing,
        );

    if (!validation.isValid) {
      setFormErrors(
          validation.errors,
      );

      return;
    }

    // =====================================================
    // NORMALIZE FORM
    // =====================================================

    const normalizedUsername =
        formData.username?.trim() ?? "";

    const normalizedEmail =
        formData.email?.trim() ?? "";

    const normalizedPassword =
        formData.password ?? "";

    const normalizedFullName =
        formData.fullName?.trim() ?? "";

    const normalizedPhone =
        formData.phone?.trim() ?? "";

    const normalizedTrainerCode =
        formData.trainerCode?.trim() ?? "";

    const normalizedSpecialty =
        formData.specialty?.trim() ?? "";

    const normalizedCertifications =
        formData.certifications?.trim() ?? "";

    const normalizedBio =
        formData.bio?.trim() ?? "";

    const normalizedExperienceYears =
        formData.experienceYears
            ? Number(
                formData.experienceYears,
            )
            : undefined;

    // =====================================================
    // EXTRA SAFETY
    // =====================================================

    if (!isEditing) {
      if (!normalizedUsername) {
        toast.error(
            "Tên đăng nhập không được để trống.",
        );
        return;
      }

      if (!normalizedEmail) {
        toast.error(
            "Email không được để trống.",
        );
        return;
      }

      if (!normalizedPassword) {
        toast.error(
            "Mật khẩu không được để trống.",
        );
        return;
      }

      if (!normalizedFullName) {
        toast.error(
            "Họ và tên không được để trống.",
        );
        return;
      }

      if (!normalizedPhone) {
        toast.error(
            "Số điện thoại không được để trống.",
        );
        return;
      }

      if (!normalizedTrainerCode) {
        toast.error(
            "Mã huấn luyện viên không được để trống.",
        );
        return;
      }

      if (!normalizedSpecialty) {
        toast.error(
            "Chuyên môn không được để trống.",
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // ===================================================
      // CREATE
      // ===================================================

      if (!isEditing) {
        const newUser =
            await userService.createUser({
              username:
              normalizedUsername,

              email:
              normalizedEmail,

              password:
              normalizedPassword,

              fullName:
              normalizedFullName,

              phone:
              normalizedPhone,

              roleCode:
                  "ROLE_TRAINER",

              status:
                  "ACTIVE",
            });

        await trainerService.createTrainer({
          userId:
          newUser.id,

          trainerCode:
          normalizedTrainerCode,

          specialization:
          normalizedSpecialty,

          experienceYears:
          normalizedExperienceYears,

          certifications:
          normalizedCertifications,

          bio:
          normalizedBio,
        });

        toast.success(
            "Tạo tài khoản và hồ sơ huấn luyện viên thành công.",
        );
      }

      // ===================================================
      // UPDATE
      // ===================================================
      else {
        if (!trainer) {
          return;
        }

        if (trainer.userId) {
          const currentUser =
              await userService.getUserById(
                  trainer.userId,
              );

          await userService.updateUser(
              trainer.userId,
              {
                username:
                currentUser.username,

                email:
                    normalizedEmail ||
                    currentUser.email,

                fullName:
                    normalizedFullName ||
                    currentUser.fullName,

                phone:
                normalizedPhone,

                status:
                currentUser.status,
              },
          );
        }

        await trainerService.updateTrainer(
            trainer.id,
            {
              specialization:
              normalizedSpecialty,

              experienceYears:
              normalizedExperienceYears,

              certifications:
              normalizedCertifications,

              bio:
              normalizedBio,
            },
        );

        toast.success(
            "Cập nhật huấn luyện viên thành công.",
        );
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error(
          "SAVE_TRAINER_ERROR:",
          error,
      );

      toast.error(
          getApiErrorMessage(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
      <Modal
          title={
            isEditing
                ? "Chỉnh sửa huấn luyện viên"
                : "Thêm huấn luyện viên"
          }
          open={open}
          onClose={onClose}
          size="xl"
          disableClose={isSubmitting}
      >
        <p className="mb-6 text-sm text-slate-500">
          {isEditing
              ? "Cập nhật thông tin tài khoản và chuyên môn của huấn luyện viên."
              : "Tạo tài khoản ROLE_TRAINER và hồ sơ chuyên môn tương ứng."}
        </p>

        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
          {/* =================================================
            ACCOUNT
        ================================================= */}

          <section className="space-y-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-6">
            <div>
              <h3 className="font-bold text-slate-800">
                Thông tin tài khoản
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Thông tin dùng để đăng nhập vào hệ thống FitLife.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                  label="Họ và tên *"
                  name="fullName"
                  placeholder="VD: Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  error={formErrors.fullName}
              />

              <Input
                  label="Tên đăng nhập *"
                  name="username"
                  placeholder="VD: nguyenvana"
                  value={formData.username}
                  onChange={handleFormChange}
                  error={formErrors.username}
                  disabled={isEditing}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                  label="Email *"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleFormChange}
                  error={formErrors.email}
              />

              <Input
                  label="Số điện thoại *"
                  name="phone"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={handleFormChange}
                  error={formErrors.phone}
              />
            </div>

            {!isEditing && (
                <Input
                    label="Mật khẩu *"
                    name="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleFormChange}
                    error={formErrors.password}
                />
            )}
          </section>

          {/* =================================================
            TRAINER PROFILE
        ================================================= */}

          <section className="space-y-5">
            <div>
              <h3 className="font-bold text-slate-800">
                Hồ sơ chuyên môn
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Thông tin chuyên môn phục vụ quản lý PT và hội viên.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                  label="Mã huấn luyện viên *"
                  name="trainerCode"
                  placeholder="VD: PT001"
                  value={formData.trainerCode}
                  onChange={handleFormChange}
                  error={
                    formErrors.trainerCode
                  }
                  icon={
                    <User className="h-4 w-4" />
                  }
                  disabled={isEditing}
              />

              <Input
                  label="Chuyên môn *"
                  name="specialty"
                  placeholder="VD: Bodybuilding, Yoga, giảm cân..."
                  value={formData.specialty}
                  onChange={handleFormChange}
                  error={
                    formErrors.specialty
                  }
                  icon={
                    <Activity className="h-4 w-4" />
                  }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                  label="Số năm kinh nghiệm"
                  name="experienceYears"
                  type="number"
                  placeholder="VD: 3"
                  value={
                    formData.experienceYears
                  }
                  onChange={handleFormChange}
                  error={
                    formErrors.experienceYears
                  }
                  icon={
                    <Activity className="h-4 w-4" />
                  }
              />

              <Input
                  label="Chứng chỉ"
                  name="certifications"
                  placeholder="VD: NASM, ACE..."
                  value={
                    formData.certifications
                  }
                  onChange={handleFormChange}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Giới thiệu
              </label>

              <textarea
                  name="bio"
                  rows={4}
                  placeholder="Giới thiệu về kinh nghiệm và phương pháp huấn luyện..."
                  value={formData.bio}
                  onChange={handleBioChange}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition focus:border-fit-primary focus:outline-none focus:ring-2 focus:ring-fit-primary/10"
              />
            </div>
          </section>

          {/* =================================================
            ACTION
        ================================================= */}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
            >
              Hủy bỏ
            </button>

            <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}

              {isEditing
                  ? "Lưu thay đổi"
                  : "Tạo huấn luyện viên"}
            </button>
          </div>
        </form>
      </Modal>
  );
}