import { useState } from "react";
import { Plus, Edit, Trash2, CheckCircle, XCircle, Crown, Sparkles, Utensils, UserCircle, Star } from "lucide-react";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { formatCurrency } from "../../../utils/formatCurrency";
import type { GymPackage } from "../../../types/package.type";
import { useGymPackageTab } from "../../../hooks/useGymPackageTab";
import { GymPackageFormModal } from "./GymPackageFormModal";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function GymPackageTab() {
  const {
    packages,
    loading,
    deleteId,
    setDeleteId,
    handleDelete,
    handleToggleStatus,
    fetchPackages
  } = useGymPackageTab();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<GymPackage | null>(null);

  useGSAP(() => {
    if (!loading && packages.length > 0) {
      gsap.from(".package-card", {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
        clearProps: "all"
      });
    }
  }, [loading, packages.length]);

  const handleOpenAddModal = () => {
    setSelectedPackage(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (pkg: GymPackage) => {
    setSelectedPackage(pkg);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gradient-to-r from-fit-primary/10 to-blue-600/10 rounded-3xl border border-fit-primary/20 shadow-sm backdrop-blur-sm">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fit-primary to-blue-600">Danh sách Gói tập Gym</h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">Quản lý dịch vụ, giá tiền và quyền lợi của các gói tập (VIP, BASIC...)</p>
        </div>
        <Button onClick={handleOpenAddModal} className="bg-gradient-to-r from-fit-primary to-blue-600 hover:from-blue-600 hover:to-indigo-600 border-0 shadow-lg shadow-fit-primary/30 transition-all duration-300 hover:-translate-y-1 whitespace-nowrap rounded-2xl px-6">
          <Plus className="w-5 h-5 mr-2" />
          Tạo gói mới
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-fit-primary border-t-transparent rounded-full animate-spin"></div>
          Đang tải dữ liệu...
        </div>
      ) : packages.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
          Không có gói tập nào. Hãy tạo mới!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const isVip = pkg.packageType === "VIP";
            return (
              <div 
                key={pkg.id} 
                className={`package-card relative flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  isVip ? 'ring-purple-200 hover:ring-purple-400 shadow-purple-100/50' : 'ring-slate-200 hover:ring-fit-primary/50'
                }`}
              >
                {/* Badge Trạng thái & Vip */}
                <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                  <Badge variant={pkg.status === "ACTIVE" ? "success" : "danger"} className="shadow-sm">
                    {pkg.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  {pkg.thumbnailUrl ? (
                    <img src={pkg.thumbnailUrl} alt={pkg.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-1 ring-slate-100" />
                  ) : (
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm ring-1 ${isVip ? 'bg-gradient-to-br from-purple-100 to-fuchsia-100 ring-purple-200 text-purple-600' : 'bg-slate-50 ring-slate-200 text-slate-400'}`}>
                      {isVip ? <Crown className="w-8 h-8" /> : <Star className="w-8 h-8" />}
                    </div>
                  )}
                  <div>
                    <h3 className={`text-xl font-black ${isVip ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600' : 'text-slate-900'}`}>
                      {pkg.name}
                    </h3>
                    <p className="text-sm font-mono text-slate-400 mt-0.5">{pkg.code || "-"}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">{formatCurrency(pkg.basePrice)}</span>
                    <span className="text-sm font-semibold text-slate-500">/tháng</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2 min-h-[40px]">{pkg.description || "Chưa có mô tả chi tiết."}</p>
                </div>

                <div className="flex-1 space-y-3 mb-6 bg-slate-50 rounded-2xl p-4 ring-1 ring-slate-100/50">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <div className={`p-1.5 rounded-lg ${pkg.hasAiWorkoutPlan ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className={pkg.hasAiWorkoutPlan ? '' : 'line-through text-slate-400'}>Giáo án tập AI</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <div className={`p-1.5 rounded-lg ${pkg.hasNutritionPlan ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                      <Utensils className="w-4 h-4" />
                    </div>
                    <span className={pkg.hasNutritionPlan ? '' : 'line-through text-slate-400'}>Thực đơn dinh dưỡng AI</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <div className={`p-1.5 rounded-lg ${pkg.ptSessionsPerMonth > 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-400'}`}>
                      <UserCircle className="w-4 h-4" />
                    </div>
                    <span className={pkg.ptSessionsPerMonth > 0 ? '' : 'line-through text-slate-400'}>
                      {pkg.ptSessionsPerMonth > 0 ? `${pkg.ptSessionsPerMonth} buổi PT 1 kèm 1 / tháng` : 'Không bao gồm PT'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => handleToggleStatus(pkg)} 
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      pkg.status === 'ACTIVE' 
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 hover:scale-[1.02]' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-[1.02]'
                    }`}
                  >
                    {pkg.status === 'ACTIVE' ? <><XCircle className="w-4 h-4" /> Khóa gói</> : <><CheckCircle className="w-4 h-4" /> Mở gói</>}
                  </button>
                  <button 
                    onClick={() => handleOpenEditModal(pkg)} 
                    className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all hover:scale-[1.05]" 
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setDeleteId(pkg.id)} 
                    className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all hover:scale-[1.05]" 
                    title="Xóa"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa gói tập"
        message="Bạn có chắc chắn muốn xóa gói tập này không? Nếu đã có người đăng ký, gói này chỉ bị khóa lại chứ không bị xóa."
        confirmText="Xóa"
      />

      <GymPackageFormModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchPackages} 
        pkg={selectedPackage} 
      />
    </div>
  );
}
