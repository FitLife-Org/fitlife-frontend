import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    ChevronLeft, 
    Save, 
    Plus, 
    Trash2, 
    Utensils, 
    Flame, 
    Salad 
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import toast from "react-hot-toast";
import { useForm, useFieldArray, Controller } from "react-hook-form";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

import { nutritionService } from "../../services/nutritionService";
import type { NutritionPlanRequest } from "../../types/nutrition.type";
import { getApiErrorMessage } from "../../utils/apiError";

export default function TrainerNutritionFormPage() {
    const { memberId, planId } = useParams<{ memberId: string; planId: string }>();
    const navigate = useNavigate();
    const isEditMode = !!planId;
    const containerRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<NutritionPlanRequest>({
        defaultValues: {
            name: "",
            goal: "",
            durationWeeks: 4,
            dailyCalories: 0,
            proteinGrams: 0,
            carbohydrateGrams: 0,
            fatGrams: 0,
            trainerNote: "",
            meals: [
                { mealName: "Bữa sáng", foods: [] },
                { mealName: "Bữa trưa", foods: [] },
                { mealName: "Bữa tối", foods: [] }
            ]
        }
    });

    const { fields: mealFields, append: appendMeal, remove: removeMeal } = useFieldArray({
        control,
        name: "meals"
    });

    useEffect(() => {
        if (isEditMode && planId) {
            const fetchPlan = async () => {
                try {
                    const plan = await nutritionService.getPlanById(Number(planId));
                    reset({
                        name: plan.name,
                        description: plan.description || "",
                        goal: plan.goal,
                        durationWeeks: plan.durationWeeks,
                        dailyCalories: plan.dailyCalories || 0,
                        proteinGrams: plan.proteinGrams || 0,
                        carbohydrateGrams: plan.carbohydrateGrams || 0,
                        fatGrams: plan.fatGrams || 0,
                        trainerNote: plan.trainerNote || "",
                        meals: plan.meals.map(m => ({
                            mealName: m.mealName,
                            foods: m.foods.map(f => ({
                                foodName: f.foodName,
                                calories: f.calories || 0,
                                proteinGrams: f.proteinGrams || 0,
                                carbohydrateGrams: f.carbohydrateGrams || 0,
                                fatGrams: f.fatGrams || 0,
                                portionText: f.portionText || ""
                            }))
                        }))
                    });
                } catch (error) {
                    toast.error(getApiErrorMessage(error));
                } finally {
                    setFetching(false);
                }
            };
            void fetchPlan();
        }
    }, [isEditMode, planId, reset]);

    useGSAP(() => {
        if (!fetching) {
            gsap.from(".gsap-form-section", {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power3.out",
            });
        }
    }, [fetching]);

    const onSubmit = async (data: NutritionPlanRequest) => {
        if (!memberId) return;
        try {
            setLoading(true);
            if (isEditMode && planId) {
                await nutritionService.updateTrainerPlan(Number(planId), Number(memberId), data);
                toast.success("Cập nhật giáo án thành công!");
            } else {
                await nutritionService.createTrainerPlan(Number(memberId), data);
                toast.success("Tạo giáo án mới thành công!");
            }
            navigate(`/trainer/members/${memberId}/nutrition`);
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-fit-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="space-y-6 pb-24">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(`/trainer/members/${memberId}/nutrition`)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {isEditMode ? "Chỉnh sửa Giáo án" : "Tạo Giáo án mới"}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Thiết lập dinh dưỡng cá nhân hóa cho học viên</p>
                    </div>
                </div>
                
                <Button 
                    onClick={handleSubmit(onSubmit)} 
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-fit-primary to-blue-600 text-white shadow-lg shadow-fit-primary/20 hover:scale-105 transition-transform"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                    {isEditMode ? "Lưu thay đổi" : "Lưu giáo án"}
                </Button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <Card className="gsap-form-section p-6 border-t-4 border-t-blue-500">
                    <div className="flex items-center gap-2 mb-6">
                        <Salad className="w-6 h-6 text-blue-500" />
                        <h2 className="text-lg font-bold text-slate-800">Thông tin chung</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Tên giáo án (*)" 
                            placeholder="VD: Giảm cân cấp tốc 4 tuần"
                            {...register("name", { required: "Vui lòng nhập tên giáo án" })}
                            error={errors.name?.message}
                        />
                        <Input 
                            label="Mục tiêu (*)" 
                            placeholder="VD: Giảm 3kg mỡ thừa"
                            {...register("goal", { required: "Vui lòng nhập mục tiêu" })}
                            error={errors.goal?.message}
                        />
                        <Input 
                            type="number"
                            label="Thời lượng (tuần) (*)" 
                            {...register("durationWeeks", { required: "Bắt buộc", min: 1 })}
                            error={errors.durationWeeks?.message}
                        />
                        <Input 
                            type="number"
                            label="Tổng Calories/ngày" 
                            {...register("dailyCalories")}
                        />
                        <Input 
                            type="number"
                            label="Protein (g)" 
                            {...register("proteinGrams")}
                        />
                        <Input 
                            type="number"
                            label="Carbs (g)" 
                            {...register("carbohydrateGrams")}
                        />
                        <Input 
                            type="number"
                            label="Fat (g)" 
                            {...register("fatGrams")}
                        />
                        <Input 
                            label="Ghi chú của PT" 
                            placeholder="Dặn dò thêm cho hội viên..."
                            {...register("trainerNote")}
                        />
                    </div>
                </Card>

                <Card className="gsap-form-section p-6 border-t-4 border-t-orange-500">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Utensils className="w-6 h-6 text-orange-500" />
                            <h2 className="text-lg font-bold text-slate-800">Danh sách bữa ăn</h2>
                        </div>
                        <Button 
                            type="button"
                            variant="outline"
                            onClick={() => appendMeal({ mealName: "Bữa phụ", foods: [] })}
                            className="flex items-center gap-2 text-fit-primary border-fit-primary hover:bg-fit-primary hover:text-white"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm bữa ăn
                        </Button>
                    </div>

                    <div className="space-y-8">
                        {mealFields.map((meal, mealIndex) => (
                            <div key={meal.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm relative group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-1/3">
                                        <Input 
                                            placeholder="Tên bữa ăn (VD: Bữa sáng)"
                                            {...register(`meals.${mealIndex}.mealName` as const, { required: true })}
                                            className="font-bold text-lg bg-white"
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => removeMeal(mealIndex)}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-2"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <FoodList control={control} register={register} mealIndex={mealIndex} />
                            </div>
                        ))}
                    </div>
                </Card>
            </form>
        </div>
    );
}

function FoodList({ control, register, mealIndex }: { control: any, register: any, mealIndex: number }) {
    const { fields: foodFields, append: appendFood, remove: removeFood } = useFieldArray({
        control,
        name: `meals.${mealIndex}.foods`
    });

    return (
        <div className="space-y-4">
            {foodFields.length > 0 && (
                <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 px-2 uppercase tracking-wider">
                    <div className="col-span-4">Tên món ăn</div>
                    <div className="col-span-2">Định lượng</div>
                    <div className="col-span-1">Kcal</div>
                    <div className="col-span-1">Pro(g)</div>
                    <div className="col-span-1">Carb(g)</div>
                    <div className="col-span-1">Fat(g)</div>
                    <div className="col-span-2 text-right">Xóa</div>
                </div>
            )}
            
            {foodFields.map((food, foodIndex) => (
                <div key={food.id} className="grid grid-cols-12 gap-4 items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="col-span-4">
                        <Input 
                            placeholder="Tên món"
                            {...register(`meals.${mealIndex}.foods.${foodIndex}.foodName` as const, { required: true })}
                            className="bg-slate-50/50"
                        />
                    </div>
                    <div className="col-span-2">
                        <Input 
                            placeholder="VD: 1 bát"
                            {...register(`meals.${mealIndex}.foods.${foodIndex}.portionText` as const)}
                            className="bg-slate-50/50"
                        />
                    </div>
                    <div className="col-span-1">
                        <Input 
                            type="number"
                            placeholder="0"
                            {...register(`meals.${mealIndex}.foods.${foodIndex}.calories` as const)}
                            className="bg-slate-50/50"
                        />
                    </div>
                    <div className="col-span-1">
                        <Input 
                            type="number"
                            placeholder="0"
                            {...register(`meals.${mealIndex}.foods.${foodIndex}.proteinGrams` as const)}
                            className="bg-slate-50/50 text-green-600"
                        />
                    </div>
                    <div className="col-span-1">
                        <Input 
                            type="number"
                            placeholder="0"
                            {...register(`meals.${mealIndex}.foods.${foodIndex}.carbohydrateGrams` as const)}
                            className="bg-slate-50/50 text-orange-600"
                        />
                    </div>
                    <div className="col-span-1">
                        <Input 
                            type="number"
                            placeholder="0"
                            {...register(`meals.${mealIndex}.foods.${foodIndex}.fatGrams` as const)}
                            className="bg-slate-50/50 text-red-600"
                        />
                    </div>
                    <div className="col-span-2 flex justify-end">
                        <button 
                            type="button"
                            onClick={() => removeFood(foodIndex)}
                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}

            <Button 
                type="button"
                variant="outline"
                onClick={() => appendFood({ foodName: "", calories: 0, proteinGrams: 0, carbohydrateGrams: 0, fatGrams: 0 })}
                className="w-full border-dashed border-2 border-slate-300 text-slate-500 hover:bg-slate-100 hover:border-slate-400 mt-4"
            >
                <Plus className="w-4 h-4 mr-2" />
                Thêm món ăn
            </Button>
        </div>
    );
}
