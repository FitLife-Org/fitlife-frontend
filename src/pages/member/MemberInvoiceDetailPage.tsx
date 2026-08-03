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
    CreditCard,
    Mail,
    Printer,
} from "lucide-react";

import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import InvoiceDocument from "../../components/invoice/InvoiceDocument";

import { invoiceService } from "../../services/invoiceService";
import { showAlert } from "../../utils/alert";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/formatDate";
import { ROUTES } from "../../config/routes";

import type {
    Invoice,
    InvoiceHistory,
} from "../../types/invoice.type";

export default function MemberInvoiceDetailPage() {
    const { id } = useParams<{
        id: string;
    }>();

    const navigate = useNavigate();

    const invoiceId = Number(id);

    const [invoice, setInvoice] =
        useState<Invoice | null>(null);

    const [histories, setHistories] =
        useState<InvoiceHistory[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [emailing, setEmailing] =
        useState(false);

    const loadData = useCallback(
        async (): Promise<void> => {
            if (
                !Number.isInteger(invoiceId) ||
                invoiceId <= 0
            ) {
                setInvoice(null);
                setHistories([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const results =
                    await Promise.allSettled([
                        invoiceService
                            .getMyInvoiceById(
                                invoiceId,
                            ),

                        invoiceService
                            .getMyInvoiceHistory(
                                invoiceId,
                            ),
                    ]);

                const invoiceResult =
                    results[0];

                if (
                    invoiceResult.status ===
                    "rejected"
                ) {
                    throw invoiceResult.reason;
                }

                setInvoice(
                    invoiceResult.value,
                );

                const historyResult =
                    results[1];

                setHistories(
                    historyResult.status ===
                    "fulfilled"
                        ? historyResult.value
                        : [],
                );
            } catch (error: unknown) {
                console.error(
                    "LOAD_MEMBER_INVOICE_DETAIL_ERROR:",
                    error,
                );

                setInvoice(null);
                setHistories([]);

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

    const handleEmail =
        async (): Promise<void> => {
            if (
                !invoice ||
                emailing
            ) {
                return;
            }

            const result =
                await showAlert.confirm(
                    "Gửi hóa đơn qua email?",
                    "Hóa đơn sẽ được gửi tới email của tài khoản đang đăng nhập.",
                    {
                        confirmButtonText:
                            "Gửi email",

                        cancelButtonText: "Hủy",
                    },
                );

            if (!result.isConfirmed) {
                return;
            }

            try {
                setEmailing(true);

                await invoiceService
                    .emailMyInvoice(
                        invoice.id,
                    );

                await showAlert.success(
                    "Đã gửi email",
                    "Hóa đơn đã được gửi tới email của bạn.",
                );

                await loadData();
            } catch (error: unknown) {
                console.error(
                    "EMAIL_MY_INVOICE_ERROR:",
                    error,
                );

                await showAlert.error(
                    "Không thể gửi email",
                    getApiErrorMessage(error),
                );
            } finally {
                setEmailing(false);
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
                    không thuộc tài khoản của bạn.
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            ROUTES.MEMBER_INVOICES,
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
                            ROUTES.MEMBER_INVOICES,
                        )
                    }
                    className="mb-4 flex items-center gap-2 font-semibold text-slate-500 hover:text-fit-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại hóa đơn
                </button>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <PageHeader
                        title="Chi tiết hóa đơn"
                        description={
                            invoice.invoiceCode
                        }
                    />

                    <div className="flex flex-wrap gap-2">
                        {invoice.status ===
                            "UNPAID" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/member/payment/${invoice.id}`,
                                        )
                                    }
                                    className="flex items-center gap-2 rounded-xl bg-fit-primary px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Thanh toán
                                </button>
                            )}

                        <button
                            type="button"
                            onClick={() =>
                                void handleEmail()
                            }
                            disabled={emailing}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            <Mail className="h-4 w-4" />

                            {emailing
                                ? "Đang gửi..."
                                : "Gửi email"}
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
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden">
                <InvoiceDocument
                    invoice={invoice}
                />
            </Card>

            <Card className="no-print p-6">
                <h2 className="text-lg font-black text-slate-900">
                    Lịch sử hóa đơn
                </h2>

                <div className="mt-6 space-y-5">
                    {histories.length === 0 ? (
                        <p className="text-sm text-slate-500">
                            Chưa có lịch sử hóa đơn.
                        </p>
                    ) : (
                        histories.map(
                            (history, index) => (
                                <div
                                    key={history.id}
                                    className="flex gap-4"
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="h-3 w-3 rounded-full bg-fit-primary" />

                                        {index <
                                            histories.length -
                                            1 && (
                                                <span className="h-full min-h-12 w-px bg-slate-200" />
                                            )}
                                    </div>

                                    <div className="pb-5">
                                        <p className="font-bold text-slate-800">
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
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {history.notes}
                                            </p>
                                        )}

                                        <p className="mt-2 text-xs text-slate-400">
                                            {formatDate(
                                                history.createdAt,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ),
                        )
                    )}
                </div>
            </Card>
        </div>
    );
}