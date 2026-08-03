import {
  useCallback,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  showAlert,
} from "../utils/alert";

import {
  paymentService,
} from "../services/paymentService";

import type {
  PaymentResult,
} from "../types/payment.type";

function getErrorMessage(
    error: unknown,
    fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const responseData =
        error.response?.data as
            | {
          message?: string;
        }
            | undefined;

    return (
        responseData?.message ||
        fallback
    );
  }

  if (
      error instanceof Error &&
      error.message
  ) {
    return error.message;
  }

  return fallback;
}

export function usePaymentManagement() {
  const [
    payments,
    setPayments,
  ] = useState<PaymentResult[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /**
   * Payment đang được xác nhận hoặc từ chối.
   * Dùng để khóa nút thao tác đúng dòng.
   */
  const [
    actionPaymentId,
    setActionPaymentId,
  ] = useState<number | null>(
      null,
  );

  const fetchPayments =
      useCallback(
          async (): Promise<void> => {
            try {
              setLoading(true);

              const data =
                  await paymentService
                      .getAdminPayments({
                        status: "PENDING",
                      });

              setPayments(data);
            } catch (
                error: unknown
                ) {
              console.error(
                  "GET_ADMIN_PAYMENTS_ERROR:",
                  error,
              );

              setPayments([]);

              void showAlert.error(
                  "Không thể tải thanh toán",
                  getErrorMessage(
                      error,
                      "Không thể tải danh sách thanh toán đang chờ xử lý.",
                  ),
              );
            } finally {
              setLoading(false);
            }
          },
          [],
      );

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  const handleConfirm =
      async (
          paymentId: number,
      ): Promise<void> => {
        if (
            actionPaymentId !== null
        ) {
          return;
        }

        const confirmResult =
            await showAlert.confirm(
                "Xác nhận thanh toán?",
                "Hóa đơn sẽ được đánh dấu đã thanh toán và gói tập tương ứng có thể được kích hoạt.",
                {
                  icon: "question",
                  confirmButtonText:
                      "Xác nhận",
                  cancelButtonText:
                      "Hủy",
                },
            );

        if (
            !confirmResult.isConfirmed
        ) {
          return;
        }

        try {
          setActionPaymentId(
              paymentId,
          );

          await paymentService
              .confirmPayment(
                  paymentId,
                  {
                    transactionNo:
                        `ADMIN-${Date.now()}`,

                    note:
                        "Admin/Staff xác nhận đã nhận thanh toán",
                  },
              );

          await showAlert.success(
              "Thành công",
              "Đã xác nhận thanh toán.",
          );

          await fetchPayments();
        } catch (
            error: unknown
            ) {
          console.error(
              "CONFIRM_PAYMENT_ERROR:",
              error,
          );

          await showAlert.error(
              "Không thể xác nhận",
              getErrorMessage(
                  error,
                  "Không thể xác nhận thanh toán.",
              ),
          );
        } finally {
          setActionPaymentId(null);
        }
      };

  const handleFail =
      async (
          paymentId: number,
      ): Promise<void> => {
        if (
            actionPaymentId !== null
        ) {
          return;
        }

        const inputResult =
            await showAlert.warning(
                "Từ chối thanh toán",
                undefined,
                {
                  input: "textarea",

                  inputLabel:
                      "Lý do từ chối",

                  inputPlaceholder:
                      "Nhập lý do thanh toán không hợp lệ...",

                  inputValue:
                      "Không tìm thấy giao dịch thanh toán",

                  inputAttributes: {
                    maxlength: "500",
                  },

                  showCancelButton:
                      true,

                  confirmButtonText:
                      "Xác nhận từ chối",

                  cancelButtonText:
                      "Đóng",

                  inputValidator:
                      (value) => {
                        if (
                            !value ||
                            !String(
                                value,
                            ).trim()
                        ) {
                          return "Vui lòng nhập lý do từ chối.";
                        }

                        return undefined;
                      },
                },
            );

        if (
            !inputResult.isConfirmed
        ) {
          return;
        }

        const reason =
            String(
                inputResult.value ?? "",
            ).trim();

        if (!reason) {
          return;
        }

        try {
          setActionPaymentId(
              paymentId,
          );

          await paymentService
              .failPayment(
                  paymentId,
                  reason,
              );

          await showAlert.success(
              "Thành công",
              "Đã từ chối thanh toán.",
          );

          await fetchPayments();
        } catch (
            error: unknown
            ) {
          console.error(
              "FAIL_PAYMENT_ERROR:",
              error,
          );

          await showAlert.error(
              "Không thể từ chối",
              getErrorMessage(
                  error,
                  "Không thể từ chối thanh toán.",
              ),
          );
        } finally {
          setActionPaymentId(null);
        }
      };

  return {
    payments,
    loading,

    actionPaymentId,

    handleConfirm,
    handleFail,

    refreshPayments:
    fetchPayments,
  };
}