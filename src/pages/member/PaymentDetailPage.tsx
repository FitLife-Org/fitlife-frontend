import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Loader2,
} from "lucide-react";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import { showAlert } from "../../utils/alert";
import { formatCurrency } from "../../utils/formatCurrency";
import { paymentService } from "../../features/payment/services/paymentService";
import { validatePaymentForm } from "../../features/payment/utils/paymentValidator";
import { usePaymentDetail, MemberPaymentMethod } from "../../features/payment/hooks/usePaymentHooks";

export default function PaymentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoice, loading } = usePaymentDetail(id);

  const [paymentMethod, setPaymentMethod] = useState<MemberPaymentMethod>("BANK_TRANSFER");
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const handlePayment = async (): Promise<void> => {
    if (!invoice) return;

    const payload = {
      invoiceId: invoice.id,
      paymentMethod,
      note: note.trim() || undefined,
    };

    if (!validatePaymentForm(payload)) return;

    try {
      setProcessing(true);

      if (paymentMethod === "VNPAY") {
        const result = await paymentService.createVnpayPaymentUrl({ invoiceId: invoice.id });
        window.location.href = result.paymentUrl;
        return;
      }

      await paymentService.createPayment(payload);
      showAlert.success(
        "Tạo yêu cầu thanh toán thành công",
        "Vui lòng chờ Admin xác nhận thanh toán."
      );
      navigate("/member/payment");
    } catch (error: unknown) {
      console.error("CREATE_PAYMENT_ERROR:", error);
      let message = "Có lỗi xảy ra khi tạo yêu cầu thanh toán.";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      showAlert.error("Lỗi", message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">
            Đang tải dữ liệu hóa đơn...
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-black text-slate-900">
            Không tìm thấy hóa đơn
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Hóa đơn không tồn tại hoặc không thuộc tài khoản của bạn.
          </p>
          <button
            onClick={() => navigate("/member/payment")}
            className="mt-6 rounded-xl bg-fit-primary px-5 py-3 font-bold text-white transition-all hover:bg-blue-600"
          >
            Xem lịch sử thanh toán
          </button>
        </Card>
      </div>
    );
  }

  const payableAmount = invoice.finalAmount ?? invoice.amount ?? 0;
  const isPaid = invoice.status === "PAID";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-2 flex items-center gap-2 font-medium text-fit-muted transition-colors hover:text-fit-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </button>

      <PageHeader
        title="Thanh toán hóa đơn"
        description={`Mã hóa đơn: ${invoice.invoiceCode || `INV-${invoice.id}`}`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card className="p-6 md:p-8">
            <h2 className="mb-6 text-xl font-bold text-fit-text">
              Chi tiết hóa đơn
            </h2>

            <div className="space-y-4 divide-y divide-slate-100">
              <div className="flex justify-between pb-4">
                <span className="font-medium text-slate-500">Mã hóa đơn</span>
                <span className="font-bold text-slate-800">
                  {invoice.invoiceCode || `INV-${invoice.id}`}
                </span>
              </div>

              <div className="flex justify-between py-4">
                <span className="font-medium text-slate-500">Hội viên</span>
                <span className="font-bold text-slate-800">
                  {invoice.memberName || "-"}
                </span>
              </div>

              <div className="flex justify-between py-4">
                <span className="font-medium text-slate-500">Gói tập</span>
                <span className="font-bold text-slate-800">
                  {invoice.packageName || "Đăng ký gói tập"}
                </span>
              </div>

              <div className="flex justify-between py-4">
                <span className="font-medium text-slate-500">Trạng thái</span>
                <Badge
                  variant={isPaid ? "success" : "warning"}
                  className="inline-block"
                >
                  {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                </Badge>
              </div>

              {typeof invoice.totalAmount === "number" && (
                <div className="flex justify-between py-4">
                  <span className="font-medium text-slate-500">Tạm tính</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(invoice.totalAmount)}
                  </span>
                </div>
              )}

              {typeof invoice.discountAmount === "number" &&
                invoice.discountAmount > 0 && (
                  <div className="flex justify-between py-4">
                    <span className="font-medium text-slate-500">Giảm giá</span>
                    <span className="font-bold text-emerald-600">
                      -{formatCurrency(invoice.discountAmount)}
                    </span>
                  </div>
                )}
            </div>
          </Card>

          {!isPaid && (
            <Card className="p-6 md:p-8">
              <h2 className="mb-4 text-xl font-bold text-fit-text">
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === "BANK_TRANSFER"
                      ? "border-fit-primary bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="BANK_TRANSFER"
                      checked={paymentMethod === "BANK_TRANSFER"}
                      onChange={() => setPaymentMethod("BANK_TRANSFER")}
                      className="h-4 w-4 text-fit-primary focus:ring-fit-primary"
                    />
                    <div>
                      <span className="font-bold text-slate-800">
                        Chuyển khoản ngân hàng
                      </span>
                      <p className="mt-1 text-xs text-slate-500">
                        Tạo yêu cầu thanh toán và chờ Admin/Staff xác nhận.
                      </p>
                    </div>
                  </div>
                  <CreditCard className="h-6 w-6 text-fit-primary" />
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === "CASH"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="CASH"
                      checked={paymentMethod === "CASH"}
                      onChange={() => setPaymentMethod("CASH")}
                      className="h-4 w-4 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800">
                        Tiền mặt tại quầy
                      </span>
                      <p className="mt-1 text-xs text-slate-500">
                        Thanh toán trực tiếp tại quầy lễ tân.
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-emerald-600">CASH</span>
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === "VNPAY"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="VNPAY"
                      checked={paymentMethod === "VNPAY"}
                      onChange={() => setPaymentMethod("VNPAY")}
                      className="h-4 w-4 text-blue-500 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800">
                        Thanh toán qua VNPay
                      </span>
                      <p className="mt-1 text-xs text-slate-500">
                        Chuyển hướng đến cổng thanh toán an toàn VNPay.
                      </p>
                    </div>
                  </div>
                  <img
                    src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png"
                    alt="VNPay"
                    className="h-6 object-contain grayscale-0"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <label className="text-sm font-semibold text-slate-700">
                  Ghi chú thanh toán
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm focus:border-fit-primary focus:outline-none focus:ring-1 focus:ring-fit-primary"
                  rows={2}
                  placeholder="VD: Đã chuyển khoản, vui lòng kiểm tra..."
                />
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-24 border-none bg-gradient-to-b from-slate-900 to-slate-800 p-6 text-white shadow-xl">
            <h3 className="mb-4 text-lg font-bold">Tổng cộng</h3>

            <div className="mb-8 flex items-end justify-between">
              <span className="text-slate-400">Cần thanh toán</span>
              <span className="text-3xl font-black text-emerald-400">
                {formatCurrency(payableAmount)}
              </span>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing || isPaid}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-fit-primary py-4 font-bold text-white transition-all hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : isPaid ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Đã thanh toán
                </>
              ) : (
                <>
                  {paymentMethod === "VNPAY" ? "Thanh toán bằng VNPay" : "Tạo yêu cầu thanh toán"}
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>

            <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-slate-400">
              <AlertCircle className="h-3 w-3" />
              Gói tập chỉ được kích hoạt sau khi Admin xác nhận.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
