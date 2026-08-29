import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Copy,
    Dumbbell,
    GripVertical,
    Info,
    Minus,
    Plus,
    RotateCcw,
    Save,
    Trash2,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";

import {
    ROUTES,
} from "../../config/routes";

import {
    workoutService,
} from "../../services/workoutService";

import type {
    WorkoutExerciseRequest,
    WorkoutPlanCreateRequest,
    WorkoutPlanDay,
    WorkoutPlanDayRequest,
    WorkoutPlanDetail,
    WorkoutPlanSourceType,
    WorkoutPlanUpdateRequest,
} from "../../types/workout.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

// ============================================================
// TYPES
// ============================================================

interface WorkoutMetadataForm {
    name: string;
    goal: string;
    experienceLevel: string;

    durationWeeks: string;
    workoutDaysPerWeek: string;
    workoutDurationMinutes: string;

    description: string;
    note: string;
}

interface WorkoutExerciseForm {
    localId: string;

    exerciseName: string;
    targetMuscle: string;

    equipmentId: string;

    sets: string;
    reps: string;

    weightKg: string;

    durationMinutes: string;
    distanceKm: string;

    restSeconds: string;

    tempo: string;
    rpe: string;

    instruction: string;
    note: string;
    videoUrl: string;

    isOptional: boolean;
}

interface WorkoutDayForm {
    localId: string;

    weekNo: string;
    dayNo: string;
    dayOfWeek: string;

    name: string;
    focusArea: string;

    estimatedMinutes: string;

    note: string;

    isRestDay: boolean;

    expanded: boolean;

    exercises: WorkoutExerciseForm[];
}

// ============================================================
// CONSTANTS
// ============================================================

const DAYS_OF_WEEK = [
    {
        value: "MONDAY",
        label: "Thứ 2",
    },
    {
        value: "TUESDAY",
        label: "Thứ 3",
    },
    {
        value: "WEDNESDAY",
        label: "Thứ 4",
    },
    {
        value: "THURSDAY",
        label: "Thứ 5",
    },
    {
        value: "FRIDAY",
        label: "Thứ 6",
    },
    {
        value: "SATURDAY",
        label: "Thứ 7",
    },
    {
        value: "SUNDAY",
        label: "Chủ nhật",
    },
] as const;

const EXPERIENCE_LEVELS = [
    {
        value: "BEGINNER",
        label: "Người mới",
    },
    {
        value: "INTERMEDIATE",
        label: "Trung cấp",
    },
    {
        value: "ADVANCED",
        label: "Nâng cao",
    },
] as const;

const initialMetadata: WorkoutMetadataForm = {
    name: "",
    goal: "",
    experienceLevel: "BEGINNER",

    durationWeeks: "4",
    workoutDaysPerWeek: "3",
    workoutDurationMinutes: "60",

    description: "",
    note: "",
};

// ============================================================
// HELPERS
// ============================================================

function createLocalId(
    prefix: string,
): string {
    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;
}

function createEmptyExercise():
    WorkoutExerciseForm {
    return {
        localId:
            createLocalId(
                "exercise",
            ),

        exerciseName: "",
        targetMuscle: "",

        equipmentId: "",

        sets: "3",
        reps: "10-12",

        weightKg: "",

        durationMinutes: "",
        distanceKm: "",

        restSeconds: "60",

        tempo: "",
        rpe: "",

        instruction: "",
        note: "",
        videoUrl: "",

        isOptional: false,
    };
}

function createEmptyDay(
    index: number,
): WorkoutDayForm {
    const dayNo =
        index + 1;

    return {
        localId:
            createLocalId(
                "day",
            ),

        weekNo: "1",
        dayNo:
            String(dayNo),

        dayOfWeek:
            DAYS_OF_WEEK[
            index %
            DAYS_OF_WEEK.length
                ]?.value ??
            "",

        name:
            `Buổi tập ${dayNo}`,

        focusArea: "",

        estimatedMinutes:
            "60",

        note: "",

        isRestDay: false,

        expanded: true,

        exercises: [
            createEmptyExercise(),
        ],
    };
}

function toOptionalNumber(
    value: string,
): number | undefined {
    if (
        value.trim() ===
        ""
    ) {
        return undefined;
    }

    const number =
        Number(value);

    if (
        !Number.isFinite(
            number,
        )
    ) {
        return undefined;
    }

    return number;
}

function toRequiredNumber(
    value: string,
    fallback: number,
): number {
    const number =
        Number(value);

    if (
        !Number.isFinite(
            number,
        )
    ) {
        return fallback;
    }

    return number;
}

function optionalText(
    value: string,
): string | undefined {
    const normalized =
        value.trim();

    return normalized
        ? normalized
        : undefined;
}

function sourceLabel(
    source:
    WorkoutPlanSourceType,
): string {
    switch (source) {
        case "AI_GENERATED":
            return "FitLife AI";

        case "TRAINER_CREATED":
            return "Huấn luyện viên";

        case "MEMBER_CREATED":
            return "Hội viên";

        case "MANUAL":
            return "Thủ công";

        default:
            return source;
    }
}

function mapDetailToMetadata(
    plan:
    WorkoutPlanDetail,
): WorkoutMetadataForm {
    return {
        name:
            plan.name ??
            "",

        goal:
            plan.goal ??
            "",

        experienceLevel:
            plan.experienceLevel ??
            "BEGINNER",

        durationWeeks:
            String(
                plan.durationWeeks ??
                4,
            ),

        workoutDaysPerWeek:
            String(
                plan.workoutDaysPerWeek ??
                3,
            ),

        workoutDurationMinutes:
            String(
                plan.workoutDurationMinutes ??
                60,
            ),

        description:
            plan.description ??
            "",

        note:
            plan.note ??
            "",
    };
}

function mapExerciseToForm(
    exercise:
    WorkoutPlanDay["exercises"][number],
): WorkoutExerciseForm {
    return {
        localId:
            createLocalId(
                "exercise",
            ),

        exerciseName:
            exercise.exerciseName ??
            "",

        targetMuscle:
            exercise.targetMuscle ??
            "",

        equipmentId:
            exercise.equipmentId !=
            null
                ? String(
                    exercise.equipmentId,
                )
                : "",

        sets:
            exercise.sets !=
            null
                ? String(
                    exercise.sets,
                )
                : "",

        reps:
            exercise.reps ??
            "",

        weightKg:
            exercise.weightKg !=
            null
                ? String(
                    exercise.weightKg,
                )
                : "",

        durationMinutes:
            exercise.durationMinutes !=
            null
                ? String(
                    exercise.durationMinutes,
                )
                : "",

        distanceKm:
            exercise.distanceKm !=
            null
                ? String(
                    exercise.distanceKm,
                )
                : "",

        restSeconds:
            exercise.restSeconds !=
            null
                ? String(
                    exercise.restSeconds,
                )
                : "",

        tempo:
            exercise.tempo ??
            "",

        rpe:
            exercise.rpe !=
            null
                ? String(
                    exercise.rpe,
                )
                : "",

        instruction:
            exercise.instruction ??
            "",

        note:
            exercise.note ??
            "",

        videoUrl:
            exercise.videoUrl ??
            "",

        isOptional:
            exercise.isOptional ??
            false,
    };
}

function mapDayToForm(
    day:
    WorkoutPlanDay,
    index:
    number,
): WorkoutDayForm {
    return {
        localId:
            createLocalId(
                "day",
            ),

        weekNo:
            String(
                day.weekNo ??
                1,
            ),

        dayNo:
            String(
                day.dayNo ??
                index + 1,
            ),

        dayOfWeek:
            day.dayOfWeek ??
            "",

        name:
            day.name ??
            `Buổi tập ${index + 1}`,

        focusArea:
            day.focusArea ??
            "",

        estimatedMinutes:
            day.estimatedMinutes !=
            null
                ? String(
                    day.estimatedMinutes,
                )
                : "",

        note:
            day.note ??
            "",

        isRestDay:
            day.isRestDay ??
            false,

        expanded: true,

        exercises:
            day.isRestDay
                ? []
                : day.exercises?.map(
                mapExerciseToForm,
            ) ?? [],
    };
}

function mapExerciseRequest(
    exercise:
    WorkoutExerciseForm,
    index:
    number,
): WorkoutExerciseRequest {
    return {
        exerciseName:
            exercise.exerciseName
                .trim(),

        targetMuscle:
            optionalText(
                exercise.targetMuscle,
            ),

        equipmentId:
            toOptionalNumber(
                exercise.equipmentId,
            ),

        sets:
            toOptionalNumber(
                exercise.sets,
            ),

        reps:
            optionalText(
                exercise.reps,
            ),

        weightKg:
            toOptionalNumber(
                exercise.weightKg,
            ),

        durationMinutes:
            toOptionalNumber(
                exercise.durationMinutes,
            ),

        distanceKm:
            toOptionalNumber(
                exercise.distanceKm,
            ),

        restSeconds:
            toOptionalNumber(
                exercise.restSeconds,
            ),

        tempo:
            optionalText(
                exercise.tempo,
            ),

        rpe:
            toOptionalNumber(
                exercise.rpe,
            ),

        instruction:
            optionalText(
                exercise.instruction,
            ),

        note:
            optionalText(
                exercise.note,
            ),

        videoUrl:
            optionalText(
                exercise.videoUrl,
            ),

        sortOrder:
        index,

        isOptional:
        exercise.isOptional,
    };
}

function mapDayRequest(
    day:
    WorkoutDayForm,
    index:
    number,
): WorkoutPlanDayRequest {
    return {
        weekNo:
            toRequiredNumber(
                day.weekNo,
                1,
            ),

        dayNo:
            toRequiredNumber(
                day.dayNo,
                index + 1,
            ),

        dayOfWeek:
            optionalText(
                day.dayOfWeek,
            ),

        name:
            day.name.trim(),

        focusArea:
            optionalText(
                day.focusArea,
            ),

        estimatedMinutes:
            toOptionalNumber(
                day.estimatedMinutes,
            ),

        note:
            optionalText(
                day.note,
            ),

        sortOrder:
        index,

        isRestDay:
        day.isRestDay,

        exercises:
            day.isRestDay
                ? []
                : day.exercises.map(
                    mapExerciseRequest,
                ),
    };
}

// ============================================================
// COMPONENT
// ============================================================

export default function MemberWorkoutFormPage() {
    const {
        id,
    } =
        useParams<{
            id?: string;
        }>();

    const navigate =
        useNavigate();

    const isEditMode =
        Boolean(id);

    const planId =
        id
            ? Number(id)
            : null;

    const [
        metadata,
        setMetadata,
    ] =
        useState<
            WorkoutMetadataForm
        >(
            initialMetadata,
        );

    const [
        days,
        setDays,
    ] =
        useState<
            WorkoutDayForm[]
        >([
            createEmptyDay(
                0,
            ),
        ]);

    const [
        existingPlan,
        setExistingPlan,
    ] =
        useState<
            WorkoutPlanDetail | null
        >(null);

    const [
        loading,
        setLoading,
    ] =
        useState(
            isEditMode,
        );

    const [
        saving,
        setSaving,
    ] =
        useState(false);

    const [
        loadError,
        setLoadError,
    ] =
        useState<
            string | null
        >(null);

    // ========================================================
    // LOAD EDIT DATA
    // ========================================================

    const loadPlan =
        useCallback(
            async (): Promise<void> => {
                if (
                    !isEditMode
                ) {
                    return;
                }

                if (
                    planId ===
                    null ||
                    !Number.isInteger(
                        planId,
                    ) ||
                    planId <= 0
                ) {
                    setLoadError(
                        "Workout Plan ID không hợp lệ.",
                    );

                    setLoading(
                        false,
                    );

                    return;
                }

                try {
                    setLoading(
                        true,
                    );

                    setLoadError(
                        null,
                    );

                    const plan =
                        await workoutService
                            .getWorkoutPlanDetails(
                                planId,
                            );

                    setExistingPlan(
                        plan,
                    );

                    setMetadata(
                        mapDetailToMetadata(
                            plan,
                        ),
                    );

                    setDays(
                        plan.days.length >
                        0
                            ? plan.days.map(
                                mapDayToForm,
                            )
                            : [
                                createEmptyDay(
                                    0,
                                ),
                            ],
                    );
                } catch (error) {
                    setLoadError(
                        getApiErrorMessage(
                            error,
                            "Không thể tải giáo án.",
                        ),
                    );
                } finally {
                    setLoading(
                        false,
                    );
                }
            },
            [
                isEditMode,
                planId,
            ],
        );

    useEffect(() => {
        void loadPlan();
    }, [
        loadPlan,
    ]);

    // ========================================================
    // SUMMARY
    // ========================================================

    const totalExercises =
        useMemo(
            () =>
                days.reduce(
                    (
                        total,
                        day,
                    ) =>
                        total +
                        (
                            day.isRestDay
                                ? 0
                                : day
                                    .exercises
                                    .length
                        ),
                    0,
                ),
            [
                days,
            ],
        );

    const trainingDays =
        useMemo(
            () =>
                days.filter(
                    (
                        day,
                    ) =>
                        !day.isRestDay,
                ).length,
            [
                days,
            ],
        );

    // ========================================================
    // METADATA
    // ========================================================

    const updateMetadata =
        (
            field:
            keyof WorkoutMetadataForm,
            value: string,
        ): void => {
            setMetadata(
                (
                    previous,
                ) => ({
                    ...previous,

                    [field]:
                    value,
                }),
            );
        };

    // ========================================================
    // DAYS
    // ========================================================

    const addDay =
        (): void => {
            setDays(
                (
                    previous,
                ) => [
                    ...previous,

                    createEmptyDay(
                        previous.length,
                    ),
                ],
            );
        };

    const removeDay =
        (
            localId: string,
        ): void => {
            setDays(
                (
                    previous,
                ) =>
                    previous
                        .filter(
                            (
                                day,
                            ) =>
                                day.localId !==
                                localId,
                        )
                        .map(
                            (
                                day,
                                index,
                            ) => ({
                                ...day,

                                dayNo:
                                    String(
                                        index +
                                        1,
                                    ),
                            }),
                        ),
            );
        };

    const duplicateDay =
        (
            localId: string,
        ): void => {
            setDays(
                (
                    previous,
                ) => {
                    const source =
                        previous.find(
                            (
                                day,
                            ) =>
                                day.localId ===
                                localId,
                        );

                    if (
                        !source
                    ) {
                        return previous;
                    }

                    const duplicated:
                        WorkoutDayForm = {
                        ...source,

                        localId:
                            createLocalId(
                                "day",
                            ),

                        name:
                            `${source.name} - bản sao`,

                        exercises:
                            source.exercises.map(
                                (
                                    exercise,
                                ) => ({
                                    ...exercise,

                                    localId:
                                        createLocalId(
                                            "exercise",
                                        ),
                                }),
                            ),
                    };

                    return [
                        ...previous,
                        duplicated,
                    ];
                },
            );
        };

    const updateDay =
        <K extends keyof WorkoutDayForm>(
            localId: string,
            field: K,
            value:
            WorkoutDayForm[K],
        ): void => {
            setDays(
                (
                    previous,
                ) =>
                    previous.map(
                        (
                            day,
                        ) => {
                            if (
                                day.localId !==
                                localId
                            ) {
                                return day;
                            }

                            if (
                                field ===
                                "isRestDay"
                            ) {
                                const isRest =
                                    Boolean(
                                        value,
                                    );

                                return {
                                    ...day,

                                    isRestDay:
                                    isRest,

                                    exercises:
                                        isRest
                                            ? []
                                            : (
                                                day
                                                    .exercises
                                                    .length >
                                                0
                                                    ? day
                                                        .exercises
                                                    : [
                                                        createEmptyExercise(),
                                                    ]
                                            ),
                                };
                            }

                            return {
                                ...day,

                                [field]:
                                value,
                            };
                        },
                    ),
            );
        };

    const moveDay =
        (
            index: number,
            direction:
                "up" |
                "down",
        ): void => {
            setDays(
                (
                    previous,
                ) => {
                    const targetIndex =
                        direction ===
                        "up"
                            ? index -
                            1
                            : index +
                            1;

                    if (
                        targetIndex <
                        0 ||
                        targetIndex >=
                        previous.length
                    ) {
                        return previous;
                    }

                    const next =
                        [
                            ...previous,
                        ];

                    [
                        next[index],
                        next[targetIndex],
                    ] = [
                        next[
                            targetIndex
                            ],
                        next[
                            index
                            ],
                    ];

                    return next.map(
                        (
                            day,
                            currentIndex,
                        ) => ({
                            ...day,

                            dayNo:
                                String(
                                    currentIndex +
                                    1,
                                ),
                        }),
                    );
                },
            );
        };

    // ========================================================
    // EXERCISES
    // ========================================================

    const addExercise =
        (
            dayId:
            string,
        ): void => {
            setDays(
                (
                    previous,
                ) =>
                    previous.map(
                        (
                            day,
                        ) =>
                            day.localId ===
                            dayId
                                ? {
                                    ...day,

                                    isRestDay:
                                        false,

                                    exercises:
                                        [
                                            ...day.exercises,

                                            createEmptyExercise(),
                                        ],
                                }
                                : day,
                    ),
            );
        };

    const removeExercise =
        (
            dayId:
            string,

            exerciseId:
            string,
        ): void => {
            setDays(
                (
                    previous,
                ) =>
                    previous.map(
                        (
                            day,
                        ) =>
                            day.localId ===
                            dayId
                                ? {
                                    ...day,

                                    exercises:
                                        day.exercises.filter(
                                            (
                                                exercise,
                                            ) =>
                                                exercise.localId !==
                                                exerciseId,
                                        ),
                                }
                                : day,
                    ),
            );
        };

    const updateExercise =
        <
            K extends keyof WorkoutExerciseForm,
        >(
            dayId:
            string,

            exerciseId:
            string,

            field:
            K,

            value:
            WorkoutExerciseForm[K],
        ): void => {
            setDays(
                (
                    previous,
                ) =>
                    previous.map(
                        (
                            day,
                        ) => {
                            if (
                                day.localId !==
                                dayId
                            ) {
                                return day;
                            }

                            return {
                                ...day,

                                exercises:
                                    day.exercises.map(
                                        (
                                            exercise,
                                        ) =>
                                            exercise.localId ===
                                            exerciseId
                                                ? {
                                                    ...exercise,

                                                    [field]:
                                                    value,
                                                }
                                                : exercise,
                                    ),
                            };
                        },
                    ),
            );
        };

    // ========================================================
    // VALIDATION
    // ========================================================

    const validateForm =
        (): string | null => {
            if (
                !metadata.name.trim()
            ) {
                return "Vui lòng nhập tên giáo án.";
            }

            if (
                !metadata.goal.trim()
            ) {
                return "Vui lòng nhập mục tiêu tập luyện.";
            }

            const durationWeeks =
                Number(
                    metadata.durationWeeks,
                );

            if (
                !Number.isInteger(
                    durationWeeks,
                ) ||
                durationWeeks <
                1 ||
                durationWeeks >
                52
            ) {
                return "Thời lượng giáo án phải từ 1 đến 52 tuần.";
            }

            const workoutDaysPerWeek =
                Number(
                    metadata.workoutDaysPerWeek,
                );

            if (
                !Number.isInteger(
                    workoutDaysPerWeek,
                ) ||
                workoutDaysPerWeek <
                1 ||
                workoutDaysPerWeek >
                7
            ) {
                return "Số buổi tập mỗi tuần phải từ 1 đến 7.";
            }

            if (
                days.length ===
                0
            ) {
                return "Giáo án phải có ít nhất một ngày.";
            }

            for (
                let index =
                    0;
                index <
                days.length;
                index++
            ) {
                const day =
                    days[index];

                if (
                    !day.name.trim()
                ) {
                    return `Vui lòng nhập tên cho ngày ${index + 1}.`;
                }

                if (
                    day.isRestDay
                ) {
                    continue;
                }

                for (
                    let exerciseIndex =
                        0;
                    exerciseIndex <
                    day
                        .exercises
                        .length;
                    exerciseIndex++
                ) {
                    const exercise =
                        day
                            .exercises[
                            exerciseIndex
                            ];

                    if (
                        !exercise
                            .exerciseName
                            .trim()
                    ) {
                        return `Ngày ${index + 1}, bài tập ${exerciseIndex + 1}: vui lòng nhập tên bài tập.`;
                    }

                    const rpe =
                        toOptionalNumber(
                            exercise.rpe,
                        );

                    if (
                        rpe !=
                        null &&
                        (
                            rpe <
                            0 ||
                            rpe >
                            10
                        )
                    ) {
                        return `RPE của bài tập "${exercise.exerciseName}" phải từ 0 đến 10.`;
                    }
                }
            }

            return null;
        };

    // ========================================================
    // REQUEST BUILDERS
    // ========================================================

    const buildCreateRequest =
        (): WorkoutPlanCreateRequest => ({
            name:
                metadata.name
                    .trim(),

            goal:
                metadata.goal
                    .trim(),

            experienceLevel:
                optionalText(
                    metadata.experienceLevel,
                ),

            durationWeeks:
                toRequiredNumber(
                    metadata.durationWeeks,
                    4,
                ),

            workoutDaysPerWeek:
                toRequiredNumber(
                    metadata.workoutDaysPerWeek,
                    3,
                ),

            workoutDurationMinutes:
                toOptionalNumber(
                    metadata.workoutDurationMinutes,
                ),

            description:
                optionalText(
                    metadata.description,
                ),

            note:
                optionalText(
                    metadata.note,
                ),

            days:
                days.map(
                    mapDayRequest,
                ),
        });

    const buildUpdateRequest =
        (): WorkoutPlanUpdateRequest => ({
            name:
                metadata.name
                    .trim(),

            goal:
                metadata.goal
                    .trim(),

            experienceLevel:
                optionalText(
                    metadata.experienceLevel,
                ),

            durationWeeks:
                toRequiredNumber(
                    metadata.durationWeeks,
                    4,
                ),

            workoutDaysPerWeek:
                toRequiredNumber(
                    metadata.workoutDaysPerWeek,
                    3,
                ),

            workoutDurationMinutes:
                toOptionalNumber(
                    metadata.workoutDurationMinutes,
                ),

            description:
                optionalText(
                    metadata.description,
                ),

            note:
                optionalText(
                    metadata.note,
                ),
        });

    // ========================================================
    // SAVE
    // ========================================================

    const handleSave =
        async (): Promise<void> => {
            const validationError =
                validateForm();

            if (
                validationError
            ) {
                toast.error(
                    validationError,
                );

                return;
            }

            if (
                isEditMode &&
                existingPlan &&
                !existingPlan
                    .editableByMember
            ) {
                toast.error(
                    "Giáo án này không cho phép hội viên tự chỉnh sửa.",
                );

                return;
            }

            try {
                setSaving(
                    true,
                );

                if (
                    isEditMode
                ) {
                    if (
                        planId ===
                        null ||
                        !Number.isInteger(
                            planId,
                        )
                    ) {
                        throw new Error(
                            "Workout Plan ID không hợp lệ.",
                        );
                    }

                    await workoutService
                        .updateWorkoutPlan(
                            planId,
                            buildUpdateRequest(),
                        );

                    await workoutService
                        .updateWorkoutPlanStructure(
                            planId,
                            days.map(
                                mapDayRequest,
                            ),
                        );

                    toast.success(
                        "Đã cập nhật giáo án.",
                    );

                    navigate(
                        ROUTES
                            .MEMBER_WORKOUT_DETAIL
                            .replace(
                                ":id",
                                String(
                                    planId,
                                ),
                            ),
                        {
                            replace: true,
                        },
                    );

                    return;
                }

                const created =
                    await workoutService
                        .createWorkoutPlan(
                            buildCreateRequest(),
                        );

                toast.success(
                    "Đã tạo giáo án mới.",
                );

                navigate(
                    ROUTES
                        .MEMBER_WORKOUT_DETAIL
                        .replace(
                            ":id",
                            String(
                                created.id,
                            ),
                        ),
                    {
                        replace: true,
                    },
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
                setSaving(
                    false,
                );
            }
        };

    // ========================================================
    // RENDER STATES
    // ========================================================

    if (
        loading
    ) {
        return (
            <Loading
                label="Đang tải giáo án..."
            />
        );
    }

    if (
        loadError
    ) {
        return (
            <Card className="mx-auto max-w-xl p-10 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />

                <h2 className="mt-4 text-xl font-black text-slate-900">
                    Không thể mở trình chỉnh sửa
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    {loadError}
                </p>

                <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() =>
                        navigate(
                            ROUTES.MEMBER_WORKOUTS,
                        )
                    }
                >
                    <ArrowLeft className="h-4 w-4" />

                    Quay lại giáo án
                </Button>
            </Card>
        );
    }

    if (
        isEditMode &&
        existingPlan &&
        !existingPlan
            .editableByMember
    ) {
        return (
            <Card className="mx-auto max-w-2xl p-10 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />

                <h2 className="mt-4 text-xl font-black text-slate-900">
                    Giáo án không thể chỉnh sửa
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Giáo án này được tạo bởi{" "}
                    <strong>
                        {sourceLabel(
                            existingPlan.sourceType,
                        )}
                    </strong>{" "}
                    hoặc đang ở trạng thái chỉ đọc.
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Bạn có thể clone giáo án thành một bản riêng rồi chỉnh sửa bản sao.
                </p>

                <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() =>
                        navigate(
                            ROUTES
                                .MEMBER_WORKOUT_DETAIL
                                .replace(
                                    ":id",
                                    String(
                                        existingPlan.id,
                                    ),
                                ),
                        )
                    }
                >
                    <ArrowLeft className="h-4 w-4" />

                    Quay lại
                </Button>
            </Card>
        );
    }

    return (
        <div className="space-y-6 pb-14">
            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <PageHeader
                eyebrow="Workout Editor"
                title={
                    isEditMode
                        ? "Chỉnh sửa giáo án"
                        : "Tạo giáo án mới"
                }
                description={
                    isEditMode
                        ? "Điều chỉnh thông tin, ngày tập và từng bài tập trong giáo án."
                        : "Tự xây dựng giáo án tập luyện phù hợp với mục tiêu của bạn."
                }
                action={
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            disabled={
                                saving
                            }
                            onClick={() =>
                                navigate(
                                    ROUTES
                                        .MEMBER_WORKOUTS,
                                )
                            }
                        >
                            <ArrowLeft className="h-4 w-4" />

                            Hủy
                        </Button>

                        <Button
                            variant="primary"
                            isLoading={
                                saving
                            }
                            loadingText="Đang lưu..."
                            onClick={() => {
                                void handleSave();
                            }}
                        >
                            <Save className="h-4 w-4" />

                            {isEditMode
                                ? "Lưu thay đổi"
                                : "Tạo giáo án"}
                        </Button>
                    </div>
                }
            />

            {/* ================================================= */}
            {/* SUMMARY */}
            {/* ================================================= */}

            <section
                className="
                    grid
                    grid-cols-2
                    gap-3
                    sm:grid-cols-4
                "
            >
                <SummaryBox
                    label="Tổng ngày"
                    value={
                        days.length
                    }
                />

                <SummaryBox
                    label="Ngày tập"
                    value={
                        trainingDays
                    }
                />

                <SummaryBox
                    label="Ngày nghỉ"
                    value={
                        days.length -
                        trainingDays
                    }
                />

                <SummaryBox
                    label="Bài tập"
                    value={
                        totalExercises
                    }
                />
            </section>

            {/* ================================================= */}
            {/* METADATA */}
            {/* ================================================= */}

            <Card className="overflow-hidden">
                <section className="border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <div
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-emerald-100
                                text-emerald-700
                            "
                        >
                            <Info className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="text-lg font-black text-slate-900">
                                Thông tin giáo án
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Cấu hình mục tiêu và thời lượng tổng quát.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-5 p-5 sm:p-6 lg:grid-cols-2">
                    <FormField
                        label="Tên giáo án"
                        required
                    >
                        <input
                            type="text"
                            maxLength={
                                150
                            }
                            value={
                                metadata.name
                            }
                            onChange={(
                                event,
                            ) =>
                                updateMetadata(
                                    "name",
                                    event.target
                                        .value,
                                )
                            }
                            placeholder="Ví dụ: Lean Body - 4 tuần"
                            className="fit-input"
                        />
                    </FormField>

                    <FormField
                        label="Mục tiêu"
                        required
                    >
                        <input
                            type="text"
                            maxLength={
                                100
                            }
                            value={
                                metadata.goal
                            }
                            onChange={(
                                event,
                            ) =>
                                updateMetadata(
                                    "goal",
                                    event.target
                                        .value,
                                )
                            }
                            placeholder="Ví dụ: Tăng cơ giảm mỡ"
                            className="fit-input"
                        />
                    </FormField>

                    <FormField label="Trình độ">
                        <select
                            value={
                                metadata
                                    .experienceLevel
                            }
                            onChange={(
                                event,
                            ) =>
                                updateMetadata(
                                    "experienceLevel",
                                    event.target
                                        .value,
                                )
                            }
                            className="fit-input"
                        >
                            {EXPERIENCE_LEVELS.map(
                                (
                                    item,
                                ) => (
                                    <option
                                        key={
                                            item.value
                                        }
                                        value={
                                            item.value
                                        }
                                    >
                                        {
                                            item.label
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </FormField>

                    <FormField label="Số tuần">
                        <input
                            type="number"
                            min={
                                1
                            }
                            max={
                                52
                            }
                            value={
                                metadata
                                    .durationWeeks
                            }
                            onChange={(
                                event,
                            ) =>
                                updateMetadata(
                                    "durationWeeks",
                                    event.target
                                        .value,
                                )
                            }
                            className="fit-input"
                        />
                    </FormField>

                    <FormField label="Buổi / tuần">
                        <input
                            type="number"
                            min={
                                1
                            }
                            max={
                                7
                            }
                            value={
                                metadata
                                    .workoutDaysPerWeek
                            }
                            onChange={(
                                event,
                            ) =>
                                updateMetadata(
                                    "workoutDaysPerWeek",
                                    event.target
                                        .value,
                                )
                            }
                            className="fit-input"
                        />
                    </FormField>

                    <FormField label="Thời lượng / buổi">
                        <div className="relative">
                            <input
                                type="number"
                                min={
                                    10
                                }
                                max={
                                    600
                                }
                                value={
                                    metadata
                                        .workoutDurationMinutes
                                }
                                onChange={(
                                    event,
                                ) =>
                                    updateMetadata(
                                        "workoutDurationMinutes",
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                className="fit-input pr-16"
                            />

                            <span
                                className="
                                    pointer-events-none
                                    absolute
                                    right-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-xs
                                    font-semibold
                                    text-slate-400
                                "
                            >
                                phút
                            </span>
                        </div>
                    </FormField>

                    <FormField
                        label="Mô tả"
                        className="lg:col-span-2"
                    >
                        <textarea
                            rows={
                                3
                            }
                            maxLength={
                                5000
                            }
                            value={
                                metadata
                                    .description
                            }
                            onChange={(
                                event,
                            ) =>
                                updateMetadata(
                                    "description",
                                    event.target
                                        .value,
                                )
                            }
                            placeholder="Mô tả tổng quan về giáo án..."
                            className="fit-input resize-y"
                        />
                    </FormField>

                    <FormField
                        label="Ghi chú"
                        className="lg:col-span-2"
                    >
                        <textarea
                            rows={
                                3
                            }
                            maxLength={
                                5000
                            }
                            value={
                                metadata.note
                            }
                            onChange={(
                                event,
                            ) =>
                                updateMetadata(
                                    "note",
                                    event.target
                                        .value,
                                )
                            }
                            placeholder="Lưu ý chung khi thực hiện giáo án..."
                            className="fit-input resize-y"
                        />
                    </FormField>
                </section>
            </Card>

            {/* ================================================= */}
            {/* DAY EDITOR */}
            {/* ================================================= */}

            <section>
                <div
                    className="
                        mb-4
                        flex
                        flex-col
                        gap-3
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >
                    <div>
                        <h2 className="text-xl font-black text-slate-900">
                            Cấu trúc ngày tập
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Thêm ngày tập, ngày nghỉ và các bài tập tương ứng.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={
                            addDay
                        }
                    >
                        <Plus className="h-4 w-4" />

                        Thêm ngày
                    </Button>
                </div>

                <div className="space-y-5">
                    {days.map(
                        (
                            day,
                            dayIndex,
                        ) => (
                            <WorkoutDayEditor
                                key={
                                    day.localId
                                }
                                day={
                                    day
                                }
                                index={
                                    dayIndex
                                }
                                totalDays={
                                    days.length
                                }
                                onUpdate={
                                    updateDay
                                }
                                onRemove={
                                    removeDay
                                }
                                onDuplicate={
                                    duplicateDay
                                }
                                onMove={
                                    moveDay
                                }
                                onAddExercise={
                                    addExercise
                                }
                                onRemoveExercise={
                                    removeExercise
                                }
                                onUpdateExercise={
                                    updateExercise
                                }
                            />
                        ),
                    )}
                </div>

                <button
                    type="button"
                    onClick={
                        addDay
                    }
                    className="
                        mt-5
                        flex
                        min-h-20
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        border-2
                        border-dashed
                        border-slate-200
                        bg-white
                        text-sm
                        font-bold
                        text-slate-500
                        transition
                        hover:border-emerald-300
                        hover:bg-emerald-50/40
                        hover:text-emerald-700
                    "
                >
                    <Plus className="h-5 w-5" />

                    Thêm ngày vào giáo án
                </button>
            </section>

            {/* ================================================= */}
            {/* BOTTOM SAVE */}
            {/* ================================================= */}

            <div
                className="
                    sticky
                    bottom-4
                    z-20
                    flex
                    flex-col
                    gap-3
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white/95
                    p-4
                    shadow-xl
                    backdrop-blur
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >
                <div>
                    <p className="font-black text-slate-900">
                        {isEditMode
                            ? "Lưu thay đổi giáo án"
                            : "Hoàn tất giáo án"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                        {trainingDays} ngày tập •{" "}
                        {totalExercises} bài tập
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        disabled={
                            saving
                        }
                        onClick={() =>
                            navigate(
                                ROUTES
                                    .MEMBER_WORKOUTS,
                            )
                        }
                    >
                        Hủy
                    </Button>

                    <Button
                        variant="primary"
                        isLoading={
                            saving
                        }
                        loadingText="Đang lưu..."
                        onClick={() => {
                            void handleSave();
                        }}
                    >
                        <Save className="h-4 w-4" />

                        {isEditMode
                            ? "Lưu thay đổi"
                            : "Tạo giáo án"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// DAY EDITOR
// ============================================================

interface WorkoutDayEditorProps {
    day:
        WorkoutDayForm;

    index:
        number;

    totalDays:
        number;

    onUpdate:
        <K extends keyof WorkoutDayForm>(
            localId: string,
            field: K,
            value:
            WorkoutDayForm[K],
        ) => void;

    onRemove:
        (
            localId: string,
        ) => void;

    onDuplicate:
        (
            localId: string,
        ) => void;

    onMove:
        (
            index: number,
            direction:
                "up" |
                "down",
        ) => void;

    onAddExercise:
        (
            dayId: string,
        ) => void;

    onRemoveExercise:
        (
            dayId: string,
            exerciseId: string,
        ) => void;

    onUpdateExercise:
        <
            K extends keyof WorkoutExerciseForm,
        >(
            dayId: string,
            exerciseId: string,
            field: K,
            value:
            WorkoutExerciseForm[K],
        ) => void;
}

function WorkoutDayEditor({
                              day,
                              index,
                              totalDays,
                              onUpdate,
                              onRemove,
                              onDuplicate,
                              onMove,
                              onAddExercise,
                              onRemoveExercise,
                              onUpdateExercise,
                          }: WorkoutDayEditorProps) {
    return (
        <Card className="overflow-hidden">
            {/* HEADER */}

            <header
                className={`
                    flex
                    flex-col
                    gap-4
                    border-b
                    p-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between

                    ${
                    day.isRestDay
                        ? "border-slate-200 bg-slate-50"
                        : "border-emerald-100 bg-emerald-50/50"
                }
                `}
            >
                <div className="flex min-w-0 items-center gap-3">
                    <GripVertical className="h-5 w-5 shrink-0 text-slate-300" />

                    <div
                        className={`
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            text-sm
                            font-black

                            ${
                            day.isRestDay
                                ? "bg-slate-200 text-slate-600"
                                : "bg-emerald-100 text-emerald-700"
                        }
                        `}
                    >
                        {index +
                            1}
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-black text-slate-900">
                                {day.name ||
                                    `Ngày ${index + 1}`}
                            </h3>

                            {day.isRestDay && (
                                <Badge variant="default">
                                    Ngày nghỉ
                                </Badge>
                            )}
                        </div>

                        <p className="mt-0.5 text-xs text-slate-500">
                            {day.isRestDay
                                ? "Không có bài tập"
                                : `${day.exercises.length} bài tập`}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                    <IconButton
                        title="Di chuyển lên"
                        disabled={
                            index ===
                            0
                        }
                        onClick={() =>
                            onMove(
                                index,
                                "up",
                            )
                        }
                    >
                        <ChevronUp className="h-4 w-4" />
                    </IconButton>

                    <IconButton
                        title="Di chuyển xuống"
                        disabled={
                            index ===
                            totalDays -
                            1
                        }
                        onClick={() =>
                            onMove(
                                index,
                                "down",
                            )
                        }
                    >
                        <ChevronDown className="h-4 w-4" />
                    </IconButton>

                    <IconButton
                        title="Nhân bản ngày"
                        onClick={() =>
                            onDuplicate(
                                day.localId,
                            )
                        }
                    >
                        <Copy className="h-4 w-4" />
                    </IconButton>

                    <IconButton
                        title={
                            day.expanded
                                ? "Thu gọn"
                                : "Mở rộng"
                        }
                        onClick={() =>
                            onUpdate(
                                day.localId,
                                "expanded",
                                !day.expanded,
                            )
                        }
                    >
                        {day.expanded ? (
                            <Minus className="h-4 w-4" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                    </IconButton>

                    <IconButton
                        title="Xóa ngày"
                        danger
                        disabled={
                            totalDays <=
                            1
                        }
                        onClick={() =>
                            onRemove(
                                day.localId,
                            )
                        }
                    >
                        <Trash2 className="h-4 w-4" />
                    </IconButton>
                </div>
            </header>

            {day.expanded && (
                <div className="p-5 sm:p-6">
                    {/* DAY METADATA */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            md:grid-cols-2
                            xl:grid-cols-4
                        "
                    >
                        <FormField
                            label="Tên ngày"
                            required
                            className="xl:col-span-2"
                        >
                            <input
                                value={
                                    day.name
                                }
                                onChange={(
                                    event,
                                ) =>
                                    onUpdate(
                                        day.localId,
                                        "name",
                                        event.target
                                            .value,
                                    )
                                }
                                className="fit-input"
                                placeholder="Upper Body / Push Day..."
                            />
                        </FormField>

                        <FormField label="Tuần">
                            <input
                                type="number"
                                min={
                                    1
                                }
                                max={
                                    52
                                }
                                value={
                                    day.weekNo
                                }
                                onChange={(
                                    event,
                                ) =>
                                    onUpdate(
                                        day.localId,
                                        "weekNo",
                                        event.target
                                            .value,
                                    )
                                }
                                className="fit-input"
                            />
                        </FormField>

                        <FormField label="Thứ tự ngày">
                            <input
                                type="number"
                                min={
                                    1
                                }
                                max={
                                    7
                                }
                                value={
                                    day.dayNo
                                }
                                onChange={(
                                    event,
                                ) =>
                                    onUpdate(
                                        day.localId,
                                        "dayNo",
                                        event.target
                                            .value,
                                    )
                                }
                                className="fit-input"
                            />
                        </FormField>

                        <FormField label="Ngày trong tuần">
                            <select
                                value={
                                    day.dayOfWeek
                                }
                                onChange={(
                                    event,
                                ) =>
                                    onUpdate(
                                        day.localId,
                                        "dayOfWeek",
                                        event.target
                                            .value,
                                    )
                                }
                                className="fit-input"
                            >
                                <option value="">
                                    Chưa xác định
                                </option>

                                {DAYS_OF_WEEK.map(
                                    (
                                        item,
                                    ) => (
                                        <option
                                            key={
                                                item.value
                                            }
                                            value={
                                                item.value
                                            }
                                        >
                                            {
                                                item.label
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </FormField>

                        <FormField label="Nhóm cơ / trọng tâm">
                            <input
                                value={
                                    day.focusArea
                                }
                                onChange={(
                                    event,
                                ) =>
                                    onUpdate(
                                        day.localId,
                                        "focusArea",
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Ngực, vai, tay sau..."
                                className="fit-input"
                            />
                        </FormField>

                        <FormField label="Thời lượng dự kiến">
                            <div className="relative">
                                <input
                                    type="number"
                                    min={
                                        0
                                    }
                                    max={
                                        600
                                    }
                                    value={
                                        day.estimatedMinutes
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        onUpdate(
                                            day.localId,
                                            "estimatedMinutes",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className="fit-input pr-16"
                                />

                                <span
                                    className="
                                        pointer-events-none
                                        absolute
                                        right-4
                                        top-1/2
                                        -translate-y-1/2
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    phút
                                </span>
                            </div>
                        </FormField>

                        {/* REST DAY */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50
                                px-4
                                py-3
                            "
                        >
                            <div>
                                <p className="text-sm font-bold text-slate-700">
                                    Ngày nghỉ
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    Không có bài tập
                                </p>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={
                                    day.isRestDay
                                }
                                onClick={() =>
                                    onUpdate(
                                        day.localId,
                                        "isRestDay",
                                        !day.isRestDay,
                                    )
                                }
                                className={`
                                    relative
                                    h-6
                                    w-11
                                    rounded-full
                                    transition

                                    ${
                                    day.isRestDay
                                        ? "bg-emerald-500"
                                        : "bg-slate-300"
                                }
                                `}
                            >
                                <span
                                    className={`
                                        absolute
                                        top-1
                                        h-4
                                        w-4
                                        rounded-full
                                        bg-white
                                        shadow
                                        transition-all

                                        ${
                                        day.isRestDay
                                            ? "left-6"
                                            : "left-1"
                                    }
                                    `}
                                />
                            </button>
                        </div>

                        <FormField
                            label="Ghi chú ngày"
                            className="md:col-span-2 xl:col-span-4"
                        >
                            <textarea
                                rows={
                                    2
                                }
                                value={
                                    day.note
                                }
                                onChange={(
                                    event,
                                ) =>
                                    onUpdate(
                                        day.localId,
                                        "note",
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Lưu ý cho buổi tập..."
                                className="fit-input resize-y"
                            />
                        </FormField>
                    </div>

                    {/* EXERCISES */}

                    {!day.isRestDay && (
                        <section className="mt-7">
                            <div
                                className="
                                    mb-3
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                "
                            >
                                <div>
                                    <h4 className="font-black text-slate-900">
                                        Bài tập
                                    </h4>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Thiết lập bài tập cho ngày này.
                                    </p>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        onAddExercise(
                                            day.localId,
                                        )
                                    }
                                >
                                    <Plus className="h-4 w-4" />

                                    Thêm bài
                                </Button>
                            </div>

                            {day.exercises.length ===
                            0 ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onAddExercise(
                                            day.localId,
                                        )
                                    }
                                    className="
                                        flex
                                        min-h-28
                                        w-full
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-2xl
                                        border-2
                                        border-dashed
                                        border-slate-200
                                        bg-slate-50/50
                                        text-sm
                                        font-bold
                                        text-slate-500
                                        transition
                                        hover:border-emerald-300
                                        hover:text-emerald-700
                                    "
                                >
                                    <Plus className="h-5 w-5" />

                                    Thêm bài tập đầu tiên
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    {day.exercises.map(
                                        (
                                            exercise,
                                            exerciseIndex,
                                        ) => (
                                            <WorkoutExerciseEditor
                                                key={
                                                    exercise.localId
                                                }
                                                dayId={
                                                    day.localId
                                                }
                                                exercise={
                                                    exercise
                                                }
                                                index={
                                                    exerciseIndex
                                                }
                                                onUpdate={
                                                    onUpdateExercise
                                                }
                                                onRemove={
                                                    onRemoveExercise
                                                }
                                            />
                                        ),
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {day.isRestDay && (
                        <div
                            className="
                                mt-6
                                flex
                                items-center
                                gap-3
                                rounded-2xl
                                border
                                border-blue-100
                                bg-blue-50
                                p-4
                            "
                        >
                            <RotateCcw className="h-5 w-5 shrink-0 text-blue-600" />

                            <p className="text-sm leading-6 text-blue-700">
                                Đây là ngày nghỉ. Danh sách bài tập sẽ không được gửi lên máy chủ.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

// ============================================================
// EXERCISE EDITOR
// ============================================================

interface WorkoutExerciseEditorProps {
    dayId:
        string;

    exercise:
        WorkoutExerciseForm;

    index:
        number;

    onUpdate:
        <
            K extends keyof WorkoutExerciseForm,
        >(
            dayId: string,
            exerciseId: string,
            field: K,
            value:
            WorkoutExerciseForm[K],
        ) => void;

    onRemove:
        (
            dayId: string,
            exerciseId: string,
        ) => void;
}

function WorkoutExerciseEditor({
                                   dayId,
                                   exercise,
                                   index,
                                   onUpdate,
                                   onRemove,
                               }: WorkoutExerciseEditorProps) {
    return (
        <article
            className="
                rounded-2xl
                border
                border-slate-200
                bg-slate-50/60
                p-4
                sm:p-5
            "
        >
            <div
                className="
                    mb-4
                    flex
                    items-center
                    justify-between
                    gap-3
                "
            >
                <div className="flex items-center gap-3">
                    <div
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            bg-white
                            text-emerald-600
                            shadow-sm
                        "
                    >
                        <Dumbbell className="h-4 w-4" />
                    </div>

                    <div>
                        <h5 className="font-black text-slate-900">
                            Bài tập{" "}
                            {index +
                                1}
                        </h5>

                        {exercise.isOptional && (
                            <p className="text-[11px] font-semibold text-amber-600">
                                Không bắt buộc
                            </p>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    title="Xóa bài tập"
                    onClick={() =>
                        onRemove(
                            dayId,
                            exercise.localId,
                        )
                    }
                    className="
                        rounded-lg
                        p-2
                        text-red-500
                        transition
                        hover:bg-red-50
                    "
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-4
                "
            >
                <FormField
                    label="Tên bài tập"
                    required
                    className="sm:col-span-2"
                >
                    <input
                        value={
                            exercise
                                .exerciseName
                        }
                        onChange={(
                            event,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "exerciseName",
                                event.target
                                    .value,
                            )
                        }
                        placeholder="Bench Press..."
                        className="fit-input"
                    />
                </FormField>

                <FormField label="Nhóm cơ">
                    <input
                        value={
                            exercise
                                .targetMuscle
                        }
                        onChange={(
                            event,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "targetMuscle",
                                event.target
                                    .value,
                            )
                        }
                        placeholder="Chest"
                        className="fit-input"
                    />
                </FormField>

                <FormField label="Equipment ID">
                    <input
                        type="number"
                        min={
                            0
                        }
                        value={
                            exercise
                                .equipmentId
                        }
                        onChange={(
                            event,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "equipmentId",
                                event.target
                                    .value,
                            )
                        }
                        placeholder="Tùy chọn"
                        className="fit-input"
                    />
                </FormField>

                <FormField label="Sets">
                    <input
                        type="number"
                        min={
                            1
                        }
                        max={
                            100
                        }
                        value={
                            exercise.sets
                        }
                        onChange={(
                            event,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "sets",
                                event.target
                                    .value,
                            )
                        }
                        className="fit-input"
                    />
                </FormField>

                <FormField label="Reps">
                    <input
                        value={
                            exercise.reps
                        }
                        onChange={(
                            event,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "reps",
                                event.target
                                    .value,
                            )
                        }
                        placeholder="8-12"
                        className="fit-input"
                    />
                </FormField>

                <FormField label="Khối lượng">
                    <NumberWithUnit
                        value={
                            exercise.weightKg
                        }
                        unit="kg"
                        min={
                            0
                        }
                        step="0.5"
                        onChange={(
                            value,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "weightKg",
                                value,
                            )
                        }
                    />
                </FormField>

                <FormField label="Nghỉ giữa hiệp">
                    <NumberWithUnit
                        value={
                            exercise
                                .restSeconds
                        }
                        unit="giây"
                        min={
                            0
                        }
                        onChange={(
                            value,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "restSeconds",
                                value,
                            )
                        }
                    />
                </FormField>

                <FormField label="RPE">
                    <input
                        type="number"
                        min={
                            0
                        }
                        max={
                            10
                        }
                        step="0.5"
                        value={
                            exercise.rpe
                        }
                        onChange={(
                            event,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "rpe",
                                event.target
                                    .value,
                            )
                        }
                        placeholder="1-10"
                        className="fit-input"
                    />
                </FormField>

                <FormField label="Tempo">
                    <input
                        value={
                            exercise.tempo
                        }
                        onChange={(
                            event,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "tempo",
                                event.target
                                    .value,
                            )
                        }
                        placeholder="3-1-1"
                        className="fit-input"
                    />
                </FormField>

                <FormField label="Thời gian">
                    <NumberWithUnit
                        value={
                            exercise
                                .durationMinutes
                        }
                        unit="phút"
                        min={
                            0
                        }
                        onChange={(
                            value,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "durationMinutes",
                                value,
                            )
                        }
                    />
                </FormField>

                <FormField label="Quãng đường">
                    <NumberWithUnit
                        value={
                            exercise
                                .distanceKm
                        }
                        unit="km"
                        min={
                            0
                        }
                        step="0.1"
                        onChange={(
                            value,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "distanceKm",
                                value,
                            )
                        }
                    />
                </FormField>

                <div
                    className="
                        flex
                        items-end
                        pb-1
                    "
                >
                    <label
                        className="
                            flex
                            min-h-11
                            w-full
                            cursor-pointer
                            items-center
                            gap-3
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                        "
                    >
                        <input
                            type="checkbox"
                            checked={
                                exercise
                                    .isOptional
                            }
                            onChange={(
                                event,
                            ) =>
                                onUpdate(
                                    dayId,
                                    exercise.localId,
                                    "isOptional",
                                    event.target
                                        .checked,
                                )
                            }
                            className="h-4 w-4 accent-emerald-600"
                        />

                        <span className="text-sm font-semibold text-slate-600">
                            Bài tùy chọn
                        </span>
                    </label>
                </div>

                <FormField
                    label="Hướng dẫn"
                    className="sm:col-span-2 lg:col-span-4"
                >
                    <textarea
                        rows={
                            2
                        }
                        value={
                            exercise
                                .instruction
                        }
                        onChange={(
                            event,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "instruction",
                                event.target
                                    .value,
                            )
                        }
                        placeholder="Mô tả kỹ thuật thực hiện..."
                        className="fit-input resize-y"
                    />
                </FormField>

                <FormField
                    label="Ghi chú"
                    className="sm:col-span-2"
                >
                    <textarea
                        rows={
                            2
                        }
                        value={
                            exercise.note
                        }
                        onChange={(
                            event,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "note",
                                event.target
                                    .value,
                            )
                        }
                        placeholder="Lưu ý riêng..."
                        className="fit-input resize-y"
                    />
                </FormField>

                <FormField
                    label="Video URL"
                    className="sm:col-span-2"
                >
                    <input
                        type="url"
                        value={
                            exercise
                                .videoUrl
                        }
                        onChange={(
                            event,
                        ) =>
                            onUpdate(
                                dayId,
                                exercise.localId,
                                "videoUrl",
                                event.target
                                    .value,
                            )
                        }
                        placeholder="https://..."
                        className="fit-input"
                    />
                </FormField>
            </div>
        </article>
    );
}

// ============================================================
// COMMON SMALL COMPONENTS
// ============================================================

function FormField({
                       label,
                       required = false,
                       className = "",
                       children,
                   }: {
    label:
        string;

    required?:
        boolean;

    className?:
        string;

    children:
        React.ReactNode;
}) {
    return (
        <label
            className={
                className
            }
        >
            <span className="mb-2 block text-sm font-bold text-slate-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </span>

            {children}
        </label>
    );
}

function NumberWithUnit({
                            value,
                            unit,
                            min,
                            step,
                            onChange,
                        }: {
    value:
        string;

    unit:
        string;

    min?:
        number;

    step?:
        string;

    onChange:
        (
            value:
            string,
        ) => void;
}) {
    return (
        <div className="relative">
            <input
                type="number"
                min={
                    min
                }
                step={
                    step
                }
                value={
                    value
                }
                onChange={(
                    event,
                ) =>
                    onChange(
                        event.target
                            .value,
                    )
                }
                className="fit-input pr-16"
            />

            <span
                className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-[11px]
                    font-semibold
                    text-slate-400
                "
            >
                {unit}
            </span>
        </div>
    );
}

function SummaryBox({
                        label,
                        value,
                    }: {
    label:
        string;

    value:
        number;
}) {
    return (
        <Card className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
                {value}
            </p>
        </Card>
    );
}

function IconButton({
                        title,
                        children,
                        onClick,
                        disabled = false,
                        danger = false,
                    }: {
    title:
        string;

    children:
        React.ReactNode;

    onClick:
        () => void;

    disabled?:
        boolean;

    danger?:
        boolean;
}) {
    return (
        <button
            type="button"
            title={
                title
            }
            aria-label={
                title
            }
            disabled={
                disabled
            }
            onClick={
                onClick
            }
            className={`
                rounded-lg
                p-2
                transition
                disabled:cursor-not-allowed
                disabled:opacity-30

                ${
                danger
                    ? "text-red-500 hover:bg-red-50"
                    : "text-slate-500 hover:bg-white hover:text-slate-900"
            }
            `}
        >
            {children}
        </button>
    );
}