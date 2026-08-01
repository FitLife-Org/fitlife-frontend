import Modal from "../../../components/common/Modal";
import Badge from "../../../components/common/Badge";
import Loading from "../../../components/common/Loading";
import type { NutritionPlan } from "../../../types/nutrition.type";

interface Props {
  open: boolean;
  onClose: () => void;
  plan: NutritionPlan | null;
  loading: boolean;
}

export default function NutritionPlanDetailModal({ open, onClose, plan, loading }: Props) {
  if (!plan && !loading) return null;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <Badge variant="success">Đang áp dụng</Badge>;
      case "DRAFT": return <Badge variant="warning">Bản nháp</Badge>;
      case "COMPLETED": return <Badge variant="purple">Hoàn thành</Badge>;
      case "ARCHIVED": return <Badge variant="default">Lưu trữ</Badge>;
      case "CANCELLED": return <Badge variant="danger">Đã hủy</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const renderSourceBadge = (source: string) => {
    switch (source) {
      case "AI_GENERATED": return <Badge variant="purple">AI Generated</Badge>;
      case "TRAINER_CREATED": return <Badge variant="success">Trainer</Badge>;
      case "MEMBER_CREATED": return <Badge variant="default">Member</Badge>;
      default: return <Badge variant="warning">{source}</Badge>;
    }
  };

  return (
    <Modal title="Chi tiết Thực đơn Dinh dưỡng" open={open} onClose={onClose}>
      {loading ? (
        <Loading label="Đang tải chi tiết thực đơn..." />
      ) : plan ? (
        <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
          {/* Header Info */}
          <div className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <h4 className="font-bold text-lg text-slate-900">{plan.name || "Thực đơn không tên"}</h4>
              <p className="text-sm text-slate-500 mt-1">Mục tiêu: <span className="font-semibold text-slate-700">{plan.goal}</span></p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {renderStatusBadge(plan.status)}
              {renderSourceBadge(plan.source)}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center bg-white shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Calo/Ngày</span>
              <span className="text-lg font-black text-fit-primary mt-1">{plan.dailyCalories || 0}</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center bg-white shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Protein</span>
              <span className="text-lg font-black text-rose-500 mt-1">{plan.proteinGrams || 0}g</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center bg-white shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Carbs</span>
              <span className="text-lg font-black text-amber-500 mt-1">{plan.carbohydrateGrams || 0}g</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center bg-white shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Fat</span>
              <span className="text-lg font-black text-emerald-500 mt-1">{plan.fatGrams || 0}g</span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-100 bg-white">
                <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Thời gian</span>
                <p className="text-sm font-medium text-slate-800">
                  {plan.startDate || "Chưa bắt đầu"} → {plan.expectedEndDate || "Không giới hạn"} ({plan.durationWeeks} tuần)
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-white">
                <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Chỉ định khác</span>
                <p className="text-sm font-medium text-slate-800">Số bữa: {plan.mealsPerDay || 0} bữa/ngày</p>
                <p className="text-sm font-medium text-slate-800 mt-1">Lượng nước: {plan.waterMlPerDay || 0} ml</p>
              </div>
            </div>
            <div className="space-y-3">
              {plan.foodsToLimit && (
                <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50">
                  <span className="text-xs text-rose-500 font-bold uppercase block mb-1">Thực phẩm hạn chế</span>
                  <p className="text-sm font-medium text-rose-900">{plan.foodsToLimit}</p>
                </div>
              )}
              {plan.warningMessage && (
                <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50">
                  <span className="text-xs text-amber-600 font-bold uppercase block mb-1">Cảnh báo y tế</span>
                  <p className="text-sm font-medium text-amber-900">{plan.warningMessage}</p>
                </div>
              )}
            </div>
          </div>

          {/* Meals */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 pl-1 border-b border-slate-100 pb-2">Danh sách Bữa ăn</h4>
            {plan.meals && plan.meals.length > 0 ? (
              <div className="space-y-4">
                {plan.meals.map((meal, index) => (
                  <div key={index} className="rounded-xl border border-slate-100 overflow-hidden bg-white shadow-sm">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                      <h5 className="font-bold text-slate-700">{meal.mealName}</h5>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-left text-xs">
                        <thead className="text-slate-400 bg-white border-b border-slate-50">
                          <tr>
                            <th className="px-4 py-2 font-semibold">Tên món</th>
                            <th className="px-4 py-2 font-semibold">Khẩu phần</th>
                            <th className="px-4 py-2 font-semibold">Calo</th>
                            <th className="px-4 py-2 font-semibold">Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {meal.foods?.map((food, fIndex) => (
                            <tr key={fIndex} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-medium text-slate-700">{food.foodName}</td>
                              <td className="px-4 py-3 text-slate-600">
                                {food.portionText || `${food.quantity || ''} ${food.unit || ''}`}
                              </td>
                              <td className="px-4 py-3 text-fit-primary font-semibold">{food.calories || 0}</td>
                              <td className="px-4 py-3 text-slate-500 italic">{food.note || food.preparation || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-sm font-medium">
                Thực đơn này chưa có chi tiết bữa ăn.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
