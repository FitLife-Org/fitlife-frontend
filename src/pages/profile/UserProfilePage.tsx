import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  Award,
  Camera,
  CheckCircle2,
  ChevronRight,
  Edit2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";

import {
  useAuthStore,
} from "../../store/authStore";

import {
  profileService,
} from "../../services/profileService";

import {
  userService,
} from "../../services/userService";

import {
  showAlert,
} from "../../utils/alert";

import {
  getApiErrorMessage,
} from "../../utils/apiError";

import {
  validateChangePassword,
} from "../../utils/validators/profileValidator";

import {
  validateAvatarFile,
} from "../../utils/validateAvatarFile";

import type {
  Trainer,
} from "../../types/trainer.type";

import type {
  User as UserType,
} from "../../types/user.type";

// =====================================================
// TYPES
// =====================================================

interface BasicProfileForm {
  fullName: string;
  phone: string;
}

interface TrainerProfileForm {
  fullName: string;
  phone: string;
  specialization: string;
  experienceYears: string;
  certifications: string;
  bio: string;
}

// =====================================================
// COMPONENT
// =====================================================

export default function UserProfilePage() {
  const authUser =
      useAuthStore(
          (state) => state.user,
      );

  const updateUserStore =
      useAuthStore(
          (state) => state.updateUser,
      );

  const [
    profile,
    setProfile,
  ] = useState<UserType | null>(
      null,
  );

  const [
    trainerProfile,
    setTrainerProfile,
  ] = useState<Trainer | null>(
      null,
  );

  const [
    basicForm,
    setBasicForm,
  ] = useState<BasicProfileForm>({
    fullName: "",
    phone: "",
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
  ] = useState<string | null>(
      null,
  );

  // =====================================================
  // PASSWORD MODAL
  // =====================================================

  const [
    passwordModalOpen,
    setPasswordModalOpen,
  ] = useState(false);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    passwordSaving,
    setPasswordSaving,
  ] = useState(false);

  // =====================================================
  // TRAINER MODAL
  // =====================================================

  const [
    editTrainerModalOpen,
    setEditTrainerModalOpen,
  ] = useState(false);

  const [
    trainerForm,
    setTrainerForm,
  ] = useState<TrainerProfileForm>({
    fullName: "",
    phone: "",
    specialization: "",
    experienceYears: "",
    certifications: "",
    bio: "",
  });

  const [
    trainerSaving,
    setTrainerSaving,
  ] = useState(false);

  const isTrainer =
      authUser?.roles.includes(
          "ROLE_TRAINER",
      ) ?? false;

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const userDetails =
            await profileService.getUserProfile();

        setProfile(
            userDetails,
        );

        setBasicForm({
          fullName:
              userDetails.fullName ?? "",

          phone:
              userDetails.phone ?? "",
        });

        if (
            userDetails.roles.includes(
                "ROLE_TRAINER",
            )
        ) {
          try {
            const trainerDetails =
                await profileService.getTrainerProfile();

            setTrainerProfile(
                trainerDetails,
            );
          } catch (error) {
            console.error(
                "LOAD_TRAINER_PROFILE_ERROR:",
                error,
            );
          }
        } else {
          setTrainerProfile(null);
        }
      } catch (error) {
        console.error(
            "LOAD_USER_PROFILE_ERROR:",
            error,
        );

        void showAlert.error(
            "Lỗi",
            "Không thể tải thông tin hồ sơ cá nhân.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  // =====================================================
  // AVATAR
  // =====================================================

  const handleAvatarChange = async (
      event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file =
        event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationMessage =
        validateAvatarFile(file);

    if (validationMessage) {
      void showAlert.warning(
          "Ảnh không hợp lệ",
          validationMessage,
      );

      event.target.value = "";
      return;
    }

    const objectUrl =
        URL.createObjectURL(file);

    setAvatarPreview(
        objectUrl,
    );

    try {
      setUploadingAvatar(true);

      const updatedUser =
          await profileService.updateUserAvatar(
              file,
          );

      setProfile(
          updatedUser,
      );

      if (authUser) {
        updateUserStore({
          ...authUser,
          avatarUrl:
          updatedUser.avatarUrl,
        });
      }

      void showAlert.success(
          "Thành công",
          "Đã cập nhật ảnh đại diện.",
      );
    } catch (error) {
      console.error(
          "UPLOAD_AVATAR_ERROR:",
          error,
      );

      setAvatarPreview(null);

      void showAlert.error(
          "Lỗi",
          getApiErrorMessage(error),
      );
    } finally {
      setUploadingAvatar(false);

      URL.revokeObjectURL(
          objectUrl,
      );

      event.target.value = "";
    }
  };

  // =====================================================
  // BASIC PROFILE
  // =====================================================

  const handleBasicChange = (
      field: keyof BasicProfileForm,
      value: string,
  ) => {
    setBasicForm(
        (previous) => ({
          ...previous,
          [field]: value,
        }),
    );
  };

  const handleSaveProfile =
      async (): Promise<void> => {
        if (
            !basicForm.fullName.trim()
        ) {
          void showAlert.warning(
              "Thiếu dữ liệu",
              "Họ và tên không được để trống.",
          );

          return;
        }

        try {
          setSaving(true);

          const updatedUser =
              await profileService.updateUserProfile({
                fullName:
                    basicForm.fullName.trim(),

                phone:
                    basicForm.phone.trim(),
              });

          setProfile(
              updatedUser,
          );

          setBasicForm({
            fullName:
                updatedUser.fullName ?? "",

            phone:
                updatedUser.phone ?? "",
          });

          if (authUser) {
            updateUserStore({
              ...authUser,

              fullName:
              updatedUser.fullName,

              avatarUrl:
                  updatedUser.avatarUrl ??
                  authUser.avatarUrl,
            });
          }

          void showAlert.success(
              "Thành công",
              "Thông tin cá nhân đã được cập nhật.",
          );
        } catch (error) {
          console.error(
              "SAVE_PROFILE_ERROR:",
              error,
          );

          void showAlert.error(
              "Lỗi",
              getApiErrorMessage(error),
          );
        } finally {
          setSaving(false);
        }
      };

  // =====================================================
  // PASSWORD
  // =====================================================

  const handlePasswordChange =
      async (
          event: FormEvent<HTMLFormElement>,
      ): Promise<void> => {
        event.preventDefault();

        if (
            !validateChangePassword(
                currentPassword,
                newPassword,
                confirmPassword,
            )
        ) {
          return;
        }

        try {
          setPasswordSaving(true);

          await userService.changePassword({
            currentPassword,
            newPassword,
            confirmPassword,
          });

          void showAlert.success(
              "Thành công",
              "Đổi mật khẩu thành công.",
          );

          setPasswordModalOpen(
              false,
          );

          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } catch (error) {
          console.error(
              "CHANGE_PASSWORD_ERROR:",
              error,
          );

          void showAlert.error(
              "Đổi mật khẩu thất bại",
              getApiErrorMessage(error),
          );
        } finally {
          setPasswordSaving(false);
        }
      };

  const handleClosePasswordModal =
      () => {
        if (passwordSaving) {
          return;
        }

        setPasswordModalOpen(false);

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      };

  // =====================================================
  // TRAINER EDIT
  // =====================================================

  const handleOpenTrainerModal =
      () => {
        if (!profile) {
          return;
        }

        setTrainerForm({
          fullName:
              profile.fullName ?? "",

          phone:
              profile.phone ?? "",

          specialization:
              trainerProfile?.specialization ??
              "",

          experienceYears:
              trainerProfile?.experienceYears !==
              undefined
                  ? String(
                      trainerProfile.experienceYears,
                  )
                  : "",

          certifications:
              trainerProfile?.certifications ??
              "",

          bio:
              trainerProfile?.bio ?? "",
        });

        setEditTrainerModalOpen(
            true,
        );
      };

  const handleTrainerFieldChange = (
      field: keyof TrainerProfileForm,
      value: string,
  ) => {
    setTrainerForm(
        (previous) => ({
          ...previous,
          [field]: value,
        }),
    );
  };

  const handleSaveTrainerModal =
      async (
          event: FormEvent<HTMLFormElement>,
      ): Promise<void> => {
        event.preventDefault();

        if (
            !trainerForm.fullName.trim()
        ) {
          void showAlert.warning(
              "Thiếu dữ liệu",
              "Họ và tên không được để trống.",
          );

          return;
        }

        if (
            !trainerForm.specialization.trim()
        ) {
          void showAlert.warning(
              "Thiếu dữ liệu",
              "Chuyên môn huấn luyện viên không được để trống.",
          );

          return;
        }

        const experienceYears =
            trainerForm.experienceYears
                ? Number(
                    trainerForm.experienceYears,
                )
                : 0;

        if (
            Number.isNaN(
                experienceYears,
            ) ||
            experienceYears < 0
        ) {
          void showAlert.warning(
              "Dữ liệu không hợp lệ",
              "Số năm kinh nghiệm phải lớn hơn hoặc bằng 0.",
          );

          return;
        }

        try {
          setTrainerSaving(true);

          const updatedUser =
              await profileService.updateUserProfile({
                fullName:
                    trainerForm.fullName.trim(),

                phone:
                    trainerForm.phone.trim(),
              });

          const updatedTrainer =
              await profileService.updateTrainerProfile({
                specialization:
                    trainerForm.specialization.trim(),

                experienceYears,

                certifications:
                    trainerForm.certifications.trim(),

                bio:
                    trainerForm.bio.trim(),
              });

          setProfile(
              updatedUser,
          );

          setTrainerProfile(
              updatedTrainer,
          );

          setBasicForm({
            fullName:
                updatedUser.fullName ?? "",

            phone:
                updatedUser.phone ?? "",
          });

          if (authUser) {
            updateUserStore({
              ...authUser,

              fullName:
              updatedUser.fullName,

              avatarUrl:
                  updatedUser.avatarUrl ??
                  authUser.avatarUrl,
            });
          }

          void showAlert.success(
              "Thành công",
              "Đã cập nhật thông tin huấn luyện viên.",
          );

          setEditTrainerModalOpen(
              false,
          );
        } catch (error) {
          console.error(
              "SAVE_TRAINER_PROFILE_ERROR:",
              error,
          );

          void showAlert.error(
              "Lỗi",
              getApiErrorMessage(error),
          );
        } finally {
          setTrainerSaving(false);
        }
      };

  // =====================================================
  // LOADING / EMPTY
  // =====================================================

  if (loading) {
    return (
        <div className="flex min-h-80 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
        </div>
    );
  }

  if (!profile) {
    return (
        <div className="rounded-2xl bg-red-50 p-8 text-center font-medium text-red-600">
          Không thể tải thông tin hồ sơ cá nhân.
        </div>
    );
  }

  // =====================================================
  // DISPLAY HELPERS
  // =====================================================

  const roleLabels:
      Record<string, string> = {
    ROLE_ADMIN:
        "Quản trị viên",

    ROLE_STAFF:
        "Nhân viên hệ thống",

    ROLE_TRAINER:
        "Huấn luyện viên (PT)",

    ROLE_MEMBER:
        "Hội viên",
  };

  const primaryRole =
      profile.roles[0];

  const avatarUrl =
      avatarPreview ||
      profile.avatarUrl ||
      null;

  const badgeVariant =
      profile.roles.includes(
          "ROLE_ADMIN",
      )
          ? "danger"
          : profile.roles.includes(
              "ROLE_TRAINER",
          )
              ? "success"
              : profile.roles.includes(
                  "ROLE_STAFF",
              )
                  ? "warning"
                  : "default";

  // =====================================================
  // RENDER
  // =====================================================

  return (
      <div className="space-y-6">
        <PageHeader
            title="Hồ sơ cá nhân"
            description="Quản lý thông tin tài khoản, bảo mật và hồ sơ chuyên môn."
        />

        <div className="grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">

          {/* =================================================
            LEFT PROFILE
        ================================================= */}

          <div className="space-y-4">
            <Card className="overflow-hidden border-none bg-white p-0 shadow-xl">
              <div className="flex flex-col items-center border-b border-slate-100 px-6 pb-8">

                {/* Avatar */}

                <div className="relative mb-4 mt-6 h-32 w-32">
                  <div className="group relative h-full w-full overflow-hidden rounded-full border-4 border-slate-100 bg-slate-50 shadow-sm">
                    {uploadingAvatar && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
                        </div>
                    )}

                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={
                              profile.fullName
                            }
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-fit-primarySoft text-fit-primary">
                          <User className="h-12 w-12" />
                        </div>
                    )}
                  </div>

                  <label className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow transition-transform hover:scale-110">
                    <Camera className="h-4 w-4" />

                    <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleAvatarChange
                        }
                        disabled={
                          uploadingAvatar
                        }
                    />
                  </label>
                </div>

                {/* Name */}

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {profile.fullName}
                  </h2>

                  <p className="mt-1 font-mono text-sm text-slate-400">
                    @{profile.username}
                  </p>

                  <div className="mt-3 flex justify-center">
                    <Badge
                        variant={
                          badgeVariant
                        }
                    >
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />

                      {roleLabels[
                              primaryRole
                              ] ??
                          "Người dùng"}
                    </span>
                    </Badge>
                  </div>
                </div>

                {/* Contact */}

                <div className="mt-8 w-full space-y-4 text-sm">
                  <div className="border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Mail className="h-4 w-4" />
                    Email
                  </span>

                    <span className="mt-1 block break-words font-medium text-slate-900">
                    {profile.email}
                  </span>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Phone className="h-4 w-4" />
                    Điện thoại
                  </span>

                    <span className="mt-1 block font-medium text-slate-900">
                    {profile.phone ||
                        "Chưa cập nhật"}
                  </span>
                  </div>

                  {isTrainer &&
                      trainerProfile && (
                          <div>
                      <span className="flex items-center gap-2 text-slate-500">
                        <Award className="h-4 w-4" />
                        Mã HLV
                      </span>

                            <span className="mt-1 block font-mono font-bold text-slate-900">
                        {
                          trainerProfile.trainerCode
                        }
                      </span>
                          </div>
                      )}
                </div>
              </div>
            </Card>

            {isTrainer && (
                <Button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 bg-fit-primary py-3 text-white shadow-md hover:bg-fit-primaryHover"
                    onClick={
                      handleOpenTrainerModal
                    }
                >
                  <Edit2 className="h-4 w-4" />
                  Cập nhật huấn luyện viên
                </Button>
            )}
          </div>

          {/* =================================================
            RIGHT
        ================================================= */}

          <div className="space-y-6">

            {/* Basic */}

            <Card className="p-6">
              <div className="mb-6 flex items-center gap-2 text-fit-primary">
                <User className="h-5 w-5" />

                <h2 className="text-lg font-bold text-fit-text">
                  Thông tin tài khoản
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                    name="fullName"
                    label="Họ và tên *"
                    value={
                      basicForm.fullName
                    }
                    onChange={(event) =>
                        handleBasicChange(
                            "fullName",
                            event.target.value,
                        )
                    }
                />

                <Input
                    name="phone"
                    label="Số điện thoại"
                    value={
                      basicForm.phone
                    }
                    onChange={(event) =>
                        handleBasicChange(
                            "phone",
                            event.target.value,
                        )
                    }
                />

                <Input
                    name="username"
                    label="Tên đăng nhập"
                    value={
                      profile.username
                    }
                    disabled
                    readOnly
                />

                <Input
                    name="email"
                    label="Email hệ thống"
                    value={
                      profile.email
                    }
                    disabled
                    readOnly
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                    type="button"
                    onClick={
                      handleSaveProfile
                    }
                    disabled={saving}
                    isLoading={saving}
                >
                  Lưu thông tin
                </Button>
              </div>
            </Card>

            {/* Trainer information */}

            {isTrainer &&
                trainerProfile && (
                    <Card className="p-6">
                      <div className="mb-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-fit-primary">
                          <Award className="h-5 w-5" />

                          <h2 className="text-lg font-bold text-fit-text">
                            Hồ sơ chuyên môn
                          </h2>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={
                              handleOpenTrainerModal
                            }
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Chuyên môn
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {trainerProfile.specialization ||
                                "Chưa cập nhật"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Kinh nghiệm
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {trainerProfile.experienceYears ??
                                0}{" "}
                            năm
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Chứng chỉ
                          </p>

                          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                            {trainerProfile.certifications ||
                                "Chưa cập nhật"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Giới thiệu
                          </p>

                          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                            {trainerProfile.bio ||
                                "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>
                    </Card>
                )}

            {/* Security */}

            <Card className="p-6">
              <div className="mb-6 flex items-center gap-2 text-fit-primary">
                <Lock className="h-5 w-5" />

                <h2 className="text-lg font-bold text-fit-text">
                  Bảo mật tài khoản
                </h2>
              </div>

              <div className="space-y-4">
                <button
                    type="button"
                    onClick={() =>
                        setPasswordModalOpen(
                            true,
                        )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-fit-border bg-fit-bg p-4 text-left transition-colors hover:border-fit-primary/50"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-fit-muted" />

                    <div>
                      <p className="text-sm font-medium text-fit-text">
                        Đổi mật khẩu
                      </p>

                      <p className="text-xl leading-none tracking-[0.2em] text-fit-muted">
                        ••••••••
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-fit-muted" />
                </button>

                <div className="flex items-center justify-between rounded-xl border border-fit-border bg-fit-bg p-4">
                  <div>
                    <p className="text-sm font-medium text-fit-text">
                      Trạng thái tài khoản
                    </p>

                    <p className="mt-1 text-sm text-fit-muted">
                      {profile.status}
                    </p>
                  </div>

                  <CheckCircle2 className="h-5 w-5 text-fit-primary" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* =================================================
          PASSWORD MODAL
      ================================================= */}

        <Modal
            title="Đổi mật khẩu tài khoản"
            open={passwordModalOpen}
            onClose={
              handleClosePasswordModal
            }
            disableClose={
              passwordSaving
            }
        >
          <form
              onSubmit={
                handlePasswordChange
              }
              className="space-y-4"
          >
            <Input
                label="Mật khẩu hiện tại *"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) =>
                    setCurrentPassword(
                        event.target.value,
                    )
                }
                required
            />

            <Input
                label="Mật khẩu mới *"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) =>
                    setNewPassword(
                        event.target.value,
                    )
                }
                required
            />

            <Input
                label="Xác nhận mật khẩu mới *"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                    setConfirmPassword(
                        event.target.value,
                    )
                }
                required
            />

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button
                  type="button"
                  variant="outline"
                  onClick={
                    handleClosePasswordModal
                  }
                  disabled={
                    passwordSaving
                  }
              >
                Hủy
              </Button>

              <Button
                  type="submit"
                  isLoading={
                    passwordSaving
                  }
              >
                Đổi mật khẩu
              </Button>
            </div>
          </form>
        </Modal>

        {/* =================================================
          TRAINER MODAL
      ================================================= */}

        <Modal
            title="Chỉnh sửa huấn luyện viên"
            open={editTrainerModalOpen}
            onClose={() => {
              if (!trainerSaving) {
                setEditTrainerModalOpen(
                    false,
                );
              }
            }}
            disableClose={
              trainerSaving
            }
        >
          <p className="mb-6 text-sm text-slate-500">
            Cập nhật thông tin tài khoản và hồ sơ chuyên môn PT.
          </p>

          <form
              onSubmit={
                handleSaveTrainerModal
              }
              className="space-y-6"
          >
            <div className="space-y-4 rounded-2xl border border-slate-100/80 bg-slate-50/50 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Thông tin tài khoản
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                    label="Họ và tên *"
                    name="fullName"
                    value={
                      trainerForm.fullName
                    }
                    onChange={(event) =>
                        handleTrainerFieldChange(
                            "fullName",
                            event.target.value,
                        )
                    }
                    required
                />

                <Input
                    label="Tên đăng nhập"
                    name="username"
                    value={
                      profile.username
                    }
                    disabled
                    readOnly
                />

                <Input
                    label="Email"
                    name="email"
                    value={
                      profile.email
                    }
                    disabled
                    readOnly
                />

                <Input
                    label="Số điện thoại"
                    name="phone"
                    value={
                      trainerForm.phone
                    }
                    onChange={(event) =>
                        handleTrainerFieldChange(
                            "phone",
                            event.target.value,
                        )
                    }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                  label="Mã huấn luyện viên"
                  name="trainerCode"
                  value={
                      trainerProfile?.trainerCode ??
                      ""
                  }
                  disabled
                  readOnly
              />

              <Input
                  label="Chuyên môn *"
                  name="specialization"
                  value={
                    trainerForm.specialization
                  }
                  onChange={(event) =>
                      handleTrainerFieldChange(
                          "specialization",
                          event.target.value,
                      )
                  }
                  required
              />

              <Input
                  label="Số năm kinh nghiệm"
                  name="experienceYears"
                  type="number"
                  value={
                    trainerForm.experienceYears
                  }
                  onChange={(event) =>
                      handleTrainerFieldChange(
                          "experienceYears",
                          event.target.value,
                      )
                  }
              />

              <Input
                  label="Chứng chỉ"
                  name="certifications"
                  value={
                    trainerForm.certifications
                  }
                  onChange={(event) =>
                      handleTrainerFieldChange(
                          "certifications",
                          event.target.value,
                      )
                  }
                  placeholder="VD: NASM, ACE..."
              />

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Giới thiệu
                </label>

                <textarea
                    rows={4}
                    value={
                      trainerForm.bio
                    }
                    onChange={(event) =>
                        handleTrainerFieldChange(
                            "bio",
                            event.target.value,
                        )
                    }
                    placeholder="Nhập thông tin giới thiệu về huấn luyện viên..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-fit-primary focus:ring-2 focus:ring-fit-primary/10"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                      setEditTrainerModalOpen(
                          false,
                      )
                  }
                  disabled={
                    trainerSaving
                  }
              >
                Hủy bỏ
              </Button>

              <Button
                  type="submit"
                  isLoading={
                    trainerSaving
                  }
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Modal>
      </div>
  );
}