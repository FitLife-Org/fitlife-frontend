import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function TrainerManagementPage() {
  return (
    <>
      <PageHeader title="PT / Huấn luyện viên" description="Quản lý hồ sơ, chuyên môn và lịch làm việc của PT" />
      <div className="grid gap-6 md:grid-cols-3">
        {["Hoàng Quốc Bảo", "Lê Phương Vy", "Trần Minh Đức"].map((name) => <Card className="p-6" key={name}><h2 className="text-xl font-black text-fit-text">{name}</h2><p className="mt-2 text-fit-muted">Strength & Conditioning</p><div className="mt-4"><Badge variant="success">Đang làm việc</Badge></div></Card>)}
      </div>
    </>
  );
}
