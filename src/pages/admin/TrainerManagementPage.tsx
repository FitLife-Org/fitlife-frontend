import { useState } from "react";
import { Search, Plus, Edit2, Trash2, Mail, Phone, User } from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import { useTrainerManagement } from "../../hooks/useTrainerManagement";
import { TrainerFormModal } from "./components/TrainerFormModal";
import { usePageAnimation } from "../../hooks/usePageAnimation";
import type { Trainer } from "../../types/trainer.type";

export default function TrainerManagementPage() {
  const containerRef = usePageAnimation();
  const {
    loading,
    search,
    setSearch,
    filteredTrainers,
    handleDelete,
    fetchTrainers
  } = useTrainerManagement();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  const handleOpenAddModal = () => {
    setSelectedTrainer(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8" ref={containerRef}>
      <PageHeader 
        title="Quản lý Huấn Luyện Viên" 
        description="Theo dõi danh sách, chuyên môn và thông tin liên lạc của các PT." 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 gsap-animate">
        <div className="w-full sm:w-80">
          <Input 
            icon={<Search className="w-5 h-5" />}
            placeholder="Tìm theo tên hoặc chuyên môn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-950 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm PT Mới</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 gsap-animate">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-950 rounded-full animate-spin" />
        </div>
      ) : filteredTrainers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 gsap-animate">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">Không tìm thấy Huấn Luyện Viên nào</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTrainers.map(trainer => (
            <div
              key={trainer.id}
              className="gsap-animate group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-950/5 rounded-full blur-2xl group-hover:bg-slate-950/10 transition-colors" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl border border-slate-200 flex items-center justify-center shadow-inner">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEditModal(trainer)}
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
            </div>
          ))}
        </div>
      )}

      <TrainerFormModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchTrainers} 
        trainer={selectedTrainer} 
      />
    </div>
  );
}
