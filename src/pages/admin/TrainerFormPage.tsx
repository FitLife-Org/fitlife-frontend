import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Activity, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/common/Input";
import { trainerService } from "../../services/trainerService";
import { validateTrainerForm, type TrainerFormData } from "../../utils/validators/trainerValidator";

export default function TrainerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TrainerFormData>({
    userId: "",
    trainerCode: "",
    specialty: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TrainerFormData, string>>>({});

  useEffect(() => {
    if (isEditing) {
      const fetchTrainer = async () => {
        try {
          const trainers = await trainerService.getAdminTrainers();
          const trainer = trainers.find(t => t.id === Number(id));
          if (trainer) {
            setFormData({
              userId: trainer.userId?.toString() || "",
              trainerCode: trainer.trainerCode || "",
              specialty: trainer.specialty || "",
            });
          } else {
            toast.error("Không tìm thấy Huấn Luyện Viên");
            navigate("/admin/trainers");
          }
        } catch {
          toast.error("Không thể tải thông tin PT");
          navigate("/admin/trainers");
        } finally {
          setLoading(false);
        }
      };
      fetchTrainer();
    }
  }, [id, isEditing, navigate]);

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
      if (isEditing) {
        await trainerService.updateTrainer(Number(id), { specialty: formData.specialty });
        toast.success("Cập nhật PT thành công!");
      } else {
        await trainerService.createTrainer({
          userId: Number(formData.userId),
          trainerCode: formData.trainerCode,
          specialty: formData.specialty,
        });
        toast.success("Thêm PT thành công!");
      }
      navigate("/admin/trainers");
    } catch {
      toast.error("Có lỗi xảy ra khi lưu PT.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-950 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/trainers")}
          className="p-2 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <PageHeader 
          title={isEditing ? "Chỉnh sửa PT" : "Thêm Huấn Luyện Viên"} 
          description={isEditing ? "Cập nhật thông tin chuyên môn của PT." : "Tạo mới một tài khoản Huấn Luyện Viên."} 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
            label="Mã huấn luyện viên"
            name="trainerCode"
            placeholder="VD: PT001"
            value={formData.trainerCode}
            onChange={handleFormChange}
            error={formErrors.trainerCode}
            icon={<User className="w-4 h-4" />}
            disabled={isEditing}
          />

          <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 mt-8">
            <button
              type="button"
              onClick={() => navigate("/admin/trainers")}
              className="px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 text-sm font-medium text-white bg-slate-950 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEditing ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
