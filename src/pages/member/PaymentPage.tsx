import { useEffect, useState } from "react";
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
import { invoiceService } from "../../services/invoiceService";
import { paymentService } from "../../services/paymentService";
import type { Invoice } from "../../types/invoice.type";
import type { PaymentResult } from "../../types/payment.type";
import { validatePaymentForm } from "../../utils/validators/paymentValidator";

type MemberPaymentMethod = "CASH" | "BANK_TRANSFER";

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<PaymentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] =
      useState<MemberPaymentMethod>("BANK_TRANSFER");
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);

        if (id) {
          const invoiceData = await invoiceService.getInvoiceById(Number(id));
          setInvoice(invoiceData);
          return;
        }

        const paymentData = await paymentService.getMyPayments();
        setPayments(paymentData);
      } catch (error: unknown) {
        console.error("LOAD_MEMBER_PAYMENT_PAGE_ERROR:", error);

        let message = "Không thể tải dữ liệu thanh toán.";

        if (axios.isAxiosError(error)) {
          message = error.response?.data?.message || message;
        }

        showAlert.error("Lỗi", message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getPaymentStatus = (payment: PaymentResult): string => {
    return payment.paymentStatus ?? payment.status ?? "PENDING";
  };

  const getStatusBadgeVariant = (
      status: string
  ): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case "SUCCESS":
        return "success";
      case "FAILED":
      case "CANCELLED":
      case "REFUNDED":
        return "danger";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "SUCCESS":
        return "Thành công";
      case "PENDING":
        return "Chờ xác nhận";
      case "FAILED":
        return "Thất bại";
      case "CANCELLED":
        return "Đã hủy";
      case "REFUNDED":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  const handlePayment = async (): Promise<void> => {
    if (!invoice) {
      return;
    }

    const payload = {
      invoiceId: invoice.id,
      paymentMethod,
      note: note.trim() || undefined,
    };

    if (!validatePaymentForm(payload)) {
      return;
    }

    try {
      setProcessing(true);

      await paymentService.createPayment(payload);

      showAlert.success(
          "Tạo yêu cầu thanh toán thành công",
          "Vui lòng chờ Admin/Staff xác nhận thanh toán."
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
            <Loader2 className="h-8 w-8 animate-spin text-fit-primary" />
            <p className="text-sm font-medium text-slate-500">
              Đang tải dữ liệu thanh toán...
            </p>
          </div>
        </div>
    );
  }

  if (id && !invoice) {
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
                className="mt-6 rounded-xl bg-fit-primary px-5 py-3 font-bold text-white"
            >
              Xem lịch sử thanh toán
            </button>
          </Card>
        </div>
    );
  }

  if (id && invoice) {
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
                      <span className="font-medium text-slate-500">
                        Giảm giá
                      </span>
                            <span className="font-bold text-emerald-600">
                        -{formatCurrency(invoice.discountAmount)}
                      </span>
                          </div>
                      )}

                  <div className="flex justify-between py-4">
                  <span className="font-medium text-slate-500">
                    Cần thanh toán
                  </span>
                    <span className="text-2xl font-black text-fit-primary">
                    {formatCurrency(payableAmount)}
                  </span>
                  </div>
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
                        Đang tạo yêu cầu...
                      </>
                  ) : isPaid ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Đã thanh toán
                      </>
                  ) : (
                      <>
                        Tạo yêu cầu thanh toán
                        <ChevronRight className="h-5 w-5" />
                      </>
                  )}
                </button>

                <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-slate-400">
                  <AlertCircle className="h-3 w-3" />
                  Gói tập chỉ được kích hoạt sau khi Admin/Staff xác nhận.
                </p>
              </Card>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="mx-auto max-w-5xl space-y-6 pb-10">
        <PageHeader
            title="Giao dịch của tôi"
            description="Quản lý lịch sử thanh toán và hóa đơn"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="p-6 md:p-8">
              <h2 className="mb-6 text-xl font-bold text-fit-text">
                Lịch sử giao dịch
              </h2>

              {payments.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <CreditCard className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-slate-700">
                      Chưa có giao dịch nào
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Các giao dịch thanh toán của bạn sẽ hiện ở đây.
                    </p>
                  </div>
              ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => {
                      const status = getPaymentStatus(payment);

                      return (
                          <div
                              key={payment.id}
                              className="flex items-center justify-between rounded-2xl border border-fit-border p-4 transition-colors hover:border-fit-primary/50"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                {status === "SUCCESS" ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                ) : (
                                    <CreditCard className="h-6 w-6" />
                                )}
                              </div>

                              <div>
                                <p className="font-bold text-slate-900">
                                  Thanh toán hóa đơn #
                                  {payment.invoiceCode || payment.invoiceId}
                                </p>

                                <div className="mt-1 flex items-center gap-2">
                                  <p className="text-xs text-slate-500">
                                    {payment.createdAt || "Vừa xong"}
                                  </p>
                                  <span className="text-xs text-slate-300">•</span>
                                  <p className="text-xs font-medium text-slate-500">
                                    {payment.paymentMethod}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-black text-slate-900">
                                {formatCurrency(payment.amount)}
                              </p>

                              <Badge
                                  variant={getStatusBadgeVariant(status)}
                                  className="mt-1 inline-block"
                              >
                                {getStatusLabel(status)}
                              </Badge>
                            </div>
                          </div>
                      );
                    })}
                  </div>
              )}
            </Card>
          </div>

          <div>
            <Card className="sticky top-24 p-6 md:p-8">
              <p className="font-medium text-slate-500">
                Cần hỗ trợ thanh toán?
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Nếu bạn gặp vấn đề trong quá trình thanh toán, vui lòng liên hệ lễ
                tân tại cơ sở hoặc gọi hotline hỗ trợ.
              </p>

              <div className="mt-6 rounded-xl bg-slate-100 p-4">
                <p className="text-sm font-bold text-slate-800">
                  Hotline: 1900 1234
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Hoạt động từ 6:00 - 22:00
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
  );
}