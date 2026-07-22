import {
  useEffect,
  useState,
} from "react";

import {
  Wand2,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import Button from "../common/Button";
import Input from "../common/Input";

import type {
  AiActivityLevel,
  AiAdvancedPlanFormValue,
  AiExperienceLevel,
  AiGoal,
  AiPreferredLanguage,
} from "../../types/ai.type";

interface AiAdvancedPlanModalProps {
  open: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (
    value: AiAdvancedPlanFormValue,
  ) => Promise<void> | void;
}

const INITIAL_VALUE: AiAdvancedPlanFormValue = {
  goal: "LOSE_WEIGHT",
  experienceLevel: "BEGINNER",
  activityLevel: "MODERATE",
  workoutDaysPerWeek: 4,
  workoutDurationMinutes: 60,
  mealsPerDay: 3,
  preferredLanguage: "vi",
  userNote: "",
};

export default function AiAdvancedPlanModal({
  open,
  submitting = false,
  onClose,
  onSubmit,
}: AiAdvancedPlanModalProps) {
  const [formData, setFormData] =
    useState<AiAdvancedPlanFormValue>(INITIAL_VALUE);

  const [validationError, setValidationError] =
    useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValidationError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (
      formData.workoutDaysPerWeek < 1 ||
      formData.workoutDaysPerWeek > 7
    ) {
      setValidationError("Số buổi tập phải từ 1 đến 7.");
      return;
    }

    if (
      formData.workoutDurationMinutes < 10 ||
      formData.workoutDurationMinutes > 300
    ) {
      setValidationError(
        "Thời lượng buổi tập phải từ 10 đến 300 phút.",
      );
      return;
    }

    if (
      formData.mealsPerDay < 1 ||
      formData.mealsPerDay > 10
    ) {
      setValidationError("Số bữa ăn phải từ 1 đến 10.");
      return;
    }

    setValidationError(null);

    await onSubmit({
      ...formData,
      userNote: formData.userNote.trim(),
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!submitting) {
                onClose();
              }
            }}
            className="absolute inset-0 z-40 rounded-3xl bg-slate-950/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute left-1/2 top-1/2 z-50 max-h-[90%] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-black text-slate-900">
                  <Wand2 className="h-6 w-6 text-violet-600" />
                  Tạo kế hoạch AI
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  AI kết hợp hồ sơ hội viên, chỉ số cơ thể và tri thức FitLife.
                </p>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed"
                aria-label="Đóng biểu mẫu AI"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Mục tiêu
                </label>

                <select
                  value={formData.goal}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      goal: event.target.value as AiGoal,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="LOSE_WEIGHT">Giảm mỡ</option>
                  <option value="GAIN_MUSCLE">Tăng cơ</option>
                  <option value="BODY_RECOMPOSITION">Tăng cơ giảm mỡ</option>
                  <option value="MAINTAIN_FITNESS">Duy trì thể lực</option>
                  <option value="IMPROVE_ENDURANCE">Cải thiện sức bền</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Trình độ tập luyện
                </label>

                <select
                  value={formData.experienceLevel}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      experienceLevel:
                        event.target.value as AiExperienceLevel,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="BEGINNER">Người mới</option>
                  <option value="INTERMEDIATE">Trung bình</option>
                  <option value="ADVANCED">Nâng cao</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Mức độ vận động hằng ngày
                </label>

                <select
                  value={formData.activityLevel}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      activityLevel:
                        event.target.value as AiActivityLevel,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="SEDENTARY">
                    Ít vận động
                  </option>

                  <option value="LIGHT">
                    Vận động nhẹ
                  </option>

                  <option value="MODERATE">
                    Vận động vừa phải
                  </option>

                  <option value="ACTIVE">
                    Vận động nhiều
                  </option>

                  <option value="VERY_ACTIVE">
                    Vận động rất nhiều
                  </option>
                </select>

                <p className="mt-1 text-xs text-slate-400">
                  Dùng để tính nhu cầu năng lượng và cường độ tập phù hợp.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Số buổi/tuần"
                  type="number"
                  min={1}
                  max={7}
                  value={formData.workoutDaysPerWeek}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      workoutDaysPerWeek: Number(event.target.value),
                    }))
                  }
                />

                <Input
                  label="Phút/buổi"
                  type="number"
                  min={10}
                  max={300}
                  value={formData.workoutDurationMinutes}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      workoutDurationMinutes: Number(event.target.value),
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Số bữa/ngày"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.mealsPerDay}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      mealsPerDay: Number(event.target.value),
                    }))
                  }
                />

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Ngôn ngữ
                  </label>

                  <select
                    value={formData.preferredLanguage}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        preferredLanguage:
                          event.target.value as AiPreferredLanguage,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Ghi chú thêm
                </label>

                <textarea
                  value={formData.userNote}
                  maxLength={2000}
                  rows={4}
                  placeholder="Ví dụ: Không thích chạy bộ, muốn ưu tiên máy tập, ngân sách ăn uống..."
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      userNote: event.target.value,
                    }))
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              {validationError && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {validationError}
                </p>
              )}

              <Button
                variant="primary"
                isLoading={submitting}
                loadingText="AI đang tạo kế hoạch..."
                onClick={handleSubmit}
                className="w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800"
              >
                <Wand2 className="h-4 w-4" />
                Tạo kế hoạch ngay
              </Button>

              <p className="text-center text-xs text-slate-400">
                Quá trình có thể mất từ 10 đến 60 giây. Không gửi yêu cầu nhiều lần.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
