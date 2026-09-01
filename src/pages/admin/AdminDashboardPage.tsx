import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckSquare,
  Clock,
  DollarSign,
  Filter,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  useGSAP,
} from "@gsap/react";

import gsap from "gsap";

import {
  toast,
} from "react-hot-toast";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";

import D3BarChart from "../../components/common/charts/D3BarChart";

import {
  adminDashboardService,
} from "../../services/adminDashboardService";

import {
  formatCurrency,
} from "../../utils/formatCurrency";

import type {
  ChartDataDto,
  DashboardFilterRequest,
  DashboardOverviewResponse,
  RecentActivityDto,
} from "../../types/dashboard.type";

// =====================================================
// TYPES
// =====================================================

type ChartTimeRange =
    | "7d"
    | "30d"
    | "all";

// =====================================================
// HELPERS
// =====================================================

function toDateInputValue(
    date: Date,
): string {
  return date
      .toISOString()
      .split("T")[0];
}

function createInitialFilters(): DashboardFilterRequest {
  const endDate =
      new Date();

  const startDate =
      new Date();

  startDate.setMonth(
      startDate.getMonth() - 1,
  );

  return {
    startDate:
        toDateInputValue(
            startDate,
        ),

    endDate:
        toDateInputValue(
            endDate,
        ),

    groupBy:
        "MONTH",
  };
}

function formatCompactCurrency(
    value: number,
): string {
  if (
      value >=
      1_000_000_000
  ) {
    return `${(
        value /
        1_000_000_000
    )
        .toFixed(1)
        .replace(
            /\.0$/,
            "",
        )} Tỷ`;
  }

  if (
      value >=
      1_000_000
  ) {
    return `${(
        value /
        1_000_000
    )
        .toFixed(1)
        .replace(
            /\.0$/,
            "",
        )} Tr`;
  }

  if (value >= 1_000) {
    return `${(
        value / 1_000
    )
        .toFixed(1)
        .replace(
            /\.0$/,
            "",
        )} K`;
  }

  return value.toString();
}

// =====================================================
// PAGE
// =====================================================

export default function AdminDashboardPage() {
  const containerRef =
      useRef<HTMLDivElement>(
          null,
      );

  const chartSectionRef =
      useRef<HTMLDivElement>(
          null,
      );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
      null,
  );

  const [
    chartTimeRange,
    setChartTimeRange,
  ] =
      useState<ChartTimeRange>(
          "30d",
      );

  const [
    filters,
    setFilters,
  ] =
      useState<DashboardFilterRequest>(
          createInitialFilters,
      );

  const [
    overview,
    setOverview,
  ] =
      useState<DashboardOverviewResponse | null>(
          null,
      );

  const [
    revenue,
    setRevenue,
  ] =
      useState<ChartDataDto[]>(
          [],
      );

  const [
    checkinsToday,
    setCheckinsToday,
  ] =
      useState<RecentActivityDto[]>(
          [],
      );

  const [
    expiring,
    setExpiring,
  ] =
      useState<RecentActivityDto[]>(
          [],
      );

  const [
    checkinSearch,
    setCheckinSearch,
  ] = useState("");

  const [
    expiringSearch,
    setExpiringSearch,
  ] = useState("");

  // =====================================================
  // FETCH
  // =====================================================

  const fetchAllData = async (
      silent = false,
  ) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const [
        overviewResponse,
        revenueResponse,
        checkinsResponse,
        expiringResponse,
      ] = await Promise.all([
        adminDashboardService.getOverview(
            filters,
        ),

        adminDashboardService.getRevenueStats(
            filters,
        ),

        adminDashboardService.getCheckinsToday(
            filters,
        ),

        adminDashboardService.getExpiringSubscriptions(
            filters,
        ),
      ]);

      setOverview(
          overviewResponse,
      );

      setRevenue(
          revenueResponse ?? [],
      );

      setCheckinsToday(
          checkinsResponse ?? [],
      );

      setExpiring(
          expiringResponse ?? [],
      );
    } catch (fetchError) {
      console.error(
          "ADMIN_DASHBOARD_ERROR:",
          fetchError,
      );

      setError(
          "Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchAllData();
  }, [filters]);

  // =====================================================
  // ANIMATION
  // =====================================================

  useGSAP(
      () => {
        if (
            loading ||
            !overview
        ) {
          return;
        }

        gsap.fromTo(
            ".gsap-reveal",
            {
              y: 24,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.45,
              stagger: 0.06,
              ease: "power2.out",
              clearProps:
                  "transform,opacity",
            },
        );
      },
      {
        dependencies: [
          loading,
          overview,
        ],
        scope:
        containerRef,
      },
  );

  useGSAP(
      () => {
        if (
            loading ||
            !overview ||
            !chartSectionRef.current
        ) {
          return;
        }

        gsap.fromTo(
            chartSectionRef.current,
            {
              opacity: 0,
              y: 12,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: "power2.out",
              clearProps:
                  "transform,opacity",
            },
        );
      },
      {
        dependencies: [
          overview,
          loading,
        ],
        scope:
        containerRef,
      },
  );

  // =====================================================
  // FILTERS
  // =====================================================

  const applyDateRange = (
      days: number,
  ) => {
    const endDate =
        new Date();

    const startDate =
        new Date();

    startDate.setDate(
        startDate.getDate() -
        days,
    );

    setFilters({
      startDate:
          toDateInputValue(
              startDate,
          ),

      endDate:
          toDateInputValue(
              endDate,
          ),

      groupBy:
          days <= 7
              ? "DAY"
              : "MONTH",
    });
  };

  const handleQuickFilter = (
      days: number,
  ) => {
    setChartTimeRange(
        days <= 7
            ? "7d"
            : "30d",
    );

    applyDateRange(
        days,
    );

    toast.success(
        `Đã cập nhật dữ liệu ${days} ngày gần nhất.`,
    );
  };

  const handleChartRangeChange = (
      range: ChartTimeRange,
  ) => {
    setChartTimeRange(
        range,
    );

    if (
        range === "7d"
    ) {
      applyDateRange(7);
      return;
    }

    if (
        range === "30d"
    ) {
      applyDateRange(30);
      return;
    }

    const endDate =
        new Date();

    const startDate =
        new Date();

    startDate.setFullYear(
        startDate.getFullYear() -
        1,
    );

    setFilters({
      startDate:
          toDateInputValue(
              startDate,
          ),

      endDate:
          toDateInputValue(
              endDate,
          ),

      groupBy:
          "MONTH",
    });
  };

  const handleStartDateChange = (
      value: string,
  ) => {
    setChartTimeRange(
        "all",
    );

    setFilters(
        (previous) => ({
          ...previous,
          startDate:
          value,
        }),
    );
  };

  const handleEndDateChange = (
      value: string,
  ) => {
    setChartTimeRange(
        "all",
    );

    setFilters(
        (previous) => ({
          ...previous,
          endDate:
          value,
        }),
    );
  };

  const handleGroupByChange = (
      value:
      DashboardFilterRequest["groupBy"],
  ) => {
    setFilters(
        (previous) => ({
          ...previous,
          groupBy:
          value,
        }),
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
      <div
          ref={containerRef}
          className="space-y-6 pb-6"
      >
        {/* =================================================
          HEADER
      ================================================= */}

        <section
            className="
          flex
          flex-col
          gap-5
          xl:flex-row
          xl:items-end
          xl:justify-between
        "
        >
          <PageHeader
              title="Dashboard Quản trị"
              description="Theo dõi doanh thu, hội viên, check-in và tình trạng gói tập của hệ thống FitLife."
          />

          {/* Filter toolbar */}

          <div
              className="
            flex
            max-w-full
            flex-wrap
            items-center
            gap-2
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-2
            shadow-sm
          "
          >
            {/* Quick filters */}

            <div
                className="
              flex
              items-center
              rounded-xl
              bg-slate-50
              p-1
            "
            >
              <button
                  type="button"
                  onClick={() =>
                      handleQuickFilter(
                          7,
                      )
                  }
                  className={`
                rounded-lg
                px-3
                py-1.5
                text-xs
                font-bold
                transition
                ${
                      chartTimeRange ===
                      "7d"
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                  }
              `}
              >
                7 ngày
              </button>

              <button
                  type="button"
                  onClick={() =>
                      handleQuickFilter(
                          30,
                      )
                  }
                  className={`
                rounded-lg
                px-3
                py-1.5
                text-xs
                font-bold
                transition
                ${
                      chartTimeRange ===
                      "30d"
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                  }
              `}
              >
                30 ngày
              </button>
            </div>

            <div className="hidden h-6 w-px bg-slate-200 sm:block" />

            {/* Date */}

            <div
                className="
              flex
              items-center
              gap-2
              rounded-xl
              px-2
            "
            >
              <Filter className="h-4 w-4 shrink-0 text-slate-400" />

              <input
                  type="date"
                  value={
                    filters.startDate
                  }
                  max={
                    filters.endDate
                  }
                  onChange={(
                      event,
                  ) =>
                      handleStartDateChange(
                          event.target
                              .value,
                      )
                  }
                  className="
                min-w-0
                bg-transparent
                p-1
                text-xs
                font-semibold
                text-slate-700
                outline-none
              "
              />

              <span className="text-slate-300">
              –
            </span>

              <input
                  type="date"
                  value={
                    filters.endDate
                  }
                  min={
                    filters.startDate
                  }
                  onChange={(
                      event,
                  ) =>
                      handleEndDateChange(
                          event.target
                              .value,
                      )
                  }
                  className="
                min-w-0
                bg-transparent
                p-1
                text-xs
                font-semibold
                text-slate-700
                outline-none
              "
              />
            </div>

            <div className="hidden h-6 w-px bg-slate-200 sm:block" />

            {/* Group */}

            <select
                value={
                  filters.groupBy
                }
                onChange={(
                    event,
                ) =>
                    handleGroupByChange(
                        event.target
                            .value as DashboardFilterRequest["groupBy"],
                    )
                }
                className="
              rounded-xl
              border-0
              bg-slate-50
              px-3
              py-2
              text-xs
              font-bold
              text-slate-700
              outline-none
            "
            >
              <option value="DAY">
                Theo ngày
              </option>

              <option value="MONTH">
                Theo tháng
              </option>

              <option value="YEAR">
                Theo năm
              </option>
            </select>

            {/* Refresh */}

            <button
                type="button"
                aria-label="Làm mới Dashboard"
                onClick={() =>
                    void fetchAllData(
                        true,
                    )
                }
                disabled={
                  refreshing
                }
                className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-emerald-50
              text-emerald-600
              transition
              hover:bg-emerald-600
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            >
              <RefreshCw
                  className={`
                h-4
                w-4
                ${
                      refreshing
                          ? "animate-spin"
                          : ""
                  }
              `}
              />
            </button>
          </div>
        </section>

        {/* =================================================
          LOADING
      ================================================= */}

        {loading && (
            <Loading label="Đang đồng bộ dữ liệu Dashboard..." />
        )}

        {/* =================================================
          ERROR
      ================================================= */}

        {!loading &&
            (error ||
                !overview) && (
                <Card
                    className="
              flex
              min-h-[300px]
              flex-col
              items-center
              justify-center
              p-8
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
                bg-rose-50
                text-rose-500
              "
                  >
                    <AlertCircle className="h-7 w-7" />
                  </div>

                  <h2 className="mt-4 text-lg font-black text-slate-900">
                    Không thể tải Dashboard
                  </h2>

                  <p className="mt-1 max-w-md text-sm text-slate-500">
                    {error ||
                        "Chưa có dữ liệu thống kê."}
                  </p>

                  <Button
                      type="button"
                      onClick={() =>
                          void fetchAllData()
                      }
                      className="mt-5"
                  >
                    Thử lại
                  </Button>
                </Card>
            )}

        {/* =================================================
          CONTENT
      ================================================= */}

        {!loading &&
            !error &&
            overview && (
                <>
                  {/* =============================================
                KPI
            ============================================= */}

                  <section
                      className="
                grid
                gap-4
                xl:grid-cols-12
              "
                  >
                    {/* Revenue hero */}

                    <div className="gsap-reveal min-w-0 xl:col-span-4">
                      <div
                          className="
                    relative
                    flex
                    h-full
                    min-h-[205px]
                    flex-col
                    justify-between
                    overflow-hidden
                    rounded-3xl
                    bg-slate-950
                    p-6
                    text-white
                    shadow-xl
                    sm:p-7
                  "
                      >
                        <div
                            className="
                      pointer-events-none
                      absolute
                      -bottom-16
                      -right-16
                      h-56
                      w-56
                      rounded-full
                      bg-emerald-500/20
                      blur-3xl
                    "
                        />

                        <div className="relative z-10 flex items-start justify-between gap-4">
                          <div
                              className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/10
                      "
                          >
                            <DollarSign className="h-6 w-6" />
                          </div>

                          <GrowthBadge
                              value={
                                overview.revenueGrowthPct
                              }
                          />
                        </div>

                        <div className="relative z-10 mt-8 min-w-0">
                          <p
                              className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-slate-400
                      "
                          >
                            Tổng doanh thu
                          </p>

                          <p
                              className="
                        mt-2
                        truncate
                        text-3xl
                        font-black
                        tracking-tight
                        text-white
                        sm:text-4xl
                      "
                          >
                            {formatCurrency(
                                Number(
                                    overview.monthlyRevenue,
                                ),
                            )}
                          </p>

                          <p className="mt-2 text-xs text-slate-400">
                            Trong khoảng thời gian đang chọn
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Other metrics */}

                    <div
                        className="
                  grid
                  min-w-0
                  gap-4
                  sm:grid-cols-3
                  xl:col-span-8
                "
                    >
                      <AdminMetric
                          icon={
                            <Users className="h-5 w-5" />
                          }
                          label="Tổng hội viên"
                          value={
                            overview.totalMembers.toLocaleString(
                                "vi-VN",
                            )
                          }
                          growth={
                            overview.membersGrowthPct
                          }
                          tone="blue"
                      />

                      <AdminMetric
                          icon={
                            <CheckSquare className="h-5 w-5" />
                          }
                          label="Check-in hôm nay"
                          value={
                            overview.todayCheckins.toLocaleString(
                                "vi-VN",
                            )
                          }
                          growth={
                            overview.checkinsGrowthPct
                          }
                          tone="orange"
                      />

                      <AdminMetric
                          icon={
                            <Clock className="h-5 w-5" />
                          }
                          label="Gói sắp hết hạn"
                          value={
                            overview.expiringPackages.toLocaleString(
                                "vi-VN",
                            )
                          }
                          growth={0}
                          tone="rose"
                      />
                    </div>
                  </section>

                  {/* =============================================
                REVENUE CHART
            ============================================= */}

                  <section
                      ref={
                        chartSectionRef
                      }
                      className="gsap-reveal"
                  >
                    <Card
                        className="
                  min-w-0
                  overflow-hidden
                  p-5
                  sm:p-6
                  lg:p-7
                "
                    >
                      <div
                          className="
                    flex
                    flex-col
                    gap-4
                    border-b
                    border-slate-100
                    pb-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />

                            <h2 className="text-xl font-black text-slate-900">
                              Xu hướng doanh thu
                            </h2>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            Theo dõi doanh thu theo khoảng thời gian đã chọn.
                          </p>
                        </div>

                        <div
                            className="
                      flex
                      shrink-0
                      items-center
                      rounded-xl
                      bg-slate-100
                      p-1
                    "
                        >
                          <RangeButton
                              active={
                                  chartTimeRange ===
                                  "7d"
                              }
                              onClick={() =>
                                  handleChartRangeChange(
                                      "7d",
                                  )
                              }
                          >
                            7 ngày
                          </RangeButton>

                          <RangeButton
                              active={
                                  chartTimeRange ===
                                  "30d"
                              }
                              onClick={() =>
                                  handleChartRangeChange(
                                      "30d",
                                  )
                              }
                          >
                            30 ngày
                          </RangeButton>

                          <RangeButton
                              active={
                                  chartTimeRange ===
                                  "all"
                              }
                              onClick={() =>
                                  handleChartRangeChange(
                                      "all",
                                  )
                              }
                          >
                            1 năm
                          </RangeButton>
                        </div>
                      </div>

                      <div
                          className="
                    mt-6
                    flex
                    min-h-[360px]
                    w-full
                    min-w-0
                    items-center
                    justify-center
                  "
                      >
                        {revenue.length >
                        0 ? (
                            <D3BarChart
                                data={
                                  revenue
                                }
                                height={
                                  340
                                }
                                color="#10b981"
                                yAxisFormatter={
                                  formatCompactCurrency
                                }
                            />
                        ) : (
                            <EmptyChart />
                        )}
                      </div>
                    </Card>
                  </section>

                  {/* =============================================
                OPERATION LISTS
            ============================================= */}

                  <section
                      className="
                grid
                gap-6
                xl:grid-cols-2
              "
                  >
                    <div className="gsap-reveal min-w-0">
                      <ListCard
                          title="Check-in gần đây"
                          description="Theo dõi hoạt động ra vào mới nhất."
                          placeholder="Tìm hội viên..."
                          searchValue={
                            checkinSearch
                          }
                          onSearchChange={
                            setCheckinSearch
                          }
                          items={
                            checkinsToday
                          }
                          type="checkin"
                      />
                    </div>

                    <div className="gsap-reveal min-w-0">
                      <ListCard
                          title="Gói cần gia hạn"
                          description="Các hội viên có gói sắp hết hạn."
                          placeholder="Tìm hội viên hoặc gói..."
                          searchValue={
                            expiringSearch
                          }
                          onSearchChange={
                            setExpiringSearch
                          }
                          items={
                            expiring
                          }
                          type="expiring"
                      />
                    </div>
                  </section>
                </>
            )}
      </div>
  );
}

// =====================================================
// RANGE BUTTON
// =====================================================

interface RangeButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function RangeButton({
                       active,
                       onClick,
                       children,
                     }: RangeButtonProps) {
  return (
      <button
          type="button"
          onClick={
            onClick
          }
          className={`
        rounded-lg
        px-3
        py-1.5
        text-xs
        font-bold
        transition
        ${
              active
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
          }
      `}
      >
        {children}
      </button>
  );
}

// =====================================================
// GROWTH
// =====================================================

function GrowthBadge({
                       value,
                     }: {
  value: number;
}) {
  const isPositive =
      value > 0;

  const isNegative =
      value < 0;

  if (
      !isPositive &&
      !isNegative
  ) {
    return (
        <span
            className="
          rounded-full
          bg-white/10
          px-3
          py-1.5
          text-xs
          font-bold
          text-slate-300
        "
        >
        0%
      </span>
    );
  }

  return (
      <div
          className={`
        flex
        items-center
        gap-1
        rounded-full
        px-3
        py-1.5
        text-xs
        font-bold
        ${
              isPositive
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-rose-500/15 text-rose-400"
          }
      `}
      >
        {isPositive ? (
            <ArrowUpRight className="h-4 w-4" />
        ) : (
            <ArrowDownRight className="h-4 w-4" />
        )}

        {Math.abs(
            value,
        )}
        %
      </div>
  );
}

// =====================================================
// ADMIN METRIC
// =====================================================

interface AdminMetricProps {
  icon: ReactNode;
  label: string;
  value: string;
  growth: number;
  tone:
      | "blue"
      | "orange"
      | "rose";
}

function AdminMetric({
                       icon,
                       label,
                       value,
                       growth,
                       tone,
                     }: AdminMetricProps) {
  const tones = {
    blue:
        "bg-blue-50 text-blue-600",

    orange:
        "bg-orange-50 text-orange-600",

    rose:
        "bg-rose-50 text-rose-600",
  };

  const isPositive =
      growth > 0;

  const isNegative =
      growth < 0;

  return (
      <Card
          className="
        gsap-reveal
        group
        flex
        min-h-[205px]
        min-w-0
        flex-col
        justify-between
        p-5
        transition
        hover:-translate-y-0.5
        hover:shadow-md
        sm:p-6
      "
      >
        <div className="flex items-start justify-between gap-3">
          <div
              className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            ${tones[tone]}
          `}
          >
            {icon}
          </div>

          {(isPositive ||
              isNegative) && (
              <div
                  className={`
              flex
              items-center
              gap-0.5
              rounded-full
              px-2.5
              py-1
              text-xs
              font-black
              ${
                      isPositive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                  }
            `}
              >
                {isPositive ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                )}

                {Math.abs(
                    growth,
                )}
                %
              </div>
          )}
        </div>

        <div className="mt-7 min-w-0">
          <p
              className="
            text-xs
            font-bold
            uppercase
            tracking-[0.08em]
            text-slate-400
          "
          >
            {label}
          </p>

          <p
              className="
            mt-2
            truncate
            text-3xl
            font-black
            tracking-tight
            text-slate-950
          "
          >
            {value}
          </p>
        </div>
      </Card>
  );
}

// =====================================================
// EMPTY CHART
// =====================================================

function EmptyChart() {
  return (
      <div
          className="
        flex
        min-h-[270px]
        w-full
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-slate-200
        bg-slate-50/60
        p-8
        text-center
      "
      >
        <div
            className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-white
          text-slate-400
          shadow-sm
        "
        >
          <TrendingUp className="h-6 w-6" />
        </div>

        <p className="mt-4 font-bold text-slate-700">
          Chưa có dữ liệu doanh thu
        </p>

        <p className="mt-1 max-w-sm text-sm text-slate-400">
          Hãy chọn khoảng thời gian khác hoặc chờ hệ thống ghi nhận thêm giao dịch.
        </p>
      </div>
  );
}

// =====================================================
// LIST
// =====================================================

function getAvatarStyle(
    name: string,
): string {
  const safeName =
      name || "FitLife";

  const code =
      safeName.charCodeAt(
          0,
      ) +
      (safeName.charCodeAt(
          1,
      ) || 0);

  const palettes = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-indigo-100 text-indigo-700",
    "bg-purple-100 text-purple-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
  ];

  return palettes[
  code %
  palettes.length
      ];
}

interface ListCardProps {
  title: string;
  description: string;

  placeholder: string;

  searchValue: string;

  onSearchChange: (
      value: string,
  ) => void;

  items:
      RecentActivityDto[];

  type:
      | "checkin"
      | "expiring";
}

function ListCard({
                    title,
                    description,
                    placeholder,
                    searchValue,
                    onSearchChange,
                    items,
                    type,
                  }: ListCardProps) {
  const normalizedSearch =
      searchValue
          .trim()
          .toLowerCase();

  const filtered =
      items.filter(
          (item) => {
            const itemDescription =
                item.description ??
                "";

            const itemTime =
                item.time ??
                "";

            if (
                !normalizedSearch
            ) {
              return true;
            }

            return (
                itemDescription
                    .toLowerCase()
                    .includes(
                        normalizedSearch,
                    ) ||
                itemTime
                    .toLowerCase()
                    .includes(
                        normalizedSearch,
                    )
            );
          },
      );

  return (
      <Card
          className="
        flex
        h-[430px]
        min-w-0
        flex-col
        overflow-hidden
        p-0
      "
      >
        {/* Header */}

        <div
            className="
          border-b
          border-slate-100
          p-5
          sm:p-6
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
              <h2 className="text-lg font-black text-slate-900">
                {title}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {description}
              </p>
            </div>

            <div
                className="
              relative
              w-full
              sm:w-56
            "
            >
              <Search
                  className="
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-400
              "
              />

              <input
                  type="text"
                  placeholder={
                    placeholder
                  }
                  value={
                    searchValue
                  }
                  onChange={(
                      event,
                  ) =>
                      onSearchChange(
                          event.target
                              .value,
                      )
                  }
                  className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                py-2.5
                pl-9
                pr-3
                text-xs
                font-medium
                text-slate-700
                outline-none
                transition
                focus:border-emerald-300
                focus:bg-white
                focus:ring-2
                focus:ring-emerald-500/10
              "
              />
            </div>
          </div>
        </div>

        {/* Body */}

        <div
            className="
          custom-scrollbar
          flex-1
          overflow-y-auto
          p-3
          sm:p-4
        "
        >
          {filtered.length ===
          0 ? (
              <div
                  className="
              flex
              h-full
              flex-col
              items-center
              justify-center
              text-center
            "
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <Search className="h-5 w-5" />
                </div>

                <p className="mt-3 text-sm font-bold text-slate-600">
                  Không có dữ liệu
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Không tìm thấy kết quả phù hợp.
                </p>
              </div>
          ) : (
              <div className="space-y-1">
                {filtered.map(
                    (item) => {
                      const description =
                          item.description ??
                          "Hoạt động";

                      const initials =
                          description
                              .trim()
                              .substring(
                                  0,
                                  2,
                              )
                              .toUpperCase();

                      return (
                          <div
                              key={
                                item.id
                              }
                              className="
                      group
                      flex
                      min-w-0
                      items-center
                      gap-3
                      rounded-2xl
                      p-3
                      transition
                      hover:bg-slate-50
                    "
                          >
                            <div
                                className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        text-xs
                        font-black
                        ${getAvatarStyle(
                                    description,
                                )}
                      `}
                            >
                              {initials}
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
                                  description
                                }
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-400">
                                {item.time}
                              </p>
                            </div>

                            <div className="shrink-0">
                              {type ===
                              "expiring" ? (
                                  <div
                                      className="
                            flex
                            items-center
                            gap-1
                            opacity-100
                            sm:opacity-0
                            sm:transition
                            sm:group-hover:opacity-100
                          "
                                  >
                                    <button
                                        type="button"
                                        aria-label="Liên hệ điện thoại"
                                        className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              bg-slate-100
                              text-slate-500
                              transition
                              hover:bg-emerald-600
                              hover:text-white
                            "
                                    >
                                      <Phone className="h-3.5 w-3.5" />
                                    </button>

                                    <button
                                        type="button"
                                        aria-label="Nhắn tin"
                                        className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              bg-slate-100
                              text-slate-500
                              transition
                              hover:bg-blue-600
                              hover:text-white
                            "
                                    >
                                      <MessageSquare className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                              ) : (
                                  <Badge
                                      variant={
                                        item.status ===
                                        "NEW"
                                            ? "success"
                                            : item.status ===
                                            "PENDING"
                                                ? "warning"
                                                : "info"
                                      }
                                  >
                                    {item.status ===
                                    "NEW"
                                        ? "Thành công"
                                        : item.status ===
                                        "PENDING"
                                            ? "Chờ xử lý"
                                            : "Hoạt động"}
                                  </Badge>
                              )}
                            </div>
                          </div>
                      );
                    },
                )}
              </div>
          )}
        </div>
      </Card>
  );
}