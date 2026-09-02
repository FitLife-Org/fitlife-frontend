import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  showAlert,
} from "../utils/alert";

import {
  invoiceService,
} from "../services/invoiceService";

import {
  paymentService,
} from "../services/paymentService";

import type {
  Invoice,
} from "../types/invoice.type";

import type {
  PaymentResult,
} from "../types/payment.type";

export type MemberPaymentMethod =
    | "CASH"
    | "BANK_TRANSFER"
    | "VNPAY";

/**
 * Lịch sử giao dịch thanh toán của member hiện tại.
 */
export function usePaymentHistory() {
  const [
    payments,
    setPayments,
  ] = useState<PaymentResult[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchPayments =
        async (): Promise<void> => {
          try {
            setLoading(true);

            const paymentData =
                await paymentService
                    .getMyPayments();

            if (!cancelled) {
              setPayments(
                  paymentData,
              );
            }
          } catch (
              error: unknown
              ) {
            console.error(
                "LOAD_MEMBER_PAYMENTS_ERROR:",
                error,
            );

            if (cancelled) {
              return;
            }

            let message =
                "Không thể tải dữ liệu thanh toán.";

            if (
                axios.isAxiosError(
                    error,
                )
            ) {
              message =
                  error.response?.data
                      ?.message ||
                  message;
            }

            setPayments([]);

            void showAlert.error(
                "Lỗi",
                message,
            );
          } finally {
            if (!cancelled) {
              setLoading(false);
            }
          }
        };

    void fetchPayments();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    payments,
    loading,
  };
}

/**
 * Lấy chi tiết hóa đơn thuộc member hiện tại
 * để thực hiện thanh toán.
 */
export function usePaymentDetail(
    id?: string,
) {
  const [
    invoice,
    setInvoice,
  ] = useState<Invoice | null>(
      null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchInvoice =
        async (): Promise<void> => {
          if (!id) {
            setInvoice(null);
            setLoading(false);
            return;
          }

          const invoiceId =
              Number(id);

          if (
              !Number.isInteger(
                  invoiceId,
              ) ||
              invoiceId <= 0
          ) {
            setInvoice(null);
            setLoading(false);

            void showAlert.error(
                "Lỗi",
                "Mã hóa đơn không hợp lệ.",
            );

            return;
          }

          try {
            setLoading(true);

            /*
             * Endpoint member:
             * GET /invoices/{id}
             *
             * Backend phải kiểm tra hóa đơn
             * thuộc member đang đăng nhập.
             */
            const invoiceData =
                await invoiceService
                    .getMyInvoiceById(
                        invoiceId,
                    );

            if (!cancelled) {
              setInvoice(
                  invoiceData,
              );
            }
          } catch (
              error: unknown
              ) {
            console.error(
                "LOAD_INVOICE_ERROR:",
                error,
            );

            if (cancelled) {
              return;
            }

            let message =
                "Không thể tải chi tiết hóa đơn.";

            if (
                axios.isAxiosError(
                    error,
                )
            ) {
              message =
                  error.response?.data
                      ?.message ||
                  message;
            }

            setInvoice(null);

            void showAlert.error(
                "Lỗi",
                message,
            );
          } finally {
            if (!cancelled) {
              setLoading(false);
            }
          }
        };

    void fetchInvoice();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return {
    invoice,
    loading,
  };
}