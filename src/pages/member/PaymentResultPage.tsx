import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import Card from "../../components/common/Card";
import { invoiceService } from "../../services/invoiceService";
import type { Invoice } from "../../types/invoice.type";

export default function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const status = searchParams.get("status");
    const code = searchParams.get("code");
    const paymentId = searchParams.get("paymentId");

    const [invoice, setInvoice] = useState<Invoice | null>(null);

    const success = status === "SUCCESS";
    const isCancelled = status === "FAILED" && code === "24";

    useEffect(() => {
        if (success && paymentId) {
            invoiceService.getInvoiceByPaymentId(paymentId)
                .then(setInvoice)
                .catch(console.error); // Silently fail if invoice not generated yet or missing
        }
    }, [success, paymentId]);

    return (
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
            <Card className="w-full p-8 text-center">
                {success ? (
                    <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
                ) : isCancelled ? (
                    <XCircle className="mx-auto h-16 w-16 text-amber-500" />
                ) : (
                    <XCircle className="mx-auto h-16 w-16 text-red-500" />
                )}

                <h1 className="mt-6 text-2xl font-black text-slate-900">
                    {success ? "Thanh toán thành công" : isCancelled ? "Đã hủy thanh toán" : "Thanh toán thất bại"}
                </h1>

                <p className="mt-3 text-sm text-slate-500">
                    {success
                        ? "Giao dịch của bạn đã được ghi nhận. Hóa đơn sẽ được sinh tự động."
                        : isCancelled 
                            ? "Bạn đã hủy giao dịch thanh toán."
                            : `Giao dịch không thành công. Mã lỗi: ${code || "-"}`}
                </p>

                {paymentId && !invoice && (
                    <p className="mt-2 text-xs text-slate-400">
                        Mã payment: {paymentId}
                    </p>
                )}

                {invoice && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-slate-600">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            <span className="font-semibold">Đã tạo hóa đơn #{invoice.id}</span>
                        </div>
                        <Link 
                            to={`/member/invoices/${invoice.id}`}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
                        >
                            Xem chi tiết hóa đơn
                        </Link>
                    </div>
                )}

                <div className="mt-8 flex justify-center gap-3">
                    <button
                        onClick={() => navigate("/member/subscription")}
                        className="rounded-xl bg-fit-primary px-5 py-3 font-bold text-white hover:bg-blue-600"
                    >
                        Xem gói tập
                    </button>

                    <button
                        onClick={() => navigate("/member/payment")}
                        className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
                    >
                        Lịch sử thanh toán
                    </button>
                </div>
            </Card>
        </div>
    );
}