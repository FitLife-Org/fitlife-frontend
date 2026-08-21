import {
    Bot,
    CalendarPlus,
    CheckCircle2,
    Dumbbell,
    History,
    Loader2,
    RefreshCw,
    Search,
    Utensils,
    X,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import Button from "../common/Button";
import Badge from "../common/Badge";

import type {
    AiSuggestionResponse,
    AiSuggestionStatus,
    AiSuggestionType,
} from "../../types/ai.type";

interface AiHistoryDrawerProps {
    open: boolean;

    items:
        AiSuggestionResponse[];

    loading?: boolean;

    error?: string | null;

    onClose: () => void;

    onReload?: () => void;

    onSelect: (
        item:
        AiSuggestionResponse,
    ) => void;
}

type HistoryFilter =
    | "ALL"
    | AiSuggestionType;

function getSuggestionTitle(
    item:
    AiSuggestionResponse,
): string {
    switch (
        item.suggestionType
        ) {
        case "FULL_PLAN":
            return "Kế hoạch toàn diện";

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
    type:
    AiSuggestionType,
) {
    switch (type) {
        case "FULL_PLAN":
            return CalendarPlus;

        case "WORKOUT_PLAN":
            return Dumbbell;

        case "NUTRITION_PLAN":
            return Utensils;

        case "BODY_ANALYSIS":
        default:
            return Bot;
    }
}

function getStatusLabel(
    status:
    AiSuggestionStatus,
): string {
    switch (status) {
        case "PENDING":
            return "Đang xử lý";

        case "SUCCESS":
            return "Hoàn thành";

        case "FAILED":
            return "Thất bại";

        case "APPLIED":
            return "Đã áp dụng";

        default:
            return status;
    }
}

function getStatusVariant(
    status:
    AiSuggestionStatus,
):
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "default" {
    switch (status) {
        case "SUCCESS":
        case "APPLIED":
            return "success";

        case "PENDING":
            return "warning";

        case "FAILED":
            return "danger";

        default:
            return "default";
    }
}

function formatCreatedAt(
    value?: string | null,
): string {
    if (!value) {
        return "Không rõ thời gian";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
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
    const [
        filter,
        setFilter,
    ] =
        useState<HistoryFilter>(
            "ALL",
        );

    const [
        keyword,
        setKeyword,
    ] = useState("");

    /*
     * Drawer là overlay cấp application,
     * vì vậy khóa body scroll khi mở.
     */
    useEffect(() => {
        if (!open) {
            return;
        }

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
                "Escape"
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
        onClose,
    ]);

    useEffect(() => {
        if (!open) {
            return;
        }

        setFilter("ALL");
        setKeyword("");
    }, [open]);

    const filteredItems =
        useMemo(() => {
            const normalizedKeyword =
                keyword
                    .trim()
                    .toLowerCase();

            return items.filter(
                (item) => {
                    if (
                        filter !==
                        "ALL" &&
                        item.suggestionType !==
                        filter
                    ) {
                        return false;
                    }

                    if (
                        !normalizedKeyword
                    ) {
                        return true;
                    }

                    const searchableText = [
                        getSuggestionTitle(
                            item,
                        ),
                        item.summary,
                        item.goal,
                        item.memberName,
                        item.status,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return searchableText.includes(
                        normalizedKeyword,
                    );
                },
            );
        }, [
            items,
            filter,
            keyword,
        ]);

    if (!open) {
        return null;
    }

    const handleSelect = (
        item:
        AiSuggestionResponse,
    ): void => {
        onSelect(item);
        onClose();
    };

    return (
        <>
            {/* =================================================
       * OVERLAY
       * ================================================= */}

            <button
                type="button"
                aria-label="Đóng lịch sử AI"
                onClick={
                    onClose
                }
                className="
          fixed
          inset-0
          z-40
          cursor-default
          bg-slate-950/40
          backdrop-blur-sm
        "
            />

            {/* =================================================
       * DRAWER
       * ================================================= */}

            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-history-title"
                className="
          fixed
          bottom-0
          right-0
          top-0
          z-50
          flex
          w-full
          max-w-[460px]
          flex-col
          overflow-hidden
          border-l
          border-slate-200
          bg-white
          shadow-2xl
        "
            >
                {/* =============================
         * HEADER
         * ============================= */}

                <header
                    className="
            relative
            overflow-hidden
            border-b
            border-slate-200
            px-5
            py-5
          "
                >
                    <div
                        className="
              pointer-events-none
              absolute
              -right-12
              -top-16
              h-36
              w-36
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
                        <div className="flex items-center gap-3">
                            <div
                                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-violet-100
                  text-violet-700
                "
                            >
                                <History className="h-5 w-5" />
                            </div>

                            <div>
                                <h3
                                    id="ai-history-title"
                                    className="font-black text-slate-950"
                                >
                                    Lịch sử FitLife AI
                                </h3>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    {items.length} yêu cầu gần đây
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {onReload && (
                                <Button
                                    variant="ghost"
                                    onClick={
                                        onReload
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="
                    h-10
                    min-h-10
                    w-10
                    rounded-xl
                    p-0
                  "
                                    aria-label="Tải lại lịch sử AI"
                                >
                                    <RefreshCw
                                        className={`
                      h-4
                      w-4

                      ${
                                            loading
                                                ? "animate-spin"
                                                : ""
                                        }
                    `}
                                    />
                                </Button>
                            )}

                            <button
                                type="button"
                                onClick={
                                    onClose
                                }
                                aria-label="Đóng lịch sử AI"
                                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-slate-500
                  transition
                  hover:bg-slate-50
                  hover:text-slate-900
                "
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Search */}

                    <div className="relative mt-4">
                        <Search
                            className="
                absolute
                left-3.5
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-400
              "
                        />

                        <input
                            type="search"
                            value={
                                keyword
                            }
                            onChange={(
                                event,
                            ) =>
                                setKeyword(
                                    event.target
                                        .value,
                                )
                            }
                            placeholder="Tìm kế hoạch, mục tiêu..."
                            className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                pl-10
                pr-4
                text-sm
                text-slate-700
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-emerald-500
                focus:bg-white
                focus:ring-4
                focus:ring-emerald-500/10
              "
                        />
                    </div>

                    {/* Filters */}

                    <div
                        className="
              mt-3
              flex
              gap-2
              overflow-x-auto
              pb-1
            "
                    >
                        <FilterButton
                            active={
                                filter ===
                                "ALL"
                            }
                            onClick={() =>
                                setFilter(
                                    "ALL",
                                )
                            }
                        >
                            Tất cả
                        </FilterButton>

                        <FilterButton
                            active={
                                filter ===
                                "FULL_PLAN"
                            }
                            onClick={() =>
                                setFilter(
                                    "FULL_PLAN",
                                )
                            }
                        >
                            Toàn diện
                        </FilterButton>

                        <FilterButton
                            active={
                                filter ===
                                "WORKOUT_PLAN"
                            }
                            onClick={() =>
                                setFilter(
                                    "WORKOUT_PLAN",
                                )
                            }
                        >
                            Tập luyện
                        </FilterButton>

                        <FilterButton
                            active={
                                filter ===
                                "NUTRITION_PLAN"
                            }
                            onClick={() =>
                                setFilter(
                                    "NUTRITION_PLAN",
                                )
                            }
                        >
                            Dinh dưỡng
                        </FilterButton>

                        <FilterButton
                            active={
                                filter ===
                                "BODY_ANALYSIS"
                            }
                            onClick={() =>
                                setFilter(
                                    "BODY_ANALYSIS",
                                )
                            }
                        >
                            Cơ thể
                        </FilterButton>
                    </div>
                </header>

                {/* =============================
         * CONTENT
         * ============================= */}

                <div
                    className="
            fit-scrollbar
            flex-1
            overflow-y-auto
            p-4
          "
                >
                    {loading &&
                    items.length === 0 ? (
                        <div
                            className="
                flex
                h-52
                flex-col
                items-center
                justify-center
                text-slate-500
              "
                        >
                            <Loader2 className="h-7 w-7 animate-spin text-violet-600" />

                            <p className="mt-3 text-sm font-medium">
                                Đang tải lịch sử AI...
                            </p>
                        </div>
                    ) : error ? (
                        <div
                            className="
                rounded-2xl
                border
                border-red-200
                bg-red-50
                p-5
              "
                        >
                            <p className="text-sm font-semibold text-red-600">
                                {error}
                            </p>

                            {onReload && (
                                <Button
                                    variant="outline"
                                    onClick={
                                        onReload
                                    }
                                    className="mt-4 w-full"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Thử lại
                                </Button>
                            )}
                        </div>
                    ) : items.length ===
                    0 ? (
                        <EmptyHistory />
                    ) : filteredItems.length ===
                    0 ? (
                        <div
                            className="
                flex
                h-52
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-slate-300
                bg-slate-50
                p-6
                text-center
              "
                        >
                            <Search className="h-8 w-8 text-slate-300" />

                            <p className="mt-3 font-bold text-slate-700">
                                Không tìm thấy kết quả
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Thử thay đổi từ khóa hoặc loại kế hoạch.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredItems.map(
                                (item) => {
                                    const Icon =
                                        getSuggestionIcon(
                                            item.suggestionType,
                                        );

                                    return (
                                        <button
                                            key={
                                                item.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                handleSelect(
                                                    item,
                                                )
                                            }
                                            className="
                        group
                        w-full
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        text-left
                        shadow-sm
                        transition
                        hover:-translate-y-0.5
                        hover:border-violet-200
                        hover:shadow-md
                      "
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-slate-100
                            text-slate-600
                            transition
                            group-hover:bg-violet-100
                            group-hover:text-violet-700
                          "
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div
                                                        className="
                              flex
                              items-start
                              justify-between
                              gap-3
                            "
                                                    >
                                                        <div className="min-w-0">
                                                            <h4
                                                                className="
                                  truncate
                                  text-sm
                                  font-black
                                  text-slate-900
                                "
                                                            >
                                                                {getSuggestionTitle(
                                                                    item,
                                                                )}
                                                            </h4>

                                                            {item.goal && (
                                                                <p
                                                                    className="
                                    mt-1
                                    truncate
                                    text-[11px]
                                    font-semibold
                                    text-violet-600
                                  "
                                                                >
                                                                    {
                                                                        item.goal
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        <Badge
                                                            variant={
                                                                getStatusVariant(
                                                                    item.status,
                                                                )
                                                            }
                                                        >
                                                            {getStatusLabel(
                                                                item.status,
                                                            )}
                                                        </Badge>
                                                    </div>

                                                    {item.summary && (
                                                        <p
                                                            className="
                                mt-2
                                line-clamp-2
                                text-xs
                                leading-5
                                text-slate-500
                              "
                                                        >
                                                            {
                                                                item.summary
                                                            }
                                                        </p>
                                                    )}

                                                    <div
                                                        className="
                              mt-3
                              flex
                              items-center
                              justify-between
                              gap-3
                            "
                                                    >
                                                        <p
                                                            className="
                                text-[10px]
                                font-medium
                                text-slate-400
                              "
                                                        >
                                                            {formatCreatedAt(
                                                                item.createdAt ||
                                                                item.requestedAt,
                                                            )}
                                                        </p>

                                                        {item.status ===
                                                            "APPLIED" && (
                                                                <span
                                                                    className="
                                  inline-flex
                                  items-center
                                  gap-1
                                  text-[10px]
                                  font-bold
                                  text-emerald-600
                                "
                                                                >
                                <CheckCircle2 className="h-3 w-3" />
                                Đã đưa vào kế hoạch
                              </span>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                },
                            )}
                        </div>
                    )}
                </div>

                {/* =============================
         * FOOTER
         * ============================= */}

                <footer
                    className="
            border-t
            border-slate-200
            bg-slate-50
            px-5
            py-3
          "
                >
                    <p
                        className="
              text-center
              text-[11px]
              leading-5
              text-slate-400
            "
                    >
                        Lịch sử giúp bạn xem lại và áp dụng các kế hoạch AI đã tạo trước đó.
                    </p>
                </footer>
            </aside>
        </>
    );
}

function FilterButton({
                          active,
                          onClick,
                          children,
                      }: {
    active: boolean;

    onClick: () => void;

    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={
                onClick
            }
            className={`
        shrink-0
        rounded-full
        border
        px-3
        py-1.5
        text-[11px]
        font-bold
        transition

        ${
                active
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
            }
      `}
        >
            {children}
        </button>
    );
}

function EmptyHistory() {
    return (
        <div
            className="
        flex
        h-56
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-slate-300
        bg-slate-50
        p-6
        text-center
      "
        >
            <div
                className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-violet-100
          text-violet-600
        "
            >
                <Bot className="h-7 w-7" />
            </div>

            <p className="mt-4 font-black text-slate-800">
                Chưa có lịch sử AI
            </p>

            <p
                className="
          mt-1
          max-w-xs
          text-xs
          leading-5
          text-slate-500
        "
            >
                Các lần phân tích cơ thể và kế hoạch bạn tạo sẽ xuất hiện tại đây.
            </p>
        </div>
    );
}