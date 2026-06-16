import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function EquipmentManagementPage() {
  return (
    <>
      <PageHeader title="Quản lý trang thiết bị" description="Theo dõi tình trạng máy tập và lịch bảo trì" />
      <Card className="p-6">
        {["Máy chạy bộ A1", "Ghế Bench Press", "Cable Machine", "Dumbbell Rack"].map((item, index) => <div className="flex justify-between border-b border-fit-border py-4 last:border-0" key={item}><span className="font-bold text-fit-text">{item}</span><Badge variant={index === 2 ? "warning" : "success"}>{index === 2 ? "Bảo trì" : "Hoạt động"}</Badge></div>)}
      </Card>
    </>
  );
}
