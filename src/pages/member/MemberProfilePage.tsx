import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  Activity,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Crown,
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
import MemberTimeline from "../../components/member/MemberTimeline";

import {
  useMemberProfile,
} from "../../hooks/useMemberProfile";

import {
  useMemberTimeline,
} from "../../hooks/useMemberTimeline";

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

import type {
  FitnessGoal,
  Gender,
} from "../../types/member.type";

export default function MemberProfilePage() {
  const {
    profile,
    formData,

    loading,
    saving,
    uploadingAvatar,

    avatarUrl,

    setField,
    saveProfile,
    uploadAvatar,
  } = useMemberProfile();

  const {
    items:
        timelineItems,

    loading:
        timelineLoading,

    loadingMore:
        timelineLoadingMore,

    error:
        timelineError,

    hasMore:
        timelineHasMore,

    loadMore:
        loadMoreTimeline,
  } = useMemberTimeline();

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

  const handleAvatarChange = (
      event:
      ChangeEvent<HTMLInputElement>,
  ): void => {
    const file =
        event.target.files?.[0];

    if (!file) {
      return;
    }

    void uploadAvatar(
        file,
    );

    event.target.value = "";
  };

  const handlePasswordChange =
      async (
          event:
          FormEvent<HTMLFormElement>,
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
          setPasswordSaving(
              true,
          );

          await userService
              .changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
              });

          await showAlert.success(
              "Thành công",
              "Đổi mật khẩu thành công.",
          );

          setPasswordModalOpen(
              false,
          );

          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } catch (
            error: unknown
            ) {
          console.error(
              "CHANGE_PASSWORD_ERROR:",
              error,
          );

          await showAlert.error(
              "Đổi mật khẩu thất bại",
              getApiErrorMessage(
                  error,
              ),
          );
        } finally {
          setPasswordSaving(
              false,
          );
        }
      };

  const handleClosePasswordModal =
      (): void => {
        if (passwordSaving) {
          return;
        }

        setPasswordModalOpen(
            false,
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      };

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
          Không thể tải thông tin hồ sơ.
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <PageHeader
            title="Hồ sơ cá nhân"
            description="Quản lý thông tin tài khoản, sức khỏe và mục tiêu tập luyện"
        />

        <div className="grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="overflow-hidden border-none bg-white p-0 shadow-xl">
            <div className="flex flex-col items-center border-b border-slate-100 px-6 pb-8">
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
                          alt={profile.fullName}
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

              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  {profile.fullName}
                </h2>

                <p className="mt-1 font-mono text-sm text-slate-400">
                  {profile.memberCode || "Chưa có mã hội viên"}
                </p>

                <div className="mt-3 flex justify-center">
                  <Badge variant={
                    profile.status === "ACTIVE" ? "success" : 
                    profile.status === "SUSPENDED" ? "danger" : 
                    "warning"
                  }>
                  <span className="flex items-center gap-1">
                    <Crown className="h-3.5 w-3.5" />
                    {profile.status === "ACTIVE" ? "Đang hoạt động" : 
                     profile.status === "SUSPENDED" ? "Bị khóa" : 
                     profile.status === "INACTIVE" ? "Chưa kích hoạt" : 
                     profile.status || "Hội viên FitLife"}
                  </span>
                  </Badge>
                </div>
              </div>

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

                <div className="border-b border-slate-100 pb-3">
                <span className="flex items-center gap-2 text-slate-500">
                  <Calendar className="h-4 w-4" />
                  Ngày sinh
                </span>

                  <span className="mt-1 block font-medium text-slate-900">
                  {profile.dateOfBirth ||
                      "Chưa cập nhật"}
                </span>
                </div>

                <div>
                <span className="flex items-center gap-2 text-slate-500">
                  <Calendar className="h-4 w-4" />
                  Ngày tham gia
                </span>

                  <span className="mt-1 block font-medium text-slate-900">
                  {profile.joinDate ||
                      profile.createdAt?.substring(
                          0,
                          10,
                      ) ||
                      "Chưa cập nhật"}
                </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-6 flex items-center gap-2 text-fit-primary">
                <User className="h-5 w-5" />

                <h2 className="text-lg font-bold text-fit-text">
                  Thông tin cá nhân
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                    name="fullName"
                    label="Họ và tên"
                    value={
                      formData.fullName
                    }
                    onChange={(event) =>
                        setField(
                            "fullName",
                            event.target.value,
                        )
                    }
                />

                <Input
                    name="dateOfBirth"
                    type="date"
                    label="Ngày sinh"
                    icon={
                      <Calendar className="h-4 w-4" />
                    }
                    value={
                        formData.dateOfBirth ??
                        ""
                    }
                    onChange={(event) =>
                        setField(
                            "dateOfBirth",
                            event.target.value ||
                            null,
                        )
                    }
                />

                <Input
                    name="email"
                    label="Email"
                    value={profile.email}
                    disabled
                    readOnly
                />

                <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Giới tính
                </span>

                  <div className="mt-2 flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-fit-primary focus-within:ring-2 focus-within:ring-fit-primary/10">
                    <User className="mr-3 h-4 w-4 text-fit-primary" />

                    <select
                        value={
                            formData.gender ??
                            ""
                        }
                        onChange={(event) =>
                            setField(
                                "gender",
                                event.target.value
                                    ? (
                                        event.target
                                            .value as Gender
                                    )
                                    : null,
                            )
                        }
                        className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none"
                    >
                      <option value="">
                        Chọn giới tính
                      </option>

                      <option value="MALE">
                        Nam
                      </option>

                      <option value="FEMALE">
                        Nữ
                      </option>

                      <option value="OTHER">
                        Khác
                      </option>
                    </select>
                  </div>
                </label>

                <Input
                    name="phone"
                    label="Số điện thoại"
                    value={
                        formData.phone ??
                        ""
                    }
                    onChange={(event) =>
                        setField(
                            "phone",
                            event.target.value ||
                            null,
                        )
                    }
                />

                <Input
                    name="address"
                    label="Địa chỉ"
                    value={
                        formData.address ??
                        ""
                    }
                    onChange={(event) =>
                        setField(
                            "address",
                            event.target.value ||
                            null,
                        )
                    }
                />
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-6 flex items-center gap-2 text-fit-primary">
                <Activity className="h-5 w-5" />

                <h2 className="text-lg font-bold text-fit-text">
                  Sức khỏe và mục tiêu
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                    name="emergencyContactName"
                    label="Người liên hệ khẩn cấp"
                    value={
                        formData
                            .emergencyContactName ??
                        ""
                    }
                    onChange={(event) =>
                        setField(
                            "emergencyContactName",
                            event.target.value ||
                            null,
                        )
                    }
                />

                <Input
                    name="emergencyContactPhone"
                    label="SĐT khẩn cấp"
                    value={
                        formData
                            .emergencyContactPhone ??
                        ""
                    }
                    onChange={(event) =>
                        setField(
                            "emergencyContactPhone",
                            event.target.value ||
                            null,
                        )
                    }
                />

                <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Mục tiêu tập luyện
                </span>

                  <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-fit-primary focus-within:ring-2 focus-within:ring-fit-primary/10">
                    <select
                        value={
                            formData
                                .fitnessGoal ??
                            ""
                        }
                        onChange={(event) =>
                            setField(
                                "fitnessGoal",
                                event.target.value
                                    ? (
                                        event.target
                                            .value as FitnessGoal
                                    )
                                    : null,
                            )
                        }
                        className="w-full bg-transparent py-3 text-sm outline-none"
                    >
                      <option value="">
                        Chọn mục tiêu
                      </option>

                      <option value="LOSE_WEIGHT">
                        Giảm cân
                      </option>

                      <option value="GAIN_MUSCLE">
                        Tăng cơ
                      </option>

                      <option value="MAINTAIN">
                        Duy trì vóc dáng
                      </option>

                      <option value="IMPROVE_HEALTH">
                        Cải thiện sức khỏe
                      </option>

                      <option value="INCREASE_ENDURANCE">
                        Tăng sức bền
                      </option>
                    </select>
                  </div>
                </label>

                <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Ghi chú sức khỏe
                </span>

                  <textarea
                      rows={4}
                      value={
                          formData.healthNote ??
                          ""
                      }
                      onChange={(event) =>
                          setField(
                              "healthNote",
                              event.target.value ||
                              null,
                          )
                      }
                      placeholder="Chấn thương, bệnh nền hoặc lưu ý dành cho AI..."
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-fit-primary focus:ring-2 focus:ring-fit-primary/10"
                  />
                </label>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-6 flex items-center gap-2 text-fit-primary">
                <ShieldCheck className="h-5 w-5" />

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

            <Card className="p-6">
              <div className="mb-6 flex items-center gap-2 text-fit-primary">
                <Activity className="h-5 w-5" />

                <h2 className="text-lg font-bold text-fit-text">
                  Hoạt động gần đây
                </h2>
              </div>

              <MemberTimeline
                  items={
                    timelineItems
                  }
                  loading={
                    timelineLoading
                  }
                  loadingMore={
                    timelineLoadingMore
                  }
                  error={
                    timelineError
                  }
                  hasMore={
                    timelineHasMore
                  }
                  onLoadMore={() =>
                      void loadMoreTimeline()
                  }
              />
            </Card>

            <div className="flex justify-end">
              <Button
                  type="button"
                  className="w-full min-w-40 sm:w-auto"
                  onClick={() =>
                      void saveProfile()
                  }
                  disabled={saving}
                  isLoading={saving}
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>

        <Modal
            title="Đổi mật khẩu tài khoản"
            open={
              passwordModalOpen
            }
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
                value={
                  currentPassword
                }
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
                value={
                  newPassword
                }
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
                value={
                  confirmPassword
                }
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
      </div>
  );
}