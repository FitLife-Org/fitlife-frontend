import {
  Eye,
  RotateCcw,
  Search,
  X,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Pagination from "../../components/common/Pagination";

import {
  formatCurrency,
} from "../../utils/formatCurrency";

import {
  formatDate,
} from "../../utils/formatDate";

import type {
  Invoice,
  InvoiceStatus,
} from "../../types/invoice.type";

import {
  useInvoiceManagement,
} from "../../hooks/useInvoiceManagement";

import {
  ROUTES,
} from "../../config/routes";

import { usePageAnimation } from "../../hooks/usePageAnimation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

function getStatusBadge(
    status: InvoiceStatus,
) {
  switch (status) {
    case "PAID":
      return (
          <Badge variant="success">
            Đã thanh toán
          </Badge>
      );

    case "UNPAID":
      return (
          <Badge variant="warning">
            Chưa thanh toán
          </Badge>
      );

    case "CANCELLED":
      return (
          <Badge variant="danger">
            Đã hủy
          </Badge>
      );

    case "REFUNDED":
      return (
          <Badge variant="default">
            Đã hoàn tiền
          </Badge>
      );

    default:
      return (
          <Badge variant="default">
            {status}
          </Badge>
      );
  }
}

export default function InvoiceManagementPage() {
  const navigate =
      useNavigate();

  const {
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

    pageSize,
    setPageSize,

    actionInvoiceId,

    handleSearchSubmit,
    handleClearSearch,

    handleCancelInvoice,
    handleRefundInvoice,
  } = useInvoiceManagement();

  const containerRef = usePageAnimation();

  useGSAP(() => {
    if (!loading && invoices.length > 0) {
      gsap.from("tbody tr", {
        y: 20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
        clearProps: "all"
      });
    }
  }, [loading, invoices.length]);

  const openDetail = (
      invoiceId: number,
  ) => {
    navigate(
        `${ROUTES.ADMIN_INVOICES}/${invoiceId}`,
    );
  };

  const columns = [
    {
      key: "invoiceCode",
      header: "Mã hóa đơn",

      render: (
          invoice: Invoice,
      ) => (
          <button
              type="button"
              onClick={() => {
                openDetail(
                    invoice.id,
                );
              }}
              className="font-mono text-sm font-bold text-fit-primary hover:underline"
          >
            {invoice.invoiceCode}
          </button>
      ),
    },

    {
      key: "member",
      header: "Hội viên",

      render: (
          invoice: Invoice,
      ) => (
          <div>
            <p className="font-semibold text-fit-text">
              {invoice.memberName ||
                  "Chưa có tên hội viên"}
            </p>

            <p className="mt-0.5 text-xs text-fit-muted">
              {invoice.memberCode ||
                  `ID: ${invoice.memberId}`}
            </p>

            {invoice.memberEmail && (
                <p className="mt-0.5 text-xs text-slate-400">
                  {invoice.memberEmail}
                </p>
            )}
          </div>
      ),
    },

    {
      key: "package",
      header: "Gói tập",

      render: (
          invoice: Invoice,
      ) => (
          <div>
            <p className="font-medium text-slate-700">
              {invoice.packageName ||
                  "Không có thông tin"}
            </p>

            {invoice.packageDurationName && (
                <p className="mt-0.5 text-xs text-slate-400">
                  {
                    invoice.packageDurationName
                  }
                </p>
            )}
          </div>
      ),
    },

    {
      key: "amount",
      header: "Số tiền",

      render: (
          invoice: Invoice,
      ) => (
          <span className="font-bold text-fit-primary">
          {formatCurrency(
              invoice.finalAmount ?? 0,
          )}
        </span>
      ),
    },

    {
      key: "issuedAt",
      header: "Ngày phát hành",

      render: (
          invoice: Invoice,
      ) => (
          <span className="text-sm text-fit-muted">
          {formatDate(
              invoice.issuedAt ||
              invoice.createdAt,
          )}
        </span>
      ),
    },

    {
      key: "status",
      header: "Trạng thái",

      render: (
          invoice: Invoice,
      ) =>
          getStatusBadge(
              invoice.status,
          ),
    },

    {
      key: "actions",
      header: "Thao tác",

      render: (
          invoice: Invoice,
      ) => {
        const actionLoading =
            actionInvoiceId ===
            invoice.id;

        return (
            <div className="flex items-center gap-1">
              <button
                  type="button"
                  onClick={() => {
                    openDetail(
                        invoice.id,
                    );
                  }}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-fit-primary"
                  title="Xem chi tiết"
              >
                <Eye className="h-5 w-5" />
              </button>

              {invoice.status ===
                  "UNPAID" && (
                      <button
                          type="button"
                          onClick={() => {
                            void handleCancelInvoice(
                                invoice.id,
                            );
                          }}
                          disabled={
                            actionLoading
                          }
                          className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Hủy hóa đơn"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                  )}

              {invoice.status ===
                  "PAID" && (
                      <button
                          type="button"
                          onClick={() => {
                            void handleRefundInvoice(
                                invoice.id,
                            );
                          }}
                          disabled={
                            actionLoading
                          }
                          className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Hoàn tiền"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </button>
                  )}

              {actionLoading && (
                  <span className="ml-1 h-4 w-4 animate-spin rounded-full border-2 border-fit-primary border-t-transparent" />
              )}
            </div>
        );
      },
    },
  ];



  return (
      <div className="space-y-6 max-w-7xl mx-auto" ref={containerRef}>
        <PageHeader
            title="Quản lý hóa đơn"
            description="Tìm kiếm, theo dõi và xử lý tất cả hóa đơn trên hệ thống."
        />

        <Card className="p-5">
          <form
              onSubmit={
                handleSearchSubmit
              }
              className="flex flex-col gap-4 lg:flex-row lg:items-end"
          >
            <div className="flex-1">
              <label
                  htmlFor="invoice-search"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Tìm kiếm hóa đơn
              </label>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                    id="invoice-search"
                    type="search"
                    placeholder="Mã hóa đơn, tên, mã hội viên, email, số điện thoại..."
                    value={keyword}
                    onChange={(
                        event,
                    ) => {
                      setKeyword(
                          event.target.value,
                      );
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm outline-none transition-all focus:border-fit-primary focus:ring-2 focus:ring-fit-primary/10"
                />

                {keyword && (
                    <button
                        type="button"
                        onClick={
                          handleClearSearch
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Xóa tìm kiếm"
                    >
                      <X className="h-4 w-4" />
                    </button>
                )}
              </div>
            </div>

            <div className="w-full lg:w-56">
              <label
                  htmlFor="invoice-status"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Trạng thái
              </label>

              <select
                  id="invoice-status"
                  value={statusFilter}
                  onChange={(
                      event,
                  ) => {
                    handleStatusChange(
                        event.target
                            .value as
                            | InvoiceStatus
                            | "ALL",
                    );
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-fit-primary focus:ring-2 focus:ring-fit-primary/10"
              >
                <option value="ALL">
                  Tất cả trạng thái
                </option>

                <option value="UNPAID">
                  Chưa thanh toán
                </option>

                <option value="PAID">
                  Đã thanh toán
                </option>

                <option value="CANCELLED">
                  Đã hủy
                </option>

                <option value="REFUNDED">
                  Đã hoàn tiền
                </option>
              </select>
            </div>

            <button
                type="submit"
                className="rounded-xl bg-fit-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:opacity-90"
            >
              Tìm kiếm
            </button>
          </form>

          {submittedKeyword && (
              <p className="mt-3 text-sm text-slate-500">
                Kết quả tìm kiếm cho:{" "}
                <strong className="text-slate-700">
                  {submittedKeyword}
                </strong>
              </p>
          )}
        </Card>

        <Card className="overflow-hidden">
          {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />

                  <p className="text-sm font-medium text-slate-500">
                    Đang tải hóa đơn...
                  </p>
                </div>
              </div>
          ) : (
              <>
                <Table
                    columns={columns}
                    data={invoices}
                    emptyText="Không tìm thấy hóa đơn phù hợp"
                />

                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={totalElements}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(0);
                    }}
                />
              </>
          )}
        </Card>
      </div>
  );
}