import {
    useEffect,
    useState,
} from "react";

import {
    Dumbbell,
    Info,
    Sparkles,
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

    experienceLevel:
        "BEGINNER",

    activityLevel:
        "MODERATE",

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
            return "Tạo kế hoạch tập luyện";

        case "NUTRITION_PLAN":
            return "Tạo kế hoạch dinh dưỡng";

        case "FULL_PLAN":
        default:
            return "Tạo kế hoạch toàn diện";
    }
}

function getModalDescription(
    mode: AiPlanFormMode,
): string {
    switch (mode) {
        case "WORKOUT_PLAN":
            return "FitLife AI phân tích hồ sơ, mục tiêu và chỉ số cơ thể để xây dựng lịch tập phù hợp.";

        case "NUTRITION_PLAN":
            return "FitLife AI đề xuất calorie, macro và bữa ăn dựa trên mục tiêu và mức vận động của bạn.";

        case "FULL_PLAN":
        default:
            return "Kết hợp phân tích cơ thể, tập luyện và dinh dưỡng thành một kế hoạch cá nhân hóa.";
    }
}

function getSubmitLabel(
    mode: AiPlanFormMode,
): string {
    switch (mode) {
        case "WORKOUT_PLAN":
            return "Tạo lịch tập";

        case "NUTRITION_PLAN":
            return "Tạo thực đơn";

        case "FULL_PLAN":
        default:
            return "Tạo kế hoạch";
    }
}

export default function AiAdvancedPlanModal({
                                                mode,
                                                open,
                                                submitting = false,
                                                onClose,
                                                onSubmit,
                                            }: AiAdvancedPlanModalProps) {
    const [
        formData,
        setFormData,
    ] =
        useState<AiAdvancedPlanFormValue>(
            INITIAL_VALUE,
        );

    const [
        validationError,
        setValidationError,
    ] =
        useState<string | null>(
            null,
        );

    const showWorkoutFields =
        mode === "FULL_PLAN" ||
        mode === "WORKOUT_PLAN";

    const showNutritionFields =
        mode === "FULL_PLAN" ||
        mode === "NUTRITION_PLAN";

    /*
     * Reset form mỗi lần mở modal.
     *
     * Đồng thời:
     * - khóa scroll body;
     * - hỗ trợ Escape để đóng;
     * - không gọi setState trực tiếp trong render.
     */
    useEffect(() => {
        if (!open) {
            return;
        }

        setFormData({
            ...INITIAL_VALUE,
        });

        setValidationError(
            null,
        );

        const previousOverflow =
            document.body.style
                .overflow;

        document.body.style
            .overflow = "hidden";

        const handleKeyDown = (
            event: KeyboardEvent,
        ): void => {
            if (
                event.key ===
                "Escape" &&
                !submitting
            ) {
                onClose();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.body.style
                .overflow =
                previousOverflow;

            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [
        open,
        submitting,
        onClose,
    ]);

    const updateField = <
        K extends keyof AiAdvancedPlanFormValue,
    >(
        field: K,
        value:
        AiAdvancedPlanFormValue[K],
    ): void => {
        setFormData(
            (previous) => ({
                ...previous,
                [field]: value,
            }),
        );

        if (validationError) {
            setValidationError(
                null,
            );
        }
    };

    const validateForm =
        (): boolean => {
            if (
                showWorkoutFields &&
                (
                    !Number.isInteger(
                        formData
                            .workoutDaysPerWeek,
                    ) ||
                    formData
                        .workoutDaysPerWeek <
                    1 ||
                    formData
                        .workoutDaysPerWeek >
                    7
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
                    !Number.isFinite(
                        formData
                            .workoutDurationMinutes,
                    ) ||
                    formData
                        .workoutDurationMinutes <
                    10 ||
                    formData
                        .workoutDurationMinutes >
                    300
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
                    !Number.isInteger(
                        formData
                            .mealsPerDay,
                    ) ||
                    formData.mealsPerDay <
                    1 ||
                    formData.mealsPerDay >
                    10
                )
            ) {
                setValidationError(
                    "Số bữa ăn phải từ 1 đến 10.",
                );

                return false;
            }

            if (
                formData.userNote
                    .trim()
                    .length > 2000
            ) {
                setValidationError(
                    "Ghi chú không được vượt quá 2000 ký tự.",
                );

                return false;
            }

            setValidationError(
                null,
            );

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
                    formData.userNote
                        .trim(),
            });
        };

    const handleClose =
        (): void => {
            if (submitting) {
                return;
            }

            onClose();
        };

    if (!open) {
        return null;
    }

    const HeaderIcon =
        mode === "WORKOUT_PLAN"
            ? Dumbbell
            : mode ===
            "NUTRITION_PLAN"
                ? Utensils
                : Wand2;

    return (
        <>
            <button
                type="button"
                aria-label="Đóng cửa sổ tạo kế hoạch AI"
                onClick={
                    handleClose
                }
                className="
          fixed
          inset-0
          z-40
          cursor-default
          bg-slate-950/55
          backdrop-blur-sm
        "
            />

            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-plan-modal-title"
                className="
          fixed
          left-1/2
          top-1/2
          z-50
          max-h-[calc(100vh-2rem)]
          w-[calc(100%-2rem)]
          max-w-4xl
          -translate-x-1/2
          -translate-y-1/2
          overflow-y-auto
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-2xl
        "
            >
                {/* =================================================
         * HEADER
         * ================================================= */}

                <header
                    className="
            relative
            overflow-hidden
            border-b
            border-slate-100
            px-5
            py-5
            sm:px-7
            sm:py-6
          "
                >
                    <div
                        className="
              pointer-events-none
              absolute
              -right-16
              -top-20
              h-44
              w-44
              rounded-full
              bg-violet-100
              blur-3xl
            "
                    />

                    <div
                        className="
              relative
              flex
              items-start
              justify-between
              gap-4
            "
                    >
                        <div className="flex min-w-0 items-start gap-4">
                            <div
                                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-emerald-500
                  to-violet-600
                  text-white
                  shadow-lg
                  shadow-violet-500/15
                "
                            >
                                <HeaderIcon className="h-6 w-6" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                  <span
                      className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      bg-violet-50
                      px-2.5
                      py-1
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-violet-700
                    "
                  >
                    <Sparkles className="h-3 w-3" />
                    FitLife AI
                  </span>
                                </div>

                                <h3
                                    id="ai-plan-modal-title"
                                    className="
                    mt-2
                    text-xl
                    font-black
                    tracking-tight
                    text-slate-950
                    sm:text-2xl
                  "
                                >
                                    {getModalTitle(
                                        mode,
                                    )}
                                </h3>

                                <p
                                    className="
                    mt-1
                    max-w-2xl
                    text-sm
                    leading-6
                    text-slate-500
                  "
                                >
                                    {getModalDescription(
                                        mode,
                                    )}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={
                                submitting
                            }
                            onClick={
                                handleClose
                            }
                            aria-label="Đóng biểu mẫu AI"
                            className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-500
                shadow-sm
                transition
                hover:bg-slate-50
                hover:text-slate-900
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {/* =================================================
         * FORM
         * ================================================= */}

                <div className="px-5 py-6 sm:px-7">
                    <div
                        className="
              grid
              grid-cols-1
              gap-7
              lg:grid-cols-2
            "
                    >
                        {/* =============================
             * GENERAL
             * ============================= */}

                        <section>
                            <div className="mb-4">
                                <h4 className="font-black text-slate-900">
                                    Thông tin mục tiêu
                                </h4>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Cung cấp thông tin thực tế để AI xây dựng kế hoạch phù hợp hơn.
                                </p>
                            </div>

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
                                        value={
                                            formData.goal
                                        }
                                        disabled={
                                            submitting
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateField(
                                                "goal",
                                                event.target
                                                    .value as AiGoal,
                                            )
                                        }
                                        className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      font-medium
                      text-slate-700
                      outline-none
                      transition
                      focus:border-emerald-500
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
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
                                                formData
                                                    .experienceLevel
                                            }
                                            disabled={
                                                submitting
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateField(
                                                    "experienceLevel",
                                                    event.target
                                                        .value as AiExperienceLevel,
                                                )
                                            }
                                            className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        text-sm
                        font-medium
                        text-slate-700
                        outline-none
                        transition
                        focus:border-emerald-500
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
                                            formData
                                                .activityLevel
                                        }
                                        disabled={
                                            submitting
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateField(
                                                "activityLevel",
                                                event.target
                                                    .value as AiActivityLevel,
                                            )
                                        }
                                        className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      font-medium
                      text-slate-700
                      outline-none
                      transition
                      focus:border-emerald-500
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
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
                                        Ngôn ngữ kết quả
                                    </label>

                                    <select
                                        id="ai-language"
                                        value={
                                            formData
                                                .preferredLanguage
                                        }
                                        disabled={
                                            submitting
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateField(
                                                "preferredLanguage",
                                                event.target
                                                    .value as AiPreferredLanguage,
                                            )
                                        }
                                        className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      font-medium
                      text-slate-700
                      outline-none
                      transition
                      focus:border-emerald-500
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
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
                        </section>

                        {/* =============================
             * PLAN CONFIG
             * ============================= */}

                        <section>
                            <div className="mb-4">
                                <h4 className="font-black text-slate-900">
                                    Thiết lập kế hoạch
                                </h4>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Các thông số này giúp AI xây dựng kế hoạch sát với lịch sinh hoạt của bạn.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {showWorkoutFields && (
                                    <div
                                        className="
                      grid
                      grid-cols-1
                      gap-4
                      sm:grid-cols-2
                    "
                                    >
                                        <Input
                                            id="ai-workout-days"
                                            label="Số buổi / tuần"
                                            type="number"
                                            min={1}
                                            max={7}
                                            disabled={
                                                submitting
                                            }
                                            value={
                                                formData
                                                    .workoutDaysPerWeek
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateField(
                                                    "workoutDaysPerWeek",
                                                    Number(
                                                        event.target
                                                            .value,
                                                    ),
                                                )
                                            }
                                        />

                                        <Input
                                            id="ai-workout-duration"
                                            label="Phút / buổi"
                                            type="number"
                                            min={10}
                                            max={300}
                                            disabled={
                                                submitting
                                            }
                                            value={
                                                formData
                                                    .workoutDurationMinutes
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateField(
                                                    "workoutDurationMinutes",
                                                    Number(
                                                        event.target
                                                            .value,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                )}

                                {showNutritionFields && (
                                    <Input
                                        id="ai-meals-per-day"
                                        label="Số bữa / ngày"
                                        type="number"
                                        min={1}
                                        max={10}
                                        disabled={
                                            submitting
                                        }
                                        value={
                                            formData
                                                .mealsPerDay
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateField(
                                                "mealsPerDay",
                                                Number(
                                                    event.target
                                                        .value,
                                                ),
                                            )
                                        }
                                    />
                                )}

                                <div>
                                    <label
                                        htmlFor="ai-user-note"
                                        className="mb-2 block text-sm font-bold text-slate-700"
                                    >
                                        Mong muốn / lưu ý
                                    </label>

                                    <textarea
                                        id="ai-user-note"
                                        rows={
                                            showWorkoutFields &&
                                            showNutritionFields
                                                ? 6
                                                : 5
                                        }
                                        maxLength={2000}
                                        disabled={
                                            submitting
                                        }
                                        value={
                                            formData.userNote
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateField(
                                                "userNote",
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder={
                                            mode ===
                                            "WORKOUT_PLAN"
                                                ? "Ví dụ: ưu tiên thân trên, tránh bài quá phức tạp, thiết bị phổ biến..."
                                                : mode ===
                                                "NUTRITION_PLAN"
                                                    ? "Ví dụ: món Việt Nam, dễ chuẩn bị, ngân sách hợp lý..."
                                                    : "Ví dụ: muốn giảm mỡ bụng, giữ cơ và ưu tiên kế hoạch dễ duy trì..."
                                        }
                                        className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-slate-700
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-emerald-500
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
                                    />

                                    <p className="mt-1 text-right text-[11px] text-slate-400">
                                        {
                                            formData.userNote
                                                .length
                                        }
                                        /2000
                                    </p>
                                </div>

                                <div
                                    className="
                    flex
                    gap-3
                    rounded-xl
                    border
                    border-blue-100
                    bg-blue-50
                    p-4
                  "
                                >
                                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                                    <p className="text-xs leading-5 text-blue-700">
                                        AI sử dụng dữ liệu hồ sơ và chỉ số cơ thể hiện tại. Kết quả mang tính hỗ trợ và không thay thế tư vấn y tế chuyên môn.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* =================================================
         * FOOTER
         * ================================================= */}

                <footer
                    className="
            border-t
            border-slate-100
            bg-slate-50/70
            px-5
            py-4
            sm:px-7
          "
                >
                    {validationError && (
                        <p
                            className="
                mb-4
                rounded-xl
                border
                border-red-100
                bg-red-50
                px-4
                py-3
                text-sm
                font-semibold
                text-red-600
              "
                        >
                            {validationError}
                        </p>
                    )}

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
                        <p
                            className="
                max-w-xl
                text-xs
                leading-5
                text-slate-400
              "
                        >
                            Quá trình tạo kế hoạch có thể mất từ 10–120 giây. Không đóng trang hoặc gửi yêu cầu nhiều lần trong khi AI đang xử lý.
                        </p>

                        <div
                            className="
                flex
                shrink-0
                gap-2
              "
                        >
                            <Button
                                variant="outline"
                                disabled={
                                    submitting
                                }
                                onClick={
                                    handleClose
                                }
                            >
                                Hủy
                            </Button>

                            <Button
                                variant="primary"
                                isLoading={
                                    submitting
                                }
                                loadingText="AI đang xử lý..."
                                onClick={
                                    handleSubmit
                                }
                                className="min-w-[150px]"
                            >
                                <Wand2 className="h-4 w-4" />

                                {getSubmitLabel(
                                    mode,
                                )}
                            </Button>
                        </div>
                    </div>
                </footer>
            </section>
        </>
    );
}