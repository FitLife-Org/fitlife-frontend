import {
  useState,
  useEffect,
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
  QrCode,
  ScanLine,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import QRCode from "react-qr-code";
import { memberService } from "../../services/memberService";

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

  const [qrInfo, setQrInfo] = useState<{ memberCode: string; qrData: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrScale, setQrScale] = useState<number>(180);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const loadQrCode = async () => {
    try {
      setQrLoading(true);
      const data = await memberService.getMyQr();
      setQrInfo(data);
    } catch (error) {
      console.error("Lỗi khi tải mã QR:", error);
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    void loadQrCode();
    const interval = setInterval(() => {
      void loadQrCode();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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
          {/* CỘT BÊN TRÁI: THẺ THÔNG TIN CÁ NHÂN & MÃ QR CHECK-IN NẰM NGAY DƯỚI */}
          <div className="space-y-6">
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
                    {profile.memberCode}
                  </p>

                  <div className="mt-3 flex justify-center">
                    <Badge variant="success">
                    <span className="flex items-center gap-1">
                      <Crown className="h-3.5 w-3.5" />
                      Hội viên FitLife
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

            {/* MÃ QR CHECK-IN CỦA MEMBER NẰM DƯỚI THÔNG TIN CÁ NHÂN */}
            <Card className="overflow-hidden border-none bg-white p-6 shadow-xl relative text-center group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-fit-primary to-blue-500" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-fit-primary">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-fit-primary">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Mã QR Check-in</h3>
                </div>

                {/* Điều khiển Thu nhỏ / Phóng to */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setQrScale(prev => Math.max(120, prev - 25))}
                    disabled={qrScale <= 120}
                    className="p-1.5 text-slate-600 hover:text-fit-primary hover:bg-white rounded-lg transition-all disabled:opacity-30 cursor-pointer"
                    title="Thu nhỏ mã QR"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-slate-500 px-1">
                    {Math.round((qrScale / 180) * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setQrScale(prev => Math.min(230, prev + 25))}
                    disabled={qrScale >= 230}
                    className="p-1.5 text-slate-600 hover:text-fit-primary hover:bg-white rounded-lg transition-all disabled:opacity-30 cursor-pointer"
                    title="Phóng to mã QR"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-4 text-center">
                Vui lòng đưa mã này cho lễ tân hoặc quét tại cổng tự động
              </p>

              {/* QR Container */}
              <div 
                onClick={() => setQrModalOpen(true)}
                className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 relative mx-auto w-fit cursor-pointer group/qr transition-transform hover:scale-[1.02]"
                title="Nhấn để phóng to toàn màn hình"
              >
                {qrLoading && !qrInfo ? (
                  <div 
                    style={{ width: `${qrScale}px`, height: `${qrScale}px` }}
                    className="flex items-center justify-center bg-slate-50 rounded-xl"
                  >
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-fit-primary border-t-transparent" />
                  </div>
                ) : qrInfo ? (
                  <div className="relative">
                    <QRCode
                      value={qrInfo.qrData}
                      size={qrScale}
                      level="H"
                      className="rounded-lg transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-white/70 opacity-0 group-hover/qr:opacity-100 flex flex-col items-center justify-center transition-opacity rounded-lg backdrop-blur-[1px]">
                      <Maximize2 className="w-6 h-6 text-fit-primary mb-1" />
                      <span className="text-[11px] font-bold text-slate-800">Bấm phóng to</span>
                    </div>
                  </div>
                ) : (
                  <div 
                    style={{ width: `${qrScale}px`, height: `${qrScale}px` }}
                    className="flex items-center justify-center bg-slate-50 rounded-xl"
                  >
                    <p className="text-xs text-slate-400">Không thể tải QR</p>
                  </div>
                )}
              </div>

              {/* Mã hội viên & Nút phóng to / Làm mới */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Mã Hội Viên</span>
                  <span className="text-sm font-black font-mono tracking-wider text-slate-800">
                    {profile.memberCode || qrInfo?.memberCode || "MEM"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={loadQrCode}
                    disabled={qrLoading}
                    className="p-2 text-slate-500 hover:text-fit-primary hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    title="Làm mới mã QR"
                  >
                    <RefreshCw className={`w-4 h-4 ${qrLoading ? "animate-spin" : ""}`} />
                  </button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setQrModalOpen(true)}
                    className="text-xs py-1.5 px-2.5 flex items-center gap-1 font-bold border-slate-200 hover:border-fit-primary hover:text-fit-primary"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Phóng to
                  </Button>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Mã tự động làm mới sau mỗi phút</span>
              </div>
            </Card>
          </div>

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

        {/* MODAL PHÓNG TO MÃ QR */}
        <Modal
          open={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          title="Mã QR Điểm Danh Hội Viên"
          size="md"
        >
          <div className="p-6 text-center space-y-5">
            <div className="bg-emerald-50 text-emerald-800 text-xs py-2 px-4 rounded-xl font-medium inline-block">
              Đưa mã này gần cổng quét tự động hoặc xuất trình cho lễ tân
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 mx-auto w-fit">
              {qrInfo ? (
                <QRCode
                  value={qrInfo.qrData}
                  size={280}
                  level="H"
                  className="rounded-xl mx-auto"
                />
              ) : (
                <div className="w-[280px] h-[280px] flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mã Hội Viên</p>
              <p className="text-3xl font-black font-mono tracking-widest text-slate-900 mt-0.5">
                {profile.memberCode || qrInfo?.memberCode}
              </p>
              <p className="text-sm font-semibold text-slate-600 mt-1">
                {profile.fullName}
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setQrModalOpen(false)}
                className="flex items-center gap-1.5 px-6 font-bold"
              >
                <Minimize2 className="w-4 h-4" /> Thu nhỏ / Đóng
              </Button>
              <Button
                onClick={loadQrCode}
                disabled={qrLoading}
                className="flex items-center gap-1.5 px-6 font-bold"
              >
                <RefreshCw className={`w-4 h-4 ${qrLoading ? "animate-spin" : ""}`} /> Làm mới
              </Button>
            </div>
          </div>
        </Modal>
      </div>
  );
}