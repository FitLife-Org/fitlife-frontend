import {
  Bot,
  Clock3,
  RefreshCw,
  Sparkles,
  Zap,
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

function formatResetTime(
    resetAt?: string,
): string {
  if (!resetAt) {
    return "00:00 ngày mai";
  }

  const date =
      new Date(resetAt);

  if (
      Number.isNaN(
          date.getTime(),
      )
  ) {
    return "00:00 ngày mai";
  }

  return date.toLocaleString(
      "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      },
  );
}

export default function AiUsageCard({
                                      usage,
                                      loading = false,
                                      error,
                                      onReload,
                                    }: AiUsageCardProps) {
  const used =
      usage?.used ?? 0;

  const dailyLimit =
      usage?.dailyLimit ?? 5;

  const remaining =
      usage?.remaining ??
      Math.max(
          0,
          dailyLimit - used,
      );

  const percentage =
      dailyLimit > 0
          ? Math.min(
              100,
              Math.round(
                  (
                      used /
                      dailyLimit
                  ) * 100,
              ),
          )
          : 0;

  const exhausted =
      remaining <= 0;

  return (
      <Card className="relative overflow-hidden">
        <div
            className="
          pointer-events-none
          absolute
          -right-16
          -top-20
          h-48
          w-48
          rounded-full
          bg-violet-200/40
          blur-3xl
        "
        />

        <div className="relative p-5 sm:p-6">
          <div
              className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
          >
            <div className="flex items-start gap-4">
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
                <Bot className="h-6 w-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-slate-900">
                    FitLife AI hôm nay
                  </h2>

                  <Sparkles className="h-4 w-4 text-violet-500" />
                </div>

                {loading ? (
                    <p className="mt-1 text-sm text-slate-500">
                      Đang kiểm tra hạn mức AI...
                    </p>
                ) : error ? (
                    <p className="mt-1 text-sm font-medium text-red-600">
                      {error}
                    </p>
                ) : exhausted ? (
                    <p className="mt-1 text-sm font-medium text-amber-600">
                      Bạn đã sử dụng hết lượt AI hôm nay.
                    </p>
                ) : (
                    <p className="mt-1 text-sm text-slate-500">
                      Còn{" "}
                      <strong className="text-emerald-600">
                        {remaining}
                      </strong>{" "}
                      lượt phân tích hoặc tạo kế hoạch.
                    </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                  className="
                min-w-[110px]
                rounded-2xl
                bg-slate-950
                px-5
                py-3
                text-white
                shadow-lg
                shadow-slate-900/10
              "
              >
                <p
                    className="
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
                >
                  <Zap className="h-3 w-3" />
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
                        className={`
                    h-4 w-4
                    ${
                            loading
                                ? "animate-spin"
                                : ""
                        }
                  `}
                    />
                  </Button>
              )}
            </div>
          </div>

          <div className="mt-5">
            <div
                className="
              h-2
              overflow-hidden
              rounded-full
              bg-slate-100
            "
            >
              <div
                  className={`
                h-full
                rounded-full
                transition-all
                duration-500
                ${
                      exhausted
                          ? "bg-amber-500"
                          : "bg-gradient-to-r from-emerald-500 to-violet-500"
                  }
              `}
                  style={{
                    width:
                        `${percentage}%`,
                  }}
              />
            </div>

            <div
                className="
              mt-3
              flex
              items-center
              gap-2
              text-xs
              font-medium
              text-slate-400
            "
            >
              <Clock3 className="h-4 w-4" />

              <span>
              Làm mới lúc{" "}
                {formatResetTime(
                    usage?.resetAt,
                )}
            </span>
            </div>
          </div>
        </div>
      </Card>
  );
}