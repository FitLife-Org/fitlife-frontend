import { useState, useEffect, ChangeEvent } from "react";
import toast from "react-hot-toast";
import {
  Camera, User, Calendar, Activity, Lock, ChevronRight, CheckCircle2
 , ShieldCheck, Info as InfoIcon, Crown, Mail, Phone
} from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";
import { showAlert } from "../../utils/alert";
import { validateProfileForm, validateChangePassword } from "../../utils/validators/profileValidator";
import { profileService } from "../../services/profileService";
import { userService } from "../../services/userService";
import type { ProfileResponse, UpdateProfileRequest } from "../../types/profile.type";

export default function MemberProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileRequest>({});

  // Change password states
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await profileService.getProfile();
      if (!profileData) {
        throw new Error("Dữ liệu hồ sơ trống.");
      }
      setProfile(profileData);
      setFormData({
        fullName: profileData.fullName || "",
        phone: profileData.phone || "",
        gender: profileData.gender,
        dateOfBirth: profileData.dateOfBirth,
        address: profileData.address,
        emergencyContactName: profileData.emergencyContactName,
        emergencyContactPhone: profileData.emergencyContactPhone,
        healthNote: profileData.healthNote,
        fitnessGoal: profileData.fitnessGoal
      });
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === "number" ? (value === "" ? undefined : Number(value)) : value 
    }));
  };

  const handleSave = async () => {
    if (!validateProfileForm(formData)) return;
    
    try {
      setSaving(true);
      // Clean up empty strings to avoid backend validation errors and parsing errors
      const cleanData: UpdateProfileRequest = { ...formData };
      Object.keys(cleanData).forEach(key => {
        if ((cleanData as any)[key] === "") {
          (cleanData as any)[key] = undefined;
        }
      });
      
      const updatedProfile = await profileService.updateProfile(cleanData);
      setProfile(updatedProfile);
      showAlert.success("Thành công", "Cập nhật hồ sơ thành công!");
    } catch (error) {
      console.error("Failed to update profile", error);
      showAlert.error("Lỗi", "Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateChangePassword(oldPassword, newPassword, confirmPassword)) {
      return;
    }

    try {
      setPasswordSaving(true);
      await userService.changePassword({
        oldPassword,
        newPassword
      });
      showAlert.success("Thành công", "Đổi mật khẩu thành công!");
      setPasswordModalOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Failed to change password:", error);
      const errorMsg = error?.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.";
      showAlert.error("Lỗi", errorMsg);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const response = await profileService.updateAvatar(file);
      setProfile(prev => prev ? { ...prev, avatarUrl: response.avatarUrl } : null);
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật ảnh đại diện.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Đang tải hồ sơ...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-red-500">Không thể tải thông tin hồ sơ.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Quản lý thông tin tài khoản, sức khỏe và mục tiêu tập luyện"
      />

      <div className="grid gap-6 xl:grid-cols-[320px_1fr] items-start">
        {/* Left Column: Profile Card */}
        <Card className="p-0 overflow-hidden border-none shadow-xl bg-white relative">
            <div className="flex flex-col items-center pb-8 border-b border-slate-100">
              <div className="relative mx-auto h-32 w-32 mt-4 mb-4">
                <div className="h-full w-full overflow-hidden rounded-full border-4 border-slate-100 bg-slate-50 shadow-sm relative group">
                  {uploadingAvatar ? (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                      <div className="w-8 h-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
                    </div>
                  ) : null}
                  <img
                    src={profile.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.fullName)}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <label className="absolute bottom-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-sm transition-transform hover:scale-110">
                  <Camera className="h-4 w-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploadingAvatar} />
                </label>
              </div>

          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900">{profile.fullName}</h2>
            <div className="mt-2 flex justify-center">
              <Badge variant="success">
                <span className="flex items-center gap-1">
                  <Crown className="h-3.5 w-3.5" /> Thành viên FitLife
                </span>
              </Badge>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm px-4">
            <div className="flex flex-col gap-1 pb-3 border-b border-slate-100">
              <span className="flex items-center gap-2 text-slate-500">
                <Mail className="h-4 w-4" /> Email
              </span>
              <span className="font-medium text-slate-900 break-words w-full">
                {profile.email || "Chưa cập nhật"}
              </span>
            </div>
            <div className="flex flex-col gap-1 pb-3 border-b border-slate-100">
              <span className="flex items-center gap-2 text-slate-500">
                <Phone className="h-4 w-4" /> Điện thoại
              </span>
              <span className="font-medium text-slate-900 break-words w-full">
                {profile.phone || "Chưa cập nhật"}
              </span>
            </div>
            <div className="flex flex-col gap-1 pb-3 border-b border-slate-100">
              <span className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4" /> Ngày sinh
              </span>
              <span className="font-medium text-slate-900 break-words w-full">
                {profile.dateOfBirth || "Chưa cập nhật"}
              </span>
            </div>
            <div className="flex flex-col gap-1 pb-3">
              <span className="flex items-center gap-2 text-fit-muted">
                <Calendar className="h-4 w-4" /> Ngày tham gia
              </span>
              <span className="font-medium text-slate-900 break-words w-full">
                {profile.joinDate || profile.createdAt?.substring(0, 10) || "Gần đây"}
              </span>
            </div>
          </div>
          </div>
        </Card>

        {/* Right Column: Information Forms */}
        <div className="space-y-6">
          {/* Thông tin cá nhân */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2 text-fit-primary">
              <User className="h-5 w-5" />
              <h2 className="text-lg font-bold text-fit-text">Thông tin cá nhân</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                name="fullName"
                label="Họ và tên"
                value={formData.fullName || ""}
                onChange={handleInputChange}
              />
              <Input
                name="dateOfBirth"
                type="date"
                label="Ngày sinh"
                icon={<Calendar className="h-4 w-4" />}
                value={formData.dateOfBirth || ""}
                onChange={handleInputChange}
              />
              <Input
                name="email"
                label="Email"
                value={profile.email || ""}
                disabled
                readOnly
              />

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Giới tính</span>
                <div className="mt-2 flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <User className="mr-3 h-4 w-4 text-blue-500" />
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleInputChange}
                    className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </label>

              <Input
                name="phone"
                label="Số điện thoại"
                value={formData.phone || ""}
                onChange={handleInputChange}
              />
            </div>
          </Card>

          {/* Thông tin sức khỏe */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2 text-fit-primary">
              <Activity className="h-5 w-5" />
              <h2 className="text-lg font-bold text-fit-text">Thông tin sức khỏe</h2>
            </div>

            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <Input
                name="emergencyContactName"
                label="Người liên hệ khẩn cấp"
                value={formData.emergencyContactName || ""}
                onChange={handleInputChange}
                placeholder="Tên người liên hệ"
              />

              <Input
                name="emergencyContactPhone"
                label="SĐT khẩn cấp"
                value={formData.emergencyContactPhone || ""}
                onChange={handleInputChange}
                placeholder="Số điện thoại"
              />
            </div>

            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Mục tiêu tập luyện</span>
                <div className="mt-2 flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <select
                    name="fitnessGoal"
                    value={formData.fitnessGoal || ""}
                    onChange={handleInputChange}
                    className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none"
                  >
                    <option value="">Chọn mục tiêu</option>
                    <option value="LOSE_WEIGHT">Giảm cân</option>
                    <option value="GAIN_MUSCLE">Tăng cơ</option>
                    <option value="MAINTAIN">Duy trì vóc dáng</option>
                  </select>
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Ghi chú sức khỏe</span>
                <div className="mt-2 flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <input
                    name="healthNote"
                    type="text"
                    className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none"
                    value={formData.healthNote || ""}
                    onChange={handleInputChange}
                    placeholder="Các vấn đề sức khỏe cần lưu ý..."
                  />
                </div>
              </label>
            </div>
          </Card>

          {/* Bảo mật tài khoản & Thông báo */}
          <Card className="p-6">
            <div className="grid gap-10 md:grid-cols-2">
              {/* Left: Bảo mật */}
              <div>
                <div className="mb-6 flex items-center gap-2 text-fit-primary">
                  <ShieldCheck className="h-5 w-5" />
                  <h2 className="text-lg font-bold text-fit-text">Bảo mật tài khoản</h2>
                </div>

                <div className="space-y-4">
                  {profile.authProvider !== 'GOOGLE' && (
                    <div 
                      onClick={() => setPasswordModalOpen(true)}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-fit-border bg-fit-bg p-4 transition-colors hover:border-fit-primary/50"
                    >
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-fit-muted" />
                        <div>
                          <p className="text-sm font-medium text-fit-text">Đổi mật khẩu</p>
                          <p className="text-xl leading-none tracking-[0.2em] text-fit-muted">••••••••</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-fit-muted" />
                    </div>
                  )}

                  <div className="flex cursor-pointer items-center justify-between rounded-xl border border-fit-border bg-fit-bg p-4 transition-colors hover:border-fit-primary/50">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z" />
                        <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.076 7.076 0 01-6.725-4.962L1.248 17.24C3.208 21.2 7.282 24 12 24c2.923 0 5.377-1.054 7.185-2.822l-3.145-3.165z" />
                        <path fill="#4A90E2" d="M23.989 12.276c0-.81-.073-1.589-.208-2.333H12v4.61h6.716c-.29 1.498-1.123 2.768-2.362 3.61l3.146 3.165C21.343 19.62 23.989 16.335 23.989 12.276z" />
                        <path fill="#FBBC05" d="M5.275 14.128A7.067 7.067 0 014.922 12c0-.735.13-1.444.353-2.115L1.24 6.65C.448 8.243 0 10.05 0 12c0 1.95.448 3.757 1.24 5.35l4.035-3.222z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-fit-text">Liên kết Google</p>
                        <p className="flex items-center gap-1 text-sm text-fit-primary">{profile.authProvider === 'GOOGLE' ? 'Đã liên kết' : 'Chưa liên kết'}</p>
                      </div>
                    </div>
                    {profile.authProvider === 'GOOGLE' && <CheckCircle2 className="h-5 w-5 text-fit-primary" />}
                  </div>
                </div>
              </div>

              {/* Right: Thông báo */}
              <div>
                <div className="hidden h-7 md:block mb-6"></div>

                <div className="space-y-6 pt-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-fit-text">Thông báo qua email</p>
                      <p className="text-sm text-fit-muted">Nhận thông báo về lịch tập, ưu đãi</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-fit-primary transition-colors">
                      <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
                    </div>
                  </div>
                  <hr className="border-fit-border" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-fit-text">Nhắc nhở tập luyện</p>
                      <p className="text-sm text-fit-muted">Nhận nhắc nhở theo lịch tập cá nhân</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-fit-primary transition-colors">
                      <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              className="w-full sm:w-auto min-w-[140px]"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password Modal (USER-09) */}
      <Modal
        title="Đổi mật khẩu tài khoản"
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Mật khẩu hiện tại *"
            name="oldPassword"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Nhập mật khẩu hiện tại"
            required
          />
          <Input
            label="Mật khẩu mới *"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            required
          />
          <Input
            label="Xác nhận mật khẩu mới *"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button type="button" variant="outline" onClick={() => setPasswordModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={passwordSaving} className="bg-fit-primary hover:bg-fit-primaryHover text-white">
              Đổi mật khẩu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
