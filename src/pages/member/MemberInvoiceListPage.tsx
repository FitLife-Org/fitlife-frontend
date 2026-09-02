import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
    CreditCard,
    Eye,
    FileText,
} from "lucide-react";

import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";

import { invoiceService } from "../../services/invoiceService";
import { showAlert } from "../../utils/alert";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ROUTES } from "../../config/routes";

import type {
    Invoice,
    InvoiceStatus,
} from "../../types/invoice.type";

const PAGE_SIZE = 10;

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

export default function MemberInvoiceListPage() {
    const navigate = useNavigate();

    const [invoices, setInvoices] =
        useState<Invoice[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [currentPage, setCurrentPage] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(0);

    const [totalElements, setTotalElements] =
        useState(0);

    const fetchInvoices = useCallback(
        async (): Promise<void> => {
            try {
                setLoading(true);

                const result =
                    await invoiceService.getMyInvoices({
                        page: currentPage,
                        size: PAGE_SIZE,
                        sort: "issuedAt,desc",
                    });

                setInvoices(result.content);
                setTotalPages(result.totalPages);
                setTotalElements(
                    result.totalElements,
                );
            } catch (error: unknown) {
                console.error(
                    "GET_MY_INVOICES_ERROR:",
                    error,
                );

                setInvoices([]);
                setTotalPages(0);
                setTotalElements(0);

                await showAlert.error(
                    "Không thể tải hóa đơn",
                    getApiErrorMessage(error),
                );
            } finally {
                setLoading(false);
            }
        },
        [currentPage],
    );

    useEffect(() => {
        void fetchInvoices();
    }, [fetchInvoices]);

    const openDetail = (
        invoiceId: number,
    ) => {
        navigate(
            `${ROUTES.MEMBER_INVOICES}/${invoiceId}`,
        );
    };

    const openPayment = (
        invoiceId: number,
    ) => {
        navigate(
            `/member/payment/${invoiceId}`,
        );
    };

    const paidCount =
        invoices.filter(
            (invoice) =>
                invoice.status === "PAID",
        ).length;

    const unpaidCount =
        invoices.filter(
            (invoice) =>
                invoice.status === "UNPAID",
        ).length;

    const columns = [
        {
            key: "invoiceCode",
            header: "Mã hóa đơn",

            render: (
                invoice: Invoice,
            ) => (
                <button
                    type="button"
                    onClick={() =>
                        openDetail(invoice.id)
                    }
                    className="font-mono text-sm font-bold text-fit-primary hover:underline"
                >
                    {invoice.invoiceCode}
                </button>
            ),
        },

        {
            key: "packageName",
            header: "Gói tập",

            render: (
                invoice: Invoice,
            ) => (
                <div>
                    <p className="font-semibold text-slate-800">
                        {invoice.packageName ??
                            "Gói tập FitLife"}
                    </p>

                    {invoice.packageDurationName && (
                        <p className="mt-1 text-xs text-slate-400">
                            {
                                invoice.packageDurationName
                            }
                        </p>
                    )}
                </div>
            ),
        },

        {
            key: "finalAmount",
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
            header: "Ngày tạo",

            render: (
                invoice: Invoice,
            ) => (
                <span className="text-sm text-slate-500">
          {formatDate(
              invoice.issuedAt ??
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
            ) => (
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() =>
                            openDetail(invoice.id)
                        }
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-fit-primary"
                        title="Xem chi tiết"
                    >
                        <Eye className="h-5 w-5" />
                    </button>

                    {invoice.status ===
                        "UNPAID" && (
                            <button
                                type="button"
                                onClick={() =>
                                    openPayment(
                                        invoice.id,
                                    )
                                }
                                className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                                title="Thanh toán"
                            >
                                <CreditCard className="h-5 w-5" />
                            </button>
                        )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                title="Hóa đơn của tôi"
                description="Xem, thanh toán, in và theo dõi hóa đơn của bạn"
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-5">
                    <p className="text-sm font-medium text-slate-500">
                        Tổng hóa đơn
                    </p>

                    <p className="mt-2 text-3xl font-black text-slate-900">
                        {totalElements}
                    </p>
                </Card>

                <Card className="p-5">
                    <p className="text-sm font-medium text-slate-500">
                        Đã thanh toán trên trang
                    </p>

                    <p className="mt-2 text-3xl font-black text-emerald-600">
                        {paidCount}
                    </p>
                </Card>

                <Card className="p-5">
                    <p className="text-sm font-medium text-slate-500">
                        Chờ thanh toán trên trang
                    </p>

                    <p className="mt-2 text-3xl font-black text-amber-600">
                        {unpaidCount}
                    </p>
                </Card>
            </div>

            <Card className="overflow-hidden">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-9 w-9 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="py-14 text-center">
                        <FileText className="mx-auto h-14 w-14 text-slate-300" />

                        <h2 className="mt-5 text-lg font-black text-slate-800">
                            Chưa có hóa đơn
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Hóa đơn phát sinh từ gói
                            tập sẽ hiển thị tại đây.
                        </p>
                    </div>
                ) : (
                    <>
                        <Table
                            columns={columns}
                            data={invoices}
                            emptyText="Không có hóa đơn"
                        />

                        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Tổng{" "}
                                <strong>
                                    {totalElements}
                                </strong>{" "}
                                hóa đơn
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={
                                        currentPage <= 0
                                    }
                                    onClick={() =>
                                        setCurrentPage(
                                            (previous) =>
                                                Math.max(
                                                    0,
                                                    previous - 1,
                                                ),
                                        )
                                    }
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Trước
                                </button>

                                <span className="min-w-20 text-center text-sm font-semibold text-slate-600">
                  {totalPages === 0
                      ? 0
                      : currentPage + 1}
                                    /{totalPages}
                </span>

                                <button
                                    type="button"
                                    disabled={
                                        totalPages === 0 ||
                                        currentPage >=
                                        totalPages - 1
                                    }
                                    onClick={() =>
                                        setCurrentPage(
                                            (previous) =>
                                                Math.min(
                                                    totalPages - 1,
                                                    previous + 1,
                                                ),
                                        )
                                    }
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}