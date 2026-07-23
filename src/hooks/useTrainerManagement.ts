import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { trainerService } from "../services/trainerService";
import type { Trainer } from "../types/trainer.type";
import { validateTrainerForm, type TrainerFormData } from "../utils/validators/trainerValidator";

export function useTrainerManagement() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  
  const [formData, setFormData] = useState<TrainerFormData>({
    fullName: "",
    specialty: "",
    phone: "",
    email: ""
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TrainerFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const data = await trainerService.getAdminTrainers();
      setTrainers(data);
    } catch {
      toast.error("Không thể tải danh sách PT");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const openModal = (trainer?: Trainer) => {
    if (trainer) {
      setEditingTrainer(trainer);
      setFormData({
        fullName: trainer.fullName,
        specialty: trainer.specialty || "",
        phone: trainer.phone || "",
        email: trainer.email || ""
      });
    } else {
      setEditingTrainer(null);
      setFormData({ fullName: "", specialty: "", phone: "", email: "" });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingTrainer(null);
      setFormData({ fullName: "", specialty: "", phone: "", email: "" });
      setFormErrors({});
    }, 200);
  };

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
      if (editingTrainer) {
        await trainerService.updateTrainer(editingTrainer.id, formData);
        toast.success("Cập nhật PT thành công!");
      } else {
        await trainerService.createTrainer(formData);
        toast.success("Thêm PT thành công!");
      }
      fetchTrainers();
      closeModal();
    } catch {
      toast.error("Có lỗi xảy ra khi lưu PT.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: "Xóa Huấn Luyện Viên?",
      text: `Bạn có chắc chắn muốn xóa PT "${name}"? Hành động này không thể hoàn tác.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy bỏ",
      background: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await trainerService.deleteTrainer(id);
        toast.success("Đã xóa PT thành công");
        setTrainers(prev => prev.filter(t => t.id !== id));
      } catch {
        toast.error("Không thể xóa PT này.");
      }
    }
  };

  const filteredTrainers = trainers.filter(t => 
    t.fullName.toLowerCase().includes(search.toLowerCase()) || 
    (t.specialty && t.specialty.toLowerCase().includes(search.toLowerCase()))
  );

  return {
    trainers,
    loading,
    search,
    setSearch,
    isModalOpen,
    editingTrainer,
    formData,
    formErrors,
    isSubmitting,
    filteredTrainers,
    openModal,
    closeModal,
    handleFormChange,
    handleSubmit,
    handleDelete
  };
}
