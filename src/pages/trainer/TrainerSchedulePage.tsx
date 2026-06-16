import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function TrainerSchedulePage() {
  return (
    <>
      <PageHeader title="Lịch trainer" description="Theo dõi lịch huấn luyện cá nhân trong ngày" />
      <Card className="p-6">
        {["09:00 - Nguyễn Minh Anh", "10:00 - Trần Quang Huy", "14:00 - Lê Thị Thu Trang"].map((item) => <div className="flex justify-between border-b border-fit-border py-4 last:border-0" key={item}><span className="font-bold text-fit-text">{item}</span><Badge variant="info">Đã đặt</Badge></div>)}
      </Card>
    </>
  );
}
