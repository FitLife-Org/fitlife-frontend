import { useState, useEffect } from "react";
import axios from "axios";
import { showAlert } from "../../../utils/alert";
import { invoiceService } from "../../../services/invoiceService";
import { paymentService } from "../services/paymentService";
import type { Invoice } from "../../../types/invoice.type";
import type { PaymentResult } from "../types/payment.type";

export type MemberPaymentMethod = "CASH" | "BANK_TRANSFER" | "VNPAY";

export function usePaymentHistory() {
  const [payments, setPayments] = useState<PaymentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const paymentData = await paymentService.getMyPayments();
        setPayments(paymentData);
      } catch (error: unknown) {
        console.error("LOAD_MEMBER_PAYMENTS_ERROR:", error);
        let message = "Không thể tải dữ liệu thanh toán.";
        if (axios.isAxiosError(error)) {
          message = error.response?.data?.message || message;
        }
        showAlert.error("Lỗi", message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return { payments, loading };
}

export function usePaymentDetail(id?: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const invoiceData = await invoiceService.getInvoiceById(Number(id));
        setInvoice(invoiceData);
      } catch (error: unknown) {
        console.error("LOAD_INVOICE_ERROR:", error);
        let message = "Không thể tải chi tiết hóa đơn.";
        if (axios.isAxiosError(error)) {
          message = error.response?.data?.message || message;
        }
        showAlert.error("Lỗi", message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  return { invoice, loading };
}
