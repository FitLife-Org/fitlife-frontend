import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { User, Activity, X } from "lucide-react";

import Input from "../../../components/common/Input";
import { trainerService } from "../../../services/trainerService";
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
    userId: "",
    trainerCode: "",
    specialty: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TrainerFormData, string>>>({});

  useEffect(() => {
    if (open) {
      if (trainer) {
        setFormData({
          userId: trainer.userId?.toString() || "",
          trainerCode: trainer.trainerCode || "",
          specialty: trainer.specialization || trainer.specialty || "",
        });
      } else {
        setFormData({
          userId: "",
          trainerCode: "",
          specialty: "",
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
    const validation = validateTrainerForm(formData);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing && trainer) {
        await trainerService.updateTrainer(trainer.id, { specialization: formData.specialty });
        toast.success("Cập nhật PT thành công!");
      } else {
        await trainerService.createTrainer({
          userId: Number(formData.userId),
          trainerCode: formData.trainerCode,
          specialization: formData.specialty,
        });
        toast.success("Thêm PT thành công!");
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm gsap-animate"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {isEditing ? "Chỉnh sửa PT" : "Thêm Huấn Luyện Viên"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing ? "Cập nhật thông tin chuyên môn của PT." : "Tạo mới một tài khoản Huấn Luyện Viên."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input 
            label="ID Tài Khoản (User ID) *"
            name="userId"
            placeholder="Ví dụ: 12"
            value={formData.userId}
            onChange={handleFormChange}
            error={formErrors.userId}
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

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
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
      </section>
    </div>
  );
}
