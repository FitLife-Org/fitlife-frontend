import {
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axios from "axios";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";

import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";

import {
  showAlert,
} from "../../utils/alert";

import {
  formatCurrency,
} from "../../utils/formatCurrency";

import {
  paymentService,
} from "../../services/paymentService";

import {
  validatePaymentForm,
} from "../../utils/validators/paymentValidator";

import {
  usePaymentDetail,
  type MemberPaymentMethod,
} from "../../hooks/usePaymentHooks";

import {
  ROUTES,
} from "../../config/routes";

import type {
  InvoiceStatus,
} from "../../types/invoice.type";

type BadgeVariant =
    | "success"
    | "warning"
    | "danger"
    | "default";

function getInvoiceStatusLabel(
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

function getInvoiceStatusVariant(
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

function getApiErrorMessage(
    error: unknown,
    fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const responseData =
        error.response?.data as
            | {
          message?: string;
        }
            | undefined;

    return (
        responseData?.message ||
        fallback
    );
  }

  if (
      error instanceof Error &&
      error.message
  ) {
    return error.message;
  }

  return fallback;
}

export default function PaymentDetailPage() {
  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const navigate =
      useNavigate();

  const {
    invoice,
    loading,
  } = usePaymentDetail(id);

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
      useState<MemberPaymentMethod>(
          "BANK_TRANSFER",
      );

  const [
    note,
    setNote,
  ] = useState("");

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const handlePayment =
      async (): Promise<void> => {
        if (
            !invoice ||
            processing
        ) {
          return;
        }

        if (
            invoice.status !==
            "UNPAID"
        ) {
          await showAlert.warning(
              "Không thể thanh toán",
              "Chỉ hóa đơn chưa thanh toán mới có thể tạo giao dịch.",
          );

          return;
        }

        const payload = {
          invoiceId:
          invoice.id,

          paymentMethod,

          note:
              note.trim() ||
              undefined,
        };

        if (
            !validatePaymentForm(
                payload,
            )
        ) {
          return;
        }

        try {
          setProcessing(true);

          if (
              paymentMethod ===
              "VNPAY"
          ) {
            setProcessing(true);
            const result =
                await paymentService
                    .createVnpayPaymentUrl({
                      invoiceId:
                      invoice.id,
                    });

            if (
                !result.paymentUrl
            ) {
              throw new Error(
                  "Máy chủ không trả về đường dẫn thanh toán VNPay.",
              );
            }

            window.location.assign(
                result.paymentUrl,
            );
            return;
          }

          // For CASH and BANK_TRANSFER, we do not call the API because members cannot create offline payments directly.
          // Staff will create the offline payment via /admin/payments/offline
          await showAlert.success(
              "Hướng dẫn thanh toán",
              paymentMethod ===
              "CASH"
                  ? "Vui lòng thanh toán trực tiếp tại quầy lễ tân để được xác nhận."
                  : "Vui lòng hoàn tất chuyển khoản và liên hệ nhân viên tại quầy để được xác nhận.",
          );

          navigate(
              ROUTES.MEMBER_PAYMENT,
          );
        } catch (
            error: unknown
            ) {
          console.error(
              "CREATE_PAYMENT_ERROR:",
              error,
          );

          await showAlert.error(
              "Không thể tạo thanh toán",
              getApiErrorMessage(
                  error,
                  "Có lỗi xảy ra khi tạo yêu cầu thanh toán.",
              ),
          );
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
            <XCircle className="mx-auto h-14 w-14 text-red-400" />

            <h2 className="mt-5 text-xl font-black text-slate-900">
              Không tìm thấy hóa đơn
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Hóa đơn không tồn tại
              hoặc không thuộc tài
              khoản của bạn.
            </p>

            <button
                type="button"
                onClick={() => {
                  navigate(
                      ROUTES.MEMBER_PAYMENT,
                  );
                }}
                className="mt-6 rounded-xl bg-fit-primary px-5 py-3 font-bold text-white transition-all hover:opacity-90"
            >
              Xem lịch sử thanh toán
            </button>
          </Card>
        </div>
    );
  }

  const payableAmount =
      invoice.finalAmount ?? 0;

  const canPay =
      invoice.status ===
      "UNPAID";

  const isPaid =
      invoice.status ===
      "PAID";

  const isCancelled =
      invoice.status ===
      "CANCELLED";

  const isRefunded =
      invoice.status ===
      "REFUNDED";

  return (
      <div className="mx-auto max-w-4xl space-y-6 pb-10">
        <button
            type="button"
            onClick={() => {
              navigate(-1);
            }}
            className="flex items-center gap-2 font-medium text-fit-muted transition-colors hover:text-fit-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        <PageHeader
            title="Thanh toán hóa đơn"
            description={`Mã hóa đơn: ${invoice.invoiceCode}`}
        />

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Card className="p-6 md:p-8">
              <h2 className="mb-6 text-xl font-bold text-fit-text">
                Chi tiết hóa đơn
              </h2>

              <div className="divide-y divide-slate-100">
                <div className="flex items-start justify-between gap-6 pb-4">
                <span className="font-medium text-slate-500">
                  Mã hóa đơn
                </span>

                  <span className="break-all text-right font-mono font-bold text-slate-800">
                  {invoice.invoiceCode}
                </span>
                </div>

                <div className="flex items-start justify-between gap-6 py-4">
                <span className="font-medium text-slate-500">
                  Hội viên
                </span>

                  <div className="text-right">
                    <p className="font-bold text-slate-800">
                      {invoice.memberName ||
                          "-"}
                    </p>

                    {invoice.memberCode && (
                        <p className="mt-1 text-xs text-slate-400">
                          {
                            invoice.memberCode
                          }
                        </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-6 py-4">
                <span className="font-medium text-slate-500">
                  Gói tập
                </span>

                  <div className="text-right">
                    <p className="font-bold text-slate-800">
                      {invoice.packageName ||
                          "Đăng ký gói tập"}
                    </p>

                    {invoice.packageDurationName && (
                        <p className="mt-1 text-xs text-slate-400">
                          {
                            invoice.packageDurationName
                          }
                        </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 py-4">
                <span className="font-medium text-slate-500">
                  Trạng thái
                </span>

                  <Badge
                      variant={getInvoiceStatusVariant(
                          invoice.status,
                      )}
                      className="inline-block"
                  >
                    {getInvoiceStatusLabel(
                        invoice.status,
                    )}
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-6 py-4">
                <span className="font-medium text-slate-500">
                  Tạm tính
                </span>

                  <span className="font-bold text-slate-800">
                  {formatCurrency(
                      invoice.totalAmount ??
                      0,
                  )}
                </span>
                </div>

                {invoice.discountAmount >
                    0 && (
                        <div className="flex items-center justify-between gap-6 py-4">
                  <span className="font-medium text-slate-500">
                    Giảm giá
                  </span>

                          <span className="font-bold text-emerald-600">
                    -
                            {formatCurrency(
                                invoice.discountAmount,
                            )}
                  </span>
                        </div>
                    )}

                {invoice.cancelReason && (
                    <div className="flex items-start justify-between gap-6 py-4">
                  <span className="font-medium text-slate-500">
                    Lý do hủy
                  </span>

                      <span className="max-w-sm text-right text-sm font-medium text-red-600">
                    {
                      invoice.cancelReason
                    }
                  </span>
                    </div>
                )}

                {invoice.refundReason && (
                    <div className="flex items-start justify-between gap-6 py-4">
                  <span className="font-medium text-slate-500">
                    Lý do hoàn tiền
                  </span>

                      <span className="max-w-sm text-right text-sm font-medium text-amber-600">
                    {
                      invoice.refundReason
                    }
                  </span>
                    </div>
                )}
              </div>
            </Card>

            {canPay && (
                <Card className="p-6 md:p-8">
                  <h2 className="mb-4 text-xl font-bold text-fit-text">
                    Phương thức thanh toán
                  </h2>

                  <div className="space-y-3">
                    <label
                        className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                            paymentMethod ===
                            "BANK_TRANSFER"
                                ? "border-fit-primary bg-blue-50"
                                : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="payment"
                            value="BANK_TRANSFER"
                            checked={
                                paymentMethod ===
                                "BANK_TRANSFER"
                            }
                            onChange={() => {
                              setPaymentMethod(
                                  "BANK_TRANSFER",
                              );
                            }}
                            className="h-4 w-4 text-fit-primary focus:ring-fit-primary"
                        />

                        <div>
                      <span className="font-bold text-slate-800">
                        Chuyển khoản ngân hàng
                      </span>

                          <p className="mt-1 text-xs text-slate-500">
                            Tạo yêu cầu và
                            chờ Admin/Staff
                            xác nhận.
                          </p>
                        </div>
                      </div>

                      <CreditCard className="h-6 w-6 text-fit-primary" />
                    </label>

                    <label
                        className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                            paymentMethod ===
                            "CASH"
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="payment"
                            value="CASH"
                            checked={
                                paymentMethod ===
                                "CASH"
                            }
                            onChange={() => {
                              setPaymentMethod(
                                  "CASH",
                              );
                            }}
                            className="h-4 w-4 text-emerald-500 focus:ring-emerald-500"
                        />

                        <div>
                      <span className="font-bold text-slate-800">
                        Tiền mặt tại quầy
                      </span>

                          <p className="mt-1 text-xs text-slate-500">
                            Thanh toán trực
                            tiếp tại quầy lễ
                            tân.
                          </p>
                        </div>
                      </div>

                      <span className="font-black text-emerald-600">
                    CASH
                  </span>
                    </label>

                    <label
                        className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                            paymentMethod ===
                            "VNPAY"
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="payment"
                            value="VNPAY"
                            checked={
                                paymentMethod ===
                                "VNPAY"
                            }
                            onChange={() => {
                              setPaymentMethod(
                                  "VNPAY",
                              );
                            }}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-500"
                        />

                        <div>
                      <span className="font-bold text-slate-800">
                        Thanh toán qua
                        VNPay
                      </span>

                          <p className="mt-1 text-xs text-slate-500">
                            Chuyển hướng đến
                            cổng thanh toán
                            VNPay.
                          </p>
                        </div>
                      </div>

                      <span className="font-black text-blue-600">
                    VNPAY
                  </span>
                    </label>
                  </div>

                  <div className="flex flex-col gap-2 pt-6">
                    <label
                        htmlFor="payment-note"
                        className="text-sm font-semibold text-slate-700"
                    >
                      Ghi chú thanh toán
                    </label>

                    <textarea
                        id="payment-note"
                        value={note}
                        onChange={(
                            event,
                        ) => {
                          setNote(
                              event.target.value,
                          );
                        }}
                        maxLength={500}
                        className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-fit-primary focus:ring-1 focus:ring-fit-primary"
                        rows={3}
                        placeholder="Ví dụ: Đã chuyển khoản, vui lòng kiểm tra..."
                    />

                    <p className="text-right text-xs text-slate-400">
                      {note.length}/500
                    </p>
                  </div>
                </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-24 border-none bg-gradient-to-b from-slate-900 to-slate-800 p-6 text-white shadow-xl">
              <h3 className="mb-4 text-lg font-bold">
                Tổng cộng
              </h3>

              <div className="mb-8">
                <p className="text-sm text-slate-400">
                  Số tiền hóa đơn
                </p>

                <p className="mt-2 break-words text-3xl font-black text-emerald-400">
                  {formatCurrency(
                      payableAmount,
                  )}
                </p>
              </div>

              <button
                  type="button"
                  onClick={() => {
                    void handlePayment();
                  }}
                  disabled={
                      processing ||
                      !canPay
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-fit-primary px-3 py-4 font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
                ) : isCancelled ? (
                    <>
                      <XCircle className="h-5 w-5" />
                      Hóa đơn đã hủy
                    </>
                ) : isRefunded ? (
                    <>
                      <RotateCcw className="h-5 w-5" />
                      Đã hoàn tiền
                    </>
                ) : (
                    <>
                      {paymentMethod ===
                      "VNPAY"
                          ? "Thanh toán bằng VNPay"
                          : "Tạo yêu cầu thanh toán"}

                      <ChevronRight className="h-5 w-5" />
                    </>
                )}
              </button>

              {canPay ? (
                  <p className="mt-4 flex items-start justify-center gap-1 text-center text-xs leading-5 text-slate-400">
                    <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                    Gói tập được kích
                    hoạt sau khi thanh
                    toán được xác nhận.
                  </p>
              ) : (
                  <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                    Hóa đơn này không
                    còn thao tác thanh
                    toán.
                  </p>
              )}
            </Card>
          </div>
        </div>
      </div>
  );
}