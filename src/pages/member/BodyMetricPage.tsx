import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function BodyMetricPage() {
  return (
    <>
      <PageHeader title="Chỉ số cơ thể" description="Theo dõi BMI, cân nặng, mỡ cơ thể và cơ bắp" />
      <div className="grid gap-6 md:grid-cols-4">
        {[
          ["BMI", "22.4", "Bình thường"],
          ["Cân nặng", "66.1 kg", "-1.2 kg"],
          ["Body Fat", "15.8%", "-0.6%"],
          ["Cơ bắp", "34.2 kg", "+0.8 kg"],
        ].map(([label, value, note]) => (
          <Card className="p-6" key={label}>
            <p className="text-fit-muted">{label}</p>
            <p className="mt-3 text-3xl font-black text-fit-text">{value}</p>
            <p className="mt-2 text-sm font-semibold text-fit-primary">{note}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6 p-6">
        <h2 className="text-xl font-bold text-fit-text">Tiến độ 8 tuần qua</h2>
        <div className="mt-6 h-72 rounded-3xl bg-gradient-to-b from-white to-emerald-50 p-6">
          <svg className="h-full w-full" viewBox="0 0 800 260">
            {[50, 100, 150, 200].map((y) => <line key={y} x1="0" x2="800" y1={y} y2={y} stroke="#e5e7eb" />)}
            <polyline fill="none" points="20,70 100,74 180,96 260,118 340,142 420,150 500,170 580,180 660,205 740,220" stroke="#059669" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
      </Card>
    </>
  );
}
