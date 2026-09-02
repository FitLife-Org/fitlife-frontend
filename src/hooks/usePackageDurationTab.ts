import { useState, useEffect } from "react";
import { showAlert } from "../utils/alert";
import { packageService } from "../services/packageService";
import type { GymPackage, PackageDuration } from "../types/package.type";
import { validateAdminDurationForm } from "../utils/validators/adminDurationValidator";

export function usePackageDurationTab() {
  const [durations, setDurations] = useState<PackageDuration[]>([]);
  const [packages, setPackages] = useState<GymPackage[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDuration, setEditingDuration] = useState<PackageDuration | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    months: "1",
    discountPercent: "0",
    gymPackageId: "",
    price: "",
    discountPrice: ""
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [durationsData, packagesData] = await Promise.all([
        packageService.getAdminPackageDurations(),
        packageService.getAdminPackages({ size: 100 })
      ]);
      setDurations(durationsData);
      setPackages(packagesData);
    } catch {
      console.error("Failed to fetch durations");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (duration?: PackageDuration) => {
    if (duration) {
      setEditingDuration(duration);
      setFormData({
        code: duration.code,
        name: duration.name,
        months: duration.months.toString(),
        discountPercent: duration.discountPercent.toString(),
        gymPackageId: duration.gymPackageId ? duration.gymPackageId.toString() : "",
        price: duration.price ? duration.price.toString() : "",
        discountPrice: duration.discountPrice ? duration.discountPrice.toString() : ""
      });
    } else {
      setEditingDuration(null);
      setFormData({ 
        code: "", 
        name: "", 
        months: "1",
        discountPercent: "0",
        gymPackageId: packages.length > 0 ? packages[0].id.toString() : "",
        price: "",
        discountPrice: ""
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
        months: Number(formData.months),
        discountPercent: Number(formData.discountPercent),
        gymPackageId: Number(formData.gymPackageId),
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : Number(formData.price),
        status: "ACTIVE"
      };

      const validationResult = validateAdminDurationForm(payload);
      if (!validationResult.success) {
        const errorMsg = 'error' in validationResult && validationResult.error?.issues?.[0]?.message 
          ? validationResult.error.issues[0].message 
          : "Dữ liệu không hợp lệ";
        showAlert.error("Lỗi", errorMsg);
        return;
      }

      if (editingDuration) {
        const { code: _code, ...updatePayload } = payload;
        await packageService.updatePackageDuration(editingDuration.id, updatePayload);
        showAlert.success("Thành công", "Đã cập nhật thời hạn");
      } else {
        await packageService.createPackageDuration(payload);
        showAlert.success("Thành công", "Đã tạo thời hạn mới");
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      showAlert.error("Lỗi", "Không thể lưu thông tin thời hạn");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await packageService.deletePackageDuration(deleteId);
      showAlert.success("Thành công", "Đã xóa thời hạn");
      fetchData();
    } catch {
      showAlert.error("Lỗi", "Không thể xóa thời hạn");
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (duration: PackageDuration) => {
    try {
      const newStatus = duration.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await packageService.updatePackageDurationStatus(duration.id, newStatus);
      showAlert.success("Thành công", `Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'khóa'} thời hạn`);
      fetchData();
    } catch {
      showAlert.error("Lỗi", "Không thể thay đổi trạng thái");
    }
  };

  return {
    durations,
    packages,
    loading,
    isModalOpen,
    setIsModalOpen,
    editingDuration,
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
