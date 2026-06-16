import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function MySubscriptionPage() {
  return (
    <>
      <PageHeader title="Gói hội viên của tôi" description="Theo dõi trạng thái gói tập và thời hạn sử dụng" />
      <Card className="p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <div>
            <Badge variant="success">Đang hoạt động</Badge>
            <h2 className="mt-4 text-3xl font-black text-fit-text">Premium 6 tháng</h2>
            <p className="mt-2 text-fit-muted">Hết hạn ngày 01/08/2025</p>
          </div>
          <div className="min-w-64 rounded-2xl bg-fit-primarySoft p-5">
            <p className="text-sm text-fit-muted">Thời gian còn lại</p>
            <p className="mt-2 text-4xl font-black text-fit-primary">12 ngày</p>
          </div>
        </div>
      </Card>
    </>
  );
}
