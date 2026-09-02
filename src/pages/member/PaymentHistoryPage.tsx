import { CreditCard, CheckCircle2 } from "lucide-react";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import { formatCurrency } from "../../utils/formatCurrency";
import type { PaymentResult } from "../../types/payment.type";
import { usePaymentHistory } from "../../hooks/usePaymentHooks";

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

export default function PaymentHistoryPage() {
  const { payments, loading } = usePaymentHistory();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">
            Đang tải dữ liệu thanh toán...
          </p>
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
