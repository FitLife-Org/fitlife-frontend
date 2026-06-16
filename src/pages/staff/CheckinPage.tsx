import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function CheckinPage() {
  return (
    <>
      <PageHeader title="Check-in" description="Quét mã hoặc tìm hội viên để xác nhận vào phòng tập" />
      <Card className="grid min-h-96 place-items-center p-6 text-center">
        <div>
          <div className="mx-auto h-48 w-48 rounded-3xl border-4 border-dashed border-fit-primary bg-fit-primarySoft" />
          <p className="mt-6 font-bold text-fit-text">Khu vực quét QR check-in</p>
        </div>
      </Card>
    </>
  );
}
