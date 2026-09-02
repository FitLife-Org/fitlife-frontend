import { showAlert } from "../alert";
import type { PaymentRequest } from "../../types/payment.type";

export const validatePaymentForm = (data: PaymentRequest): boolean => {
  if (!data.invoiceId) {
    showAlert.error("Lỗi", "Không tìm thấy thông tin hóa đơn.");
    return false;
  }

  if (!data.paymentMethod || data.paymentMethod.trim() === "") {
    showAlert.error("Lỗi", "Vui lòng chọn phương thức thanh toán.");
    return false;
  }

  const validMethods = ["VNPAY", "MOMO", "CASH", "BANK_TRANSFER"];
  if (!validMethods.includes(data.paymentMethod)) {
    showAlert.error("Lỗi", "Phương thức thanh toán không hợp lệ.");
    return false;
  }

  if (data.note && data.note.length > 500) {
    showAlert.error("Lỗi", "Ghi chú thanh toán không được vượt quá 500 ký tự.");
    return false;
  }

  return true;
};
