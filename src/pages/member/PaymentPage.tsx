import { CheckCircle2 } from "lucide-react";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { formatCurrency } from "../../utils/formatCurrency";

export default function PaymentPage() {
  return (
    <>
      <PageHeader title="Thanh toán" description="Quản lý giao dịch và nạp ví FitLife" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-fit-text">Giao dịch gần đây</h2>
          <div className="mt-5 space-y-4">
            {[1200000, 599000, 349000].map((amount, index) => (
              <div className="flex items-center justify-between rounded-2xl border border-fit-border p-4" key={amount}>
                <div className="flex items-center gap-3"><CheckCircle2 className="text-fit-primary" /><div><p className="font-bold text-fit-text">GD250601-00{index + 1}</p><p className="text-sm text-fit-muted">Thanh toán gói tập</p></div></div>
                <p className="font-black text-fit-text">{formatCurrency(amount)}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-fit-muted">Số dư ví</p>
          <p className="mt-3 text-4xl font-black text-fit-primary">{formatCurrency(1250000)}</p>
          <button className="mt-6 w-full rounded-xl bg-fit-primary py-3 font-bold text-white" type="button">Nạp tiền</button>
        </Card>
      </div>
    </>
  );
}
