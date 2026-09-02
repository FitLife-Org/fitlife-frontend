import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type KeyboardEvent,
} from "react";

import {
    Activity,
    Bot,
    ClipboardList,
    Dumbbell,
    History,
    Loader2,
    Send,
    Utensils,
    Wand2,
    X,
} from "lucide-react";

import { showAlert } from "../../utils/alert";

import { usePageAnimation } from "../../hooks/usePageAnimation";

import AiAdvancedPlanModal from "../../components/ai/AiAdvancedPlanModal";
import AiChatMessage from "../../components/ai/AiChatMessage";
import AiFeedbackForm from "../../components/ai/AiFeedbackForm";
import AiHistoryDrawer from "../../components/ai/AiHistoryDrawer";
import AiPlanViewer from "../../components/ai/AiPlanViewer";
import AiUsageCard from "../../components/ai/AiUsageCard";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";

import { aiService } from "../../services/aiService";

import type {
    AiAdvancedPlanFormValue,
    AiChatMessageModel,
    AiPlanFormMode,
    AiSuggestionDetailResponse,
    AiSuggestionResponse,
    AiUsageTodayResponse,
} from "../../types/ai.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

interface QuickAction {
    label: string;

    description: string;

    icon: typeof Bot;

    type:
        | AiPlanFormMode
        | "BODY_ANALYSIS";
}

const QUICK_ACTIONS: QuickAction[] = [
    {
        label: "Kế hoạch toàn diện",
        description:
            "Kết hợp lịch tập và dinh dưỡng trong một kế hoạch cá nhân hóa.",
        icon: ClipboardList,
        type: "FULL_PLAN",
    },

    {
        label: "Phân tích cơ thể",
        description:
            "Phân tích Body Metric mới nhất và nhận đánh giá từ FitLife AI.",
        icon: Activity,
        type: "BODY_ANALYSIS",
    },

    {
        label: "Kế hoạch tập luyện",
        description:
            "Tạo lịch tập riêng dựa trên mục tiêu, trình độ và thời gian của bạn.",
        icon: Dumbbell,
        type: "WORKOUT_PLAN",
    },

    {
        label: "Kế hoạch dinh dưỡng",
        description:
            "Đề xuất calorie, macro và các bữa ăn phù hợp với mục tiêu.",
        icon: Utensils,
        type: "NUTRITION_PLAN",
    },
];

function createTimestamp(): string {
    return new Date().toLocaleTimeString(
        "vi-VN",
        {
            hour: "2-digit",
            minute: "2-digit",
        },
    );
}

function createMessageId(
    prefix: string,
): string {
    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}

const INITIAL_MESSAGE:
    AiChatMessageModel = {
    id: "initial-ai-message",

    sender: "ai",

    text:
        "Chào bạn! Mình là Trợ lý AI FitLife. Mình có thể phân tích chỉ số cơ thể, xây dựng kế hoạch tập luyện và đề xuất dinh dưỡng dựa trên dữ liệu cá nhân của bạn.",

    timestamp:
        createTimestamp(),
};

function getGoalLabel(
    goal: string,
): string {
    const labels:
        Record<string, string> = {
        LOSE_WEIGHT:
            "Giảm mỡ",

        GAIN_MUSCLE:
            "Tăng cơ",

        BODY_RECOMPOSITION:
            "Tăng cơ giảm mỡ",

        MAINTAIN_FITNESS:
            "Duy trì thể lực",

        IMPROVE_ENDURANCE:
            "Cải thiện sức bền",
    };

    return labels[goal] ?? goal;
}

function getActivityLevelLabel(
    value: string,
): string {
    const labels:
        Record<string, string> = {
        SEDENTARY:
            "Ít vận động",

        LIGHT:
            "Vận động nhẹ",

        MODERATE:
            "Vận động vừa",

        ACTIVE:
            "Vận động nhiều",

        VERY_ACTIVE:
            "Vận động rất nhiều",
    };

    return labels[value] ?? value;
}

function getExperienceLabel(
    value: string,
): string {
    const labels:
        Record<string, string> = {
        BEGINNER:
            "Người mới",

        INTERMEDIATE:
            "Trung bình",

        ADVANCED:
            "Nâng cao",
    };

    return labels[value] ?? value;
}

function createPlanRequestMessage(
    mode: AiPlanFormMode,
    value:
    AiAdvancedPlanFormValue,
): string {
    const parts = [
        `mục tiêu ${getGoalLabel(
            value.goal,
        )}`,

        `mức vận động ${getActivityLevelLabel(
            value.activityLevel,
        )}`,
    ];

    if (
        mode === "FULL_PLAN" ||
        mode === "WORKOUT_PLAN"
    ) {
        parts.push(
            `trình độ ${getExperienceLabel(
                value.experienceLevel,
            )}`,

            `${value.workoutDaysPerWeek} buổi/tuần`,

            `${value.workoutDurationMinutes} phút/buổi`,
        );
    }

    if (
        mode === "FULL_PLAN" ||
        mode === "NUTRITION_PLAN"
    ) {
        parts.push(
            `${value.mealsPerDay} bữa/ngày`,
        );
    }

    const note =
        value.userNote.trim();

    if (note) {
        parts.push(
            `ghi chú: ${note}`,
        );
    }

    const title =
        mode === "WORKOUT_PLAN"
            ? "kế hoạch tập luyện"
            : mode ===
            "NUTRITION_PLAN"
                ? "kế hoạch dinh dưỡng"
                : "kế hoạch toàn diện";

    return `Tạo ${title} với ${parts.join(", ")}.`;
}

function getSuccessMessage(
    mode: AiPlanFormMode,
): string {
    switch (mode) {
        case "WORKOUT_PLAN":
            return "Đã tạo kế hoạch tập luyện.";

        case "NUTRITION_PLAN":
            return "Đã tạo kế hoạch dinh dưỡng.";

        case "FULL_PLAN":
        default:
            return "Đã tạo kế hoạch toàn diện.";
    }
}

export default function AiFitnessPage() {
    const containerRef =
        usePageAnimation();

    const [
        messages,
        setMessages,
    ] =
        useState<
            AiChatMessageModel[]
        >([
            INITIAL_MESSAGE,
        ]);

    const [
        input,
        setInput,
    ] =
        useState("");

    const [
        isTyping,
        setIsTyping,
    ] =
        useState(false);

    const [
        showAdvancedForm,
        setShowAdvancedForm,
    ] =
        useState(false);

    const [
        planFormMode,
        setPlanFormMode,
    ] =
        useState<AiPlanFormMode>(
            "FULL_PLAN",
        );

    const [
        historyOpen,
        setHistoryOpen,
    ] =
        useState(false);

    const [
        historyItems,
        setHistoryItems,
    ] =
        useState<
            AiSuggestionResponse[]
        >([]);

    const [
        historyLoading,
        setHistoryLoading,
    ] =
        useState(false);

    const [
        historyError,
        setHistoryError,
    ] =
        useState<string | null>(
            null,
        );

    const [
        selectedHistoryItem,
        setSelectedHistoryItem,
    ] =
        useState<
            AiSuggestionDetailResponse | null
        >(null);

    const [
        detailLoading,
        setDetailLoading,
    ] =
        useState(false);

    const [
        usage,
        setUsage,
    ] =
        useState<
            AiUsageTodayResponse | null
        >(null);

    const [
        usageLoading,
        setUsageLoading,
    ] =
        useState(false);

    const [
        usageError,
        setUsageError,
    ] =
        useState<string | null>(
            null,
        );

    const messagesEndRef =
        useRef<HTMLDivElement>(
            null,
        );

    // =====================================================
    // USAGE
    // =====================================================

    const loadUsage =
        useCallback(
            async (): Promise<void> => {
                try {
                    setUsageLoading(
                        true,
                    );

                    setUsageError(
                        null,
                    );

                    /*
                     * Không dùng mock nữa.
                     *
                     * GET
                     * /ai/suggestions/usage/today
                     */
                    const result =
                        await aiService
                            .getTodayUsage();

                    setUsage(
                        result,
                    );
                } catch (error) {
                    setUsage(
                        null,
                    );

                    setUsageError(
                        getApiErrorMessage(
                            error,
                            "Không thể tải lượt sử dụng AI.",
                        ),
                    );
                } finally {
                    setUsageLoading(
                        false,
                    );
                }
            },
            [],
        );

    // =====================================================
    // HISTORY
    // =====================================================

    const loadHistory =
        useCallback(
            async (): Promise<void> => {
                try {
                    setHistoryLoading(
                        true,
                    );

                    setHistoryError(
                        null,
                    );

                    const page =
                        await aiService
                            .getAiHistory(
                                0,
                                20,
                            );

                    setHistoryItems(
                        page.content ??
                        [],
                    );
                } catch (error) {
                    setHistoryError(
                        getApiErrorMessage(
                            error,
                            "Không thể tải lịch sử AI.",
                        ),
                    );
                } finally {
                    setHistoryLoading(
                        false,
                    );
                }
            },
            [],
        );

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        void Promise.all([
            loadUsage(),
            loadHistory(),
        ]);
    }, [
        loadHistory,
        loadUsage,
    ]);

    // =====================================================
    // AUTO SCROLL
    // =====================================================

    useEffect(() => {
        messagesEndRef.current
            ?.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
    }, [
        messages,
        isTyping,
    ]);

    // =====================================================
    // MESSAGE
    // =====================================================

    const appendUserMessage = (
        text: string,
    ): void => {
        setMessages(
            (previous) => [
                ...previous,

                {
                    id:
                        createMessageId(
                            "user",
                        ),

                    sender:
                        "user",

                    text,

                    timestamp:
                        createTimestamp(),
                },
            ],
        );
    };

    const appendAiMessage = (
        text: string,

        suggestionDetail?:
        AiSuggestionDetailResponse,
    ): void => {
        setMessages(
            (previous) => [
                ...previous,

                {
                    id:
                        createMessageId(
                            "ai",
                        ),

                    sender:
                        "ai",

                    text,

                    timestamp:
                        createTimestamp(),

                    suggestionDetail,
                },
            ],
        );
    };

    // =====================================================
    // UPDATE SUGGESTION
    // =====================================================

    const updateSuggestionEverywhere =
        useCallback(
            (
                updated:
                AiSuggestionDetailResponse,
            ): void => {
                setSelectedHistoryItem(
                    (current) =>
                        current?.id ===
                        updated.id
                            ? updated
                            : current,
                );

                setMessages(
                    (previous) =>
                        previous.map(
                            (
                                message,
                            ) =>
                                message
                                    .suggestionDetail
                                    ?.id ===
                                updated.id
                                    ? {
                                        ...message,

                                        suggestionDetail:
                                        updated,
                                    }
                                    : message,
                        ),
                );

                setHistoryItems(
                    (previous) =>
                        previous.map(
                            (
                                item,
                            ) =>
                                item.id ===
                                updated.id
                                    ? {
                                        ...item,
                                        ...updated,
                                    }
                                    : item,
                        ),
                );

                /*
                 * Đồng bộ status / usage từ backend.
                 */
                void Promise.all([
                    loadHistory(),
                    loadUsage(),
                ]);
            },
            [
                loadHistory,
                loadUsage,
            ],
        );

    // =====================================================
    // OPEN PLAN FORM
    // =====================================================

    const openPlanForm = (
        mode:
        AiPlanFormMode,
    ): void => {
        if (isTyping) {
            return;
        }

        setPlanFormMode(
            mode,
        );

        setShowAdvancedForm(
            true,
        );
    };

    // =====================================================
    // GENERATE PLAN
    // =====================================================

    const submitPlanForm =
        async (
            value:
            AiAdvancedPlanFormValue,
        ): Promise<void> => {
            if (isTyping) {
                return;
            }

            appendUserMessage(
                createPlanRequestMessage(
                    planFormMode,
                    value,
                ),
            );

            setIsTyping(
                true,
            );

            try {
                let result:
                    AiSuggestionResponse;

                /*
                 * Đây là phần quan trọng:
                 *
                 * FULL_PLAN
                 * → generateFullPlan()
                 *
                 * WORKOUT_PLAN
                 * → generateWorkoutPlan()
                 *
                 * NUTRITION_PLAN
                 * → generateNutritionPlan()
                 */
                switch (
                    planFormMode
                    ) {
                    case "WORKOUT_PLAN":
                        result =
                            await aiService
                                .generateWorkoutPlan(
                                    {
                                        goal:
                                        value.goal,

                                        experienceLevel:
                                        value
                                            .experienceLevel,

                                        activityLevel:
                                        value
                                            .activityLevel,

                                        workoutDaysPerWeek:
                                        value
                                            .workoutDaysPerWeek,

                                        workoutDurationMinutes:
                                        value
                                            .workoutDurationMinutes,

                                        preferredLanguage:
                                        value
                                            .preferredLanguage,

                                        userNote:
                                            value
                                                .userNote
                                                .trim() ||
                                            undefined,
                                    },
                                );

                        break;

                    case "NUTRITION_PLAN":
                        result =
                            await aiService
                                .generateNutritionPlan(
                                    {
                                        goal:
                                        value.goal,

                                        activityLevel:
                                        value
                                            .activityLevel,

                                        mealsPerDay:
                                        value
                                            .mealsPerDay,

                                        preferredLanguage:
                                        value
                                            .preferredLanguage,

                                        userNote:
                                            value
                                                .userNote
                                                .trim() ||
                                            undefined,
                                    },
                                );

                        break;

                    case "FULL_PLAN":
                    default:
                        result =
                            await aiService
                                .generateFullPlan(
                                    {
                                        goal:
                                        value.goal,

                                        experienceLevel:
                                        value
                                            .experienceLevel,

                                        activityLevel:
                                        value
                                            .activityLevel,

                                        workoutDaysPerWeek:
                                        value
                                            .workoutDaysPerWeek,

                                        workoutDurationMinutes:
                                        value
                                            .workoutDurationMinutes,

                                        mealsPerDay:
                                        value
                                            .mealsPerDay,

                                        preferredLanguage:
                                        value
                                            .preferredLanguage,

                                        userNote:
                                            value
                                                .userNote
                                                .trim() ||
                                            undefined,
                                    },
                                );

                        break;
                }

                /*
                 * Generate API trả summary response.
                 *
                 * Query detail để lấy:
                 * - aiResponse
                 * - items
                 * - applied IDs
                 * - feedback
                 */
                const detail =
                    await aiService
                        .getAiSuggestionDetail(
                            result.id,
                        );

                appendAiMessage(
                    detail.summary ||
                    "FitLife AI đã hoàn thành yêu cầu của bạn.",

                    detail,
                );

                setShowAdvancedForm(
                    false,
                );

                void showAlert.success("Thành công", 
                    getSuccessMessage(
                        planFormMode,
                    ),
                );

                await Promise.all([
                    loadHistory(),
                    loadUsage(),
                ]);
            } catch (error) {
                const message =
                    getApiErrorMessage(
                        error,
                        "Không thể tạo kế hoạch AI.",
                    );

                appendAiMessage(
                    `Xin lỗi, yêu cầu chưa thể hoàn thành.\n\n${message}`,
                );

                void showAlert.error("Đã xảy ra lỗi", 
                    message,
                );
            } finally {
                setIsTyping(
                    false,
                );
            }
        };

    // =====================================================
    // BODY ANALYSIS
    // =====================================================

    const handleBodyAnalysis =
        async (): Promise<void> => {
            if (isTyping) {
                return;
            }

            appendUserMessage(
                "Phân tích chỉ số cơ thể hiện tại và đưa ra khuyến nghị thực tế.",
            );

            setIsTyping(
                true,
            );

            try {
                /*
                 * analyzeBody() đã trả
                 * AiSuggestionDetailResponse.
                 *
                 * Không cần query detail lần hai.
                 */
                const detail =
                    await aiService
                        .analyzeBody(
                            {
                                preferredLanguage:
                                    "vi",

                                userNote:
                                    "Phân tích ngắn gọn, thực tế và ưu tiên an toàn.",
                            },
                        );

                appendAiMessage(
                    detail.summary ||
                    "FitLife AI đã hoàn thành phân tích cơ thể.",

                    detail,
                );

                void showAlert.success("Thành công", 
                    "Đã phân tích cơ thể.",
                );

                await Promise.all([
                    loadHistory(),
                    loadUsage(),
                ]);
            } catch (error) {
                const message =
                    getApiErrorMessage(
                        error,
                        "Không thể phân tích cơ thể.",
                    );

                appendAiMessage(
                    `Xin lỗi, mình chưa thể phân tích cơ thể lúc này.\n\n${message}`,
                );

                void showAlert.error("Đã xảy ra lỗi", 
                    message,
                );
            } finally {
                setIsTyping(
                    false,
                );
            }
        };

    // =====================================================
    // QUICK ACTION
    // =====================================================

    const handleQuickAction = (
        action:
        QuickAction,
    ): void => {
        if (
            action.type ===
            "BODY_ANALYSIS"
        ) {
            void handleBodyAnalysis();

            return;
        }

        openPlanForm(
            action.type,
        );
    };

    // =====================================================
    // CHAT PLACEHOLDER
    // =====================================================

    const handleSend =
        (): void => {
            const normalizedInput =
                input.trim();

            if (
                !normalizedInput ||
                isTyping
            ) {
                return;
            }

            appendUserMessage(
                normalizedInput,
            );

            setInput("");

            /*
             * Chưa có backend Chat AI.
             *
             * Không fake AI response như thể
             * chatbot đang hoạt động.
             */
            appendAiMessage(
                "Chat tự do hiện chưa được bật. Bạn có thể sử dụng Phân tích cơ thể, Kế hoạch toàn diện, Kế hoạch tập luyện hoặc Kế hoạch dinh dưỡng.",
            );
        };

    const handleKeyDown = (
        event:
        KeyboardEvent<HTMLInputElement>,
    ): void => {
        if (
            event.key ===
            "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            handleSend();
        }
    };

    // =====================================================
    // HISTORY DETAIL
    // =====================================================

    const openHistoryDetail =
        async (
            item:
            AiSuggestionResponse,
        ): Promise<void> => {
            try {
                setHistoryOpen(
                    false,
                );

                setSelectedHistoryItem(
                    null,
                );

                setDetailLoading(
                    true,
                );

                const detail =
                    await aiService
                        .getAiSuggestionDetail(
                            item.id,
                        );

                setSelectedHistoryItem(
                    detail,
                );
            } catch (error) {
                void showAlert.error("Đã xảy ra lỗi", 
                    getApiErrorMessage(
                        error,
                        "Không thể tải chi tiết lịch sử AI.",
                    ),
                );
            } finally {
                setDetailLoading(
                    false,
                );
            }
        };

    // =====================================================
    // UI
    // =====================================================

    return (
        <div
            ref={
                containerRef
            }
            className="
                relative
                flex
                min-h-[calc(100vh-8rem)]
                flex-col
            "
        >
            <PageHeader
                eyebrow="FitLife Intelligence"
                title="FitLife AI"
                description="Phân tích dữ liệu cơ thể và xây dựng kế hoạch tập luyện, dinh dưỡng phù hợp với mục tiêu của bạn."
                action={
                    <Button
                        variant="outline"
                        onClick={() =>
                            setHistoryOpen(
                                true,
                            )
                        }
                        className="rounded-full"
                    >
                        <History className="h-4 w-4" />

                        Lịch sử AI
                    </Button>
                }
            />

            {/* =================================================
             * USAGE
             * ================================================= */}

            <div className="mb-5">
                <AiUsageCard
                    usage={
                        usage
                    }
                    loading={
                        usageLoading
                    }
                    error={
                        usageError
                    }
                    onReload={() => {
                        void loadUsage();
                    }}
                />
            </div>

            {/* =================================================
             * AI WORKSPACE
             * ================================================= */}

            <div
                className="
                    flex
                    min-h-[650px]
                    flex-1
                    flex-col
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                "
            >
                {/* =============================================
                 * CHAT BODY
                 * ============================================= */}

                <div
                    className="
                        flex-1
                        overflow-y-auto
                        bg-slate-50/70
                        p-4
                        sm:p-6
                    "
                >
                    {/* =========================================
                     * QUICK ACTIONS
                     * ========================================= */}

                    {messages.length ===
                        1 && (
                            <section className="mb-8">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">
                                        Bạn muốn FitLife AI hỗ trợ gì?
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Chọn một chức năng để bắt đầu từ dữ liệu thực tế của bạn.
                                    </p>
                                </div>

                                <div
                                    className="
                                    mt-4
                                    grid
                                    grid-cols-1
                                    gap-4
                                    sm:grid-cols-2
                                    xl:grid-cols-4
                                "
                                >
                                    {QUICK_ACTIONS.map(
                                        (
                                            action,
                                        ) => {
                                            const Icon =
                                                action.icon;

                                            return (
                                                <button
                                                    key={
                                                        action.type
                                                    }
                                                    type="button"
                                                    disabled={
                                                        isTyping
                                                    }
                                                    onClick={() =>
                                                        handleQuickAction(
                                                            action,
                                                        )
                                                    }
                                                    className="
                                                    group
                                                    rounded-2xl
                                                    border
                                                    border-slate-200
                                                    bg-white
                                                    p-5
                                                    text-left
                                                    shadow-sm
                                                    transition-all
                                                    duration-200

                                                    hover:-translate-y-1
                                                    hover:border-emerald-300
                                                    hover:shadow-lg

                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-60
                                                "
                                                >
                                                    <div
                                                        className="
                                                        flex
                                                        h-11
                                                        w-11
                                                        items-center
                                                        justify-center
                                                        rounded-2xl
                                                        bg-gradient-to-br
                                                        from-emerald-100
                                                        to-violet-100
                                                        text-emerald-700
                                                        transition
                                                        group-hover:scale-110
                                                    "
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                    </div>

                                                    <h3 className="mt-4 font-black text-slate-900">
                                                        {
                                                            action.label
                                                        }
                                                    </h3>

                                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                                        {
                                                            action.description
                                                        }
                                                    </p>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            </section>
                        )}

                    {/* =========================================
                     * MESSAGES
                     * ========================================= */}

                    <div className="space-y-6">
                        {messages.map(
                            (
                                message,
                            ) => (
                                <AiChatMessage
                                    key={
                                        message.id
                                    }
                                    message={
                                        message
                                    }
                                    onSuggestionChanged={
                                        updateSuggestionEverywhere
                                    }
                                />
                            ),
                        )}

                        {isTyping && (
                            <div className="flex max-w-4xl gap-4">
                                <div
                                    className="
                                        mt-1
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-gradient-to-br
                                        from-emerald-500
                                        to-violet-600
                                        text-white
                                    "
                                >
                                    <Bot className="h-4 w-4" />
                                </div>

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        rounded-2xl
                                        rounded-tl-md
                                        border
                                        border-slate-200
                                        bg-white
                                        px-4
                                        py-3
                                        shadow-sm
                                    "
                                >
                                    <Loader2 className="h-4 w-4 animate-spin text-violet-600" />

                                    <div>
                                        <p className="text-sm font-bold text-slate-700">
                                            FitLife AI đang xử lý...
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            Quá trình có thể mất từ 10 đến 120 giây.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div
                            ref={
                                messagesEndRef
                            }
                        />
                    </div>
                </div>

                {/* =============================================
                 * CHAT INPUT
                 * ============================================= */}

                <div
                    className="
                        border-t
                        border-slate-200
                        bg-white
                        p-4
                    "
                >
                    <div
                        className="
                            mx-auto
                            flex
                            max-w-5xl
                            items-center
                            gap-2
                        "
                    >
                        <button
                            type="button"
                            disabled={
                                isTyping
                            }
                            onClick={() =>
                                openPlanForm(
                                    "FULL_PLAN",
                                )
                            }
                            title="Tạo kế hoạch AI"
                            aria-label="Tạo kế hoạch AI"
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-violet-100
                                text-violet-700
                                transition
                                hover:bg-violet-200

                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            <Wand2 className="h-5 w-5" />
                        </button>

                        <div className="relative flex-1">
                            <Input
                                id="ai-chat-input"
                                value={
                                    input
                                }
                                disabled={
                                    isTyping
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setInput(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                onKeyDown={
                                    handleKeyDown
                                }
                                placeholder="Nhập câu hỏi hoặc chọn một chức năng AI..."
                                className="mt-0 pr-14"
                            />

                            <Button
                                variant="primary"
                                disabled={
                                    !input.trim() ||
                                    isTyping
                                }
                                onClick={
                                    handleSend
                                }
                                aria-label="Gửi yêu cầu"
                                className="
                                    absolute
                                    right-1.5
                                    top-1/2
                                    h-9
                                    min-h-9
                                    w-9
                                    -translate-y-1/2
                                    rounded-lg
                                    p-0
                                "
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <p className="mx-auto mt-2 max-w-5xl text-center text-[10px] text-slate-400">
                        FitLife AI cung cấp gợi ý hỗ trợ, không thay thế chẩn đoán hoặc tư vấn y tế chuyên môn.
                    </p>
                </div>
            </div>

            {/* =================================================
             * PLAN MODAL
             * ================================================= */}

            <AiAdvancedPlanModal
                mode={
                    planFormMode
                }
                open={
                    showAdvancedForm
                }
                submitting={
                    isTyping
                }
                onClose={() => {
                    if (
                        !isTyping
                    ) {
                        setShowAdvancedForm(
                            false,
                        );
                    }
                }}
                onSubmit={
                    submitPlanForm
                }
            />

            {/* =================================================
             * HISTORY DRAWER
             * ================================================= */}

            <AiHistoryDrawer
                open={
                    historyOpen
                }
                items={
                    historyItems
                }
                loading={
                    historyLoading
                }
                error={
                    historyError
                }
                onClose={() =>
                    setHistoryOpen(
                        false,
                    )
                }
                onReload={() => {
                    void loadHistory();
                }}
                onSelect={(
                    item,
                ) => {
                    void openHistoryDetail(
                        item,
                    );
                }}
            />

            {/* =================================================
             * HISTORY DETAIL
             * ================================================= */}

            {(
                selectedHistoryItem ||
                detailLoading
            ) && (
                <>
                    <button
                        type="button"
                        aria-label="Đóng chi tiết AI"
                        onClick={() => {
                            if (
                                !detailLoading
                            ) {
                                setSelectedHistoryItem(
                                    null,
                                );
                            }
                        }}
                        className="
                            fixed
                            inset-0
                            z-50
                            cursor-default
                            bg-slate-950/60
                            backdrop-blur-sm
                        "
                    />

                    <section
                        role="dialog"
                        aria-modal="true"
                        className="
                            fixed
                            inset-3
                            z-[60]
                            flex
                            flex-col
                            overflow-hidden
                            rounded-3xl
                            border
                            border-slate-200
                            bg-slate-50
                            shadow-2xl

                            sm:inset-8
                        "
                    >
                        <header
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-slate-200
                                bg-white
                                px-5
                                py-4
                            "
                        >
                            <div>
                                <h2 className="font-black text-slate-900">
                                    Chi tiết gợi ý AI
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Xem nội dung, áp dụng kế hoạch và gửi đánh giá.
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={
                                    detailLoading
                                }
                                onClick={() =>
                                    setSelectedHistoryItem(
                                        null,
                                    )
                                }
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-slate-100
                                    text-slate-500
                                    transition

                                    hover:bg-slate-200
                                    hover:text-slate-900
                                "
                                aria-label="Đóng chi tiết AI"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </header>

                        <div
                            className="
                                flex-1
                                overflow-y-auto
                                p-4
                                sm:p-6
                            "
                        >
                            {detailLoading &&
                            !selectedHistoryItem ? (
                                <div
                                    className="
                                        flex
                                        min-h-80
                                        flex-col
                                        items-center
                                        justify-center
                                    "
                                >
                                    <Loader2 className="h-8 w-8 animate-spin text-violet-600" />

                                    <p className="mt-3 text-sm font-semibold text-slate-500">
                                        Đang tải chi tiết...
                                    </p>
                                </div>
                            ) : (
                                selectedHistoryItem && (
                                    <div className="mx-auto max-w-5xl">
                                        <AiPlanViewer
                                            suggestion={
                                                selectedHistoryItem
                                            }
                                            onChanged={
                                                updateSuggestionEverywhere
                                            }
                                        />

                                        {selectedHistoryItem.status ===
                                            "SUCCESS" &&
                                            !selectedHistoryItem
                                                .feedback && (
                                                <AiFeedbackForm
                                                    suggestionId={
                                                        selectedHistoryItem.id
                                                    }
                                                    onSubmitted={() => {
                                                        void aiService
                                                            .getAiSuggestionDetail(
                                                                selectedHistoryItem.id,
                                                            )
                                                            .then(
                                                                updateSuggestionEverywhere,
                                                            )
                                                            .catch(
                                                                (
                                                                    error,
                                                                ) => {
                                                                    void showAlert.error("Đã xảy ra lỗi", 
                                                                        getApiErrorMessage(
                                                                            error,
                                                                            "Không thể tải lại đánh giá AI.",
                                                                        ),
                                                                    );
                                                                },
                                                            );
                                                    }}
                                                />
                                            )}
                                    </div>
                                )
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}