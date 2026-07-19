import { useState, useEffect } from "react";
import axios from "axios";
import { showAlert } from "../../../utils/alert";
import { paymentService } from "../services/paymentService";
import type { PaymentResult } from "../types/payment.type";

export function usePaymentManagement() {
  const [payments, setPayments] = useState<PaymentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async (): Promise<void> => {
    try {
      setLoading(true);

      const data = await paymentService.getAdminPayments({
        status: "PENDING",
      });

      setPayments(data);
    } catch (error: unknown) {
      console.error("GET_ADMIN_PAYMENTS_ERROR:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || fallback;
    }

    return fallback;
  };

  const handleConfirm = async (paymentId: number): Promise<void> => {
    try {
      await paymentService.confirmPayment(paymentId, {
        transactionNo: `ADMIN-${Date.now()}`,
        note: "Admin/Staff xác nhận đã nhận thanh toán",
      });

      showAlert.success("Thành công", "Đã xác nhận thanh toán");
      fetchPayments();
    } catch (error: unknown) {
      console.error("CONFIRM_PAYMENT_ERROR:", error);

      showAlert.error(
        "Lỗi",
        getErrorMessage(error, "Không thể xác nhận thanh toán")
      );
    }
  };

  const handleFail = async (paymentId: number): Promise<void> => {
    try {
      await paymentService.failPayment(
        paymentId,
        "Không tìm thấy giao dịch thanh toán"
      );

      showAlert.success("Thành công", "Đã từ chối thanh toán");
      fetchPayments();
    } catch (error: unknown) {
      console.error("FAIL_PAYMENT_ERROR:", error);

      showAlert.error(
        "Lỗi",
        getErrorMessage(error, "Không thể từ chối thanh toán")
      );
    }
  };

  return {
    payments,
    loading,
    handleConfirm,
    handleFail
  };
}
