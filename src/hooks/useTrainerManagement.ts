import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { trainerService } from "../services/trainerService";
import type { Trainer } from "../types/trainer.type";

export function useTrainerManagement() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const data = await trainerService.getAdminTrainers();
      setTrainers(data);
    } catch {
      toast.error("Không thể tải danh sách PT");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: "Xóa Huấn Luyện Viên?",
      text: `Bạn có chắc chắn muốn xóa PT "${name}"? Hành động này không thể hoàn tác.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy bỏ",
      background: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await trainerService.deleteTrainer(id);
        toast.success("Đã xóa PT thành công");
        setTrainers(prev => prev.filter(t => t.id !== id));
      } catch {
        toast.error("Không thể xóa PT này.");
      }
    }
  };

  const filteredTrainers = trainers.filter(t => 
    (t.fullName || "").toLowerCase().includes(search.toLowerCase()) || 
    (t.specialty && t.specialty.toLowerCase().includes(search.toLowerCase())) ||
    (t.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return {
    trainers,
    loading,
    search,
    setSearch,
    filteredTrainers,
    handleDelete,
    fetchTrainers
  };
}
