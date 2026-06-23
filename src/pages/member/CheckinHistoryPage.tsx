import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function CheckinHistoryPage() {
  return (
    <>
      <PageHeader title="Lịch sử check-in" description="Các lần vào phòng tập gần đây" />
      <Card className="p-6">
        {["16/06/2026 18:02", "15/06/2026 07:45", "13/06/2026 18:11"].map((time) => (
          <div className="flex items-center justify-between border-b border-fit-border py-4 last:border-0" key={time}>
            <span className="font-medium text-fit-text">{time}</span>
            <Badge variant="success">Thành công</Badge>
          </div>
        ))}
      </Card>
    </>
  );
}
