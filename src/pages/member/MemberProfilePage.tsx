import { Mail, Phone, Ruler, UserRound, Weight } from "lucide-react";
import type { ReactNode } from "react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function MemberProfilePage() {
  return (
    <>
      <PageHeader title="Hồ sơ hội viên" description="Quản lý thông tin cá nhân và chỉ số sức khỏe của bạn" />
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="p-6 text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-fit-primarySoft text-fit-primary">
            <UserRound className="h-14 w-14" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-fit-text">Nguyễn Minh Anh</h2>
          <p className="mt-1 text-fit-muted">minh.anh@fitlife.vn</p>
          <div className="mt-4"><Badge variant="success">Thành viên Premium</Badge></div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-bold text-fit-text">Thông tin liên hệ</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Info icon={<Mail />} label="Email" value="minh.anh@fitlife.vn" />
            <Info icon={<Phone />} label="Số điện thoại" value="0987 654 321" />
            <Info icon={<Ruler />} label="Chiều cao" value="174 cm" />
            <Info icon={<Weight />} label="Cân nặng" value="66.1 kg" />
          </div>
        </Card>
      </div>
    </>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-4 rounded-2xl border border-fit-border p-4"><span className="text-fit-primary">{icon}</span><div><p className="text-sm text-fit-muted">{label}</p><p className="font-bold text-fit-text">{value}</p></div></div>;
}
