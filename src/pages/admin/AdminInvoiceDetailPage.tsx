import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ArrowLeft,
    Mail,
    Printer,
    RotateCcw,
    XCircle,
} from "lucide-react";

import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import InvoiceDocument from "../../components/invoice/InvoiceDocument";

import { invoiceService } from "../../services/invoiceService";
import { paymentService } from "../../services/paymentService";
import { showAlert } from "../../utils/alert";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ROUTES } from "../../config/routes";

import type {
    Invoice,
    InvoiceAuditLog,
    InvoiceHistory,
    InvoicePayment,
    InvoiceStatus,
} from "../../types/invoice.type";

type BadgeVariant =
    | "success"
    | "warning"
    | "danger"
    | "default";

function getStatusLabel(
    status: InvoiceStatus,
): string {
    switch (status) {
        case "UNPAID":
            return "Chưa thanh toán";

        case "PAID":
            return "Đã thanh toán";

        case "CANCELLED":
            return "Đã hủy";

        case "REFUNDED":
            return "Đã hoàn tiền";

        default:
            return status;
    }
}

function getStatusVariant(
    status: InvoiceStatus,
): BadgeVariant {
    switch (status) {
        case "PAID":
            return "success";

        case "UNPAID":
            return "warning";

        case "CANCELLED":
            return "danger";

        case "REFUNDED":
            return "default";

        default:
            return "default";
    }
}

export default function AdminInvoiceDetailPage() {
    const { id } = useParams<{
        id: string;
    }>();

    const navigate = useNavigate();

    const invoiceId = Number(id);

    const [invoice, setInvoice] =
        useState<Invoice | null>(null);

    const [payments, setPayments] =
        useState<InvoicePayment[]>([]);

    const [histories, setHistories] =
        useState<InvoiceHistory[]>([]);

    const [auditLogs, setAuditLogs] =
        useState<InvoiceAuditLog[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [actionLoading, setActionLoading] =
        useState(false);

    const loadData = useCallback(
        async (): Promise<void> => {
            if (
                !Number.isInteger(invoiceId) ||
                invoiceId <= 0
            ) {
                setInvoice(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const results =
                    await Promise.allSettled([
                        invoiceService.getAdminInvoiceById(
                            invoiceId,
                        ),

                        invoiceService.getInvoicePayments(
                            invoiceId,
                            {
                                page: 0,
                                size: 50,
                            },
                        ),

                        invoiceService.getInvoiceHistoryForAdmin(
                            invoiceId,
                        ),

                        invoiceService.getInvoiceAuditLogs(
                            invoiceId,
                        ),
                    ]);

                const invoiceResult = results[0];

                if (
                    invoiceResult.status ===
                    "rejected"
                ) {
                    throw invoiceResult.reason;
                }

                setInvoice(invoiceResult.value);

                const paymentResult = results[1];

                setPayments(
                    paymentResult.status ===
                    "fulfilled"
                        ? paymentResult.value.content
                        : [],
                );

                const historyResult = results[2];

                setHistories(
                    historyResult.status ===
                    "fulfilled"
                        ? historyResult.value
                        : [],
                );

                const auditResult = results[3];

                setAuditLogs(
                    auditResult.status ===
                    "fulfilled"
                        ? auditResult.value
                        : [],
                );
            } catch (error: unknown) {
                console.error(
                    "LOAD_ADMIN_INVOICE_DETAIL_ERROR:",
                    error,
                );

                setInvoice(null);
                setPayments([]);
                setHistories([]);
                setAuditLogs([]);

                await showAlert.error(
                    "Không thể tải hóa đơn",
                    getApiErrorMessage(error),
                );
            } finally {
                setLoading(false);
            }
        },
        [invoiceId],
    );

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleCancel =
        async (): Promise<void> => {
            if (
                !invoice ||
                invoice.status !== "UNPAID" ||
                actionLoading
            ) {
                return;
            }

            const result =
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

                        showCancelButton: true,

                        confirmButtonText:
                            "Xác nhận hủy",

                        cancelButtonText: "Đóng",

                        inputValidator: (value) => {
                            if (
                                !value ||
                                !String(value).trim()
                            ) {
                                return "Vui lòng nhập lý do hủy.";
                            }

                            return undefined;
                        },
                    },
                );

            if (!result.isConfirmed) {
                return;
            }

            const reason = String(
                result.value ?? "",
            ).trim();

            if (!reason) {
                return;
            }

            try {
                setActionLoading(true);

                await invoiceService.cancelInvoice(
                    invoice.id,
                    reason,
                );

                await showAlert.success(
                    "Thành công",
                    "Đã hủy hóa đơn.",
                );

                await loadData();
            } catch (error: unknown) {
                console.error(
                    "CANCEL_INVOICE_ERROR:",
                    error,
                );

                await showAlert.error(
                    "Không thể hủy hóa đơn",
                    getApiErrorMessage(error),
                );
            } finally {
                setActionLoading(false);
            }
        };

    const handleOfflinePayment =
        async (): Promise<void> => {
            if (
                !invoice ||
                invoice.status !== "UNPAID" ||
                actionLoading
            ) {
                return;
            }

            const result =
                await showAlert.info(
                    "Xác nhận thanh toán thủ công",
                    "Gói tập sẽ được kích hoạt ngay sau khi xác nhận.",
                    {
                        html: `
                            <div class="text-left mt-4 space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                                    <select id="swal-payment-method" class="w-full rounded-md border-gray-300 shadow-sm focus:border-fit-primary focus:ring-fit-primary sm:text-sm p-2 border">
                                        <option value="CASH">Tiền mặt</option>
                                        <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                                    <textarea id="swal-payment-note" class="w-full rounded-md border-gray-300 shadow-sm focus:border-fit-primary focus:ring-fit-primary sm:text-sm p-2 border" rows="3" placeholder="Nhập mã giao dịch hoặc ghi chú..."></textarea>
                                </div>
                            </div>
                        `,
                        showCancelButton: true,
                        confirmButtonText: "Xác nhận đã nhận tiền",
                        cancelButtonText: "Hủy",
                        preConfirm: () => {
                            const methodEl = document.getElementById("swal-payment-method") as HTMLSelectElement;
                            const noteEl = document.getElementById("swal-payment-note") as HTMLTextAreaElement;
                            return {
                                paymentMethod: methodEl.value as "CASH" | "BANK_TRANSFER",
                                note: noteEl.value
                            };
                        }
                    },
                );

            if (!result.isConfirmed || !result.value) {
                return;
            }

            try {
                setActionLoading(true);

                await paymentService.createOfflinePayment({
                    invoiceId: invoice.id,
                    paymentMethod: result.value.paymentMethod,
                    note: result.value.note
                });

                await showAlert.success(
                    "Thành công",
                    "Đã xác nhận thanh toán và kích hoạt gói tập.",
                );

                await loadData();
            } catch (error: unknown) {
                console.error(
                    "CREATE_OFFLINE_PAYMENT_ERROR:",
                    error,
                );

                await showAlert.error(
                    "Lỗi xác nhận thanh toán",
                    getApiErrorMessage(error),
                );
            } finally {
                setActionLoading(false);
            }
        };


    const handleRefund =
        async (): Promise<void> => {
            if (
                !invoice ||
                invoice.status !== "PAID" ||
                actionLoading
            ) {
                return;
            }

            const result =
                await showAlert.warning(
                    "Hoàn tiền hóa đơn",
                    "Giao dịch và gói tập liên quan cũng sẽ được cập nhật.",
                    {
                        input: "textarea",

                        inputLabel:
                            "Lý do hoàn tiền",

                        inputPlaceholder:
                            "Nhập lý do hoàn tiền...",

                        inputAttributes: {
                            maxlength: "500",
                        },

                        showCancelButton: true,

                        confirmButtonText:
                            "Xác nhận hoàn tiền",

                        cancelButtonText: "Đóng",

                        inputValidator: (value) => {
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

            if (!result.isConfirmed) {
                return;
            }

            const reason = String(
                result.value ?? "",
            ).trim();

            if (!reason) {
                return;
            }

            try {
                setActionLoading(true);

                await invoiceService.refundInvoice(
                    invoice.id,
                    reason,
                );

                await showAlert.success(
                    "Thành công",
                    "Đã hoàn tiền hóa đơn.",
                );

                await loadData();
            } catch (error: unknown) {
                console.error(
                    "REFUND_INVOICE_ERROR:",
                    error,
                );

                await showAlert.error(
                    "Không thể hoàn tiền",
                    getApiErrorMessage(error),
                );
            } finally {
                setActionLoading(false);
            }
        };

    const handleEmail =
        async (): Promise<void> => {
            if (
                !invoice ||
                actionLoading
            ) {
                return;
            }

            const result =
                await showAlert.info(
                    "Gửi hóa đơn qua email",
                    undefined,
                    {
                        input: "email",

                        inputLabel:
                            "Email nhận hóa đơn",

                        inputValue:
                            invoice.memberEmail ?? "",

                        inputPlaceholder:
                            "email@example.com",

                        showCancelButton: true,

                        confirmButtonText:
                            "Gửi email",

                        cancelButtonText: "Đóng",
                    },
                );

            if (!result.isConfirmed) {
                return;
            }

            const email = String(
                result.value ?? "",
            ).trim();

            try {
                setActionLoading(true);

                await invoiceService
                    .emailInvoiceForAdmin(
                        invoice.id,
                        email || undefined,
                    );

                await showAlert.success(
                    "Đã gửi email",
                    "Hóa đơn đã được gửi thành công.",
                );

                await loadData();
            } catch (error: unknown) {
                console.error(
                    "EMAIL_INVOICE_ERROR:",
                    error,
                );

                await showAlert.error(
                    "Không thể gửi email",
                    getApiErrorMessage(error),
                );
            } finally {
                setActionLoading(false);
            }
        };

    if (loading) {
        return (
            <div className="flex h-72 items-center justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <Card className="mx-auto max-w-2xl p-8 text-center">
                <h1 className="text-xl font-black text-slate-900">
                    Không tìm thấy hóa đơn
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Hóa đơn không tồn tại hoặc
                    bạn không có quyền truy cập.
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            ROUTES.ADMIN_INVOICES,
                        )
                    }
                    className="mt-6 rounded-xl bg-fit-primary px-5 py-3 font-bold text-white"
                >
                    Quay lại danh sách
                </button>
            </Card>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="no-print">
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            ROUTES.ADMIN_INVOICES,
                        )
                    }
                    className="mb-4 flex items-center gap-2 font-semibold text-slate-500 hover:text-fit-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </button>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <PageHeader
                            title="Chi tiết hóa đơn"
                            description={
                                invoice.invoiceCode
                            }
                        />

                        <div className="mt-3">
                            <Badge
                                variant={getStatusVariant(
                                    invoice.status,
                                )}
                            >
                                {getStatusLabel(
                                    invoice.status,
                                )}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                void handleEmail()
                            }
                            disabled={actionLoading}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            <Mail className="h-4 w-4" />
                            Gửi email
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                window.print()
                            }
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                            <Printer className="h-4 w-4" />
                            In / Lưu PDF
                        </button>

                        {invoice.status ===
                            "UNPAID" && (
                                <>
                                <button
                                    type="button"
                                    onClick={() =>
                                        void handleOfflinePayment()
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    <Printer className="h-4 w-4" />
                                    Thanh toán Offline
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        void handleCancel()
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Hủy hóa đơn
                                </button>
                                </>
                            )}

                        {invoice.status ===
                            "PAID" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        void handleRefund()
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Hoàn tiền
                                </button>
                            )}
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden">
                <InvoiceDocument
                    invoice={invoice}
                />
            </Card>

            <div className="no-print grid gap-6 xl:grid-cols-3">
                <Card className="p-6">
                    <h2 className="text-lg font-black text-slate-900">
                        Thanh toán liên quan
                    </h2>

                    <div className="mt-5 space-y-4">
                        {payments.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                Chưa có giao dịch.
                            </p>
                        ) : (
                            payments.map(
                                (payment) => (
                                    <div
                                        key={payment.id}
                                        className="rounded-xl border border-slate-200 p-4"
                                    >
                                        <div className="flex justify-between gap-3">
                                            <div>
                                                <p className="font-mono text-sm font-bold">
                                                    {payment.paymentCode}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {payment.paymentMethod}
                                                </p>
                                            </div>

                                            <Badge
                                                variant={
                                                    payment.paymentStatus ===
                                                    "SUCCESS"
                                                        ? "success"
                                                        : payment.paymentStatus ===
                                                        "PENDING"
                                                            ? "warning"
                                                            : payment.paymentStatus ===
                                                            "FAILED"
                                                                ? "danger"
                                                                : "default"
                                                }
                                            >
                                                {
                                                    payment.paymentStatus
                                                }
                                            </Badge>
                                        </div>

                                        <p className="mt-3 font-bold text-fit-primary">
                                            {formatCurrency(
                                                payment.amount,
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {formatDate(
                                                payment.paidAt ??
                                                payment.createdAt,
                                            )}
                                        </p>
                                    </div>
                                ),
                            )
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-black text-slate-900">
                        Lịch sử trạng thái
                    </h2>

                    <div className="mt-5 space-y-5">
                        {histories.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                Chưa có lịch sử.
                            </p>
                        ) : (
                            histories.map(
                                (history) => (
                                    <div
                                        key={history.id}
                                        className="border-l-2 border-fit-primary pl-4"
                                    >
                                        <p className="font-bold">
                                            {history.action}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {history.oldStatus ??
                                                "-"}{" "}
                                            →{" "}
                                            {history.newStatus ??
                                                "-"}
                                        </p>

                                        {history.notes && (
                                            <p className="mt-2 text-sm text-slate-600">
                                                {history.notes}
                                            </p>
                                        )}

                                        <p className="mt-2 text-xs text-slate-400">
                                            {history.changedByName ??
                                                "SYSTEM"}{" "}
                                            ·{" "}
                                            {formatDate(
                                                history.createdAt,
                                            )}
                                        </p>
                                    </div>
                                ),
                            )
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-black text-slate-900">
                        Nhật ký thao tác
                    </h2>

                    <div className="mt-5 max-h-[500px] space-y-4 overflow-y-auto">
                        {auditLogs.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                Chưa có nhật ký.
                            </p>
                        ) : (
                            auditLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="rounded-xl bg-slate-50 p-4"
                                >
                                    <p className="font-bold">
                                        {log.action}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {log.actorName ??
                                            "SYSTEM"}
                                    </p>

                                    {log.description && (
                                        <p className="mt-2 text-sm text-slate-600">
                                            {log.description}
                                        </p>
                                    )}

                                    <p className="mt-2 text-xs text-slate-400">
                                        {formatDate(
                                            log.createdAt,
                                        )}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}