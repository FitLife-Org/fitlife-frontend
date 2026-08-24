import {
  Activity,
  Apple,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";

import {
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useGSAP,
} from "@gsap/react";

import gsap from "gsap";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";

import {
  ROUTES,
} from "../../config/routes";

/* ============================================================
 * TEMP DATA
 *
 * TODO:
 * Sau khi giao diện ổn định, thay bằng:
 * - Subscription API
 * - Workout API
 * - Nutrition API
 * - Body Metric API
 * ============================================================ */

const progressData = [
  {
    week: "T1",
    weight: 61.8,
    fat: 20.8,
  },
  {
    week: "T2",
    weight: 61.4,
    fat: 20.3,
  },
  {
    week: "T3",
    weight: 61.0,
    fat: 19.8,
  },
  {
    week: "T4",
    weight: 60.7,
    fat: 19.4,
  },
  {
    week: "T5",
    weight: 60.5,
    fat: 19.1,
  },
  {
    week: "T6",
    weight: 60.2,
    fat: 18.8,
  },
  {
    week: "T7",
    weight: 60.0,
    fat: 18.5,
  },
  {
    week: "T8",
    weight: 59.8,
    fat: 18.2,
  },
];

const todayExercises = [
  {
    name: "Bench Press",
    prescription: "4 × 8-10",
  },
  {
    name: "Shoulder Press",
    prescription: "3 × 10-12",
  },
  {
    name: "Incline Dumbbell Press",
    prescription: "3 × 10-12",
  },
  {
    name: "Triceps Pushdown",
    prescription: "3 × 12-15",
  },
];

const quickActions = [
  {
    name: "Buổi tập hôm nay",
    description: "Xem và thực hiện workout",
    icon: Dumbbell,
    route:
    ROUTES.MEMBER_WORKOUT_TODAY,
    iconClass:
        "bg-violet-50 text-violet-600",
  },
  {
    name: "Dinh dưỡng hôm nay",
    description: "Theo dõi meal plan",
    icon: Apple,
    route:
    ROUTES.MEMBER_NUTRITION_TODAY,
    iconClass:
        "bg-emerald-50 text-emerald-600",
  },
  {
    name: "Chỉ số cơ thể",
    description: "Cập nhật Body Metric",
    icon: Target,
    route:
    ROUTES.MEMBER_BODY_METRICS,
    iconClass:
        "bg-blue-50 text-blue-600",
  },
  {
    name: "FitLife AI",
    description: "Phân tích và tạo kế hoạch",
    icon: Sparkles,
    route:
    ROUTES.MEMBER_AI,
    iconClass:
        "bg-rose-50 text-rose-600",
  },
];

/* ============================================================
 * TOOLTIP
 * ============================================================ */

interface CustomTooltipProps {
  active?: boolean;

  payload?: Array<{
    value: number;
    dataKey: string;
  }>;

  label?: string;
}

function CustomTooltip({
                         active,
                         payload,
                         label,
                       }: CustomTooltipProps) {
  if (
      !active ||
      !payload ||
      payload.length === 0
  ) {
    return null;
  }

  const item =
      payload[0];

  return (
      <div
          className="
        rounded-xl
        border
        border-slate-200
        bg-white/95
        p-3
        shadow-lg
        backdrop-blur
      "
      >
        <p
            className="
          text-xs
          font-semibold
          text-slate-400
        "
        >
          {label}
        </p>

        <p
            className="
          mt-1
          text-sm
          font-black
          text-emerald-600
        "
        >
          {item.value}
          {item.dataKey ===
          "weight"
              ? " kg"
              : "%"}
        </p>
      </div>
  );
}

/* ============================================================
 * PAGE
 * ============================================================ */

export default function DashboardPage() {
  const containerRef =
      useRef<HTMLDivElement>(
          null,
      );

  const [
    chartType,
    setChartType,
  ] =
      useState<
          "weight" | "fat"
      >("weight");

  useGSAP(
      () => {
        gsap.fromTo(
            ".member-dashboard-animate",
            {
              opacity: 0,
              y: 18,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.06,
              ease: "power2.out",
              clearProps:
                  "all",
            },
        );
      },
      {
        scope:
        containerRef,
      },
  );

  return (
      <div
          ref={containerRef}
          className="
        w-full
        min-w-0
        space-y-6
        pb-8
      "
      >
        {/* =====================================================
       * HEADER
       * ===================================================== */}

        <section
            className="
          member-dashboard-animate
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
        >
          <div>
            <p
                className="
              text-xs
              font-black
              uppercase
              tracking-[0.2em]
              text-emerald-600
            "
            >
              Member Dashboard
            </p>

            <h1
                className="
              mt-2
              text-2xl
              font-black
              tracking-tight
              text-slate-950
              sm:text-3xl
            "
            >
              Tổng quan hành trình
              của bạn
            </h1>

            <p
                className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
            "
            >
              Theo dõi kế hoạch tập
              luyện, dinh dưỡng và
              sự thay đổi cơ thể tại
              một nơi.
            </p>
          </div>

          <Link
              to={
                ROUTES.MEMBER_AI
              }
              className="
            inline-flex
            min-h-11
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-emerald-600
            px-5
            text-sm
            font-bold
            text-white
            shadow-sm
            transition
            hover:bg-emerald-700
          "
          >
            <Sparkles className="h-4 w-4" />

            Mở FitLife AI
          </Link>
        </section>

        {/* =====================================================
       * METRICS
       * ===================================================== */}

        <section
            className="
          grid
          min-w-0
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
        >
          <MetricCard
              icon={
                <Trophy className="h-5 w-5" />
              }
              label="Gói hiện tại"
              value="Premium"
              tone="green"
              footer={
                <Badge variant="success">
                  Đang hoạt động
                </Badge>
              }
          />

          <MetricCard
              icon={
                <Dumbbell className="h-5 w-5" />
              }
              label="Buổi tập tuần này"
              value="4 / 6"
              progress={67}
              tone="blue"
          />

          <MetricCard
              icon={
                <Flame className="h-5 w-5" />
              }
              label="Calories hôm nay"
              value="1.850 / 2.200"
              progress={84}
              tone="green"
          />

          <MetricCard
              icon={
                <CalendarDays className="h-5 w-5" />
              }
              label="Thời hạn gói"
              value="12 ngày"
              tone="purple"
              footer={
                <span className="text-xs font-semibold text-slate-500">
              Còn lại trước khi
              hết hạn
            </span>
              }
          />
        </section>

        {/* =====================================================
       * MAIN CONTENT
       * ===================================================== */}

        <section
            className="
          grid
          min-w-0
          gap-6
          xl:grid-cols-12
        "
        >
          {/* TODAY WORKOUT */}

          <div
              className="
            member-dashboard-animate
            min-w-0
            xl:col-span-5
          "
          >
            <Card
                className="
              flex
              h-full
              min-w-0
              flex-col
              p-5
              sm:p-6
            "
            >
              <div
                  className="
                flex
                items-start
                justify-between
                gap-3
              "
              >
                <div>
                  <p
                      className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-emerald-600
                  "
                  >
                    Today
                  </p>

                  <h2
                      className="
                    mt-1
                    text-xl
                    font-black
                    text-slate-900
                  "
                  >
                    Buổi tập hôm nay
                  </h2>
                </div>

                <Link
                    to={
                      ROUTES.MEMBER_WORKOUT_TODAY
                    }
                    className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-1
                  text-xs
                  font-bold
                  text-emerald-600
                  hover:text-emerald-700
                "
                >
                  Chi tiết

                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div
                  className="
                mt-5
                rounded-2xl
                border
                border-emerald-100
                bg-emerald-50/50
                p-4
              "
              >
                <div
                    className="
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-2
                "
                >
                  <div>
                    <p
                        className="
                      text-xs
                      font-bold
                      text-emerald-600
                    "
                    >
                      17:00 · 60 phút
                    </p>

                    <p
                        className="
                      mt-1
                      font-black
                      text-slate-900
                    "
                    >
                      Push Day
                    </p>

                    <p
                        className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                    >
                      Ngực · Vai ·
                      Tay sau
                    </p>
                  </div>

                  <Badge variant="success">
                    4 bài
                  </Badge>
                </div>
              </div>

              <div
                  className="
                mt-4
                flex-1
                space-y-1
              "
              >
                {todayExercises.map(
                    (
                        exercise,
                        index,
                    ) => (
                        <div
                            key={
                              exercise.name
                            }
                            className="
                      flex
                      min-w-0
                      items-center
                      justify-between
                      gap-3
                      rounded-xl
                      px-2
                      py-2.5
                      transition
                      hover:bg-slate-50
                    "
                        >
                          <div
                              className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                      "
                          >
                      <span
                          className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-slate-100
                          text-xs
                          font-black
                          text-slate-500
                        "
                      >
                        {index + 1}
                      </span>

                            <span
                                className="
                          truncate
                          text-sm
                          font-semibold
                          text-slate-700
                        "
                            >
                        {
                          exercise.name
                        }
                      </span>
                          </div>

                          <span
                              className="
                        shrink-0
                        text-xs
                        font-semibold
                        text-slate-400
                      "
                          >
                      {
                        exercise.prescription
                      }
                    </span>
                        </div>
                    ),
                )}
              </div>

              <Link
                  to={
                    ROUTES.MEMBER_WORKOUT_TODAY
                  }
                  className="
                mt-5
                inline-flex
                min-h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-slate-950
                px-4
                text-sm
                font-bold
                text-white
                transition
                hover:bg-slate-800
              "
              >
                Bắt đầu buổi tập

                <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          </div>

          {/* BODY PROGRESS */}

          <div
              className="
            member-dashboard-animate
            min-w-0
            xl:col-span-7
          "
          >
            <Card
                className="
              h-full
              min-w-0
              p-5
              sm:p-6
            "
            >
              <div
                  className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
              >
                <div>
                  <p
                      className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-emerald-600
                  "
                  >
                    Body Metric
                  </p>

                  <h2
                      className="
                    mt-1
                    text-xl
                    font-black
                    text-slate-900
                  "
                  >
                    Tiến độ cơ thể
                  </h2>
                </div>

                <select
                    value={
                      chartType
                    }
                    onChange={(
                        event,
                    ) =>
                        setChartType(
                            event.target
                                .value as
                                | "weight"
                                | "fat",
                        )
                    }
                    className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-slate-600
                  outline-none
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-500/10
                "
                >
                  <option value="weight">
                    Cân nặng
                  </option>

                  <option value="fat">
                    % mỡ cơ thể
                  </option>
                </select>
              </div>

              <div
                  className="
                mt-5
                h-[270px]
                min-w-0
                overflow-hidden
                rounded-2xl
                border
                border-slate-100
                bg-slate-50/40
                p-2
              "
              >
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                  <AreaChart
                      data={
                        progressData
                      }
                      margin={{
                        top: 12,
                        right: 12,
                        left: -20,
                        bottom: 0,
                      }}
                  >
                    <defs>
                      <linearGradient
                          id="memberDashboardArea"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                      >
                        <stop
                            offset="5%"
                            stopColor="#059669"
                            stopOpacity={
                              0.28
                            }
                        />

                        <stop
                            offset="95%"
                            stopColor="#059669"
                            stopOpacity={
                              0
                            }
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={
                          false
                        }
                        stroke="#e2e8f0"
                    />

                    <XAxis
                        dataKey="week"
                        axisLine={
                          false
                        }
                        tickLine={
                          false
                        }
                        tick={{
                          fill:
                              "#94a3b8",
                          fontSize:
                              11,
                        }}
                    />

                    <YAxis
                        axisLine={
                          false
                        }
                        tickLine={
                          false
                        }
                        tick={{
                          fill:
                              "#94a3b8",
                          fontSize:
                              11,
                        }}
                        domain={[
                          "dataMin - 2",
                          "dataMax + 2",
                        ]}
                    />

                    <Tooltip
                        content={
                          <CustomTooltip />
                        }
                    />

                    <Area
                        type="monotone"
                        dataKey={
                          chartType
                        }
                        stroke="#059669"
                        strokeWidth={
                          3
                        }
                        fill="url(#memberDashboardArea)"
                        fillOpacity={
                          1
                        }
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div
                  className="
                mt-4
                grid
                grid-cols-3
                gap-3
              "
              >
                <Summary
                    label="Bắt đầu"
                    value={
                      chartType ===
                      "weight"
                          ? "61.8 kg"
                          : "20.8%"
                    }
                />

                <Summary
                    label="Hiện tại"
                    value={
                      chartType ===
                      "weight"
                          ? "59.8 kg"
                          : "18.2%"
                    }
                    active
                />

                <Summary
                    label="Thay đổi"
                    value={
                      chartType ===
                      "weight"
                          ? "-2.0 kg"
                          : "-2.6%"
                    }
                    trend="down"
                />
              </div>
            </Card>
          </div>

          {/* GOALS */}

          <div
              className="
            member-dashboard-animate
            min-w-0
            xl:col-span-12
          "
          >
            <Card
                className="
              min-w-0
              p-5
              sm:p-6
            "
            >
              <div
                  className="
                flex
                items-center
                justify-between
                gap-4
              "
              >
                <div>
                  <p
                      className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-emerald-600
                  "
                  >
                    Goals
                  </p>

                  <h2
                      className="
                    mt-1
                    text-xl
                    font-black
                    text-slate-900
                  "
                  >
                    Mục tiêu hiện tại
                  </h2>
                </div>

                <Link
                    to={
                      ROUTES.MEMBER_BODY_METRICS
                    }
                    className="
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-bold
                  text-emerald-600
                  hover:text-emerald-700
                "
                >
                  Chi tiết

                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div
                  className="
                mt-5
                grid
                gap-4
                lg:grid-cols-3
              "
              >
                <Goal
                    title="Giảm mỡ"
                    value="-1.8 kg"
                    target="Mục tiêu: -3.0 kg"
                    progress={60}
                />

                <Goal
                    title="Duy trì cơ"
                    value="Ổn định"
                    target="Không giảm khối lượng cơ"
                    progress={72}
                />

                <Goal
                    title="Tần suất tập"
                    value="12 buổi"
                    target="Mục tiêu: 20 buổi"
                    progress={60}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* =====================================================
       * QUICK ACTIONS
       * ===================================================== */}

        <section className="member-dashboard-animate">
          <Card className="min-w-0 p-5 sm:p-6">
            <div
                className="
              flex
              items-center
              gap-3
            "
            >
              <div
                  className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-emerald-50
                text-emerald-600
              "
              >
                <Activity className="h-5 w-5" />
              </div>

              <div>
                <h2
                    className="
                  text-lg
                  font-black
                  text-slate-900
                "
                >
                  Truy cập nhanh
                </h2>

                <p className="text-xs text-slate-500">
                  Các chức năng bạn
                  thường sử dụng.
                </p>
              </div>
            </div>

            <div
                className="
              mt-5
              grid
              gap-3
              sm:grid-cols-2
              xl:grid-cols-4
            "
            >
              {quickActions.map(
                  (item) => {
                    const Icon =
                        item.icon;

                    return (
                        <Link
                            key={
                              item.name
                            }
                            to={
                              item.route
                            }
                            className="
                      group
                      flex
                      min-w-0
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-4
                      transition
                      hover:-translate-y-0.5
                      hover:border-emerald-200
                      hover:shadow-md
                    "
                        >
                          <div
                              className={`
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${item.iconClass}
                      `}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                                className="
                          truncate
                          text-sm
                          font-bold
                          text-slate-800
                        "
                            >
                              {
                                item.name
                              }
                            </p>

                            <p
                                className="
                          mt-0.5
                          truncate
                          text-[11px]
                          text-slate-400
                        "
                            >
                              {
                                item.description
                              }
                            </p>
                          </div>

                          <ArrowRight
                              className="
                        h-4
                        w-4
                        shrink-0
                        text-slate-300
                        transition
                        group-hover:translate-x-1
                        group-hover:text-emerald-600
                      "
                          />
                        </Link>
                    );
                  },
              )}
            </div>
          </Card>
        </section>
      </div>
  );
}

/* ============================================================
 * COMPONENTS
 * ============================================================ */

function MetricCard({
                      icon,
                      label,
                      value,
                      progress,
                      tone,
                      footer,
                    }: {
  icon: ReactNode;
  label: string;
  value: string;
  progress?: number;
  tone:
      | "green"
      | "blue"
      | "purple";
  footer?: ReactNode;
}) {
  const tones = {
    green:
        "bg-emerald-50 text-emerald-600",

    blue:
        "bg-blue-50 text-blue-600",

    purple:
        "bg-violet-50 text-violet-600",
  };

  const bars = {
    green:
        "bg-emerald-500",

    blue:
        "bg-blue-500",

    purple:
        "bg-violet-500",
  };

  return (
      <Card
          className="
        member-dashboard-animate
        min-w-0
        p-5
      "
      >
        <div
            className="
          flex
          min-w-0
          items-center
          gap-3
        "
        >
          <div
              className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${tones[tone]}
          `}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <p
                className="
              truncate
              text-xs
              font-semibold
              text-slate-400
            "
            >
              {label}
            </p>

            <p
                className="
              mt-1
              truncate
              text-xl
              font-black
              text-slate-900
            "
            >
              {value}
            </p>
          </div>
        </div>

        {progress !== undefined && (
            <div className="mt-4">
              <div
                  className="
              mb-1.5
              flex
              justify-between
              text-[10px]
              font-bold
              text-slate-400
            "
              >
            <span>
              Tiến độ
            </span>

                <span>
              {progress}%
            </span>
              </div>

              <div
                  className="
              h-1.5
              overflow-hidden
              rounded-full
              bg-slate-100
            "
              >
                <div
                    className={`
                h-full
                rounded-full
                ${bars[tone]}
              `}
                    style={{
                      width: `${Math.min(
                          100,
                          Math.max(
                              0,
                              progress,
                          ),
                      )}%`,
                    }}
                />
              </div>
            </div>
        )}

        {footer && (
            <div className="mt-4">
              {footer}
            </div>
        )}
      </Card>
  );
}

function Summary({
                   label,
                   value,
                   active,
                   trend,
                 }: {
  label: string;
  value: string;
  active?: boolean;
  trend?:
      | "up"
      | "down";
}) {
  return (
      <div
          className={`
        min-w-0
        rounded-xl
        border
        p-3
        text-center
        ${
              active
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-100 bg-white"
          }
      `}
      >
        <p
            className="
          text-[9px]
          font-bold
          uppercase
          tracking-wide
          text-slate-400
        "
        >
          {label}
        </p>

        <div
            className="
          mt-1.5
          flex
          items-center
          justify-center
          gap-1
        "
        >
          <p
              className={`
            truncate
            text-sm
            font-black
            ${
                  active
                      ? "text-emerald-600"
                      : "text-slate-800"
              }
          `}
          >
            {value}
          </p>

          {trend && (
              <TrendingUp
                  className={`
              h-3.5
              w-3.5
              ${
                      trend ===
                      "down"
                          ? "rotate-180 text-emerald-600"
                          : "text-rose-500"
                  }
            `}
              />
          )}
        </div>
      </div>
  );
}

function Goal({
                title,
                value,
                target,
                progress,
              }: {
  title: string;
  value: string;
  target: string;
  progress: number;
}) {
  return (
      <div
          className="
        min-w-0
        rounded-2xl
        border
        border-slate-100
        bg-slate-50/50
        p-4
      "
      >
        <div
            className="
          flex
          items-start
          justify-between
          gap-3
        "
        >
          <div className="min-w-0">
            <p
                className="
              truncate
              text-sm
              font-black
              text-slate-800
            "
            >
              {title}
            </p>

            <p
                className="
              mt-1
              text-[11px]
              text-slate-400
            "
            >
              {target}
            </p>
          </div>

          <span
              className="
            shrink-0
            text-sm
            font-black
            text-emerald-600
          "
          >
          {value}
        </span>
        </div>

        <div
            className="
          mt-4
          h-2
          overflow-hidden
          rounded-full
          bg-emerald-100
        "
        >
          <div
              className="
            h-full
            rounded-full
            bg-emerald-500
          "
              style={{
                width: `${Math.min(
                    100,
                    Math.max(
                        0,
                        progress,
                    ),
                )}%`,
              }}
          />
        </div>
      </div>
  );
}