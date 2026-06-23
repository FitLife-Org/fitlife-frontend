import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function MyMembersPage() {
  return (
    <>
      <PageHeader title="Hội viên của tôi" description="Danh sách hội viên đang được bạn huấn luyện" />
      <Card className="p-6 text-fit-muted">Danh sách hội viên phụ trách sẽ hiển thị tại đây.</Card>
    </>
  );
}
