import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Package, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { showAlert } from "../../utils/alert";
import { packageService } from "../../services/packageService";
import { validateAdminPackageForm } from "../../utils/validators/adminPackageValidator";

export default function GymPackageFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
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
    if (isEditing) {
      const fetchPackage = async () => {
        try {
          const packages = await packageService.getAdminPackages({ size: 100 });
          const pkg = packages.find(p => p.id === Number(id));
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
            showAlert.error("Lỗi", "Không tìm thấy Gói tập");
            navigate("/admin/packages");
          }
        } catch {
          showAlert.error("Lỗi", "Không thể tải thông tin Gói tập");
          navigate("/admin/packages");
        } finally {
          setLoading(false);
        }
      };
      fetchPackage();
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
        return;
      }

      if (isEditing) {
        const { code: _code, ...updatePayload } = payload;
        await packageService.updatePackage(Number(id), updatePayload);
        showAlert.success("Thành công", "Đã cập nhật gói tập");
      } else {
        await packageService.createPackage(payload);
        showAlert.success("Thành công", "Đã tạo gói tập mới");
      }
      navigate("/admin/packages");
    } catch {
      showAlert.error("Lỗi", "Không thể lưu thông tin gói tập");
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
          onClick={() => navigate("/admin/packages")}
          className="p-2 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <PageHeader 
          title={isEditing ? "Chỉnh sửa Gói tập" : "Thêm Gói tập mới"} 
          description={isEditing ? "Cập nhật thông tin chi tiết gói tập." : "Tạo một gói tập mới cho khách hàng."} 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!isEditing && (
              <Input
                label="Mã gói tập"
                placeholder="VD: PKG-01"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                icon={<Package className="w-4 h-4" />}
              />
            )}
            <div className={!isEditing ? "md:col-span-1" : "md:col-span-2"}>
              <Input
                label="Tên gói tập"
                placeholder="VD: Premium 30 Days"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
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
          </div>

          <div className="flex gap-8 mt-4 pt-4 border-t border-slate-100">
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
          
          <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 mt-8">
            <button
              type="button"
              onClick={() => navigate("/admin/packages")}
              className="px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <Button type="submit" className="px-8 py-3 rounded-xl">
              {isEditing ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
