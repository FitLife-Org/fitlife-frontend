import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";

export default function MemberLookupPage() {
  return (
    <>
      <PageHeader title="Tra cứu hội viên" description="Tìm nhanh thông tin hội viên theo tên, số điện thoại hoặc mã hội viên" />
      <Card className="p-6"><Input label="Từ khóa" placeholder="Nhập tên hoặc số điện thoại" /></Card>
    </>
  );
}
