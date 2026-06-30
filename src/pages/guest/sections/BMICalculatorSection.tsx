import { useState } from "react";
import Button from "../../../components/common/Button";
import { Activity, ArrowRight, Scale, Ruler } from "lucide-react";

type BMIStatus = "Thiếu cân" | "Bình thường" | "Thừa cân" | "Béo phì";

interface BMIResult {
  bmi: number;
  status: BMIStatus;
  color: string;
  message: string;
}

export default function BMICalculatorSection() {
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [result, setResult] = useState<BMIResult | null>(null);

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) return;

    const heightInMeters = h / 100;
    const bmiValue = w / (heightInMeters * heightInMeters);
    const roundedBmi = parseFloat(bmiValue.toFixed(1));

    let status: BMIStatus = "Bình thường";
    let color = "text-emerald-600";
    let message = "Tuyệt vời! Chỉ số cơ thể của bạn rất tốt. Hãy tiếp tục duy trì nhé.";

    if (roundedBmi < 18.5) {
      status = "Thiếu cân";
      color = "text-amber-500";
      message = "Bạn đang thiếu cân. Cần bổ sung thêm dinh dưỡng và tập luyện để tăng cơ.";
    } else if (roundedBmi >= 25 && roundedBmi < 29.9) {
      status = "Thừa cân";
      color = "text-orange-500";
      message = "Bạn đang thừa cân nhẹ. Nên điều chỉnh chế độ ăn và tăng cường vận động.";
    } else if (roundedBmi >= 30) {
      status = "Béo phì";
      color = "text-rose-500";
      message = "Bạn đang ở mức béo phì. Cần có kế hoạch giảm cân nghiêm ngặt để bảo vệ sức khỏe.";
    }

    setResult({ bmi: roundedBmi, status, color, message });
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
          
          <div className="flex-1 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fit-primarySoft text-fit-primary text-sm font-semibold mb-6">
              <Activity className="w-4 h-4" /> Công cụ miễn phí
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Tính chỉ số BMI của bạn
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Kiểm tra nhanh chỉ số khối cơ thể (BMI) để biết tình trạng sức khỏe hiện tại của bạn. FitLife sẽ giúp bạn đề xuất lộ trình tập luyện phù hợp.
            </p>

            <form onSubmit={calculateBMI} className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-slate-400" /> Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="VD: 170"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-fit-primary focus:ring-2 focus:ring-fit-primary/20 outline-none transition-all bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-slate-400" /> Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="VD: 65"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-fit-primary focus:ring-2 focus:ring-fit-primary/20 outline-none transition-all bg-white"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl py-4 text-lg font-semibold flex items-center justify-center gap-2">
                Tính toán BMI <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          </div>

          <div className="flex-1 w-full lg:pl-12">
            {result ? (
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center animate-in fade-in zoom-in duration-300">
                <p className="text-slate-500 font-medium mb-2">Chỉ số BMI của bạn là</p>
                <div className={`text-6xl font-black ${result.color} mb-4 tracking-tight`}>
                  {result.bmi}
                </div>
                <div className={`inline-block px-4 py-2 rounded-full font-bold text-lg border mb-6 ${
                  result.status === "Bình thường" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                  result.status === "Thiếu cân" ? "bg-amber-50 border-amber-200 text-amber-700" :
                  result.status === "Thừa cân" ? "bg-orange-50 border-orange-200 text-orange-700" :
                  "bg-rose-50 border-rose-200 text-rose-700"
                }`}>
                  {result.status}
                </div>
                <p className="text-slate-600 leading-relaxed mb-8">{result.message}</p>
                
                <div className="bg-slate-50 rounded-2xl p-6 text-left">
                  <h4 className="font-bold text-slate-800 mb-4">Nhận tư vấn lộ trình phù hợp:</h4>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                      Tập luyện cùng PT cá nhân chuyên nghiệp
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                      Thực đơn dinh dưỡng cá nhân hóa
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                      Đo InBody định kỳ miễn phí
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full rounded-xl">Đăng ký tư vấn ngay</Button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl h-full min-h-[400px] border border-slate-100 border-dashed flex flex-col items-center justify-center p-8 text-center text-slate-400">
                 <Activity className="w-16 h-16 mb-4 opacity-50" />
                 <p className="font-medium">Nhập thông tin của bạn để xem kết quả BMI</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
