import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function BookingPage() {
  return (
    <>
      <PageHeader title="Lịch tập" description="Quản lý lịch tập cá nhân và lịch PT" />
      <Card className="p-6">
        {["Push (Ngực - Vai - Tay sau)", "Pull (Lưng - Tay trước)", "Chân & Mông"].map((session, index) => (
          <div className="flex items-center justify-between border-b border-fit-border py-5 last:border-0" key={session}>
            <div><p className="font-bold text-fit-text">{session}</p><p className="mt-1 text-sm text-fit-muted">{18 + index}:00 - {19 + index}:15</p></div>
            <Badge variant={index === 0 ? "success" : "info"}>{index === 0 ? "Hôm nay" : "Sắp tới"}</Badge>
          </div>
        ))}
      </Card>
    </>
  );
}
