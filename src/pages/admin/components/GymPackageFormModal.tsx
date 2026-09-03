import { useState, useEffect } from "react";
import { Package, X } from "lucide-react";

import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import { showAlert } from "../../../utils/alert";
import { packageService } from "../../../services/packageService";
import { validateAdminPackageForm } from "../../../utils/validators/adminPackageValidator";
import type { GymPackage } from "../../../types/package.type";

interface GymPackageFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pkg: GymPackage | null;
}

export function GymPackageFormModal({ open, onClose, onSuccess, pkg }: GymPackageFormModalProps) {
  const isEditing = Boolean(pkg);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    packageType: "BASIC",
    basePrice: "",
    ptSessionsPerMonth: 0,
    hasAiWorkoutPlan: false,
    hasNutritionPlan: false,
    description: "",
    benefits: "",
    thumbnailUrl: ""
  });

  useEffect(() => {
    if (open) {
      if (pkg) {
        setFormData({
          code: pkg.code,
          name: pkg.name,
          packageType: pkg.packageType || "BASIC",
          basePrice: pkg.basePrice.toString(),
          ptSessionsPerMonth: pkg.ptSessionsPerMonth || 0,
          hasAiWorkoutPlan: pkg.hasAiWorkoutPlan || false,
          hasNutritionPlan: pkg.hasNutritionPlan || false,
          description: pkg.description || "",
          benefits: pkg.benefits || "",
          thumbnailUrl: pkg.thumbnailUrl || ""
        });
      } else {
        setFormData({
          code: "",
          name: "",
          packageType: "BASIC",
          basePrice: "",
          ptSessionsPerMonth: 0,
          hasAiWorkoutPlan: false,
          hasNutritionPlan: false,
          description: "",
          benefits: "",
          thumbnailUrl: ""
        });
      }
    }
  }, [open, pkg]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        code: formData.code,
        name: formData.name,
        packageType: formData.packageType,
        basePrice: Number(formData.basePrice),
        ptSessionsPerMonth: Number(formData.ptSessionsPerMonth),
        hasAiWorkoutPlan: formData.hasAiWorkoutPlan,
        hasNutritionPlan: formData.hasNutritionPlan,
        description: formData.description,
        benefits: formData.benefits,
        thumbnailUrl: formData.thumbnailUrl,
        status: "ACTIVE" as const
      };

      if (!validateAdminPackageForm(payload, !isEditing)) {
        setIsSubmitting(false);
        return;
      }

      if (isEditing && pkg) {
        const { code: _code, ...updatePayload } = payload;
        await packageService.updatePackage(pkg.id, updatePayload);
        showAlert.success("Thành công", "Đã cập nhật gói tập");
      } else {
        await packageService.createPackage(payload);
        showAlert.success("Thành công", "Đã tạo gói tập mới");
      }
      onSuccess();
      onClose();
    } catch {
      showAlert.error("Lỗi", "Không thể lưu thông tin gói tập");
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
        className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <header className="flex-none flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {isEditing ? "Chỉnh sửa Gói tập" : "Thêm Gói tập mới"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing ? "Cập nhật thông tin chi tiết gói tập." : "Tạo một gói tập mới cho khách hàng."}
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="gym-package-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <Input
                  label="Tên gói tập"
                  placeholder="VD: Premium 30 Days"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="md:col-span-1">
                 <label className="mb-2 block text-sm font-semibold text-slate-700">Loại gói tập</label>
                 <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition focus:border-fit-primary focus:outline-none focus:ring-1 focus:ring-fit-primary shadow-sm hover:border-slate-300"
                    value={formData.packageType}
                    onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                 >
                    <option value="BASIC">BASIC (Cơ bản)</option>
                    <option value="VIP">VIP (Cao cấp)</option>
                    <option value="PERSONAL">PERSONAL (Gói PT)</option>
                 </select>
              </div>
              
              <Input
                label="Giá cơ bản (VNĐ)"
                type="number"
                min="0"
                placeholder="VD: 1200000"
                required
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              />
              <Input
                label="Số buổi PT / tháng"
                type="number"
                min="0"
                placeholder="VD: 4"
                required
                value={formData.ptSessionsPerMonth}
                onChange={(e) => setFormData({ ...formData, ptSessionsPerMonth: Number(e.target.value) })}
              />

              <div className="md:col-span-2 flex flex-row items-center justify-center gap-8 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-fit-primary focus:ring-fit-primary transition-colors"
                    checked={formData.hasAiWorkoutPlan}
                    onChange={(e) => setFormData({ ...formData, hasAiWorkoutPlan: e.target.checked })}
                  />
                  Tích hợp AI
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-fit-primary focus:ring-fit-primary transition-colors"
                    checked={formData.hasNutritionPlan}
                    onChange={(e) => setFormData({ ...formData, hasNutritionPlan: e.target.checked })}
                  />
                  Gói dinh dưỡng
                </label>
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Đường dẫn ảnh đại diện (Thumbnail URL)"
                  type="url"
                  placeholder="VD: https://example.com/image.jpg"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                />
              </div>

              <div className="md:col-span-1">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Mô tả gói tập</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition focus:border-fit-primary focus:outline-none focus:ring-1 focus:ring-fit-primary shadow-sm hover:border-slate-300"
                  rows={3}
                  placeholder="VD: Gói tập tiêu chuẩn phù hợp cho người mới bắt đầu..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="md:col-span-1">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Quyền lợi (cách nhau bởi dấu phẩy hoặc xuống dòng)</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition focus:border-fit-primary focus:outline-none focus:ring-1 focus:ring-fit-primary shadow-sm hover:border-slate-300"
                  rows={3}
                  placeholder="VD: Truy cập 24/7, Tủ đồ miễn phí, Xông hơi..."
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                ></textarea>
              </div>
            </div>
          </form>
        </div>

        <footer className="flex-none p-4 flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <Button type="submit" form="gym-package-form" disabled={isSubmitting} className="px-8 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
            {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEditing ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </footer>
      </section>
    </div>
  );
}
