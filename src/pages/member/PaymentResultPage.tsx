import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import Card from "../../components/common/Card";

export default function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const status = searchParams.get("status");
    const code = searchParams.get("code");
    const paymentId = searchParams.get("paymentId");

    const success = status === "SUCCESS";

    return (
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
            <Card className="w-full p-8 text-center">
                {success ? (
                    <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
                ) : (
                    <XCircle className="mx-auto h-16 w-16 text-red-500" />
                )}

                <h1 className="mt-6 text-2xl font-black text-slate-900">
                    {success ? "Thanh toán thành công" : "Thanh toán thất bại"}
                </h1>

                <p className="mt-3 text-sm text-slate-500">
                    {success
                        ? "Gói tập của bạn đã được kích hoạt."
                        : `Giao dịch không thành công. Mã lỗi: ${code || "-"}`}
                </p>

                {paymentId && (
                    <p className="mt-2 text-xs text-slate-400">
                        Mã payment: {paymentId}
                    </p>
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