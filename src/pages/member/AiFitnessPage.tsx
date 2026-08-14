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
    CalendarPlus,
    History,
    Loader2,
    Sparkles,
    Utensils,
    Wand2,
    X,
    ClipboardList,
    Send,
} from "lucide-react";

import { usePageAnimation } from "../../hooks/usePageAnimation";

import toast from "react-hot-toast";

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
            "Tạo lịch tập và dinh dưỡng trong cùng một kế hoạch.",
        icon: ClipboardList,
        type: "FULL_PLAN",
    },
    {
        label: "Phân tích cơ thể",
        description:
            "Phân tích chỉ số cơ thể mới nhất và nhận khuyến nghị.",
        icon: Activity,
        type: "BODY_ANALYSIS",
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
        "Chào bạn! Mình là Trợ lý AI FitLife. Mình có thể phân tích chỉ số cơ thể, tạo lịch tập và đề xuất dinh dưỡng phù hợp với dữ liệu cá nhân của bạn.",
    timestamp: createTimestamp(),
};

function getGoalLabel(
    goal: string,
): string {
    const labels:
        Record<string, string> = {
        LOSE_WEIGHT: "Giảm mỡ",
        GAIN_MUSCLE: "Tăng cơ",
        BODY_RECOMPOSITION:
            "Tăng cơ giảm mỡ",
        MAINTAIN_FITNESS:
            "Duy trì thể lực",
        IMPROVE_ENDURANCE:
            "Cải thiện sức bền",
    };

    return labels[goal] ?? goal;
}

function createPlanRequestMessage(
    mode: AiPlanFormMode,
    value: AiAdvancedPlanFormValue,
): string {
    const parts = [
        `mục tiêu ${getGoalLabel(
            value.goal,
        )}`,
        `mức vận động ${value.activityLevel}`,
    ];

    if (
        mode === "FULL_PLAN" ||
        mode === "WORKOUT_PLAN"
    ) {
        parts.push(
            `trình độ ${value.experienceLevel}`,
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

    if (value.userNote.trim()) {
        parts.push(
            `ghi chú: ${value.userNote.trim()}`,
        );
    }

    return `Tạo ${
        mode === "WORKOUT_PLAN"
            ? "kế hoạch tập luyện"
            : mode === "NUTRITION_PLAN"
                ? "kế hoạch dinh dưỡng"
                : "kế hoạch toàn diện"
    } với ${parts.join(", ")}.`;
}

export default function AiFitnessPage() {
    const containerRef = usePageAnimation();

    const [messages, setMessages] =
        useState<AiChatMessageModel[]>([
            INITIAL_MESSAGE,
        ]);

    const [input, setInput] =
        useState("");

    const [isTyping, setIsTyping] =
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

    const [historyOpen, setHistoryOpen] =
        useState(false);

    const [
        historyItems,
        setHistoryItems,
    ] =
        useState<AiSuggestionResponse[]>([]);

    const [
        historyLoading,
        setHistoryLoading,
    ] =
        useState(false);

    const [
        historyError,
        setHistoryError,
    ] =
        useState<string | null>(null);

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

    const [usage, setUsage] =
        useState<AiUsageTodayResponse | null>(
            null,
        );

    const [
        usageLoading,
        setUsageLoading,
    ] =
        useState(false);

    const [
        usageError,
        setUsageError,
    ] =
        useState<string | null>(null);

    const messagesEndRef =
        useRef<HTMLDivElement>(null);

    const loadUsage =
        useCallback(async () => {
            try {
                setUsageLoading(true);
                setUsageError(null);

                const result =
                    { dailyLimit: 5, remaining: 5, used: 0, resetAt: new Date().toISOString() };

                setUsage(result);
            } catch (error) {
                setUsageError(
                    getApiErrorMessage(
                        error,
                        "Không thể tải lượt sử dụng AI.",
                    ),
                );
            } finally {
                setUsageLoading(false);
            }
        }, []);

    const loadHistory =
        useCallback(async () => {
            try {
                setHistoryLoading(true);
                setHistoryError(null);

                const page =
                    await aiService
                        .getAiHistory(
                            0,
                            20,
                        );

                setHistoryItems(
                    page.content ?? [],
                );
            } catch (error) {
                setHistoryError(
                    getApiErrorMessage(
                        error,
                        "Không thể tải lịch sử AI.",
                    ),
                );
            } finally {
                setHistoryLoading(false);
            }
        }, []);

    useEffect(() => {
        void loadUsage();
        void loadHistory();
    }, [
        loadHistory,
        loadUsage,
    ]);

    useEffect(() => {
        messagesEndRef.current
            ?.scrollIntoView({
                behavior: "smooth",
            });
    }, [
        messages,
        isTyping,
    ]);

    const appendUserMessage = (
        text: string,
    ): void => {
        setMessages(
            (previous) => [
                ...previous,
                {
                    id: createMessageId(
                        "user",
                    ),
                    sender: "user",
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
                    id: createMessageId(
                        "ai",
                    ),
                    sender: "ai",
                    text,
                    timestamp:
                        createTimestamp(),
                    suggestionDetail,
                },
            ],
        );
    };

    const updateSuggestionEverywhere =
        useCallback(
            (
                updated:
                AiSuggestionDetailResponse,
            ) => {
                setSelectedHistoryItem(
                    (current) =>
                        current?.id === updated.id
                            ? updated
                            : current,
                );

                setMessages(
                    (previous) =>
                        previous.map(
                            (message) =>
                                message
                                    .suggestionDetail
                                    ?.id === updated.id
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
                            (item) =>
                                item.id === updated.id
                                    ? {
                                        ...item,
                                        ...updated,
                                    }
                                    : item,
                        ),
                );

                void loadHistory();
                void loadUsage();
            },
            [
                loadHistory,
                loadUsage,
            ],
        );

    const openPlanForm = (
        mode: AiPlanFormMode,
    ): void => {
        if (isTyping) {
            return;
        }

        setPlanFormMode(mode);
        setShowAdvancedForm(true);
    };

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

            setIsTyping(true);

            try {
                let result:
                    AiSuggestionResponse;

                result =
                    await aiService
                        .generateFullPlan({
                            goal: value.goal,

                            experienceLevel:
                            value
                                .experienceLevel,

                            activityLevel:
                            value.activityLevel,

                            workoutDaysPerWeek:
                            value
                                .workoutDaysPerWeek,

                            workoutDurationMinutes:
                            value
                                .workoutDurationMinutes,

                            mealsPerDay:
                            value.mealsPerDay,

                            preferredLanguage:
                            value
                                .preferredLanguage,

                            userNote:
                                value.userNote.trim() ||
                                undefined,
                        });

                const detail =
                    await aiService
                        .getAiSuggestionDetail(
                            result.id,
                        );

                appendAiMessage(
                    detail.summary ||
                    "FitLife AI đã hoàn thành kế hoạch.",
                    detail,
                );

                setShowAdvancedForm(false);

                toast.success(
                    planFormMode ===
                    "WORKOUT_PLAN"
                        ? "Đã tạo kế hoạch tập luyện."
                        : planFormMode ===
                        "NUTRITION_PLAN"
                            ? "Đã tạo kế hoạch dinh dưỡng."
                            : "Đã tạo kế hoạch toàn diện.",
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

                toast.error(message);
            } finally {
                setIsTyping(false);
            }
        };

    const handleBodyAnalysis =
        async (): Promise<void> => {
            if (isTyping) {
                return;
            }

            appendUserMessage(
                "Phân tích chỉ số cơ thể hiện tại và đưa ra khuyến nghị thực tế.",
            );

            setIsTyping(true);

            try {
                const result =
                    await aiService
                        .analyzeBody({
                            preferredLanguage:
                                "vi",

                            userNote:
                                "Phân tích ngắn gọn và đưa ra khuyến nghị thực tế.",
                        });

                const detail =
                    await aiService
                        .getAiSuggestionDetail(
                            result.id,
                        );

                appendAiMessage(
                    detail.summary ||
                    "FitLife AI đã hoàn thành phân tích cơ thể.",
                    detail,
                );

                toast.success(
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

                toast.error(message);
            } finally {
                setIsTyping(false);
            }
        };

    const handleQuickAction = (
        action: QuickAction,
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

    const handleSend = (): void => {
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

        appendAiMessage(
            "Chat tự do đang được hoàn thiện. Hãy chọn một chức năng AI hoặc mở biểu mẫu tạo kế hoạch.",
        );
    };

    const handleKeyDown = (
        event:
        KeyboardEvent<HTMLInputElement>,
    ): void => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            handleSend();
        }
    };

    const openHistoryDetail =
        async (
            item:
            AiSuggestionResponse,
        ): Promise<void> => {
            try {
                setHistoryOpen(false);
                setDetailLoading(true);

                const detail =
                    await aiService
                        .getAiSuggestionDetail(
                            item.id,
                        );

                setSelectedHistoryItem(
                    detail,
                );
            } catch (error) {
                toast.error(
                    getApiErrorMessage(
                        error,
                        "Không thể tải chi tiết lịch sử AI.",
                    ),
                );
            } finally {
                setDetailLoading(false);
            }
        };

    return (
        <div ref={containerRef} className="relative flex min-h-[calc(100vh-8rem)] flex-col">
            <PageHeader
                title="FitLife AI"
                description="Trợ lý thông minh tạo kế hoạch tập luyện và dinh dưỡng dựa trên dữ liệu cá nhân."
                action={
                    <Button
                        variant="outline"
                        onClick={() =>
                            setHistoryOpen(true)
                        }
                        className="rounded-full"
                    >
                        <History className="h-4 w-4" />
                        Lịch sử AI
                    </Button>
                }
            />

            <div className="mb-5">
                <AiUsageCard
                    usage={usage}
                    loading={usageLoading}
                    error={usageError}
                    onReload={() => {
                        void loadUsage();
                    }}
                />
            </div>

            <div className="flex min-h-[650px] flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">
                    {messages.length === 1 && (
                        <section className="mb-8">
                            <h2 className="text-lg font-black text-slate-900">
                                Bạn muốn FitLife AI hỗ trợ gì?
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Chọn một chức năng để bắt đầu.
                            </p>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {QUICK_ACTIONS.map(
                                    (action) => {
                                        const Icon =
                                            action.icon;

                                        return (
                                            <button
                                                key={action.type}
                                                type="button"
                                                disabled={
                                                    isTyping
                                                }
                                                onClick={() =>
                                                    handleQuickAction(
                                                        action,
                                                    )
                                                }
                                                className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-violet-100 text-emerald-700 transition group-hover:scale-110">
                                                    <Icon className="h-5 w-5" />
                                                </div>

                                                <h3 className="mt-4 font-black text-slate-900">
                                                    {action.label}
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

                    <div className="space-y-6">
                        {messages.map(
                            (message) => (
                                <AiChatMessage
                                    key={message.id}
                                    message={message}
                                    onSuggestionChanged={
                                        updateSuggestionEverywhere
                                    }
                                />
                            ),
                        )}

                        {isTyping && (
                            <div className="flex max-w-4xl gap-4">
                                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-violet-600 text-white">
                                    <Bot className="h-4 w-4" />
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                    <Loader2 className="h-4 w-4 animate-spin text-violet-600" />

                                    <div>
                                        <p className="text-sm font-bold text-slate-700">
                                            FitLife AI đang xử lý...
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            Quá trình có thể mất từ
                                            10 đến 120 giây.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="border-t border-slate-200 bg-white p-4">
                    <div className="mx-auto flex max-w-5xl items-center gap-2">
                        <button
                            type="button"
                            disabled={isTyping}
                            onClick={() =>
                                openPlanForm(
                                    "FULL_PLAN",
                                )
                            }
                            title="Tạo kế hoạch AI"
                            aria-label="Tạo kế hoạch AI"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Wand2 className="h-5 w-5" />
                        </button>

                        <div className="relative flex-1">
                            <Input
                                id="ai-chat-input"
                                value={input}
                                disabled={isTyping}
                                onChange={(event) =>
                                    setInput(
                                        event.target.value,
                                    )
                                }
                                onKeyDown={
                                    handleKeyDown
                                }
                                placeholder="Nhập câu hỏi hoặc mở biểu mẫu tạo kế hoạch..."
                                className="mt-0 pr-14"
                            />

                            <Button
                                variant="primary"
                                disabled={
                                    !input.trim() ||
                                    isTyping
                                }
                                onClick={handleSend}
                                aria-label="Gửi yêu cầu"
                                className="absolute right-1.5 top-1/2 h-9 min-h-9 w-9 -translate-y-1/2 rounded-lg p-0"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <AiAdvancedPlanModal
                mode={planFormMode}
                open={showAdvancedForm}
                submitting={isTyping}
                onClose={() => {
                    if (!isTyping) {
                        setShowAdvancedForm(
                            false,
                        );
                    }
                }}
                onSubmit={submitPlanForm}
            />

            <AiHistoryDrawer
                open={historyOpen}
                items={historyItems}
                loading={historyLoading}
                error={historyError}
                onClose={() =>
                    setHistoryOpen(false)
                }
                onReload={() => {
                    void loadHistory();
                }}
                onSelect={(item) => {
                    void openHistoryDetail(
                        item,
                    );
                }}
            />

                {(selectedHistoryItem ||
                    detailLoading) && (
                    <>
                        <div
                            onClick={() => {
                                if (
                                    !detailLoading
                                ) {
                                    setSelectedHistoryItem(
                                        null,
                                    );
                                }
                            }}
                            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm gsap-animate"
                        />

                        <section
                            className="fixed inset-3 z-50 flex flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl sm:inset-8 gsap-animate"
                        >
                            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                                <div>
                                    <h2 className="font-black text-slate-900">
                                        Chi tiết gợi ý AI
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Xem nội dung, áp dụng kế hoạch và đánh giá.
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
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                                    aria-label="Đóng chi tiết AI"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </header>

                            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                                {detailLoading &&
                                !selectedHistoryItem ? (
                                    <div className="flex min-h-80 flex-col items-center justify-center">
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

                                            {!selectedHistoryItem
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