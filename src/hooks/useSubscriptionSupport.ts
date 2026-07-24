import { useState, useEffect, useCallback } from "react";
import { subscriptionService } from "../services/subscriptionService";
import type { Subscription } from "../types/subscription.type";
import { showAlert } from "../utils/alert";

export function useSubscriptionSupport() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      
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
  }, [statusFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleCancel = async (id: number) => {
    const result = await showAlert.confirm(
      "Hủy gói tập",
      "Bạn có chắc chắn muốn hủy gói tập này không?",
      { confirmButtonText: "Hủy gói", cancelButtonText: "Đóng" }
    );

    if (result.isConfirmed) {
      try {
        await subscriptionService.cancelSubscriptionAdmin(id);
        showAlert.success("Thành công", "Đã hủy gói tập");
        fetchSubscriptions();
      } catch (error: unknown) {
        console.error("Failed to cancel subscription:", error);
        const msg = error && typeof error === 'object' && 'response' in error 
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
        showAlert.error("Lỗi", msg || "Không thể hủy gói tập");
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
        await subscriptionService.expireSubscription(id);
        showAlert.success("Thành công", "Đã đánh dấu gói tập hết hạn");
        fetchSubscriptions();
      } catch (error: unknown) {
        console.error("Failed to expire subscription:", error);
        const msg = error && typeof error === 'object' && 'response' in error 
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
        showAlert.error("Lỗi", msg || "Không thể cập nhật trạng thái");
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
