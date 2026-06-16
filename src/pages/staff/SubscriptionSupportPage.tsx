import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function SubscriptionSupportPage() {
  return (
    <>
      <PageHeader title="Hỗ trợ gói tập" description="Gia hạn, kiểm tra và hỗ trợ sự cố gói tập cho hội viên" />
      <Card className="p-6 text-fit-muted">Danh sách yêu cầu hỗ trợ sẽ hiển thị tại đây.</Card>
    </>
  );
}
