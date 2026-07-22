import {
  Bot,
  Clock3,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import Button from "../common/Button";
import Card from "../common/Card";

import type {
  AiUsageTodayResponse,
} from "../../types/ai.type";

interface AiUsageCardProps {
  usage: AiUsageTodayResponse | null;
  loading?: boolean;
  error?: string | null;
  onReload?: () => void;
}

function formatResetTime(resetAt?: string): string {
  if (!resetAt) {
    return "00:00 ngày mai";
  }

  const date = new Date(resetAt);

  if (Number.isNaN(date.getTime())) {
    return "00:00 ngày mai";
  }

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AiUsageCard({
  usage,
  loading = false,
  error,
  onReload,
}: AiUsageCardProps) {
  const used = usage?.used ?? 0;
  const dailyLimit = usage?.dailyLimit ?? 5;
  const remaining =
    usage?.remaining ?? Math.max(0, dailyLimit - used);

  const percentage =
    dailyLimit > 0
      ? Math.min(100, Math.round((used / dailyLimit) * 100))
      : 0;

  return (
    <Card className="overflow-hidden">
      <div className="relative p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-violet-100 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Bot className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-slate-900">
                  Lượt sử dụng AI hôm nay
                </h2>
                <Sparkles className="h-4 w-4 text-violet-500" />
              </div>

              {loading ? (
                <p className="mt-1 text-sm text-slate-500">
                  Đang tải thông tin hạn mức...
                </p>
              ) : error ? (
                <p className="mt-1 text-sm font-medium text-red-600">
                  {error}
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-500">
                  Bạn còn{" "}
                  <span className="font-black text-emerald-600">
                    {remaining}
                  </span>{" "}
                  lượt tạo nội dung AI.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 px-5 py-3 text-white">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Đã dùng
              </p>

              <p className="mt-1 text-2xl font-black">
                {used}
                <span className="ml-1 text-sm text-slate-400">
                  / {dailyLimit}
                </span>
              </p>
            </div>

            {onReload && (
              <Button
                variant="outline"
                onClick={onReload}
                disabled={loading}
                aria-label="Tải lại lượt sử dụng AI"
                className="h-12 min-h-12 w-12 rounded-2xl p-0"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            )}
          </div>
        </div>

        <div className="relative mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-violet-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
            <Clock3 className="h-4 w-4" />
            <span>Làm mới lúc {formatResetTime(usage?.resetAt)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
