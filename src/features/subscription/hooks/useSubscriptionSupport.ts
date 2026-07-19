import { useState, useEffect } from "react";
import { subscriptionService } from "../services/subscriptionService";
import type { Subscription } from "../types/subscription.type";
import { showAlert } from "../../../utils/alert";

export function useSubscriptionSupport() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const data = await subscriptionService.getAdminSubscriptions(params);
      setSubscriptions(data);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    const result = await showAlert.confirm(
      "Hủy gói tập",
      "Bạn có chắc chắn muốn hủy gói tập này không?",
      { confirmButtonText: "Hủy gói", cancelButtonText: "Đóng" }
    );

    if (result.isConfirmed) {
      try {
        await subscriptionService.cancelSubscriptionAdmin(id, "Staff/Admin hủy gói tập");
        showAlert.success("Thành công", "Đã hủy gói tập");
        fetchSubscriptions();
      } catch (error: any) {
        console.error("Failed to cancel subscription:", error);
        showAlert.error("Lỗi", error?.response?.data?.message || "Không thể hủy gói tập");
      }
    }
  };

  const handleExpire = async (id: number) => {
    const result = await showAlert.confirm(
      "Đánh dấu hết hạn",
      "Bạn có chắc chắn muốn đánh dấu gói tập này là đã hết hạn?",
      { confirmButtonText: "Xác nhận", cancelButtonText: "Đóng" }
    );

    if (result.isConfirmed) {
      try {
        await subscriptionService.expireSubscription(id, "Hết hạn do Staff/Admin thực hiện");
        showAlert.success("Thành công", "Đã đánh dấu gói tập hết hạn");
        fetchSubscriptions();
      } catch (error: any) {
        console.error("Failed to expire subscription:", error);
        showAlert.error("Lỗi", error?.response?.data?.message || "Không thể cập nhật trạng thái");
      }
    }
  };

  return {
    subscriptions,
    loading,
    statusFilter,
    setStatusFilter,
    handleCancel,
    handleExpire
  };
}
