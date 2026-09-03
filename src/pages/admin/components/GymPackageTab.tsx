import { useState } from "react";
import { Plus, Edit, Trash2, CheckCircle, XCircle, Crown, Sparkles, Utensils, Check, Shield, Dumbbell } from "lucide-react";
import Button from "../../../components/common/Button";
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

  // High-performance GSAP Stagger Entrance Animation
  useGSAP(() => {
    if (!loading && packages.length > 0) {
      gsap.fromTo(
        ".package-card",
        {
          y: 45,
          opacity: 0,
          scale: 0.93,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          clearProps: "all",
        }
      );
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gradient-to-r from-fit-primary/10 via-purple-500/10 to-blue-600/10 rounded-3xl border border-fit-primary/20 shadow-sm backdrop-blur-sm">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fit-primary via-purple-600 to-blue-600">
            Cấu hình & Quản lý Gói tập Gym
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Giao diện đồng bộ sang trọng như màn hình Hội viên - Dễ dàng chỉnh sửa giá, dịch vụ và trạng thái
          </p>
        </div>
        <Button onClick={handleOpenAddModal} className="bg-gradient-to-r from-fit-primary via-purple-600 to-blue-600 hover:brightness-110 border-0 shadow-lg shadow-fit-primary/30 transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap rounded-2xl px-6 font-black">
          <Plus className="w-5 h-5 mr-2" />
          Tạo gói mới
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-fit-primary border-t-transparent rounded-full animate-spin"></div>
          Đang tải dữ liệu gói tập...
        </div>
      ) : packages.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
          Không có gói tập nào. Hãy tạo mới!
        </div>
      ) : (
        /* Responsive Grid with GSAP Animation */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {packages.map((pkg) => {
            const isVip = pkg.packageType === "VIP" || pkg.packageLevel === "VIP" || pkg.code?.includes("VIP") || pkg.name?.toUpperCase().includes("VIP");
            const isPremium = pkg.packageType === "PREMIUM" || pkg.packageLevel === "PREMIUM" || pkg.code?.includes("PREMIUM") || pkg.name?.toUpperCase().includes("PREMIUM");
            const isPopular = (pkg.featured || pkg.packageType === "STANDARD" || pkg.packageLevel === "STANDARD") && !isPremium && !isVip;

            const benefitList = pkg.benefits ? pkg.benefits.split(",").map((b) => b.trim()).filter(Boolean) : [];

            return (
              <div 
                key={pkg.id} 
                className={`package-card relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  isVip
                    ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white ring-2 ring-amber-400/70 shadow-2xl shadow-amber-500/10"
                    : isPremium
                    ? "bg-gradient-to-b from-slate-950 via-purple-950/90 to-indigo-950 text-white ring-2 ring-purple-400/80 shadow-[0_0_35px_rgba(168,85,247,0.35)] backdrop-blur-md"
                    : isPopular
                    ? "bg-slate-900 text-white shadow-xl ring-1 ring-emerald-500/30"
                    : "bg-white text-slate-900 border border-slate-200 shadow-sm hover:border-slate-300"
                }`}
              >
                {/* Top Badges for Popular / Premium / VIP */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider py-1.5 px-5 rounded-full shadow-lg z-10 whitespace-nowrap">
                    Phổ biến nhất
                  </div>
                )}
                {isPremium && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 text-white text-[11px] font-black uppercase tracking-wider py-1.5 px-5 rounded-full flex items-center gap-1.5 shadow-xl shadow-purple-500/40 border border-purple-300/50 z-10 whitespace-nowrap">
                    <Sparkles className="w-4 h-4 fill-current text-purple-200 animate-pulse" /> Gói Premium
                  </div>
                )}
                {isVip && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider py-1.5 px-5 rounded-full flex items-center gap-1.5 shadow-xl shadow-amber-500/30 border border-amber-200/50 z-10 whitespace-nowrap">
                    <Crown className="w-4 h-4 fill-current text-slate-950" /> Gói VIP
                  </div>
                )}

                {/* Admin Status & Code Header */}
                <div className="flex items-center justify-between gap-2 mb-4 mt-1">
                  <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                    isPremium ? "bg-purple-900/60 text-purple-200 border border-purple-400/30" :
                    isVip ? "bg-amber-900/50 text-amber-300 border border-amber-400/30" :
                    isPopular ? "bg-slate-800 text-slate-300 border border-slate-700" :
                    "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}>
                    {pkg.code || "PACKAGE"}
                  </span>

                  <span 
                    className={`font-black text-[9.5px] uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 border shrink-0 whitespace-nowrap ${
                      pkg.status === "ACTIVE"
                        ? "bg-emerald-500 text-slate-950 border-emerald-300"
                        : "bg-rose-600 text-white border-rose-400"
                    }`}
                  >
                    {pkg.status === "ACTIVE" ? (
                      <><CheckCircle className="w-3 h-3 text-slate-950 fill-emerald-300 shrink-0" /> HOẠT ĐỘNG</>
                    ) : (
                      <><XCircle className="w-3 h-3 text-white shrink-0" /> ĐÃ KHÓA</>
                    )}
                  </span>
                </div>

                <div>
                  {/* Title & Icon */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-2xl font-black ${
                      isPremium ? "bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent" :
                      isVip ? "text-amber-300" :
                      isPopular ? "text-white" :
                      "text-slate-900"
                    }`}>
                      {pkg.name}
                    </h3>
                    {isVip ? (
                      <Crown className="w-6 h-6 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                    ) : isPremium ? (
                      <Sparkles className="w-6 h-6 text-purple-300 filter drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                    ) : (
                      <Shield className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>

                  {/* Short Description */}
                  <p className={`text-xs min-h-[32px] mb-4 ${
                    isPremium ? "text-purple-200/90 font-medium" :
                    isVip || isPopular ? "text-slate-300" :
                    "text-slate-500"
                  }`}>
                    {pkg.shortDescription || pkg.description || "Chưa có mô tả chi tiết."}
                  </p>

                  {/* Base Price */}
                  <div className={`mb-5 pb-5 border-b ${isPremium ? "border-purple-400/20" : isVip || isPopular ? "border-slate-700/60" : "border-slate-200"}`}>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-black ${isPremium ? "text-white filter drop-shadow-[0_0_10px_rgba(192,132,252,0.3)]" : isVip ? "text-white" : ""}`}>
                        {formatCurrency(pkg.basePrice)}
                      </span>
                      <span className={`text-xs font-medium ${isPremium ? "text-purple-300" : isVip || isPopular ? "text-slate-400" : "text-slate-500"}`}>
                        / tháng
                      </span>
                    </div>
                  </div>

                  {/* AI & PT Sessions Badge */}
                  <div className="space-y-2 mb-5">
                    {pkg.ptSessionsPerMonth > 0 && (
                      <div className={`flex items-center gap-2 text-xs font-extrabold px-3 py-2 rounded-xl border ${
                        isPremium
                          ? "text-purple-200 bg-purple-500/20 border-purple-400/30 shadow-inner"
                          : isVip
                          ? "text-amber-300 bg-amber-400/10 border-amber-400/20"
                          : "text-amber-700 bg-amber-50 border-amber-200"
                      }`}>
                        <Dumbbell className={`w-4 h-4 shrink-0 ${isPremium ? "text-purple-300 animate-pulse" : "text-amber-400"}`} />
                        <span>Tặng {pkg.ptSessionsPerMonth} buổi PT/tháng</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
                        pkg.hasAiWorkoutPlan
                          ? isPremium ? "bg-purple-900/40 border-purple-400/30 text-purple-200" : isVip || isPopular ? "bg-slate-800 border-slate-700 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "opacity-40 line-through border-transparent"
                      }`}>
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Lịch tập AI</span>
                      </div>

                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
                        pkg.hasNutritionPlan
                          ? isPremium ? "bg-purple-900/40 border-purple-400/30 text-purple-200" : isVip || isPopular ? "bg-slate-800 border-slate-700 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "opacity-40 line-through border-transparent"
                      }`}>
                        <Utensils className="w-3.5 h-3.5 shrink-0" />
                        <span>Thực đơn AI</span>
                      </div>
                    </div>
                  </div>

                  {/* Benefits List */}
                  {benefitList.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {benefitList.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isVip ? "text-amber-400" : isPremium ? "text-purple-400" : isPopular ? "text-emerald-400" : "text-emerald-500"
                          }`} />
                          <span className={isPremium ? "text-purple-100" : isVip || isPopular ? "text-slate-200" : "text-slate-700"}>
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Admin Action Bar */}
                <div className={`flex items-center gap-2 mt-auto pt-4 border-t ${
                  isPremium ? "border-purple-400/20" : isVip || isPopular ? "border-slate-800" : "border-slate-100"
                }`}>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(pkg)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                      pkg.status === "ACTIVE"
                        ? isPremium || isVip || isPopular
                          ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
                          : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                        : isPremium || isVip || isPopular
                          ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    {pkg.status === "ACTIVE" ? <><XCircle className="w-4 h-4" /> Khóa gói</> : <><CheckCircle className="w-4 h-4" /> Mở gói</>}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(pkg)}
                    className={`p-2.5 rounded-xl transition-all hover:scale-105 ${
                      isPremium
                        ? "bg-purple-500/30 text-purple-200 hover:bg-purple-500/50 border border-purple-400/40"
                        : isVip || isPopular
                        ? "bg-slate-800 text-blue-400 hover:bg-slate-700 border border-slate-700"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                    title="Chỉnh sửa cấu hình gói"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteId(pkg.id)}
                    className={`p-2.5 rounded-xl transition-all hover:scale-105 ${
                      isPremium || isVip || isPopular
                        ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 border border-rose-500/30"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                    title="Xóa gói tập"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa gói tập"
        message="Bạn có chắc chắn muốn xóa gói tập này không? Nếu đã có người đăng ký, gói này chỉ bị khóa lại chứ không bị xóa."
        confirmText="Xóa"
      />

      {/* Form Modal */}
      <GymPackageFormModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchPackages} 
        pkg={selectedPackage} 
      />
    </div>
  );
}
