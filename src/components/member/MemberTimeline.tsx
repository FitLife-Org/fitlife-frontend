import {
    Activity,
    Bot,
    ClipboardCheck,
    CreditCard,
    Dumbbell,
    FileText,
    HeartPulse,
    Package,
    Utensils,
    UserRound,
    type LucideIcon,
} from "lucide-react";

import type {
    MemberTimelineItem,
    MemberTimelineType,
} from "../../types/memberTimeline.type";

interface MemberTimelineProps {
    items:
        MemberTimelineItem[];

    loading: boolean;
    loadingMore?: boolean;

    error?:
        string | null;

    hasMore?: boolean;

    onLoadMore?:
        () => void;
}

const icons:
    Record<
        MemberTimelineType,
        LucideIcon
    > = {
    MEMBER_PROFILE:
    UserRound,

    SUBSCRIPTION:
    Package,

    INVOICE:
    FileText,

    PAYMENT:
    CreditCard,

    CHECKIN:
    ClipboardCheck,

    BODY_METRIC:
    HeartPulse,

    AI_SUGGESTION:
    Bot,

    WORKOUT:
    Dumbbell,

    NUTRITION:
    Utensils,

    SYSTEM:
    Activity,
};

function formatDateTime(
    value: string,
): string {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "vi-VN",
        {
            dateStyle: "medium",
            timeStyle: "short",
        },
    ).format(date);
}

export default function MemberTimeline({
                                           items,
                                           loading,
                                           loadingMore = false,
                                           error,
                                           hasMore = false,
                                           onLoadMore,
                                       }: MemberTimelineProps) {
    if (loading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <div className="fit-spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
            </div>
        );
    }

    if (
        items.length === 0
    ) {
        return (
            <div className="fit-empty-state">
                <Activity className="h-12 w-12 text-slate-300" />

                <p className="mt-3 font-bold text-slate-700">
                    Chưa có hoạt động
                </p>
            </div>
        );
    }

    return (
        <div>
            {items.map(
                (
                    item,
                    index,
                ) => {
                    const Icon =
                        icons[
                            item.type
                            ] ?? Activity;

                    return (
                        <article
                            key={item.id}
                            className="flex gap-4"
                        >
                            <div className="flex flex-col items-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fit-primarySoft text-fit-primary">
                  <Icon className="h-5 w-5" />
                </span>

                                {index <
                                    items.length -
                                    1 && (
                                        <span className="h-full min-h-10 w-px bg-slate-200" />
                                    )}
                            </div>

                            <div className="min-w-0 flex-1 pb-6">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                    <h3 className="font-bold text-slate-900">
                                        {item.title}
                                    </h3>

                                    <time className="shrink-0 text-xs text-slate-400">
                                        {formatDateTime(
                                            item.occurredAt,
                                        )}
                                    </time>
                                </div>

                                {item.description && (
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {
                                            item.description
                                        }
                                    </p>
                                )}

                                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold">
                    {item.type}
                  </span>

                                    {item.status && (
                                        <span className="rounded-full bg-fit-primarySoft px-2 py-1 text-[10px] font-bold text-fit-primary">
                      {
                          item.status
                      }
                    </span>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                },
            )}

            {hasMore &&
                onLoadMore && (
                    <div className="text-center">
                        <button
                            type="button"
                            className="fit-button-secondary"
                            onClick={
                                onLoadMore
                            }
                            disabled={
                                loadingMore
                            }
                        >
                            {loadingMore
                                ? "Đang tải..."
                                : "Xem thêm"}
                        </button>
                    </div>
                )}
        </div>
    );
}