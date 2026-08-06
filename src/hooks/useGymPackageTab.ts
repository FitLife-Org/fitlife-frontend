import { useState, useEffect } from "react";
import { showAlert } from "../utils/alert";
import { packageService } from "../services/packageService";
import type { GymPackage } from "../types/package.type";

export function useGymPackageTab() {
  const [packages, setPackages] = useState<GymPackage[]>([]);
  const [loading, setLoading] = useState(true);
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
    deleteId,
    setDeleteId,
    handleDelete,
    handleToggleStatus
  };
}
