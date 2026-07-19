import { useState } from "react";
import toast from "react-hot-toast";
import { bodyMetricService } from "../../services/bodyMetricService";

interface BodyMetricFormData {
  weightKg: string;
  heightCm: string;
  bodyFatPercent: string;
  muscleMassKg: string;
}

export function useBodyMetricLogic(onSuccess: () => Promise<void>) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BodyMetricFormData>({
    weightKg: "",
    heightCm: "",
    bodyFatPercent: "",
    muscleMassKg: ""
  });

  const validateForm = (): boolean => {
    if (!formData.weightKg || Number(formData.weightKg) <= 0) {
      toast.error("Vui lòng nhập Cân nặng hợp lệ.");
      return false;
    }
    if (formData.heightCm && Number(formData.heightCm) <= 0) {
      toast.error("Chiều cao phải lớn hơn 0.");
      return false;
    }
    if (formData.bodyFatPercent && (Number(formData.bodyFatPercent) <= 0 || Number(formData.bodyFatPercent) > 100)) {
      toast.error("Tỷ lệ mỡ không hợp lệ.");
      return false;
    }
    if (formData.muscleMassKg && Number(formData.muscleMassKg) <= 0) {
      toast.error("Lượng cơ bắp phải lớn hơn 0.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      await bodyMetricService.createMyMetric({
        weightKg: Number(formData.weightKg),
        heightCm: formData.heightCm ? Number(formData.heightCm) : undefined,
        bodyFatPercent: formData.bodyFatPercent ? Number(formData.bodyFatPercent) : undefined,
        muscleMassKg: formData.muscleMassKg ? Number(formData.muscleMassKg) : undefined
      });
      
      toast.success("Cập nhật chỉ số thành công!");
      setShowAddModal(false);
      setFormData({ weightKg: "", heightCm: "", bodyFatPercent: "", muscleMassKg: "" });
      
      await onSuccess();
    } catch (error) {
      toast.error("Không thể cập nhật chỉ số lúc này.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenModal = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({ weightKg: "", heightCm: "", bodyFatPercent: "", muscleMassKg: "" });
  };

  return {
    showAddModal,
    submitting,
    formData,
    setFormData,
    handleSubmit,
    handleOpenModal,
    handleCloseModal
  };
}
