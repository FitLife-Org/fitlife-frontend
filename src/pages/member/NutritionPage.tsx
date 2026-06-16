import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function NutritionPage() {
  return (
    <>
      <PageHeader title="Dinh dưỡng" description="Gợi ý calories, protein, carbs và fat cho mục tiêu hiện tại" />
      <div className="grid gap-6 md:grid-cols-4">
        {["2.100 kcal", "150 g protein", "220 g carbs", "60 g fat"].map((item) => <Card className="p-6 text-center text-2xl font-black text-fit-primary" key={item}>{item}</Card>)}
      </div>
    </>
  );
}
