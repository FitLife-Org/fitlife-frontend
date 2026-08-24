import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { User, Activity, X } from "lucide-react";

import Input from "../../../components/common/Input";
import Modal from "../../../components/common/Modal";
import { trainerService } from "../../../services/trainerService";
import { userService } from "../../../services/userService";
import { validateTrainerForm, type TrainerFormData } from "../../../utils/validators/trainerValidator";
import type { Trainer } from "../../../types/trainer.type";

interface TrainerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trainer: Trainer | null;
}

export function TrainerFormModal({ open, onClose, onSuccess, trainer }: TrainerFormModalProps) {
  const isEditing = Boolean(trainer);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TrainerFormData>({
    trainerCode: "",
    specialty: "",
    experienceYears: "",
    certifications: "",
    bio: "",
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TrainerFormData, string>>>({});

  useEffect(() => {
    if (open) {
      if (trainer) {
        setFormData({
          trainerCode: trainer.trainerCode || "",
          specialty: trainer.specialization || trainer.specialty || "",
          experienceYears: trainer.experienceYears?.toString() || "",
          certifications: trainer.certifications || "",
          bio: trainer.bio || "",
          username: trainer.username || "",
          email: trainer.email || "",
          password: "••••••••",
          fullName: trainer.fullName || "",
          phone: trainer.phone || "",
        });
      } else {
        setFormData({
          trainerCode: "",
          specialty: "",
          experienceYears: "",
          certifications: "",
          bio: "",
          username: "",
          email: "",
          password: "",
          fullName: "",
          phone: "",
        });
      }
      setFormErrors({});
    }
  }, [open, trainer]);

  if (!open) return null;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof TrainerFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTrainerForm(formData, isEditing);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);

      if (!isEditing) {
        // Step 1: Create the User account with ROLE_TRAINER
        const newUser = await userService.createUser({
          username: formData.username!,
          email: formData.email!,
          password: formData.password!,
          fullName: formData.fullName!,
          phone: formData.phone!,
          roleCode: "ROLE_TRAINER",
          status: "ACTIVE"
        });

        // Step 2: Create the Trainer profile linked to the new user
        const payload = {
          userId: newUser.id,
          trainerCode: formData.trainerCode,
          specialization: formData.specialty,
          experienceYears: formData.experienceYears ? Number(formData.experienceYears) : undefined,
          certifications: formData.certifications,
          bio: formData.bio,
        };

        await trainerService.createTrainer(payload);
        toast.success("Tạo mới tài khoản và hồ sơ HLV thành công!");
      } else {
        if (!trainer) return;
        
        await trainerService.updateTrainer(trainer.id, { 
          specialization: formData.specialty,
          experienceYears: formData.experienceYears ? Number(formData.experienceYears) : undefined,
          certifications: formData.certifications,
          bio: formData.bio,
        });
        toast.success("Cập nhật PT thành công!");
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi lưu PT.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa PT" : "Thêm Huấn Luyện Viên"}
      open={open}
      onClose={onClose}
      size="xl"
      disableClose={isSubmitting}
    >
      <p className="mb-4 text-sm text-slate-500">
        {isEditing ? "Cập nhật thông tin chuyên môn của PT." : "Tạo mới một tài khoản Huấn Luyện Viên."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isEditing && (
          <div className="space-y-5 p-6 bg-slate-50/80 rounded-2xl border border-slate-100 mb-2">
            <h3 className="font-bold text-sm text-slate-800">Thông tin tài khoản đăng nhập</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Họ và tên *"
                name="fullName"
                placeholder="VD: Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleFormChange}
                error={formErrors.fullName}
              />
              <Input 
                label="Tên đăng nhập (Username) *"
                name="username"
                placeholder="VD: nguyenvana"
                value={formData.username}
                onChange={handleFormChange}
                error={formErrors.username}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Email *"
                name="email"
                type="email"
                placeholder="VD: email@example.com"
                value={formData.email}
                onChange={handleFormChange}
                error={formErrors.email}
              />
              <Input 
                label="Số điện thoại *"
                name="phone"
                placeholder="VD: 0901234567"
                value={formData.phone}
                onChange={handleFormChange}
                error={formErrors.phone}
              />
            </div>
            <Input 
              label="Mật khẩu *"
              name="password"
              type="password"
              placeholder="Nhập mật khẩu cho tài khoản..."
              value={formData.password}
              onChange={handleFormChange}
              error={formErrors.password}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input 
              label="Mã huấn luyện viên *"
              name="trainerCode"
              placeholder="VD: PT001"
              value={formData.trainerCode}
              onChange={handleFormChange}
              error={formErrors.trainerCode}
              icon={<User className="w-4 h-4" />}
              disabled={isEditing}
            />
          
          <Input 
            label="Chuyên môn *"
            name="specialty"
            placeholder="Ví dụ: Yoga, Weightlifting..."
            value={formData.specialty}
            onChange={handleFormChange}
            error={formErrors.specialty}
            icon={<Activity className="w-4 h-4" />}
          />
        </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Số năm kinh nghiệm"
              name="experienceYears"
              type="number"
              placeholder="VD: 3"
              value={formData.experienceYears}
              onChange={handleFormChange}
              error={formErrors.experienceYears}
              icon={<Activity className="w-4 h-4" />}
            />
            <Input 
              label="Chứng chỉ"
              name="certifications"
              placeholder="VD: NASM, ACE..."
              value={formData.certifications}
              onChange={handleFormChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Giới thiệu (Bio)
            </label>
            <textarea
              name="bio"
              rows={2}
              placeholder="Nhập thông tin giới thiệu về HLV..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition focus:border-fit-primary focus:outline-none focus:ring-2 focus:ring-fit-primary/10 resize-none"
            />
          </div>

          <div className="pt-5 mt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-slate-950 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEditing ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </div>
        </form>
    </Modal>
  );
}
