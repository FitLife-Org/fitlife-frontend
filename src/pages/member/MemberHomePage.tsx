import {
  Activity,
  Apple,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Dumbbell,
  HeartPulse,
  QrCode,
  Sparkles,
  Target,
  Utensils,
  WalletCards,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

import {
  ROUTES,
} from "../../config/routes";

import {
  useMemberHome,
} from "../../hooks/useMemberHome";

import {
  usePageAnimation,
} from "../../hooks/usePageAnimation";

export default function MemberHomePage() {
  const containerRef =
      usePageAnimation();

  const {
    user,
    activeSub,
    latestMetric,
    loading,
    calculateDaysLeft,
  } = useMemberHome();

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Đang tải Dashboard...
            </p>
          </div>
        </div>
    );
  }

  // =====================================================
  // DERIVED DATA
  // =====================================================

  const displayName =
      user?.fullName
          ?.trim()
          .split(/\s+/)
          .pop() ||
      "Hội viên";

  const bmiValue =
      latestMetric?.bmi ??
      (
          latestMetric?.heightCm &&
          latestMetric?.weightKg
              ? latestMetric.weightKg /
              Math.pow(
                  latestMetric.heightCm /
                  100,
                  2,
              )
              : null
      );

  const daysLeft =
      activeSub?.endDate
          ? calculateDaysLeft(
              activeSub.endDate,
          )
          : null;

  const subscriptionExpiredSoon =
      daysLeft !== null &&
      daysLeft >= 0 &&
      daysLeft <= 7;

  // =====================================================
  // QUICK ACTIONS
  // =====================================================

  const quickActions = [
    {
      title:
          "Giáo án tập luyện",
      description:
          "Xem các kế hoạch và buổi tập.",
      icon: Dumbbell,
      route:
      ROUTES.MEMBER_WORKOUTS,
      iconClass:
          "bg-violet-50 text-violet-600",
    },
    {
      title:
          "Dinh dưỡng",
      description:
          "Theo dõi kế hoạch ăn uống.",
      icon: Apple,
      route:
      ROUTES.MEMBER_NUTRITION,
      iconClass:
          "bg-emerald-50 text-emerald-600",
    },
    {
      title:
          "Chỉ số cơ thể",
      description:
          "Cập nhật cân nặng và BMI.",
      icon: HeartPulse,
      route:
      ROUTES.MEMBER_BODY_METRICS,
      iconClass:
          "bg-blue-50 text-blue-600",
    },
    {
      title:
          "FitLife AI",
      description:
          "Phân tích và nhận gợi ý AI.",
      icon: Sparkles,
      route:
      ROUTES.MEMBER_AI,
      iconClass:
          "bg-rose-50 text-rose-600",
    },
  ];

  return (
      <div
          ref={containerRef}
          className="space-y-6 pb-6"
      >
        {/* =================================================
          HERO
      ================================================= */}

        <section
            className="
          gsap-animate
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
        >
          <PageHeader
              title={`Chào mừng trở lại, ${displayName}! 👋`}
              description="Theo dõi gói tập, chỉ số cơ thể và kế hoạch luyện tập của bạn hôm nay."
          />

          <Link
              to={
                ROUTES.MEMBER_CHECKINS
              }
              className="
            inline-flex
            min-h-12
            shrink-0
            items-center
            justify-center
            gap-2
            self-start
            rounded-xl
            bg-emerald-600
            px-5
            text-sm
            font-bold
            text-white
            shadow-lg
            shadow-emerald-600/15
            transition
            hover:-translate-y-0.5
            hover:bg-emerald-700
            lg:self-auto
          "
          >
            <QrCode className="h-5 w-5" />

            Check-in phòng tập
          </Link>
        </section>

        {/* =================================================
          OVERVIEW
      ================================================= */}

        <section
            className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
        >
          {/* Subscription */}

          <DashboardMetric
              icon={
                <CreditCard className="h-5 w-5" />
              }
              iconClass="bg-emerald-50 text-emerald-600"
              label="Gói tập hiện tại"
              value={
                activeSub
                    ? activeSub.gymPackageName ||
                    "FitLife"
                    : "Chưa đăng ký"
              }
              description={
                activeSub
                    ? "Đang sử dụng"
                    : "Chưa có gói hoạt động"
              }
          />

          {/* Days Left */}

          <DashboardMetric
              icon={
                <CalendarDays className="h-5 w-5" />
              }
              iconClass={
                subscriptionExpiredSoon
                    ? "bg-amber-50 text-amber-600"
                    : "bg-blue-50 text-blue-600"
              }
              label="Thời hạn gói"
              value={
                daysLeft !== null
                    ? `${Math.max(
                        0,
                        daysLeft,
                    )} ngày`
                    : "—"
              }
              description={
                subscriptionExpiredSoon
                    ? "Gói sắp hết hạn"
                    : activeSub
                        ? "Thời gian còn lại"
                        : "Chưa có gói"
              }
          />

          {/* Weight */}

          <DashboardMetric
              icon={
                <Activity className="h-5 w-5" />
              }
              iconClass="bg-sky-50 text-sky-600"
              label="Cân nặng gần nhất"
              value={
                latestMetric?.weightKg
                    ? `${latestMetric.weightKg} kg`
                    : "—"
              }
              description={
                latestMetric
                    ? "Body Metric mới nhất"
                    : "Chưa có dữ liệu"
              }
          />

          {/* BMI */}

          <DashboardMetric
              icon={
                <HeartPulse className="h-5 w-5" />
              }
              iconClass="bg-violet-50 text-violet-600"
              label="BMI hiện tại"
              value={
                bmiValue !== null
                    ? Number(
                        bmiValue,
                    ).toFixed(1)
                    : "—"
              }
              description={
                getBmiLabel(
                    bmiValue,
                )
              }
          />
        </section>

        {/* =================================================
          ACTIVE SUBSCRIPTION + DAILY ACTIONS
      ================================================= */}

        <section
            className="
          grid
          gap-6
          xl:grid-cols-12
        "
        >
          {/* Subscription */}

          <div className="gsap-animate min-w-0 xl:col-span-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
                <CreditCard className="h-5 w-5 text-emerald-600" />

                Gói tập hiện tại
              </h2>

              <Link
                  to={
                    ROUTES.MEMBER_SUBSCRIPTION
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
                Quản lý

                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {activeSub ? (
                <Card
                    className="
                relative
                h-full
                overflow-hidden
                border-0
                bg-slate-950
                p-0
                text-white
                shadow-xl
              "
                >
                  <div
                      className="
                  absolute
                  -right-20
                  -top-20
                  h-64
                  w-64
                  rounded-full
                  bg-emerald-500/15
                  blur-3xl
                "
                  />

                  <div
                      className="
                  relative
                  z-10
                  grid
                  gap-6
                  p-6
                  sm:p-7
                  md:grid-cols-[1fr_auto]
                  md:items-center
                "
                  >
                    <div className="min-w-0">
                      <Badge variant="success">
                        Đang hoạt động
                      </Badge>

                      <h3 className="mt-4 truncate text-2xl font-black">
                        {activeSub.gymPackageName ||
                            "Gói tập FitLife"}
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                        {activeSub.startDate && (
                            <span>
                        Bắt đầu:{" "}
                              {
                                activeSub.startDate
                              }
                      </span>
                        )}

                        {activeSub.endDate && (
                            <span>
                        Hết hạn:{" "}
                              {
                                activeSub.endDate
                              }
                      </span>
                        )}
                      </div>
                    </div>

                    <div
                        className="
                    min-w-[140px]
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5
                    p-5
                    text-center
                    backdrop-blur
                  "
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Còn lại
                      </p>

                      <p
                          className={`
                      mt-1
                      text-4xl
                      font-black
                      ${
                              subscriptionExpiredSoon
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                          }
                    `}
                      >
                        {Math.max(
                            0,
                            daysLeft ?? 0,
                        )}
                      </p>

                      <p className="text-xs text-slate-400">
                        ngày
                      </p>
                    </div>
                  </div>
                </Card>
            ) : (
                <Card className="flex min-h-[215px] flex-col items-center justify-center border-2 border-dashed border-slate-200 p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <CreditCard className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 font-black text-slate-900">
                    Chưa có gói tập
                  </h3>

                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Đăng ký một gói tập để sử dụng đầy đủ các dịch vụ của FitLife.
                  </p>

                  <Link
                      to={
                        ROUTES.MEMBER_PACKAGES
                      }
                      className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-emerald-600
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  hover:bg-emerald-700
                "
                  >
                    Xem gói tập

                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Card>
            )}
          </div>

          {/* Today */}

          <div className="gsap-animate min-w-0 xl:col-span-5">
            <div className="mb-3">
              <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
                <Target className="h-5 w-5 text-emerald-600" />

                Hôm nay
              </h2>
            </div>

            <Card className="h-full p-5 sm:p-6">
              <div className="space-y-3">
                <DailyAction
                    icon={
                      <Dumbbell className="h-5 w-5" />
                    }
                    iconClass="bg-violet-50 text-violet-600"
                    title="Buổi tập hôm nay"
                    description="Mở kế hoạch tập luyện hiện tại."
                    route={
                      ROUTES.MEMBER_WORKOUTS
                    }
                />

                <DailyAction
                    icon={
                      <Utensils className="h-5 w-5" />
                    }
                    iconClass="bg-emerald-50 text-emerald-600"
                    title="Dinh dưỡng hôm nay"
                    description="Xem kế hoạch ăn uống đang áp dụng."
                    route={
                      ROUTES.MEMBER_NUTRITION_TODAY
                    }
                />

                <DailyAction
                    icon={
                      <QrCode className="h-5 w-5" />
                    }
                    iconClass="bg-blue-50 text-blue-600"
                    title="Check-in"
                    description="Xem lịch sử và check-in phòng tập."
                    route={
                      ROUTES.MEMBER_CHECKINS
                    }
                />
              </div>
            </Card>
          </div>
        </section>

        {/* =================================================
          AI BANNER
      ================================================= */}

        <section className="gsap-animate">
          <Card
              className="
            overflow-hidden
            border
            border-emerald-100
            bg-gradient-to-r
            from-emerald-50
            via-white
            to-teal-50
            p-0
          "
          >
            <div
                className="
              flex
              flex-col
              gap-6
              p-6
              sm:p-7
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
            >
              <div className="flex min-w-0 gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                  <Sparkles className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
                    FitLife AI
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Trợ lý luyện tập và dinh dưỡng
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Sử dụng hồ sơ và chỉ số cơ thể để nhận phân tích, giáo án và gợi ý dinh dưỡng phù hợp.
                  </p>
                </div>
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
                bg-slate-950
                px-5
                text-sm
                font-bold
                text-white
                hover:bg-slate-800
              "
              >
                Mở FitLife AI

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        </section>

        {/* =================================================
          QUICK ACTIONS
      ================================================= */}

        <section className="gsap-animate">
          <div className="mb-3">
            <h2 className="text-lg font-black text-slate-900">
              Truy cập nhanh
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Các chức năng chính dành cho hội viên.
            </p>
          </div>

          <div
              className="
            grid
            gap-4
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
                            item.title
                          }
                          to={
                            item.route
                          }
                          className="
                    group
                    min-w-0
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
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
                      items-center
                      justify-center
                      rounded-xl
                      ${item.iconClass}
                    `}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <h3 className="mt-4 font-black text-slate-900">
                          {
                            item.title
                          }
                        </h3>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {
                            item.description
                          }
                        </p>

                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
                          Truy cập

                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                        </div>
                      </Link>
                  );
                },
            )}
          </div>
        </section>

        {/* =================================================
          ACCOUNT / PAYMENT
      ================================================= */}

        <section
            className="
          gsap-animate
          grid
          gap-4
          md:grid-cols-2
        "
        >
          <Link
              to={
                ROUTES.MEMBER_PAYMENT
              }
          >
            <Card className="group flex h-full items-center gap-4 p-5 transition hover:border-emerald-200 hover:shadow-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <WalletCards className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-900">
                  Thanh toán
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Theo dõi lịch sử và trạng thái thanh toán.
                </p>
              </div>

              <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 group-hover:text-emerald-600" />
            </Card>
          </Link>

          <Link
              to={
                ROUTES.MEMBER_BODY_METRICS
              }
          >
            <Card className="group flex h-full items-center gap-4 p-5 transition hover:border-emerald-200 hover:shadow-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-900">
                  Cập nhật tiến độ
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Ghi nhận chỉ số cơ thể mới để theo dõi thay đổi.
                </p>
              </div>

              <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 group-hover:text-emerald-600" />
            </Card>
          </Link>
        </section>
      </div>
  );
}

// =====================================================
// COMPONENTS
// =====================================================

interface DashboardMetricProps {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  description: string;
}

function DashboardMetric({
                           icon,
                           iconClass,
                           label,
                           value,
                           description,
                         }: DashboardMetricProps) {
  return (
      <Card className="gsap-animate min-w-0 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div
              className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${iconClass}
          `}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-400">
              {label}
            </p>

            <p className="mt-1 truncate text-xl font-black text-slate-900">
              {value}
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium text-slate-500">
          {description}
        </p>
      </Card>
  );
}

interface DailyActionProps {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  description: string;
  route: string;
}

function DailyAction({
                       icon,
                       iconClass,
                       title,
                       description,
                       route,
                     }: DailyActionProps) {
  return (
      <Link
          to={route}
          className="
        group
        flex
        items-center
        gap-4
        rounded-2xl
        border
        border-slate-100
        p-4
        transition
        hover:border-emerald-200
        hover:bg-emerald-50/30
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
          ${iconClass}
        `}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
      </Link>
  );
}

function getBmiLabel(
    bmi: number | null,
): string {
  if (bmi === null) {
    return "Chưa có dữ liệu";
  }

  if (bmi < 18.5) {
    return "Thiếu cân";
  }

  if (bmi < 25) {
    return "Bình thường";
  }

  if (bmi < 30) {
    return "Thừa cân";
  }

  return "Béo phì";
}