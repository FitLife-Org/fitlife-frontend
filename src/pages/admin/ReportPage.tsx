import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function ReportPage() {
  return (
    <>
      <PageHeader title="Báo cáo" description="Tổng hợp doanh thu, hội viên và hiệu suất vận hành" />
      <Card className="p-6"><p className="text-fit-muted">Khu vực báo cáo đã sẵn sàng để tích hợp chart và API thống kê.</p></Card>
    </>
  );
}
