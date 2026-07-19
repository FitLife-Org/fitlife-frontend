import { useState, useEffect } from "react";
import { showAlert } from "../utils/alert";
import { packageService } from "../services/packageService";
import type { PackageDuration } from "../types/package.type";
import { validateAdminDurationForm } from "../utils/validators/adminDurationValidator";

export function usePackageDurationTab() {
  const [durations, setDurations] = useState<PackageDuration[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDuration, setEditingDuration] = useState<PackageDuration | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    months: "1",
    discountPercent: "0"
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  useEffect(() => {
    fetchDurations();
  }, []);

  const fetchDurations = async () => {
    try {
      setLoading(true);
      const data = await packageService.getAdminPackageDurations();
      setDurations(data);
    } catch (_error) {
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
        discountPercent: duration.discountPercent.toString()
      });
    } else {
      setEditingDuration(null);
      setFormData({ 
        code: "", 
        name: "", 
        months: "1",
        discountPercent: "0"
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
        status: "ACTIVE"
      };

      const validationResult = validateAdminDurationForm(payload);
      if (!validationResult.success) {
        const errorMsg = (validationResult as any).error?.errors?.[0]?.message || "Dữ liệu không hợp lệ";
        showAlert.error("Lỗi", errorMsg);
        return;
      }

      if (editingDuration) {
        const { code, ...updatePayload } = payload;
        await packageService.updatePackageDuration(editingDuration.id, updatePayload as any);
        showAlert.success("Thành công", "Đã cập nhật thời hạn");
      } else {
        await packageService.createPackageDuration(payload as any);
        showAlert.success("Thành công", "Đã tạo thời hạn mới");
      }
      setIsModalOpen(false);
      fetchDurations();
    } catch (_error) {
      showAlert.error("Lỗi", "Không thể lưu thông tin thời hạn");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await packageService.deletePackageDuration(deleteId);
      showAlert.success("Thành công", "Đã xóa thời hạn");
      fetchDurations();
    } catch (_error) {
      showAlert.error("Lỗi", "Không thể xóa thời hạn");
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (duration: PackageDuration) => {
    try {
      const newStatus = duration.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await packageService.updatePackageDurationStatus(duration.id, newStatus as any);
      showAlert.success("Thành công", `Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'khóa'} thời hạn`);
      fetchDurations();
    } catch (_error) {
      showAlert.error("Lỗi", "Không thể thay đổi trạng thái");
    }
  };

  return {
    durations,
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
