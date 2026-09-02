import {
  ArrowLeft,
  Flame,
  Plus,
  Save,
  Trash2,
  Utensils,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";

import { ROUTES } from "../../config/routes";
import { nutritionService } from "../../services/nutritionService";
import type {
  NutritionFoodRequest,
  NutritionMealRequest,
  NutritionPlanRequest,
} from "../../types/nutrition.type";
import { showAlert } from "../../utils/alert";
import { getApiErrorMessage } from "../../utils/apiError";

const DEFAULT_MEAL_NAMES = [
  "Bữa sáng",
  "Bữa trưa",
  "Bữa phụ",
  "Bữa tối",
];

const createEmptyFood = (): NutritionFoodRequest => ({
  foodName: "",
  quantity: undefined,
  unit: "g",
  portionText: "",
  calories: undefined,
  proteinGrams: undefined,
  carbohydrateGrams: undefined,
  fatGrams: undefined,
  preparation: "",
  substitution: "",
  note: "",
});

const createEmptyMeal = (
  index: number,
): NutritionMealRequest => ({
  mealName:
    DEFAULT_MEAL_NAMES[index] ??
    `Bữa ${index + 1}`,
  foods: [createEmptyFood()],
});

const createInitialForm = (): NutritionPlanRequest => ({
  name: "",
  description: "",
  goal: "MAINTAIN_HEALTH",
  durationWeeks: 4,
  dailyCalories: 2000,
  proteinGrams: 120,
  carbohydrateGrams: 220,
  fatGrams: 60,
  fiberGrams: 25,
  mealsPerDay: 4,
  waterMlPerDay: 2500,
  startDate: new Date().toISOString().slice(0, 10),
  expectedEndDate: "",
  foodsToLimit: "",
  substitutionNote: "",
  trainerNote: "",
  memberNote: "",
  warningMessage: "",
  meals: [
    createEmptyMeal(0),
    createEmptyMeal(1),
    createEmptyMeal(2),
    createEmptyMeal(3),
  ],
});

function numberOrUndefined(
  value: string,
): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : undefined;
}

function normalizeText(
  value?: string,
): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export default function MemberNutritionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const planId = id ? Number(id) : null;
  const isEditMode =
    planId !== null &&
    Number.isInteger(planId) &&
    planId > 0;

  const [form, setForm] = useState<NutritionPlanRequest>(
    createInitialForm,
  );
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditMode || planId === null) {
      return;
    }

    let mounted = true;

    const load = async (): Promise<void> => {
      try {
        setLoading(true);

        const plan = await nutritionService.getPlanById(planId);

        if (!mounted) {
          return;
        }

        if (plan.status !== "DRAFT") {
          await showAlert.warning(
            "Không thể chỉnh sửa",
            "Chỉ kế hoạch ở trạng thái Bản nháp mới được chỉnh sửa.",
          );
          navigate(
            ROUTES.MEMBER_NUTRITION_DETAIL.replace(
              ":id",
              String(plan.id),
            ),
            { replace: true },
          );
          return;
        }

        setForm({
          name: plan.name,
          description: plan.description ?? "",
          goal: plan.goal,
          durationWeeks: plan.durationWeeks,
          dailyCalories: plan.dailyCalories ?? undefined,
          proteinGrams: plan.proteinGrams ?? undefined,
          carbohydrateGrams:
            plan.carbohydrateGrams ?? undefined,
          fatGrams: plan.fatGrams ?? undefined,
          fiberGrams: plan.fiberGrams ?? undefined,
          mealsPerDay: plan.mealsPerDay ?? undefined,
          waterMlPerDay: plan.waterMlPerDay ?? undefined,
          startDate: plan.startDate ?? "",
          expectedEndDate: plan.expectedEndDate ?? "",
          foodsToLimit: plan.foodsToLimit ?? "",
          substitutionNote: plan.substitutionNote ?? "",
          trainerNote: plan.trainerNote ?? "",
          memberNote: plan.memberNote ?? "",
          warningMessage: plan.warningMessage ?? "",
          meals:
            plan.meals.length > 0
              ? plan.meals.map((meal) => ({
                  mealName: meal.mealName,
                  foods: meal.foods.map((food) => ({
                    foodName: food.foodName,
                    quantity: food.quantity ?? undefined,
                    unit: food.unit ?? undefined,
                    portionText: food.portionText ?? undefined,
                    calories: food.calories ?? undefined,
                    proteinGrams:
                      food.proteinGrams ?? undefined,
                    carbohydrateGrams:
                      food.carbohydrateGrams ?? undefined,
                    fatGrams: food.fatGrams ?? undefined,
                    preparation: food.preparation ?? undefined,
                    substitution: food.substitution ?? undefined,
                    note: food.note ?? undefined,
                    sortOrder: food.sortOrder ?? undefined,
                  })),
                }))
              : [createEmptyMeal(0)],
        });
      } catch (error) {
        await showAlert.error(
          "Không thể tải kế hoạch",
          getApiErrorMessage(
            error,
            "Không thể tải kế hoạch dinh dưỡng.",
          ),
        );
        navigate(ROUTES.MEMBER_NUTRITION, {
          replace: true,
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [isEditMode, navigate, planId]);

  const totals = useMemo(() => {
    return form.meals.reduce(
      (summary, meal) => {
        meal.foods.forEach((food) => {
          summary.calories += food.calories ?? 0;
          summary.protein += food.proteinGrams ?? 0;
          summary.carbs += food.carbohydrateGrams ?? 0;
          summary.fat += food.fatGrams ?? 0;
        });

        return summary;
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    );
  }, [form.meals]);

  const updateMeal = (
    mealIndex: number,
    updater: (
      meal: NutritionMealRequest,
    ) => NutritionMealRequest,
  ) => {
    setForm((previous) => ({
      ...previous,
      meals: previous.meals.map((meal, index) =>
        index === mealIndex ? updater(meal) : meal,
      ),
    }));
  };

  const updateFood = (
    mealIndex: number,
    foodIndex: number,
    updater: (
      food: NutritionFoodRequest,
    ) => NutritionFoodRequest,
  ) => {
    updateMeal(mealIndex, (meal) => ({
      ...meal,
      foods: meal.foods.map((food, index) =>
        index === foodIndex ? updater(food) : food,
      ),
    }));
  };

  const addMeal = () => {
    setForm((previous) => ({
      ...previous,
      meals: [
        ...previous.meals,
        createEmptyMeal(previous.meals.length),
      ],
    }));
  };

  const removeMeal = (
    mealIndex: number,
  ) => {
    if (form.meals.length <= 1) {
      void showAlert.warning(
        "Không thể xóa",
        "Kế hoạch phải có ít nhất một bữa ăn.",
      );
      return;
    }

    setForm((previous) => ({
      ...previous,
      meals: previous.meals.filter(
        (_, index) => index !== mealIndex,
      ),
    }));
  };

  const addFood = (
    mealIndex: number,
  ) => {
    updateMeal(mealIndex, (meal) => ({
      ...meal,
      foods: [...meal.foods, createEmptyFood()],
    }));
  };

  const removeFood = (
    mealIndex: number,
    foodIndex: number,
  ) => {
    updateMeal(mealIndex, (meal) => ({
      ...meal,
      foods:
        meal.foods.length <= 1
          ? [createEmptyFood()]
          : meal.foods.filter(
              (_, index) => index !== foodIndex,
            ),
    }));
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      void showAlert.warning(
        "Thiếu thông tin",
        "Vui lòng nhập tên kế hoạch.",
      );
      return false;
    }

    if (!form.goal.trim()) {
      void showAlert.warning(
        "Thiếu thông tin",
        "Vui lòng nhập mục tiêu dinh dưỡng.",
      );
      return false;
    }

    if (form.durationWeeks < 1 || form.durationWeeks > 52) {
      void showAlert.warning(
        "Thời lượng không hợp lệ",
        "Thời lượng kế hoạch phải từ 1 đến 52 tuần.",
      );
      return false;
    }

    if (
      form.dailyCalories !== undefined &&
      (form.dailyCalories < 500 || form.dailyCalories > 10000)
    ) {
      void showAlert.warning(
        "Calories không hợp lệ",
        "Calories/ngày phải từ 500 đến 10.000 kcal.",
      );
      return false;
    }

    const validFoods = form.meals.flatMap((meal) =>
      meal.foods.filter((food) => food.foodName.trim()),
    );

    if (validFoods.length === 0) {
      void showAlert.warning(
        "Thiếu thực đơn",
        "Vui lòng thêm ít nhất một món ăn.",
      );
      return false;
    }

    return true;
  };

  const buildPayload = (): NutritionPlanRequest => {
    const meals = form.meals
      .map((meal) => ({
        mealName: meal.mealName.trim() || "Bữa ăn",
        foods: meal.foods
          .filter((food) => food.foodName.trim())
          .map((food) => ({
            ...food,
            foodName: food.foodName.trim(),
            unit: normalizeText(food.unit),
            portionText: normalizeText(food.portionText),
            preparation: normalizeText(food.preparation),
            substitution: normalizeText(food.substitution),
            note: normalizeText(food.note),
          })),
      }))
      .filter((meal) => meal.foods.length > 0);

    return {
      ...form,
      name: form.name.trim(),
      description: normalizeText(form.description),
      goal: form.goal.trim(),
      startDate: normalizeText(form.startDate),
      expectedEndDate: normalizeText(form.expectedEndDate),
      foodsToLimit: normalizeText(form.foodsToLimit),
      substitutionNote: normalizeText(form.substitutionNote),
      trainerNote: normalizeText(form.trainerNote),
      memberNote: normalizeText(form.memberNote),
      warningMessage: normalizeText(form.warningMessage),
      mealsPerDay: meals.length,
      meals,
    };
  };

  const handleSave = async (): Promise<void> => {
    if (saving || !validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      const savedPlan =
        isEditMode && planId !== null
          ? await nutritionService.updatePlan(planId, payload)
          : await nutritionService.createPlan(payload);

      await showAlert.success(
        "Thành công",
        isEditMode
          ? "Đã cập nhật kế hoạch dinh dưỡng."
          : "Đã tạo kế hoạch dinh dưỡng mới.",
      );

      navigate(
        ROUTES.MEMBER_NUTRITION_DETAIL.replace(
          ":id",
          String(savedPlan.id),
        ),
        { replace: true },
      );
    } catch (error) {
      await showAlert.error(
        "Không thể lưu",
        getApiErrorMessage(
          error,
          "Không thể lưu kế hoạch dinh dưỡng.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading label="Đang tải kế hoạch dinh dưỡng..." />;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-1 rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fit-primary">
              Nutrition Editor
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
              {isEditMode
                ? "Chỉnh sửa kế hoạch dinh dưỡng"
                : "Tạo kế hoạch dinh dưỡng"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Thiết lập calories, macro và từng bữa ăn. Chỉ có một nút lưu chính để tránh nhầm thao tác.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => void handleSave()}
          isLoading={saving}
          loadingText="Đang lưu..."
          className="xl:min-w-[180px]"
        >
          <Save className="h-4 w-4" />
          Lưu kế hoạch
        </Button>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-black text-slate-900">
              Thông tin kế hoạch
            </h2>
            <p className="text-xs text-slate-500">
              Thông số tổng quát và mục tiêu mỗi ngày.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label="Tên kế hoạch *"
            value={form.name}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
            className="xl:col-span-2"
          />

          <label className="block">
            <span className="text-sm font-medium text-fit-text">
              Mục tiêu *
            </span>
            <select
              value={form.goal}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  goal: event.target.value,
                }))
              }
              className="mt-2 min-h-11 w-full rounded-xl border border-fit-border bg-white px-4 text-sm outline-none focus:border-fit-primary"
            >
              <option value="LOSE_WEIGHT">Giảm cân</option>
              <option value="GAIN_MUSCLE">Tăng cơ</option>
              <option value="MAINTAIN_HEALTH">Duy trì sức khỏe</option>
              <option value="IMPROVE_PERFORMANCE">Cải thiện hiệu suất</option>
            </select>
          </label>

          <Input
            label="Thời lượng (tuần)"
            type="number"
            min={1}
            max={52}
            value={form.durationWeeks}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                durationWeeks:
                  numberOrUndefined(event.target.value) ?? 1,
              }))
            }
          />

          <Input
            label="Calories/ngày"
            type="number"
            min={500}
            max={10000}
            value={form.dailyCalories ?? ""}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                dailyCalories: numberOrUndefined(event.target.value),
              }))
            }
          />

          <Input
            label="Protein (g)"
            type="number"
            min={0}
            step="0.1"
            value={form.proteinGrams ?? ""}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                proteinGrams: numberOrUndefined(event.target.value),
              }))
            }
          />

          <Input
            label="Carbs (g)"
            type="number"
            min={0}
            step="0.1"
            value={form.carbohydrateGrams ?? ""}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                carbohydrateGrams: numberOrUndefined(event.target.value),
              }))
            }
          />

          <Input
            label="Fat (g)"
            type="number"
            min={0}
            step="0.1"
            value={form.fatGrams ?? ""}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                fatGrams: numberOrUndefined(event.target.value),
              }))
            }
          />

          <Input
            label="Fiber (g)"
            type="number"
            min={0}
            step="0.1"
            value={form.fiberGrams ?? ""}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                fiberGrams: numberOrUndefined(event.target.value),
              }))
            }
          />

          <Input
            label="Nước/ngày (ml)"
            type="number"
            min={0}
            max={20000}
            value={form.waterMlPerDay ?? ""}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                waterMlPerDay: numberOrUndefined(event.target.value),
              }))
            }
          />

          <Input
            label="Ngày bắt đầu"
            type="date"
            value={form.startDate ?? ""}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                startDate: event.target.value,
              }))
            }
          />

          <Input
            label="Ngày kết thúc dự kiến"
            type="date"
            value={form.expectedEndDate ?? ""}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                expectedEndDate: event.target.value,
              }))
            }
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-fit-text">
              Mô tả
            </span>
            <textarea
              value={form.description ?? ""}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              rows={3}
              className="mt-2 w-full rounded-xl border border-fit-border bg-white p-3 text-sm outline-none focus:border-fit-primary"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-fit-text">
              Ghi chú của hội viên
            </span>
            <textarea
              value={form.memberNote ?? ""}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  memberNote: event.target.value,
                }))
              }
              rows={3}
              className="mt-2 w-full rounded-xl border border-fit-border bg-white p-3 text-sm outline-none focus:border-fit-primary"
            />
          </label>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-900">
                Thực đơn trong ngày
              </h2>
              <p className="text-xs text-slate-500">
                Thêm hoặc xóa bữa ăn và món ăn linh hoạt.
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={addMeal}>
            <Plus className="h-4 w-4" />
            Thêm bữa ăn
          </Button>
        </div>

        <div className="mt-6 space-y-5">
          {form.meals.map((meal, mealIndex) => (
            <section
              key={`${mealIndex}-${meal.mealName}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <Input
                  aria-label={`Tên bữa ${mealIndex + 1}`}
                  value={meal.mealName}
                  onChange={(event) =>
                    updateMeal(mealIndex, (current) => ({
                      ...current,
                      mealName: event.target.value,
                    }))
                  }
                  className="font-bold"
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => addFood(mealIndex)}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm món
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => removeMeal(mealIndex)}
                    aria-label="Xóa bữa ăn"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 p-4">
                {meal.foods.map((food, foodIndex) => (
                  <article
                    key={`${mealIndex}-${foodIndex}`}
                    className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-black text-slate-800">
                        Món {foodIndex + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          removeFood(mealIndex, foodIndex)
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Xóa món ăn"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                      <div className="xl:col-span-2">
                        <Input
                          label="Tên món *"
                          value={food.foodName}
                          onChange={(event) =>
                            updateFood(
                              mealIndex,
                              foodIndex,
                              (current) => ({
                                ...current,
                                foodName: event.target.value,
                              }),
                            )
                          }
                        />
                      </div>

                      <Input
                        label="Khối lượng"
                        type="number"
                        min={0}
                        step="0.1"
                        value={food.quantity ?? ""}
                        onChange={(event) =>
                          updateFood(
                            mealIndex,
                            foodIndex,
                            (current) => ({
                              ...current,
                              quantity: numberOrUndefined(
                                event.target.value,
                              ),
                            }),
                          )
                        }
                      />

                      <Input
                        label="Đơn vị"
                        value={food.unit ?? ""}
                        onChange={(event) =>
                          updateFood(
                            mealIndex,
                            foodIndex,
                            (current) => ({
                              ...current,
                              unit: event.target.value,
                            }),
                          )
                        }
                      />

                      <Input
                        label="Calories"
                        type="number"
                        min={0}
                        value={food.calories ?? ""}
                        onChange={(event) =>
                          updateFood(
                            mealIndex,
                            foodIndex,
                            (current) => ({
                              ...current,
                              calories: numberOrUndefined(
                                event.target.value,
                              ),
                            }),
                          )
                        }
                      />

                      <Input
                        label="Khẩu phần"
                        value={food.portionText ?? ""}
                        onChange={(event) =>
                          updateFood(
                            mealIndex,
                            foodIndex,
                            (current) => ({
                              ...current,
                              portionText: event.target.value,
                            }),
                          )
                        }
                      />

                      <Input
                        label="Protein (g)"
                        type="number"
                        min={0}
                        step="0.1"
                        value={food.proteinGrams ?? ""}
                        onChange={(event) =>
                          updateFood(
                            mealIndex,
                            foodIndex,
                            (current) => ({
                              ...current,
                              proteinGrams: numberOrUndefined(
                                event.target.value,
                              ),
                            }),
                          )
                        }
                      />

                      <Input
                        label="Carbs (g)"
                        type="number"
                        min={0}
                        step="0.1"
                        value={food.carbohydrateGrams ?? ""}
                        onChange={(event) =>
                          updateFood(
                            mealIndex,
                            foodIndex,
                            (current) => ({
                              ...current,
                              carbohydrateGrams: numberOrUndefined(
                                event.target.value,
                              ),
                            }),
                          )
                        }
                      />

                      <Input
                        label="Fat (g)"
                        type="number"
                        min={0}
                        step="0.1"
                        value={food.fatGrams ?? ""}
                        onChange={(event) =>
                          updateFood(
                            mealIndex,
                            foodIndex,
                            (current) => ({
                              ...current,
                              fatGrams: numberOrUndefined(
                                event.target.value,
                              ),
                            }),
                          )
                        }
                      />

                      <div className="md:col-span-2 xl:col-span-3">
                        <Input
                          label="Cách chế biến"
                          value={food.preparation ?? ""}
                          onChange={(event) =>
                            updateFood(
                              mealIndex,
                              foodIndex,
                              (current) => ({
                                ...current,
                                preparation: event.target.value,
                              }),
                            )
                          }
                        />
                      </div>

                      <div className="md:col-span-2 xl:col-span-3">
                        <Input
                          label="Món thay thế"
                          value={food.substitution ?? ""}
                          onChange={(event) =>
                            updateFood(
                              mealIndex,
                              foodIndex,
                              (current) => ({
                                ...current,
                                substitution: event.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl bg-slate-950 p-5 text-white sm:grid-cols-2 lg:grid-cols-4">
          <SummaryValue label="Tổng calories" value={`${Math.round(totals.calories)} kcal`} />
          <SummaryValue label="Protein" value={`${totals.protein.toFixed(1)} g`} />
          <SummaryValue label="Carbs" value={`${totals.carbs.toFixed(1)} g`} />
          <SummaryValue label="Fat" value={`${totals.fat.toFixed(1)} g`} />
        </div>
      </Card>

      <div className="flex justify-end border-t border-slate-200 pt-5">
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.MEMBER_NUTRITION)}
        >
          Hủy và quay lại
        </Button>
      </div>
    </div>
  );
}

function SummaryValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-black">
        {value}
      </p>
    </div>
  );
}
