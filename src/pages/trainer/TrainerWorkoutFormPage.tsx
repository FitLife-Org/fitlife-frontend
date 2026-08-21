import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Activity,
    Calendar,
    ChevronLeft,
    Dumbbell,
    Plus,
    Save,
    Trash2,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    useFieldArray,
    useForm,
    type Control,
    type UseFormRegister,
} from "react-hook-form";

import gsap from "gsap";

import {
    useGSAP,
} from "@gsap/react";

import toast from "react-hot-toast";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

import {
    workoutService,
} from "../../services/workoutService";

import type {
    WorkoutPlanCreateRequest,
} from "../../types/workout.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

const DEFAULT_FORM:
    WorkoutPlanCreateRequest = {
    name: "",

    goal: "",

    experienceLevel:
        "BEGINNER",

    durationWeeks: 4,

    workoutDaysPerWeek: 3,

    workoutDurationMinutes: 60,

    description: "",

    note: "",

    days: [
        {
            weekNo: 1,

            dayNo: 1,

            name: "Ngày 1",

            estimatedMinutes:
                60,

            isRestDay:
                false,

            exercises: [],
        },
    ],
};

export default function TrainerWorkoutFormPage() {
    const {
        memberId,
        planId,
    } =
        useParams<{
            memberId: string;
            planId: string;
        }>();

    const navigate =
        useNavigate();

    const isEditMode =
        Boolean(planId);

    const containerRef =
        useRef<HTMLDivElement>(
            null,
        );

    const [
        loading,
        setLoading,
    ] =
        useState(false);

    const [
        fetching,
        setFetching,
    ] =
        useState(
            isEditMode,
        );

    const {
        register,
        control,
        handleSubmit,
        reset,

        formState: {
            errors,
        },
    } =
        useForm<WorkoutPlanCreateRequest>({
            defaultValues:
            DEFAULT_FORM,
        });

    const {
        fields:
            dayFields,

        append:
            appendDay,

        remove:
            removeDay,
    } =
        useFieldArray({
            control,

            name:
                "days",
        });

    // =====================================================
    // VALIDATE ROUTE
    // =====================================================

    const numericMemberId =
        Number(memberId);

    const hasValidMemberId =
        Number.isInteger(
            numericMemberId,
        ) &&
        numericMemberId > 0;

    // =====================================================
    // LOAD EDIT DATA
    // =====================================================

    useEffect(() => {
        if (
            !isEditMode ||
            !planId
        ) {
            setFetching(
                false,
            );

            return;
        }

        const fetchPlan =
            async (): Promise<void> => {
                try {
                    setFetching(
                        true,
                    );

                    const plan =
                        await workoutService
                            .getWorkoutPlanDetails(
                                planId,
                            );

                    reset({
                        name:
                        plan.name,

                        goal:
                            plan.goal ??
                            "",

                        experienceLevel:
                            plan.experienceLevel ??
                            "BEGINNER",

                        durationWeeks:
                            plan.durationWeeks ??
                            4,

                        workoutDaysPerWeek:
                            plan.workoutDaysPerWeek ??
                            3,

                        workoutDurationMinutes:
                            plan.workoutDurationMinutes ??
                            60,

                        description:
                            plan.description ??
                            "",

                        note:
                            plan.note ??
                            "",

                        days:
                            (
                                plan.days ??
                                []
                            ).map(
                                (
                                    day,
                                    index,
                                ) => ({
                                    weekNo:
                                        day.weekNo ??
                                        1,

                                    dayNo:
                                        day.dayNo ??
                                        index +
                                        1,

                                    dayOfWeek:
                                        day.dayOfWeek ??
                                        undefined,

                                    name:
                                        day.name ??
                                        `Ngày ${index + 1}`,

                                    focusArea:
                                        day.focusArea ??
                                        "",

                                    estimatedMinutes:
                                        day.estimatedMinutes ??
                                        60,

                                    note:
                                        day.note ??
                                        "",

                                    sortOrder:
                                        day.sortOrder ??
                                        index,

                                    isRestDay:
                                        Boolean(
                                            day.isRestDay,
                                        ),

                                    exercises:
                                        (
                                            day.exercises ??
                                            []
                                        ).map(
                                            (
                                                exercise,
                                                exerciseIndex,
                                            ) => ({
                                                exerciseName:
                                                exercise.exerciseName,

                                                targetMuscle:
                                                    exercise.targetMuscle ??
                                                    "",

                                                equipmentId:
                                                    exercise.equipmentId ??
                                                    undefined,

                                                sets:
                                                    exercise.sets ??
                                                    3,

                                                reps:
                                                    exercise.reps ??
                                                    "10",

                                                weightKg:
                                                    exercise.weightKg ??
                                                    undefined,

                                                durationMinutes:
                                                    exercise.durationMinutes ??
                                                    undefined,

                                                distanceKm:
                                                    exercise.distanceKm ??
                                                    undefined,

                                                restSeconds:
                                                    exercise.restSeconds ??
                                                    60,

                                                tempo:
                                                    exercise.tempo ??
                                                    "",

                                                rpe:
                                                    exercise.rpe ??
                                                    undefined,

                                                instruction:
                                                    exercise.instruction ??
                                                    "",

                                                note:
                                                    exercise.note ??
                                                    "",

                                                videoUrl:
                                                    exercise.videoUrl ??
                                                    "",

                                                sortOrder:
                                                    exercise.sortOrder ??
                                                    exerciseIndex,

                                                isOptional:
                                                    Boolean(
                                                        exercise.isOptional,
                                                    ),
                                            }),
                                        ),
                                }),
                            ),
                    });
                } catch (error) {
                    toast.error(
                        getApiErrorMessage(
                            error,
                            "Không thể tải giáo án.",
                        ),
                    );
                } finally {
                    setFetching(
                        false,
                    );
                }
            };

        void fetchPlan();
    }, [
        isEditMode,
        planId,
        reset,
    ]);

    // =====================================================
    // ANIMATION
    // =====================================================

    useGSAP(
        () => {
            if (fetching) {
                return;
            }

            gsap.from(
                ".gsap-form-section",
                {
                    y: 20,

                    opacity: 0,

                    duration:
                        0.45,

                    stagger:
                        0.08,

                    ease:
                        "power2.out",
                },
            );
        },
        {
            dependencies: [
                fetching,
            ],

            scope:
            containerRef,
        },
    );

    // =====================================================
    // SUBMIT
    // =====================================================

    const onSubmit =
        async (
            data:
            WorkoutPlanCreateRequest,
        ): Promise<void> => {
            if (
                !hasValidMemberId
            ) {
                toast.error(
                    "Member ID không hợp lệ.",
                );

                return;
            }

            try {
                setLoading(
                    true,
                );

                const normalizedData:
                    WorkoutPlanCreateRequest = {
                    ...data,

                    name:
                        data.name
                            .trim(),

                    goal:
                        data.goal
                            ?.trim(),

                    experienceLevel:
                        data.experienceLevel
                            ?.trim(),

                    description:
                        data.description
                            ?.trim(),

                    note:
                        data.note
                            ?.trim(),

                    days:
                        (
                            data.days ??
                            []
                        ).map(
                            (
                                day,
                                dayIndex,
                            ) => ({
                                ...day,

                                sortOrder:
                                    day.sortOrder ??
                                    dayIndex,

                                name:
                                    day.name
                                        ?.trim(),

                                focusArea:
                                    day.focusArea
                                        ?.trim(),

                                note:
                                    day.note
                                        ?.trim(),

                                exercises:
                                    (
                                        day.exercises ??
                                        []
                                    ).map(
                                        (
                                            exercise,
                                            exerciseIndex,
                                        ) => ({
                                            ...exercise,

                                            exerciseName:
                                                exercise.exerciseName
                                                    .trim(),

                                            targetMuscle:
                                                exercise.targetMuscle
                                                    ?.trim(),

                                            instruction:
                                                exercise.instruction
                                                    ?.trim(),

                                            note:
                                                exercise.note
                                                    ?.trim(),

                                            sortOrder:
                                                exercise.sortOrder ??
                                                exerciseIndex,
                                        }),
                                    ),
                            }),
                        ),
                };

                if (
                    isEditMode &&
                    planId
                ) {
                    /*
                     * Controller Trainer PATCH chỉ update
                     * metadata của plan.
                     */
                    await workoutService
                        .updateTrainerWorkoutPlan(
                            planId,
                            numericMemberId,
                            {
                                name:
                                normalizedData.name,

                                goal:
                                normalizedData.goal,

                                experienceLevel:
                                normalizedData
                                    .experienceLevel,

                                durationWeeks:
                                normalizedData
                                    .durationWeeks,

                                workoutDaysPerWeek:
                                normalizedData
                                    .workoutDaysPerWeek,

                                workoutDurationMinutes:
                                normalizedData
                                    .workoutDurationMinutes,

                                description:
                                normalizedData
                                    .description,

                                note:
                                normalizedData.note,
                            },
                        );

                    /*
                     * Structure có API riêng:
                     * PUT /workout-plans/{id}/structure
                     *
                     * Backend hiện endpoint này dành Member.
                     * Nếu Trainer bị 403 thì BE cần thêm
                     * trainer endpoint tương ứng.
                     */
                    if (
                        normalizedData.days
                    ) {
                        await workoutService
                            .updateWorkoutPlanStructure(
                                planId,
                                normalizedData.days,
                            );
                    }

                    toast.success(
                        "Cập nhật giáo án thành công.",
                    );
                } else {
                    await workoutService
                        .createTrainerWorkoutPlan(
                            numericMemberId,
                            normalizedData,
                        );

                    toast.success(
                        "Tạo giáo án mới thành công.",
                    );
                }

                navigate(
                    `/trainer/members/${numericMemberId}/workouts`,
                );
            } catch (error) {
                toast.error(
                    getApiErrorMessage(
                        error,
                        isEditMode
                            ? "Không thể cập nhật giáo án."
                            : "Không thể tạo giáo án.",
                    ),
                );
            } finally {
                setLoading(
                    false,
                );
            }
        };

    if (fetching) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <div
                    className="
                        h-9
                        w-9
                        animate-spin
                        rounded-full
                        border-4
                        border-fit-primary
                        border-t-transparent
                    "
                />
            </div>
        );
    }

    if (!hasValidMemberId) {
        return (
            <Card className="mx-auto max-w-xl p-10 text-center">
                <h1 className="text-xl font-black text-slate-900">
                    Member ID không hợp lệ
                </h1>

                <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() =>
                        navigate(
                            "/trainer/members",
                        )
                    }
                >
                    Quay lại danh sách hội viên
                </Button>
            </Card>
        );
    }

    return (
        <div
            ref={
                containerRef
            }
            className="space-y-6 pb-24"
        >
            {/* HEADER */}

            <div
                className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/trainer/members/${numericMemberId}/workouts`,
                            )
                        }
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-white
                            text-slate-600
                            shadow-sm
                            transition
                            hover:bg-slate-100
                        "
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div>
                        <h1 className="text-2xl font-black text-slate-900">
                            {isEditMode
                                ? "Chỉnh sửa giáo án"
                                : "Tạo giáo án mới"}
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Thiết kế kế hoạch tập luyện cá nhân hóa cho hội viên.
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    isLoading={
                        loading
                    }
                    loadingText={
                        isEditMode
                            ? "Đang lưu..."
                            : "Đang tạo..."
                    }
                    onClick={() => {
                        void handleSubmit(
                            onSubmit,
                        )();
                    }}
                >
                    <Save className="h-4 w-4" />

                    {isEditMode
                        ? "Lưu thay đổi"
                        : "Tạo giáo án"}
                </Button>
            </div>

            <form
                className="space-y-6"
                onSubmit={
                    handleSubmit(
                        onSubmit,
                    )
                }
            >
                {/* GENERAL */}

                <Card className="gsap-form-section border-t-4 border-t-violet-500 p-6">
                    <div className="mb-6 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-violet-500" />

                        <h2 className="text-lg font-black text-slate-800">
                            Thông tin chung
                        </h2>
                    </div>

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-5
                            md:grid-cols-2
                            xl:grid-cols-3
                        "
                    >
                        <Input
                            label="Tên giáo án (*)"
                            placeholder="VD: Tăng cơ 4 tuần"
                            {...register(
                                "name",
                                {
                                    required:
                                        "Vui lòng nhập tên giáo án.",
                                },
                            )}
                            error={
                                errors.name
                                    ?.message
                            }
                        />

                        <Input
                            label="Mục tiêu"
                            placeholder="VD: Tăng cơ, giảm mỡ"
                            {...register(
                                "goal",
                            )}
                        />

                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Trình độ
                            </label>

                            <select
                                {...register(
                                    "experienceLevel",
                                )}
                                className="
                                    h-11
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4
                                    text-sm
                                    outline-none
                                    focus:border-fit-primary
                                    focus:ring-4
                                    focus:ring-emerald-500/10
                                "
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

                        <Input
                            type="number"
                            min={1}
                            label="Thời lượng (tuần)"
                            {...register(
                                "durationWeeks",
                                {
                                    valueAsNumber:
                                        true,

                                    min: {
                                        value:
                                            1,

                                        message:
                                            "Tối thiểu 1 tuần.",
                                    },
                                },
                            )}
                            error={
                                errors
                                    .durationWeeks
                                    ?.message
                            }
                        />

                        <Input
                            type="number"
                            min={1}
                            max={7}
                            label="Buổi / tuần"
                            {...register(
                                "workoutDaysPerWeek",
                                {
                                    valueAsNumber:
                                        true,
                                },
                            )}
                        />

                        <Input
                            type="number"
                            min={10}
                            label="Phút / buổi"
                            {...register(
                                "workoutDurationMinutes",
                                {
                                    valueAsNumber:
                                        true,
                                },
                            )}
                        />

                        <div className="md:col-span-2 xl:col-span-3">
                            <Input
                                label="Mô tả"
                                placeholder="Mô tả mục đích và cấu trúc giáo án..."
                                {...register(
                                    "description",
                                )}
                            />
                        </div>

                        <div className="md:col-span-2 xl:col-span-3">
                            <Input
                                label="Ghi chú của PT"
                                placeholder="Dặn dò thêm cho hội viên..."
                                {...register(
                                    "note",
                                )}
                            />
                        </div>
                    </div>
                </Card>

                {/* DAYS */}

                <Card className="gsap-form-section border-t-4 border-t-blue-500 p-6">
                    <div
                        className="
                            mb-6
                            flex
                            flex-col
                            gap-3
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />

                            <h2 className="text-lg font-black text-slate-800">
                                Cấu trúc ngày tập
                            </h2>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                appendDay({
                                    weekNo:
                                        1,

                                    dayNo:
                                        dayFields.length +
                                        1,

                                    name:
                                        `Ngày ${dayFields.length + 1}`,

                                    estimatedMinutes:
                                        60,

                                    isRestDay:
                                        false,

                                    exercises:
                                        [],
                                })
                            }
                        >
                            <Plus className="h-4 w-4" />

                            Thêm ngày
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {dayFields.map(
                            (
                                dayField,
                                dayIndex,
                            ) => (
                                <div
                                    key={
                                        dayField.id
                                    }
                                    className="
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        p-5
                                    "
                                >
                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-4
                                            xl:flex-row
                                            xl:items-end
                                        "
                                    >
                                        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-4">
                                            <Input
                                                type="number"
                                                label="Tuần"
                                                {...register(
                                                    `days.${dayIndex}.weekNo`,
                                                    {
                                                        valueAsNumber:
                                                            true,
                                                    },
                                                )}
                                            />

                                            <Input
                                                type="number"
                                                label="Ngày"
                                                {...register(
                                                    `days.${dayIndex}.dayNo`,
                                                    {
                                                        valueAsNumber:
                                                            true,
                                                    },
                                                )}
                                            />

                                            <div className="md:col-span-2">
                                                <Input
                                                    label="Tên buổi tập"
                                                    placeholder="VD: Ngực - Tay sau"
                                                    {...register(
                                                        `days.${dayIndex}.name`,
                                                    )}
                                                />
                                            </div>

                                            <Input
                                                label="Nhóm cơ chính"
                                                placeholder="VD: Ngực"
                                                {...register(
                                                    `days.${dayIndex}.focusArea`,
                                                )}
                                            />

                                            <Input
                                                type="number"
                                                label="Thời lượng"
                                                {...register(
                                                    `days.${dayIndex}.estimatedMinutes`,
                                                    {
                                                        valueAsNumber:
                                                            true,
                                                    },
                                                )}
                                            />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <label
                                                className="
                                                    flex
                                                    cursor-pointer
                                                    items-center
                                                    gap-2
                                                    rounded-xl
                                                    bg-white
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                    font-semibold
                                                    text-slate-600
                                                "
                                            >
                                                <input
                                                    type="checkbox"
                                                    {...register(
                                                        `days.${dayIndex}.isRestDay`,
                                                    )}
                                                />

                                                Ngày nghỉ
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeDay(
                                                        dayIndex,
                                                    )
                                                }
                                                className="
                                                    flex
                                                    h-10
                                                    w-10
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    bg-red-50
                                                    text-red-500
                                                    transition
                                                    hover:bg-red-500
                                                    hover:text-white
                                                "
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <ExerciseList
                                        control={
                                            control
                                        }
                                        register={
                                            register
                                        }
                                        dayIndex={
                                            dayIndex
                                        }
                                    />
                                </div>
                            ),
                        )}
                    </div>
                </Card>

                <Button
                    type="submit"
                    variant="primary"
                    isLoading={
                        loading
                    }
                    className="w-full sm:hidden"
                >
                    <Save className="h-4 w-4" />

                    Lưu giáo án
                </Button>
            </form>
        </div>
    );
}

interface ExerciseListProps {
    control:
        Control<WorkoutPlanCreateRequest>;

    register:
        UseFormRegister<WorkoutPlanCreateRequest>;

    dayIndex:
        number;
}

function ExerciseList({
                          control,
                          register,
                          dayIndex,
                      }: ExerciseListProps) {
    /*
     * React Hook Form có giới hạn type inference với
     * field-array lồng nhau và dynamic index.
     *
     * Cast name ở đây chỉ phục vụ RHF path,
     * data cuối vẫn được kiểm soát bởi
     * WorkoutPlanCreateRequest.
     */
    const {
        fields:
            exerciseFields,

        append:
            appendExercise,

        remove:
            removeExercise,
    } =
        useFieldArray({
            control,

            name:
                `days.${dayIndex}.exercises` as
                    `days.${number}.exercises`,
        });

    return (
        <div
            className="
                mt-5
                space-y-4
                border-t
                border-slate-200
                pt-5
            "
        >
            <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-slate-500" />

                <h4 className="font-black text-slate-700">
                    Danh sách bài tập
                </h4>
            </div>

            {exerciseFields.map(
                (
                    exerciseField,
                    exerciseIndex,
                ) => (
                    <div
                        key={
                            exerciseField.id
                        }
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            p-4
                            md:grid-cols-12
                        "
                    >
                        <div className="md:col-span-4">
                            <Input
                                placeholder="Tên bài tập"
                                {...register(
                                    `days.${dayIndex}.exercises.${exerciseIndex}.exerciseName`,
                                    {
                                        required:
                                            true,
                                    },
                                )}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Input
                                placeholder="Nhóm cơ"
                                {...register(
                                    `days.${dayIndex}.exercises.${exerciseIndex}.targetMuscle`,
                                )}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <Input
                                type="number"
                                placeholder="Sets"
                                {...register(
                                    `days.${dayIndex}.exercises.${exerciseIndex}.sets`,
                                    {
                                        valueAsNumber:
                                            true,
                                    },
                                )}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Input
                                placeholder="Reps"
                                {...register(
                                    `days.${dayIndex}.exercises.${exerciseIndex}.reps`,
                                )}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Input
                                type="number"
                                placeholder="Nghỉ (giây)"
                                {...register(
                                    `days.${dayIndex}.exercises.${exerciseIndex}.restSeconds`,
                                    {
                                        valueAsNumber:
                                            true,
                                    },
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-end md:col-span-1">
                            <button
                                type="button"
                                onClick={() =>
                                    removeExercise(
                                        exerciseIndex,
                                    )
                                }
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-red-50
                                    text-red-500
                                    transition
                                    hover:bg-red-500
                                    hover:text-white
                                "
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="md:col-span-12">
                            <Input
                                placeholder="Ghi chú bài tập..."
                                {...register(
                                    `days.${dayIndex}.exercises.${exerciseIndex}.note`,
                                )}
                            />
                        </div>
                    </div>
                ),
            )}

            <Button
                type="button"
                variant="outline"
                onClick={() =>
                    appendExercise({
                        exerciseName:
                            "",

                        targetMuscle:
                            "",

                        sets:
                            3,

                        reps:
                            "10",

                        restSeconds:
                            60,

                        note:
                            "",

                        isOptional:
                            false,
                    })
                }
                className="
                    w-full
                    border-dashed
                    border-slate-300
                "
            >
                <Plus className="h-4 w-4" />

                Thêm bài tập
            </Button>
        </div>
    );
}