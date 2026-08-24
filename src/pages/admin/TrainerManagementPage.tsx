import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Mail, Phone, User, Clock, Award } from "lucide-react";
import Pagination from "../../components/common/Pagination";

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

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  const paginatedTrainers = useMemo(() => {
    return filteredTrainers.slice(
      currentPage * pageSize,
      (currentPage + 1) * pageSize
    );
  }, [filteredTrainers, currentPage, pageSize]);

  // Reset page when search changes
  useMemo(() => {
    setCurrentPage(0);
  }, [search]);

  return (
    <div className="space-y-8" ref={containerRef}>
      <PageHeader 
        title="Quản lý Huấn Luyện Viên" 
        description="Theo dõi danh sách, chuyên môn và thông tin liên lạc của các PT." 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/40 border border-white/60 gsap-animate">
        <div className="w-full sm:w-96 relative">
          <Input 
            icon={<Search className="w-5 h-5 text-slate-400" />}
            placeholder="Tìm theo tên hoặc chuyên môn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-fit-primary to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg shadow-fit-primary/30 hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm PT Mới</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 gsap-animate">
          <div className="w-12 h-12 border-4 border-fit-primary/20 border-t-fit-primary rounded-full animate-spin" />
        </div>
      ) : filteredTrainers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 gsap-animate">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 shadow-inner">
            <User className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có dữ liệu</h3>
          <p className="text-slate-500 font-medium">Không tìm thấy Huấn Luyện Viên nào khớp với tìm kiếm</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedTrainers.map(trainer => (
            <div
              key={trainer.id}
              className="gsap-animate group relative bg-white p-6 rounded-3xl border border-slate-100 shadow-md hover:shadow-2xl hover:shadow-fit-primary/20 hover:border-fit-primary/30 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-fit-primary/10 to-blue-500/10 rounded-full blur-3xl group-hover:bg-fit-primary/20 group-hover:scale-150 transition-all duration-700" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-fit-primary/10 to-blue-500/5 rounded-2xl border border-fit-primary/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <User className="w-8 h-8 text-fit-primary" />
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => handleOpenEditModal(trainer)}
                      className="p-2.5 text-blue-500 hover:text-white hover:bg-blue-500 rounded-xl transition-all shadow-sm hover:shadow-blue-500/30 hover:scale-110 bg-blue-50/50"
                      title="Sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(trainer.id, trainer.fullName)}
                      className="p-2.5 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all shadow-sm hover:shadow-rose-500/30 hover:scale-110 bg-rose-50/50"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 truncate mb-2 group-hover:text-fit-primary transition-colors duration-300" title={trainer.fullName}>
                  {trainer.fullName}
                </h3>
                
                <div className="mb-5">
                  {(trainer.specialization || trainer.specialty) ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-fit-primary/10 to-blue-500/10 text-fit-primary border border-fit-primary/20 shadow-sm">
                      {trainer.specialization || trainer.specialty}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">Chưa cập nhật chuyên môn</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-fit-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Kinh nghiệm</p>
                      <p className="text-xs font-semibold text-slate-700">{trainer.experienceYears ? `${trainer.experienceYears}+ năm` : "Chưa cập nhật"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Award className="w-3.5 h-3.5 text-fit-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-500">Chứng chỉ</p>
                      <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                        {trainer.certifications ? trainer.certifications.split(',')[0] : "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600 font-medium mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="truncate">{trainer.phone || "Chưa cập nhật SĐT"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="truncate">{trainer.email || "Chưa cập nhật Email"}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {trainer.bio || "Chưa có thông tin giới thiệu."}
                  </p>
                </div>
              </div>
            </div>
          ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Pagination 
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={filteredTrainers.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(0);
                }}
            />
          </div>
        </>
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
