import {
  useState,
} from "react";

import {
  Dumbbell,
  Utensils,
  Wand2,
  X,
} from "lucide-react";

import Button from "../common/Button";
import Input from "../common/Input";

import type {
  AiActivityLevel,
  AiAdvancedPlanFormValue,
  AiExperienceLevel,
  AiGoal,
  AiPlanFormMode,
  AiPreferredLanguage,
} from "../../types/ai.type";

interface AiAdvancedPlanModalProps {
  mode: AiPlanFormMode;

  open: boolean;
  submitting?: boolean;

  onClose: () => void;

  onSubmit: (
      value: AiAdvancedPlanFormValue,
  ) => Promise<void> | void;
}

const INITIAL_VALUE:
    AiAdvancedPlanFormValue = {
  goal: "LOSE_WEIGHT",
  experienceLevel: "BEGINNER",
  activityLevel: "MODERATE",

  workoutDaysPerWeek: 3,
  workoutDurationMinutes: 45,

  mealsPerDay: 3,

  preferredLanguage: "vi",

  userNote: "",
};

function getModalTitle(
    mode: AiPlanFormMode,
): string {
  switch (mode) {
    case "WORKOUT_PLAN":
      return "Tạo kế hoạch tập luyện AI";

    case "NUTRITION_PLAN":
      return "Tạo kế hoạch dinh dưỡng AI";

    default:
      return "Tạo kế hoạch toàn diện AI";
  }
}

function getModalDescription(
    mode: AiPlanFormMode,
): string {
  switch (mode) {
    case "WORKOUT_PLAN":
      return "AI phân tích hồ sơ và chỉ số cơ thể để xây dựng lịch tập phù hợp.";

    case "NUTRITION_PLAN":
      return "AI đề xuất calories, macro và bữa ăn dựa trên mục tiêu cá nhân.";

    default:
      return "AI kết hợp hồ sơ, chỉ số cơ thể, lịch tập và dinh dưỡng.";
  }
}

export default function AiAdvancedPlanModal({
                                              mode,
                                              open,
                                              submitting = false,
                                              onClose,
                                              onSubmit,
                                            }: AiAdvancedPlanModalProps) {
  const [formData, setFormData] =
      useState<AiAdvancedPlanFormValue>(
          INITIAL_VALUE,
      );

  const [
    validationError,
    setValidationError,
  ] =
      useState<string | null>(null);

  const showWorkoutFields =
      mode === "FULL_PLAN" ||
      mode === "WORKOUT_PLAN";

  const showNutritionFields =
      mode === "FULL_PLAN" ||
      mode === "NUTRITION_PLAN";

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setValidationError(null);
    }
  }

  const validateForm =
      (): boolean => {
        if (
            showWorkoutFields &&
            (
                formData.workoutDaysPerWeek < 1 ||
                formData.workoutDaysPerWeek > 7
            )
        ) {
          setValidationError(
              "Số buổi tập phải từ 1 đến 7.",
          );

          return false;
        }

        if (
            showWorkoutFields &&
            (
                formData.workoutDurationMinutes < 10 ||
                formData.workoutDurationMinutes > 300
            )
        ) {
          setValidationError(
              "Thời lượng buổi tập phải từ 10 đến 300 phút.",
          );

          return false;
        }

        if (
            showNutritionFields &&
            (
                formData.mealsPerDay < 1 ||
                formData.mealsPerDay > 10
            )
        ) {
          setValidationError(
              "Số bữa ăn phải từ 1 đến 10.",
          );

          return false;
        }

        if (
            formData.userNote.trim().length >
            2000
        ) {
          setValidationError(
              "Ghi chú không được vượt quá 2000 ký tự.",
          );

          return false;
        }

        setValidationError(null);

        return true;
      };

  const handleSubmit =
      async (): Promise<void> => {
        if (
            submitting ||
            !validateForm()
        ) {
          return;
        }

        await onSubmit({
          ...formData,
          userNote:
              formData.userNote.trim(),
        });
      };

  const handleClose =
      (): void => {
        if (!submitting) {
          onClose();
        }
      };

  const HeaderIcon =
      mode === "WORKOUT_PLAN"
          ? Dumbbell
          : mode === "NUTRITION_PLAN"
              ? Utensils
              : Wand2;

  return (
      <>
        {open && (
            <>
              <div
                  onClick={handleClose}
                  className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm"
              />

              <section
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="ai-plan-modal-title"
                  className="fixed left-1/2 top-1/2 z-50 max-h-[95vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3
                        id="ai-plan-modal-title"
                        className="flex items-center gap-2 text-xl font-black text-slate-900"
                    >
                      <HeaderIcon className="h-6 w-6 text-violet-600" />

                      {getModalTitle(mode)}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {getModalDescription(mode)}
                    </p>
                  </div>

                  <button
                      type="button"
                      disabled={submitting}
                      onClick={handleClose}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Đóng biểu mẫu AI"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Left Column: General Info */}
                  <div className="space-y-4">
                    <div>
                      <label
                          htmlFor="ai-goal"
                          className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Mục tiêu
                      </label>

                      <select
                          id="ai-goal"
                          value={formData.goal}
                          disabled={submitting}
                          onChange={(event) =>
                              setFormData(
                                  (previous) => ({
                                    ...previous,
                                    goal:
                                        event.target
                                            .value as AiGoal,
                                  }),
                              )
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      >
                        <option value="LOSE_WEIGHT">
                          Giảm mỡ
                        </option>

                        <option value="GAIN_MUSCLE">
                          Tăng cơ
                        </option>

                        <option value="BODY_RECOMPOSITION">
                          Tăng cơ giảm mỡ
                        </option>

                        <option value="MAINTAIN_FITNESS">
                          Duy trì thể lực
                        </option>

                        <option value="IMPROVE_ENDURANCE">
                          Cải thiện sức bền
                        </option>
                      </select>
                    </div>

                    {showWorkoutFields && (
                        <div>
                          <label
                              htmlFor="ai-experience-level"
                              className="mb-2 block text-sm font-bold text-slate-700"
                          >
                            Trình độ tập luyện
                          </label>

                          <select
                              id="ai-experience-level"
                              value={
                                formData.experienceLevel
                              }
                              disabled={submitting}
                              onChange={(event) =>
                                  setFormData(
                                      (previous) => ({
                                        ...previous,
                                        experienceLevel:
                                            event.target
                                                .value as AiExperienceLevel,
                                      }),
                                  )
                              }
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          >
                            <option value="BEGINNER">
                              Người mới
                            </option>

                            <option value="INTERMEDIATE">
                              Trung bình
                            </option>

                            <option value="ADVANCED">
                              Nâng cao
                            </option>
                          </select>
                        </div>
                    )}

                    <div>
                      <label
                          htmlFor="ai-activity-level"
                          className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Mức vận động hằng ngày
                      </label>

                      <select
                          id="ai-activity-level"
                          value={
                            formData.activityLevel
                          }
                          disabled={submitting}
                          onChange={(event) =>
                              setFormData(
                                  (previous) => ({
                                    ...previous,
                                    activityLevel:
                                        event.target
                                            .value as AiActivityLevel,
                                  }),
                              )
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
                          Vận động vừa
                        </option>

                        <option value="ACTIVE">
                          Vận động nhiều
                        </option>

                        <option value="VERY_ACTIVE">
                          Vận động rất nhiều
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                          htmlFor="ai-language"
                          className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Ngôn ngữ
                      </label>

                      <select
                          id="ai-language"
                          value={
                            formData.preferredLanguage
                          }
                          disabled={submitting}
                          onChange={(event) =>
                              setFormData(
                                  (previous) => ({
                                    ...previous,
                                    preferredLanguage:
                                        event.target
                                            .value as AiPreferredLanguage,
                                  }),
                              )
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      >
                        <option value="vi">
                          Tiếng Việt
                        </option>

                        <option value="en">
                          English
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column: Workout, Nutrition, Note */}
                  <div className="space-y-4">
                    {showWorkoutFields && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Input
                              id="ai-workout-days"
                              label="Số buổi/tuần"
                              type="number"
                              min={1}
                              max={7}
                              disabled={submitting}
                              value={
                                formData
                                    .workoutDaysPerWeek
                              }
                              onChange={(event) =>
                                  setFormData(
                                      (previous) => ({
                                        ...previous,
                                        workoutDaysPerWeek:
                                            Number(
                                                event.target
                                                    .value,
                                            ),
                                      }),
                                  )
                              }
                          />

                          <Input
                              id="ai-workout-duration"
                              label="Phút/buổi"
                              type="number"
                              min={10}
                              max={300}
                              disabled={submitting}
                              value={
                                formData
                                    .workoutDurationMinutes
                              }
                              onChange={(event) =>
                                  setFormData(
                                      (previous) => ({
                                        ...previous,
                                        workoutDurationMinutes:
                                            Number(
                                                event.target
                                                    .value,
                                            ),
                                      }),
                                  )
                              }
                          />
                        </div>
                    )}

                    {showNutritionFields && (
                        <Input
                            id="ai-meals-per-day"
                            label="Số bữa/ngày"
                            type="number"
                            min={1}
                            max={10}
                            disabled={submitting}
                            value={
                              formData.mealsPerDay
                            }
                            onChange={(event) =>
                                setFormData(
                                    (previous) => ({
                                      ...previous,
                                      mealsPerDay:
                                          Number(
                                              event.target.value,
                                          ),
                                    }),
                                )
                            }
                        />
                    )}

                    <div>
                      <label
                          htmlFor="ai-user-note"
                          className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Ghi chú thêm
                      </label>

                      <textarea
                          id="ai-user-note"
                          rows={showWorkoutFields && showNutritionFields ? 4 : 3}
                          maxLength={2000}
                          disabled={submitting}
                          value={formData.userNote}
                          onChange={(event) =>
                              setFormData(
                                  (previous) => ({
                                    ...previous,
                                    userNote:
                                    event.target.value,
                                  }),
                              )
                          }
                          placeholder={
                            mode ===
                            "WORKOUT_PLAN"
                                ? "Ví dụ: Ưu tiên bài tập an toàn, thiết bị phổ biến..."
                                : mode ===
                                "NUTRITION_PLAN"
                                    ? "Ví dụ: Món Việt Nam, dễ nấu, ngân sách hợp lý..."
                                    : "Ví dụ: Kế hoạch thực tế, an toàn và dễ duy trì..."
                          }
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />

                      <p className="mt-1 text-right text-xs text-slate-400">
                        {formData.userNote.length}
                        /2000
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  {validationError && (
                      <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                        {validationError}
                      </p>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <p className="text-center sm:text-left text-xs text-slate-400">
                      Quá trình có thể mất từ 10 đến
                      120 giây. Không gửi yêu cầu nhiều lần.
                    </p>

                    <Button
                        variant="primary"
                        isLoading={submitting}
                        loadingText="AI đang tạo kế hoạch..."
                        onClick={handleSubmit}
                        className="w-full sm:w-auto px-8 rounded-xl bg-slate-950 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10"
                    >
                      <Wand2 className="h-4 w-4" />
                      Tạo kế hoạch ngay
                    </Button>
                  </div>
                </div>
              </section>
            </>
        )}
      </>
  );
}