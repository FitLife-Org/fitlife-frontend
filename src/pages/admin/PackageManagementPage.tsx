import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { formatCurrency } from "../../utils/formatCurrency";

export default function PackageManagementPage() {
  return (
    <>
      <PageHeader title="Quản lý gói tập" description="Cấu hình giá, thời hạn và quyền lợi từng gói" />
      <div className="grid gap-6 md:grid-cols-4">
        {[
          ["Basic", 199000],
          ["Standard", 349000],
          ["Premium", 599000],
          ["PT Pro", 999000],
        ].map(([name, price]) => <Card className="p-6" key={name}><h2 className="text-2xl font-black text-fit-text">{name}</h2><p className="mt-4 text-3xl font-black text-fit-primary">{formatCurrency(Number(price))}</p></Card>)}
      </div>
    </>
  );
}
