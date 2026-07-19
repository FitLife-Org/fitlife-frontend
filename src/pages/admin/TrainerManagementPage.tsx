import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Trash2, Mail, Phone, Activity, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";

import { trainerService } from "../../features/trainer/services/trainerService";
import type { Trainer } from "../../features/trainer/types/trainer.type";
import { validateTrainerForm, type TrainerFormData } from "../../features/trainer/utils/trainerValidator";

export default function TrainerManagementPage() {
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
    } catch (error) {
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
    } catch (error) {
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
      } catch (error) {
        toast.error("Không thể xóa PT này.");
      }
    }
  };

  const filteredTrainers = trainers.filter(t => 
    t.fullName.toLowerCase().includes(search.toLowerCase()) || 
    (t.specialty && t.specialty.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Quản lý Huấn Luyện Viên" 
        description="Theo dõi danh sách, chuyên môn và thông tin liên lạc của các PT." 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="w-full sm:w-80">
          <Input 
            icon={<Search className="w-5 h-5" />}
            placeholder="Tìm theo tên hoặc chuyên môn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-950 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm PT Mới</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-950 rounded-full animate-spin" />
        </div>
      ) : filteredTrainers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">Không tìm thấy Huấn Luyện Viên nào</p>
        </div>
      ) : (
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          <AnimatePresence>
            {filteredTrainers.map(trainer => (
              <motion.div
                key={trainer.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-950/5 rounded-full blur-2xl group-hover:bg-slate-950/10 transition-colors" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl border border-slate-200 flex items-center justify-center shadow-inner">
                      <User className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal(trainer)}
                        className="p-2 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(trainer.id, trainer.fullName)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-950 truncate mb-1" title={trainer.fullName}>
                    {trainer.fullName}
                  </h3>
                  
                  <div className="mb-4">
                    {trainer.specialty ? (
                      <Badge variant="info" className="text-xs bg-slate-100 text-slate-700 border-none font-medium">
                        {trainer.specialty}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">Chưa cập nhật chuyên môn</span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{trainer.phone || "Trống"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{trainer.email || "Trống"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal 
        title={editingTrainer ? "Chỉnh sửa Thông tin PT" : "Thêm PT Mới"} 
        open={isModalOpen} 
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input 
            label="Họ và Tên *"
            name="fullName"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={formData.fullName}
            onChange={handleFormChange}
            error={formErrors.fullName}
            icon={<User className="w-4 h-4" />}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Số điện thoại"
              name="phone"
              placeholder="0912345678"
              value={formData.phone}
              onChange={handleFormChange}
              error={formErrors.phone}
              icon={<Phone className="w-4 h-4" />}
            />
            
            <Input 
              label="Email"
              name="email"
              type="email"
              placeholder="example@fitlife.vn"
              value={formData.email}
              onChange={handleFormChange}
              error={formErrors.email}
              icon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-slate-950 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editingTrainer ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
