import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Target,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";

import {
  ROUTES,
} from "../../config/routes";

import {
  usePageAnimation,
} from "../../hooks/usePageAnimation";

import {
  subscriptionService,
} from "../../services/subscriptionService";

import {
  workoutService,
} from "../../services/workoutService";

import type {
  WorkoutPlan,
  WorkoutPlanDay,
} from "../../types/workout.type";

import {
  getApiErrorMessage,
} from "../../utils/apiError";

function buildWorkoutDetailRoute(
    planId: number,
): string {
  return ROUTES
      .MEMBER_WORKOUT_DETAIL
      .replace(
          ":id",
          String(planId),
      );
}

function normalizeDayOfWeek(
    value?: string | null,
): number | null {
  if (!value) {
    return null;
  }

  const normalized =
      value
          .trim()
          .toUpperCase();

  const mapping:
      Record<string, number> = {
    MONDAY: 1,
    MON: 1,
    "THỨ 2": 1,
    "THU 2": 1,
    "2": 1,

    TUESDAY: 2,
    TUE: 2,
    "THỨ 3": 2,
    "THU 3": 2,
    "3": 2,

    WEDNESDAY: 3,
    WED: 3,
    "THỨ 4": 3,
    "THU 4": 3,
    "4": 3,

    THURSDAY: 4,
    THU: 4,
    "THỨ 5": 4,
    "THU 5": 4,
    "5": 4,

    FRIDAY: 5,
    FRI: 5,
    "THỨ 6": 5,
    "THU 6": 5,
    "6": 5,

    SATURDAY: 6,
    SAT: 6,
    "THỨ 7": 6,
    "THU 7": 6,
    "7": 6,

    SUNDAY: 7,
    SUN: 7,
    "CHỦ NHẬT": 7,
    "CHU NHAT": 7,
    CN: 7,
  };

  return (
      mapping[normalized] ??
      null
  );
}

function getCalendarDayNumber(
    date: Date,
): number {
  const jsDay =
      date.getDay();

  return jsDay === 0
      ? 7
      : jsDay;
}

function getVietnameseDayLabel(
    date: Date,
): string {
  const day =
      getCalendarDayNumber(
          date,
      );

  return day === 7
      ? "Chủ nhật"
      : `Thứ ${day + 1}`;
}

function findWorkoutDay(
    days: WorkoutPlanDay[],
    date: Date,
): WorkoutPlanDay | null {
  const calendarDay =
      getCalendarDayNumber(
          date,
      );

  /*
   * Ưu tiên dayOfWeek nếu Backend có.
   */
  const byDayOfWeek =
      days.find(
          (day) =>
              normalizeDayOfWeek(
                  day.dayOfWeek,
              ) ===
              calendarDay,
      );

  if (byDayOfWeek) {
    return byDayOfWeek;
  }

  /*
   * Fallback cho dữ liệu cũ chỉ có dayNo.
   */
  return (
      days.find(
          (day) =>
              day.dayNo ===
              calendarDay,
      ) ??
      null
  );
}

export default function MemberSchedulePage() {
  const containerRef =
      usePageAnimation();

  const navigate =
      useNavigate();

  const [
    loading,
    setLoading,
  ] =
      useState(true);

  const [
    plans,
    setPlans,
  ] =
      useState<
          WorkoutPlan[]
      >([]);

  const [
    activePlan,
    setActivePlan,
  ] =
      useState<
          WorkoutPlan | null
      >(null);

  const [
    currentDate,
    setCurrentDate,
  ] =
      useState(
          new Date(),
      );

  const [
    hasSubscription,
    setHasSubscription,
  ] =
      useState(true);

  const fetchPlans =
      async (): Promise<void> => {
        try {
          setLoading(
              true,
          );

          const [
            subscription,
            workoutPlans,
          ] =
              await Promise.all([
                subscriptionService
                    .getMySubscription(),

                workoutService
                    .getMyWorkoutPlans(),
              ]);

          setHasSubscription(
              Boolean(
                  subscription,
              ),
          );

          setPlans(
              workoutPlans,
          );

          /*
           * Không lấy data[0] làm active
           * một cách mù quáng nếu có nhiều plan.
           */
          const active =
              workoutPlans.find(
                  (plan) =>
                      plan.status ===
                      "ACTIVE",
              ) ??
              null;

          setActivePlan(
              active,
          );
        } catch (error) {
          setPlans(
              [],
          );

          setActivePlan(
              null,
          );

          toast.error(
              getApiErrorMessage(
                  error,
                  "Không thể tải lịch tập.",
              ),
          );
        } finally {
          setLoading(
              false,
          );
        }
      };

  useEffect(() => {
    void fetchPlans();
  }, []);

  const weekDays =
      useMemo(() => {
        const start =
            new Date(
                currentDate,
            );

        const currentDay =
            start.getDay();

        const difference =
            currentDay === 0
                ? -6
                : 1 -
                currentDay;

        start.setDate(
            start.getDate() +
            difference,
        );

        start.setHours(
            0,
            0,
            0,
            0,
        );

        return Array.from(
            {
              length: 7,
            },
            (
                _,
                index,
            ) => {
              const date =
                  new Date(
                      start,
                  );

              date.setDate(
                  start.getDate() +
                  index,
              );

              return date;
            },
        );
      }, [
        currentDate,
      ]);

  const goToPreviousWeek =
      (): void => {
        const nextDate =
            new Date(
                currentDate,
            );

        nextDate.setDate(
            nextDate.getDate() -
            7,
        );

        setCurrentDate(
            nextDate,
        );
      };

  const goToNextWeek =
      (): void => {
        const nextDate =
            new Date(
                currentDate,
            );

        nextDate.setDate(
            nextDate.getDate() +
            7,
        );

        setCurrentDate(
            nextDate,
        );
      };

  const goToToday =
      (): void => {
        setCurrentDate(
            new Date(),
        );
      };

  if (loading) {
    return (
        <Loading label="Đang tải lịch tập..." />
    );
  }

  return (
      <div
          ref={
            containerRef
          }
          className="space-y-6 pb-10"
      >
        <PageHeader
            eyebrow="Workout Schedule"
            title="Lịch tập của tôi"
            description="Theo dõi lịch tập của giáo án đang hoạt động theo từng ngày trong tuần."
            action={
              <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    aria-label="Tuần trước"
                    onClick={
                      goToPreviousWeek
                    }
                    className="h-11 w-11 p-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <Button
                    variant="outline"
                    onClick={
                      goToToday
                    }
                >
                  Hôm nay
                </Button>

                <Button
                    variant="outline"
                    aria-label="Tuần sau"
                    onClick={
                      goToNextWeek
                    }
                    className="h-11 w-11 p-0"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            }
        />

        {!hasSubscription ? (
            <EmptyState
                title="Chưa có gói tập"
                description="Bạn cần đăng ký gói tập để sử dụng đầy đủ các dịch vụ dành cho hội viên."
                buttonLabel="Xem gói tập"
                onClick={() =>
                    navigate(
                        ROUTES.MEMBER_PACKAGES,
                    )
                }
            />
        ) : !activePlan ? (
            <EmptyState
                title="Chưa có giáo án đang hoạt động"
                description="Hãy tạo kế hoạch bằng FitLife AI hoặc chọn một giáo án hiện có để bắt đầu."
                buttonLabel="Tạo giáo án bằng AI"
                onClick={() =>
                    navigate(
                        ROUTES.MEMBER_AI,
                    )
                }
            />
        ) : (
            <>
              {/* ACTIVE PLAN */}

              <section
                  className="
                            overflow-hidden
                            rounded-2xl
                            border
                            border-emerald-200
                            bg-gradient-to-r
                            from-emerald-50
                            to-white
                            p-5
                        "
              >
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
                  <div>
                    <Badge variant="success">
                      Giáo án đang hoạt động
                    </Badge>

                    <h2 className="mt-2 text-lg font-black text-slate-900">
                      {
                        activePlan.name
                      }
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {activePlan.goal ||
                          "Kế hoạch tập luyện cá nhân hóa"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() =>
                            navigate(
                                ROUTES.MEMBER_WORKOUTS,
                            )
                        }
                    >
                      Đổi giáo án
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() =>
                            navigate(
                                buildWorkoutDetailRoute(
                                    activePlan.id,
                                ),
                            )
                        }
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </section>

              {/* WEEK */}

              <section
                  className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                            lg:grid-cols-4
                            xl:grid-cols-7
                        "
              >
                {weekDays.map(
                    (
                        date,
                        index,
                    ) => {
                      const today =
                          new Date();

                      const isToday =
                          today.toDateString() ===
                          date.toDateString();

                      const workoutDay =
                          findWorkoutDay(
                              activePlan.days ??
                              [],
                              date,
                          );

                      return (
                          <article
                              key={
                                date.toISOString()
                              }
                              className={`
                                            relative
                                            flex
                                            min-h-[250px]
                                            flex-col
                                            rounded-2xl
                                            border
                                            p-4
                                            transition-all

                                            ${
                                  isToday
                                      ? "border-emerald-400 bg-emerald-50/50 shadow-md ring-1 ring-emerald-300"
                                      : "border-slate-200 bg-white shadow-sm hover:shadow-md"
                              }
                                        `}
                          >
                            {isToday && (
                                <span
                                    className="
                                                    absolute
                                                    -top-3
                                                    left-1/2
                                                    -translate-x-1/2
                                                    whitespace-nowrap
                                                    rounded-full
                                                    bg-emerald-500
                                                    px-3
                                                    py-1
                                                    text-[10px]
                                                    font-black
                                                    uppercase
                                                    tracking-wider
                                                    text-white
                                                    shadow-sm
                                                "
                                >
                                                Hôm nay
                                            </span>
                            )}

                            <header
                                className="
                                                border-b
                                                border-slate-100
                                                pb-3
                                                text-center
                                            "
                            >
                              <p
                                  className={`
                                                    text-xs
                                                    font-bold
                                                    uppercase
                                                    tracking-wide

                                                    ${
                                      isToday
                                          ? "text-emerald-600"
                                          : "text-slate-400"
                                  }
                                                `}
                              >
                                {getVietnameseDayLabel(
                                    date,
                                )}
                              </p>

                              <p
                                  className={`
                                                    mt-1
                                                    text-2xl
                                                    font-black

                                                    ${
                                      isToday
                                          ? "text-emerald-900"
                                          : "text-slate-900"
                                  }
                                                `}
                              >
                                {date.getDate()}
                              </p>
                            </header>

                            <div className="flex flex-1 flex-col pt-4">
                              {!workoutDay ||
                              workoutDay.isRestDay ? (
                                  <div
                                      className="
                                                        flex
                                                        flex-1
                                                        flex-col
                                                        items-center
                                                        justify-center
                                                        text-center
                                                    "
                                  >
                                    <CalendarIcon className="h-7 w-7 text-slate-300" />

                                    <p className="mt-2 text-sm font-bold text-slate-400">
                                      Ngày nghỉ
                                    </p>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                      Phục hồi và chuẩn bị cho buổi tiếp theo
                                    </p>
                                  </div>
                              ) : (
                                  <>
                                    <div className="flex-1">
                                      <h3
                                          className="
                                                                line-clamp-2
                                                                font-black
                                                                text-slate-800
                                                            "
                                      >
                                        {workoutDay.name ||
                                            `Ngày tập ${workoutDay.dayNo ?? index + 1}`}
                                      </h3>

                                      {workoutDay.focusArea && (
                                          <div
                                              className="
                                                                    mt-2
                                                                    inline-flex
                                                                    max-w-full
                                                                    items-center
                                                                    gap-1.5
                                                                    rounded-full
                                                                    bg-slate-100
                                                                    px-2.5
                                                                    py-1
                                                                    text-[11px]
                                                                    font-semibold
                                                                    text-slate-600
                                                                "
                                          >
                                            <Target className="h-3 w-3 shrink-0" />

                                            <span className="truncate">
                                                                    {
                                                                      workoutDay.focusArea
                                                                    }
                                                                </span>
                                          </div>
                                      )}

                                      <p className="mt-3 text-xs font-medium text-slate-400">
                                        {workoutDay.exercises?.length ??
                                            0}{" "}
                                        bài tập
                                      </p>

                                      {workoutDay.estimatedMinutes !=
                                          null && (
                                              <p className="mt-1 text-xs text-slate-400">
                                                Khoảng{" "}
                                                {
                                                  workoutDay.estimatedMinutes
                                                }{" "}
                                                phút
                                              </p>
                                          )}
                                    </div>

                                    <Button
                                        variant={
                                          isToday
                                              ? "primary"
                                              : "outline"
                                        }
                                        className="mt-4 w-full"
                                        onClick={() =>
                                            navigate(
                                                buildWorkoutDetailRoute(
                                                    activePlan.id,
                                                ),
                                            )
                                        }
                                    >
                                      <Dumbbell className="h-4 w-4" />

                                      Xem bài tập
                                    </Button>
                                  </>
                              )}
                            </div>
                          </article>
                      );
                    },
                )}
              </section>

              <p className="text-xs leading-5 text-slate-400">
                * Tiến độ hoàn thành từng buổi sẽ được bổ sung khi module Workout Log được kích hoạt. Hiện tại lịch này hiển thị cấu trúc giáo án đang áp dụng.
              </p>
            </>
        )}
      </div>
  );
}

function EmptyState({
                      title,
                      description,
                      buttonLabel,
                      onClick,
                    }: {
  title: string;

  description: string;

  buttonLabel: string;

  onClick: () => void;
}) {
  return (
      <section
          className="
                rounded-3xl
                border
                border-dashed
                border-slate-300
                bg-white
                p-10
                text-center
                shadow-sm
                sm:p-14
            "
      >
        <div
            className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-slate-100
                "
        >
          <CalendarIcon className="h-8 w-8 text-slate-400" />
        </div>

        <h3 className="mt-5 text-xl font-black text-slate-900">
          {title}
        </h3>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
          {description}
        </p>

        <Button
            variant="primary"
            className="mt-6"
            onClick={
              onClick
            }
        >
          {buttonLabel}
        </Button>
      </section>
  );
}