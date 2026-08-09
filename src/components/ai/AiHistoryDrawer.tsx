import {
    Bot,
    CalendarPlus,
    History,
    Loader2,
    RefreshCw,
    Utensils,
    X,
} from "lucide-react";

import Button from "../common/Button";

import type {
    AiSuggestionResponse,
} from "../../types/ai.type";

interface AiHistoryDrawerProps {
    open: boolean;

    items: AiSuggestionResponse[];

    loading?: boolean;

    error?: string | null;

    onClose: () => void;

    onReload?: () => void;

    onSelect: (
        item: AiSuggestionResponse,
    ) => void;
}

function getSuggestionTitle(
    item: AiSuggestionResponse,
): string {
    switch (item.suggestionType) {
        case "FULL_PLAN":
            return "Kế hoạch tập luyện và dinh dưỡng";

        case "WORKOUT_PLAN":
            return "Kế hoạch tập luyện";

        case "NUTRITION_PLAN":
            return "Kế hoạch dinh dưỡng";

        case "BODY_ANALYSIS":
            return "Phân tích cơ thể";

        default:
            return "Gợi ý FitLife AI";
    }
}

function getSuggestionIcon(
    item: AiSuggestionResponse,
) {
    if (
        item.suggestionType ===
        "FULL_PLAN" ||
        item.suggestionType ===
        "WORKOUT_PLAN"
    ) {
        return CalendarPlus;
    }

    if (
        item.suggestionType ===
        "NUTRITION_PLAN"
    ) {
        return Utensils;
    }

    return Bot;
}

function formatCreatedAt(
    value?: string | null,
): string {
    if (!value) {
        return "Không rõ thời gian";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Không rõ thời gian";
    }

    return date.toLocaleString(
        "vi-VN",
        {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        },
    );
}

export default function AiHistoryDrawer({
                                            open,
                                            items,
                                            loading = false,
                                            error,
                                            onClose,
                                            onReload,
                                            onSelect,
                                        }: AiHistoryDrawerProps) {
    return (
        <>
            {open && (
                <>
                    <div
                        onClick={onClose}
                        className="absolute inset-0 z-40 rounded-3xl bg-slate-950/30 backdrop-blur-sm"
                    />

                    <aside
                        className="absolute bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col overflow-hidden rounded-r-3xl border-l border-slate-200 bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                                    <History className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="font-black text-slate-900">
                                        Lịch sử AI
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        {items.length} kết quả gần đây
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {onReload && (
                                    <Button
                                        variant="ghost"
                                        onClick={onReload}
                                        disabled={loading}
                                        className="h-9 min-h-9 w-9 rounded-full p-0"
                                        aria-label="Tải lại lịch sử AI"
                                    >
                                        <RefreshCw
                                            className={`h-4 w-4 ${
                                                loading
                                                    ? "animate-spin"
                                                    : ""
                                            }`}
                                        />
                                    </Button>
                                )}

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {loading &&
                            items.length === 0 ? (
                                <div className="flex h-40 flex-col items-center justify-center text-slate-500">
                                    <Loader2 className="h-6 w-6 animate-spin text-violet-600" />

                                    <p className="mt-3 text-sm font-medium">
                                        Đang tải lịch sử...
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                                    <p className="text-sm font-semibold text-red-600">
                                        {error}
                                    </p>

                                    {onReload && (
                                        <Button
                                            variant="outline"
                                            onClick={onReload}
                                            className="mt-3 w-full"
                                        >
                                            Thử lại
                                        </Button>
                                    )}
                                </div>
                            ) : items.length === 0 ? (
                                <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                    <Bot className="h-8 w-8 text-slate-300" />

                                    <p className="mt-3 font-bold text-slate-700">
                                        Chưa có lịch sử AI
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Kế hoạch bạn tạo sẽ xuất hiện tại đây.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {items.map(
                                        (item) => {
                                            const Icon =
                                                getSuggestionIcon(
                                                    item,
                                                );

                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() =>
                                                        onSelect(
                                                            item,
                                                        )
                                                    }
                                                    className="w-full rounded-2xl border border-transparent p-4 text-left transition hover:border-slate-200 hover:bg-slate-50"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                                            <Icon className="h-4 w-4" />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <h4 className="line-clamp-1 text-sm font-bold text-slate-900">
                                                                    {getSuggestionTitle(
                                                                        item,
                                                                    )}
                                                                </h4>

                                                                <span
                                                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                        item.status ===
                                                                        "FAILED"
                                                                            ? "bg-red-100 text-red-600"
                                                                            : item.status ===
                                                                            "APPLIED"
                                                                                ? "bg-emerald-100 text-emerald-700"
                                                                                : "bg-blue-100 text-blue-700"
                                                                    }`}
                                                                >
                                  {
                                      item.status
                                  }
                                </span>
                                                            </div>

                                                            {item.summary && (
                                                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                                                    {
                                                                        item.summary
                                                                    }
                                                                </p>
                                                            )}

                                                            <p className="mt-2 text-[10px] font-medium text-slate-400">
                                                                {formatCreatedAt(
                                                                    item.createdAt ||
                                                                    item.requestedAt,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </div>
                    </aside>
                </>
            )}
        </>
    );
}
