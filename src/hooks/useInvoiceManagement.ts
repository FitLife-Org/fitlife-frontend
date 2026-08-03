import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  invoiceService,
} from "../services/invoiceService";

import {
  showAlert,
} from "../utils/alert";

import {
  getApiErrorMessage,
} from "../utils/apiError";

import type {
  Invoice,
  InvoiceStatus,
} from "../types/invoice.type";

const DEFAULT_PAGE_SIZE = 10;

export function useInvoiceManagement() {
  const [
    invoices,
    setInvoices,
  ] = useState<Invoice[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    keyword,
    setKeyword,
  ] = useState("");

  const [
    submittedKeyword,
    setSubmittedKeyword,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
      InvoiceStatus | "ALL"
  >("ALL");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(0);

  const [
    totalElements,
    setTotalElements,
  ] = useState(0);

  const [
    actionInvoiceId,
    setActionInvoiceId,
  ] = useState<number | null>(
      null,
  );

  const fetchInvoices =
      useCallback(async () => {
        try {
          setLoading(true);

          const result =
              await invoiceService
                  .getAdminInvoices({
                    page:
                    currentPage,

                    size:
                    DEFAULT_PAGE_SIZE,

                    keyword:
                        submittedKeyword ||
                        undefined,

                    status:
                        statusFilter === "ALL"
                            ? undefined
                            : statusFilter,

                    sort:
                        "issuedAt,desc",
                  });

          setInvoices(
              result.content,
          );

          setTotalPages(
              result.totalPages,
          );

          setTotalElements(
              result.totalElements,
          );
        } catch (
            error: unknown
            ) {
          console.error(
              "GET_ADMIN_INVOICES_ERROR:",
              error,
          );

          setInvoices([]);
          setTotalPages(0);
          setTotalElements(0);

          showAlert.error(
              "Không thể tải hóa đơn",
              getApiErrorMessage(
                  error,
                  "Không thể tải danh sách hóa đơn.",
              ),
          );
        } finally {
          setLoading(false);
        }
      }, [
        currentPage,
        statusFilter,
        submittedKeyword,
      ]);

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  const handleSearchSubmit = (
      event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setCurrentPage(0);

    setSubmittedKeyword(
        keyword.trim(),
    );
  };

  const handleClearSearch = () => {
    setKeyword("");
    setSubmittedKeyword("");
    setCurrentPage(0);
  };

  const handleStatusChange = (
      status:
          | InvoiceStatus
          | "ALL",
  ) => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  const handleCancelInvoice =
      async (
          invoiceId: number,
      ) => {
        const promptResult =
            await showAlert.warning(
                "Hủy hóa đơn",
                undefined,
                {
                  input: "textarea",

                  inputLabel:
                      "Lý do hủy hóa đơn",

                  inputPlaceholder:
                      "Nhập lý do hủy...",

                  inputAttributes: {
                    maxlength: "500",
                  },

                  showCancelButton:
                      true,

                  confirmButtonText:
                      "Xác nhận hủy",

                  cancelButtonText:
                      "Đóng",

                  inputValidator:
                      (value) => {
                        if (
                            !value ||
                            !String(value).trim()
                        ) {
                          return "Vui lòng nhập lý do hủy hóa đơn.";
                        }

                        return undefined;
                      },
                },
            );

        if (
            !promptResult.isConfirmed
        ) {
          return;
        }

        const reason =
            String(
                promptResult.value ?? "",
            ).trim();

        if (!reason) {
          return;
        }

        try {
          setActionInvoiceId(
              invoiceId,
          );

          const updatedInvoice =
              await invoiceService
                  .cancelInvoice(
                      invoiceId,
                      reason,
                  );

          setInvoices(
              (previous) =>
                  previous.map(
                      (invoice) =>
                          invoice.id ===
                          updatedInvoice.id
                              ? updatedInvoice
                              : invoice,
                  ),
          );

          showAlert.success(
              "Thành công",
              "Đã hủy hóa đơn.",
          );
        } catch (
            error: unknown
            ) {
          console.error(
              "CANCEL_INVOICE_ERROR:",
              error,
          );

          showAlert.error(
              "Không thể hủy hóa đơn",
              getApiErrorMessage(
                  error,
                  "Hủy hóa đơn thất bại.",
              ),
          );
        } finally {
          setActionInvoiceId(null);
        }
      };

  const handleRefundInvoice =
      async (
          invoiceId: number,
      ) => {
        const promptResult =
            await showAlert.warning(
                "Hoàn tiền hóa đơn",
                "Thao tác này sẽ chuyển hóa đơn, giao dịch và gói tập sang trạng thái hoàn tiền/hủy.",
                {
                  input: "textarea",

                  inputLabel:
                      "Lý do hoàn tiền",

                  inputPlaceholder:
                      "Nhập lý do hoàn tiền...",

                  inputAttributes: {
                    maxlength: "500",
                  },

                  showCancelButton:
                      true,

                  confirmButtonText:
                      "Xác nhận hoàn tiền",

                  cancelButtonText:
                      "Đóng",

                  inputValidator:
                      (value) => {
                        if (
                            !value ||
                            !String(value).trim()
                        ) {
                          return "Vui lòng nhập lý do hoàn tiền.";
                        }

                        return undefined;
                      },
                },
            );

        if (
            !promptResult.isConfirmed
        ) {
          return;
        }

        const reason =
            String(
                promptResult.value ?? "",
            ).trim();

        if (!reason) {
          return;
        }

        const confirmResult =
            await showAlert.confirm(
                "Xác nhận hoàn tiền?",
                "Sau khi hoàn tiền, hóa đơn không thể chuyển lại thành đã thanh toán.",
                {
                  icon: "warning",

                  confirmButtonText:
                      "Hoàn tiền",

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
          setActionInvoiceId(
              invoiceId,
          );

          const updatedInvoice =
              await invoiceService
                  .refundInvoice(
                      invoiceId,
                      reason,
                  );

          setInvoices(
              (previous) =>
                  previous.map(
                      (invoice) =>
                          invoice.id ===
                          updatedInvoice.id
                              ? updatedInvoice
                              : invoice,
                  ),
          );

          showAlert.success(
              "Hoàn tiền thành công",
              "Hóa đơn và giao dịch đã được cập nhật.",
          );
        } catch (
            error: unknown
            ) {
          console.error(
              "REFUND_INVOICE_ERROR:",
              error,
          );

          showAlert.error(
              "Không thể hoàn tiền",
              getApiErrorMessage(
                  error,
                  "Hoàn tiền hóa đơn thất bại.",
              ),
          );
        } finally {
          setActionInvoiceId(null);
        }
      };

  return {
    invoices,
    loading,

    keyword,
    setKeyword,

    submittedKeyword,

    statusFilter,
    handleStatusChange,

    currentPage,
    setCurrentPage,

    totalPages,
    totalElements,

    pageSize:
    DEFAULT_PAGE_SIZE,

    actionInvoiceId,

    handleSearchSubmit,
    handleClearSearch,

    handleCancelInvoice,
    handleRefundInvoice,

    refreshInvoices:
    fetchInvoices,
  };
}