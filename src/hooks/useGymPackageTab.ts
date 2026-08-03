import { useState, useEffect } from "react";
import { showAlert } from "../utils/alert";
import { packageService } from "../services/packageService";
import type { GymPackage } from "../types/package.type";
import { validateAdminPackageForm } from "../utils/validators/adminPackageValidator";

export function useGymPackageTab() {
  const [packages, setPackages] = useState<GymPackage[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<GymPackage | null>(null);
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

  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await packageService.getAdminPackages({ size: 100 });
      setPackages(data);
    } catch {
      console.error("Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg?: GymPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
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
      setEditingPackage(null);
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
    setIsModalOpen(true);
  };

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
        status: "ACTIVE"
      };

      if (!validateAdminPackageForm(payload, !editingPackage)) {
        return;
      }

      if (editingPackage) {
        const { code: _code, ...updatePayload } = payload;
        await packageService.updatePackage(editingPackage.id, updatePayload);
        showAlert.success("Thành công", "Đã cập nhật gói tập");
      } else {
        await packageService.createPackage(payload);
        showAlert.success("Thành công", "Đã tạo gói tập mới");
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch {
      showAlert.error("Lỗi", "Không thể lưu thông tin gói tập");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await packageService.deletePackage(deleteId);
      showAlert.success("Thành công", "Đã xóa gói tập");
      fetchPackages();
    } catch {
      showAlert.error("Lỗi", "Không thể xóa gói tập");
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (pkg: GymPackage) => {
    try {
      const newStatus = pkg.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await packageService.updatePackageStatus(pkg.id, newStatus);
      showAlert.success("Thành công", `Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'khóa'} gói tập`);
      fetchPackages();
    } catch {
      showAlert.error("Lỗi", "Không thể thay đổi trạng thái");
    }
  };

  return {
    packages,
    loading,
    isModalOpen,
    setIsModalOpen,
    editingPackage,
    formData,
    setFormData,
    deleteId,
    setDeleteId,
    handleOpenModal,
    handleSubmit,
    handleDelete,
    handleToggleStatus
  };
}
