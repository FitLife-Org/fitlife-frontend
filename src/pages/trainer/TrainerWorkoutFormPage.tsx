import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    ChevronLeft, 
    Save, 
    Plus, 
    Trash2, 
    Dumbbell, 
    Calendar,
    Activity
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import toast from "react-hot-toast";
import { useForm, useFieldArray } from "react-hook-form";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

import { workoutService } from "../../services/workoutService";
import type { WorkoutPlanCreateRequest } from "../../types/workout.type";
import { getApiErrorMessage } from "../../utils/apiError";

export default function TrainerWorkoutFormPage() {
    const { memberId, planId } = useParams<{ memberId: string; planId: string }>();
    const navigate = useNavigate();
    const isEditMode = !!planId;
    const containerRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<WorkoutPlanCreateRequest>({
        defaultValues: {
            memberId: Number(memberId),
            name: "",
            goal: "",
            experienceLevel: "BEGINNER",
            durationWeeks: 4,
            workoutDaysPerWeek: 3,
            workoutDurationMinutes: 60,
            description: "",
            note: "",
            days: [
                { weekNo: 1, dayNo: 1, name: "Ngày 1", exercises: [] }
            ]
        }
    });

    const { fields: dayFields, append: appendDay, remove: removeDay } = useFieldArray({
        control,
        name: "days"
    });

    useEffect(() => {
        if (isEditMode && planId) {
            const fetchPlan = async () => {
                try {
                    const plan = await workoutService.getWorkoutPlanDetails(planId);
                    reset({
                        memberId: plan.memberId,
                        name: plan.name,
                        goal: plan.goal || "",
                        experienceLevel: plan.experienceLevel || "BEGINNER",
                        durationWeeks: plan.durationWeeks || 4,
                        workoutDaysPerWeek: plan.workoutDaysPerWeek || 3,
                        workoutDurationMinutes: plan.workoutDurationMinutes || 60,
                        description: plan.description || "",
                        note: plan.note || "",
                        days: plan.days.map(d => ({
                            weekNo: d.weekNo || 1,
                            dayNo: d.dayNo || 1,
                            name: d.name || "",
                            focusArea: d.focusArea || "",
                            estimatedMinutes: d.estimatedMinutes || 60,
                            isRestDay: d.isRestDay || false,
                            exercises: d.exercises.map(e => ({
                                exerciseName: e.exerciseName,
                                sets: e.sets || 3,
                                reps: e.reps || "10",
                                restSeconds: e.restSeconds || 60,
                                targetMuscle: e.targetMuscle || "",
                                weightKg: e.weightKg || 0,
                                note: e.note || ""
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

    const onSubmit = async (data: WorkoutPlanCreateRequest) => {
        if (!memberId) return;
        try {
            setLoading(true);
            if (isEditMode && planId) {
                await workoutService.updateTrainerWorkoutPlan(planId, memberId, data);
                toast.success("Cập nhật lộ trình tập luyện thành công!");
            } else {
                await workoutService.createTrainerWorkoutPlan(memberId, data);
                toast.success("Tạo lộ trình tập luyện mới thành công!");
            }
            navigate(`/trainer/members/${memberId}/workouts`);
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
                        onClick={() => navigate(`/trainer/members/${memberId}/workouts`)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {isEditMode ? "Chỉnh sửa Lộ trình tập luyện" : "Tạo Lộ trình mới"}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Thiết kế lộ trình tập luyện cá nhân hóa cho học viên</p>
                    </div>
                </div>
                
                <Button 
                    onClick={handleSubmit(onSubmit)} 
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-fit-primary to-blue-600 text-white shadow-lg shadow-fit-primary/20 hover:scale-105 transition-transform"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                    {isEditMode ? "Lưu thay đổi" : "Lưu lộ trình"}
                </Button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <Card className="gsap-form-section p-6 border-t-4 border-t-purple-500">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="w-6 h-6 text-purple-500" />
                        <h2 className="text-lg font-bold text-slate-800">Thông tin chung</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Input 
                            label="Tên lộ trình (*)" 
                            placeholder="VD: Lộ trình tăng cơ 4 tuần"
                            {...register("name", { required: "Vui lòng nhập tên lộ trình" })}
                            error={errors.name?.message}
                        />
                        <Input 
                            label="Mục tiêu (*)" 
                            placeholder="VD: Tăng cơ, giảm mỡ"
                            {...register("goal", { required: "Vui lòng nhập mục tiêu" })}
                            error={errors.goal?.message}
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700">Mức độ (*)</label>
                            <select 
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-fit-primary focus:ring-1 focus:ring-fit-primary"
                                {...register("experienceLevel")}
                            >
                                <option value="BEGINNER">Người mới bắt đầu</option>
                                <option value="INTERMEDIATE">Trung bình</option>
                                <option value="ADVANCED">Nâng cao</option>
                            </select>
                        </div>
                        <Input 
                            type="number"
                            label="Thời lượng (tuần) (*)" 
                            {...register("durationWeeks", { required: "Bắt buộc", min: 1 })}
                            error={errors.durationWeeks?.message}
                        />
                        <Input 
                            type="number"
                            label="Số buổi tập/tuần" 
                            {...register("workoutDaysPerWeek")}
                        />
                        <Input 
                            type="number"
                            label="Thời lượng/buổi (phút)" 
                            {...register("workoutDurationMinutes")}
                        />
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <Input 
                                label="Mô tả" 
                                placeholder="Mô tả chi tiết lộ trình..."
                                {...register("description")}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <Input 
                                label="Ghi chú của PT" 
                                placeholder="Dặn dò thêm cho hội viên..."
                                {...register("note")}
                            />
                        </div>
                    </div>
                </Card>

                <Card className="gsap-form-section p-6 border-t-4 border-t-blue-500">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Activity className="w-6 h-6 text-blue-500" />
                            <h2 className="text-lg font-bold text-slate-800">Cấu trúc Ngày tập</h2>
                        </div>
                        <Button 
                            type="button"
                            variant="outline"
                            onClick={() => appendDay({ weekNo: 1, dayNo: dayFields.length + 1, name: `Ngày ${dayFields.length + 1}`, exercises: [] })}
                            className="flex items-center gap-2 text-fit-primary border-fit-primary hover:bg-fit-primary hover:text-white"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm ngày tập
                        </Button>
                    </div>

                    <div className="space-y-8">
                        {dayFields.map((day, dayIndex) => (
                            <div key={day.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm relative group">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-24">
                                            <Input 
                                                placeholder="Tuần số"
                                                type="number"
                                                label="Tuần"
                                                {...register(`days.${dayIndex}.weekNo` as const)}
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="w-24">
                                            <Input 
                                                placeholder="Ngày số"
                                                type="number"
                                                label="Ngày"
                                                {...register(`days.${dayIndex}.dayNo` as const)}
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[200px]">
                                            <Input 
                                                placeholder="Tên ngày (VD: Ngực - Tay sau)"
                                                label="Chủ đề buổi tập"
                                                {...register(`days.${dayIndex}.name` as const, { required: true })}
                                                className="font-bold text-lg bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mr-4">
                                            <input 
                                                type="checkbox" 
                                                {...register(`days.${dayIndex}.isRestDay` as const)}
                                                className="w-4 h-4 text-fit-primary rounded border-slate-300 focus:ring-fit-primary"
                                            />
                                            Ngày nghỉ
                                        </label>
                                        <button 
                                            type="button"
                                            onClick={() => removeDay(dayIndex)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-2"
                                            title="Xóa ngày tập"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                
                                <ExerciseList control={control} register={register} dayIndex={dayIndex} />
                            </div>
                        ))}
                    </div>
                </Card>
            </form>
        </div>
    );
}

function ExerciseList({ control, register, dayIndex }: { control: any, register: any, dayIndex: number }) {
    const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
        control,
        name: `days.${dayIndex}.exercises`
    });

    return (
        <div className="space-y-4 border-t border-slate-200 pt-4 mt-4">
            <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-slate-500" />
                Danh sách bài tập
            </h4>
            
            {exerciseFields.length > 0 && (
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 px-2 uppercase tracking-wider">
                    <div className="col-span-3">Tên bài tập</div>
                    <div className="col-span-2">Cơ mục tiêu</div>
                    <div className="col-span-1 text-center">Hiệp (Sets)</div>
                    <div className="col-span-2 text-center">Số Lần (Reps)</div>
                    <div className="col-span-2 text-center">Nghỉ (giây)</div>
                    <div className="col-span-2 text-right">Xóa</div>
                </div>
            )}
            
            {exerciseFields.map((exercise, exerciseIndex) => (
                <div key={exercise.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="col-span-3">
                        <Input 
                            placeholder="VD: Bench Press"
                            {...register(`days.${dayIndex}.exercises.${exerciseIndex}.exerciseName` as const, { required: true })}
                            className="bg-slate-50/50"
                        />
                    </div>
                    <div className="col-span-2">
                        <Input 
                            placeholder="VD: Ngực"
                            {...register(`days.${dayIndex}.exercises.${exerciseIndex}.targetMuscle` as const)}
                            className="bg-slate-50/50"
                        />
                    </div>
                    <div className="col-span-1">
                        <Input 
                            type="number"
                            placeholder="3"
                            {...register(`days.${dayIndex}.exercises.${exerciseIndex}.sets` as const)}
                            className="bg-slate-50/50 text-center"
                        />
                    </div>
                    <div className="col-span-2">
                        <Input 
                            placeholder="10-12"
                            {...register(`days.${dayIndex}.exercises.${exerciseIndex}.reps` as const)}
                            className="bg-slate-50/50 text-center"
                        />
                    </div>
                    <div className="col-span-2">
                        <Input 
                            type="number"
                            placeholder="60"
                            {...register(`days.${dayIndex}.exercises.${exerciseIndex}.restSeconds` as const)}
                            className="bg-slate-50/50 text-center"
                        />
                    </div>
                    <div className="col-span-2 flex justify-end">
                        <button 
                            type="button"
                            onClick={() => removeExercise(exerciseIndex)}
                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="col-span-12 mt-1">
                        <Input 
                            placeholder="Ghi chú thêm (VD: Giữ form chuẩn, xuống chậm...)"
                            {...register(`days.${dayIndex}.exercises.${exerciseIndex}.note` as const)}
                            className="bg-slate-50 text-sm"
                        />
                    </div>
                </div>
            ))}

            <Button 
                type="button"
                variant="outline"
                onClick={() => appendExercise({ exerciseName: "", sets: 3, reps: "10", restSeconds: 60, targetMuscle: "" })}
                className="w-full border-dashed border-2 border-slate-300 text-slate-500 hover:bg-slate-100 hover:border-slate-400 mt-2"
            >
                <Plus className="w-4 h-4 mr-2" />
                Thêm bài tập
            </Button>
        </div>
    );
}
