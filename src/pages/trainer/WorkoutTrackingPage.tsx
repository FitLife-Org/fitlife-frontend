import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function WorkoutTrackingPage() {
  return (
    <>
      <PageHeader title="Theo dõi bài tập" description="Ghi nhận tiến độ bài tập và nhận xét của trainer" />
      <Card className="p-6 text-fit-muted">Bảng theo dõi workout sẽ hiển thị tại đây.</Card>
    </>
  );
}
