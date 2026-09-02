import type {
    Invoice,
} from "../../types/invoice.type";

import {
    formatCurrency,
} from "../../utils/formatCurrency";

import {
    formatDate,
} from "../../utils/formatDate";

interface InvoiceDocumentProps {
    invoice: Invoice;
}

function getStatusLabel(
    status: Invoice["status"],
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

function getStatusClassName(
    status: Invoice["status"],
): string {
    switch (status) {
        case "PAID":
            return "bg-emerald-100 text-emerald-700";

        case "UNPAID":
            return "bg-amber-100 text-amber-700";

        case "CANCELLED":
            return "bg-red-100 text-red-700";

        case "REFUNDED":
            return "bg-slate-200 text-slate-700";

        default:
            return "bg-slate-100 text-slate-700";
    }
}

export default function InvoiceDocument({
                                            invoice,
                                        }: InvoiceDocumentProps) {
    return (
        <article
            id="invoice-document"
            className="invoice-print-area mx-auto w-full max-w-4xl bg-white p-6 text-slate-900 sm:p-8 lg:p-10"
        >
            <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-3xl font-black tracking-tight text-fit-primary">
                        FITLIFE
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-500">
                        Hệ thống quản lý phòng gym và hỗ trợ sức khỏe
                    </p>

                    <div className="mt-4 space-y-1 text-sm text-slate-500">
                        <p>Hotline: 1900 1234</p>
                        <p>Email: support@fitlife.local</p>
                    </div>
                </div>

                <div className="text-left sm:text-right">
                    <h1 className="text-2xl font-black uppercase tracking-wide text-slate-900">
                        Hóa đơn
                    </h1>

                    <p className="mt-2 font-mono text-sm font-bold text-fit-primary">
                        {invoice.invoiceCode}
                    </p>

                    <div className="mt-3">
            <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClassName(
                    invoice.status,
                )}`}
            >
              {getStatusLabel(
                  invoice.status,
              )}
            </span>
                    </div>
                </div>
            </header>

            <section className="grid gap-8 border-b border-slate-200 py-8 md:grid-cols-2">
                <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Thông tin hội viên
                    </h2>

                    <div className="mt-4 space-y-2 text-sm">
                        <p className="text-lg font-bold text-slate-900">
                            {invoice.memberName ||
                                "Hội viên FitLife"}
                        </p>

                        <p>
              <span className="font-semibold text-slate-500">
                Mã hội viên:
              </span>{" "}
                            {invoice.memberCode ||
                                `#${invoice.memberId}`}
                        </p>

                        {invoice.memberEmail && (
                            <p>
                <span className="font-semibold text-slate-500">
                  Email:
                </span>{" "}
                                {invoice.memberEmail}
                            </p>
                        )}

                        {invoice.memberPhone && (
                            <p>
                <span className="font-semibold text-slate-500">
                  Điện thoại:
                </span>{" "}
                                {invoice.memberPhone}
                            </p>
                        )}
                    </div>
                </div>

                <div className="md:text-right">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Thông tin hóa đơn
                    </h2>

                    <div className="mt-4 space-y-2 text-sm">
                        <p>
              <span className="font-semibold text-slate-500">
                Ngày phát hành:
              </span>{" "}
                            {formatDate(
                                invoice.issuedAt ||
                                invoice.createdAt,
                            )}
                        </p>

                        {invoice.paidAt && (
                            <p>
                <span className="font-semibold text-slate-500">
                  Ngày thanh toán:
                </span>{" "}
                                {formatDate(
                                    invoice.paidAt,
                                )}
                            </p>
                        )}

                        {invoice.cancelledAt && (
                            <p>
                <span className="font-semibold text-slate-500">
                  Ngày hủy:
                </span>{" "}
                                {formatDate(
                                    invoice.cancelledAt,
                                )}
                            </p>
                        )}

                        {invoice.refundedAt && (
                            <p>
                <span className="font-semibold text-slate-500">
                  Ngày hoàn tiền:
                </span>{" "}
                                {formatDate(
                                    invoice.refundedAt,
                                )}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section className="py-8">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-bold text-slate-600">
                                Nội dung
                            </th>

                            <th className="px-4 py-3 text-left font-bold text-slate-600">
                                Thời hạn
                            </th>

                            <th className="px-4 py-3 text-right font-bold text-slate-600">
                                Thành tiền
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        <tr className="border-t border-slate-200">
                            <td className="px-4 py-5">
                                <p className="font-bold text-slate-900">
                                    {invoice.packageName ||
                                        "Gói tập FitLife"}
                                </p>

                                {invoice.subscriptionId && (
                                    <p className="mt-1 text-xs text-slate-400">
                                        Subscription #
                                        {invoice.subscriptionId}
                                    </p>
                                )}
                            </td>

                            <td className="px-4 py-5 text-slate-600">
                                {invoice.packageDurationName ||
                                    "-"}
                            </td>

                            <td className="px-4 py-5 text-right font-bold text-slate-900">
                                {formatCurrency(
                                    invoice.totalAmount ?? 0,
                                )}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="ml-auto w-full max-w-md border-t border-slate-200 pt-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Giá gốc
            </span>

                        <span className="font-semibold text-slate-800">
              {formatCurrency(
                  invoice.totalAmount ?? 0,
              )}
            </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Giảm giá
            </span>

                        <span className="font-semibold text-emerald-600">
              -
                            {formatCurrency(
                                invoice.discountAmount ?? 0,
                            )}
            </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-base font-black text-slate-900">
              Tổng thanh toán
            </span>

                        <span className="text-2xl font-black text-fit-primary">
              {formatCurrency(
                  invoice.finalAmount ?? 0,
              )}
            </span>
                    </div>
                </div>
            </section>

            {(invoice.note ||
                invoice.cancelReason ||
                invoice.refundReason) && (
                <section className="mt-8 rounded-xl bg-slate-50 p-5">
                    <h2 className="text-sm font-black uppercase tracking-wide text-slate-600">
                        Ghi chú
                    </h2>

                    <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                        {invoice.note && (
                            <p>{invoice.note}</p>
                        )}

                        {invoice.cancelReason && (
                            <p>
                                <strong className="text-red-600">
                                    Lý do hủy:
                                </strong>{" "}
                                {invoice.cancelReason}
                            </p>
                        )}

                        {invoice.refundReason && (
                            <p>
                                <strong className="text-amber-600">
                                    Lý do hoàn tiền:
                                </strong>{" "}
                                {invoice.refundReason}
                            </p>
                        )}
                    </div>
                </section>
            )}

            <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-xs leading-5 text-slate-400">
                <p>
                    Hóa đơn này được tạo tự động bởi hệ thống FitLife.
                </p>

                <p>
                    Cảm ơn bạn đã sử dụng dịch vụ của FitLife.
                </p>
            </footer>
        </article>
    );
}