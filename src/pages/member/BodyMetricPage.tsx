import {
  Activity,
  CalendarDays,
  Dumbbell,
  Gauge,
  HeartPulse,
  Plus,
  Ruler,
  Scale,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

import {
  useBodyMetric,
} from "../../hooks/useBodyMetric";

import type {
  BmiLevel,
  BodyMetricChartPoint,
} from "../../types/bodyMetric.type";

function formatNumber(
    value?: number | null,
    fractionDigits = 1,
): string {
  if (
      value === null ||
      value === undefined ||
      !Number.isFinite(value)
  ) {
    return "--";
  }

  return new Intl.NumberFormat(
      "vi-VN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits:
        fractionDigits,
      },
  ).format(value);
}

function formatDateTime(
    value?: string | null,
): string {
  if (!value) {
    return "--";
  }

  const date =
      new Date(value);

  if (
      Number.isNaN(
          date.getTime(),
      )
  ) {
    return "--";
  }

  return new Intl.DateTimeFormat(
      "vi-VN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
  ).format(date);
}

function getBmiBadgeClasses(
    level: BmiLevel | null,
): string {
  switch (level) {
    case "NORMAL":
      return "bg-emerald-50 text-emerald-700";

    case "UNDERWEIGHT":
      return "bg-blue-50 text-blue-700";

    case "OVERWEIGHT":
      return "bg-amber-50 text-amber-700";

    case "OBESE":
      return "bg-rose-50 text-rose-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  icon:
      typeof Scale;
}

function MetricCard({
                      title,
                      value,
                      unit,
                      subtitle,
                      icon: Icon,
                    }: MetricCardProps) {
  return (
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              {title}
            </p>

            <div className="mt-3 flex items-end gap-1">
              <span className="text-3xl font-black text-slate-900">
                {value}
              </span>

              {unit && (
                  <span className="pb-1 text-sm font-bold text-slate-400">
                  {unit}
                </span>
              )}
            </div>

            {subtitle && (
                <p className="mt-2 text-xs text-slate-500">
                  {subtitle}
                </p>
            )}
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fit-primarySoft text-fit-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
  );
}

interface SimpleLineChartProps {
  data: BodyMetricChartPoint[];
  valueKey: "weightKg" | "bmi";
  title: string;
  unit: string;
}

function SimpleLineChart({
                           data,
                           valueKey,
                           title,
                           unit,
                         }: SimpleLineChartProps) {
  const width = 760;
  const height = 260;

  const paddingLeft = 52;
  const paddingRight = 24;
  const paddingTop = 28;
  const paddingBottom = 44;

  const plotWidth =
      width -
      paddingLeft -
      paddingRight;

  const plotHeight =
      height -
      paddingTop -
      paddingBottom;

  const values =
      data
          .map(
              (item) =>
                  item[valueKey],
          )
          .filter(
              (
                  value,
              ): value is number =>
                  Number.isFinite(value),
          );

  if (values.length === 0) {
    return (
        <Card className="p-6">
          <h2 className="text-lg font-black text-slate-900">
            {title}
          </h2>

          <div className="mt-5 flex h-52 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-sm font-medium text-slate-400">
              Chưa đủ dữ liệu để hiển thị biểu đồ.
            </p>
          </div>
        </Card>
    );
  }

  let minimum =
      Math.min(...values);

  let maximum =
      Math.max(...values);

  if (minimum === maximum) {
    minimum -= 1;
    maximum += 1;
  } else {
    const margin =
        (
            maximum -
            minimum
        ) * 0.15;

    minimum -= margin;
    maximum += margin;
  }

  const getX = (
      index: number,
  ): number => {
    if (data.length <= 1) {
      return (
          paddingLeft +
          plotWidth / 2
      );
    }

    return (
        paddingLeft +
        (
            index /
            (data.length - 1)
        ) *
        plotWidth
    );
  };

  const getY = (
      value: number,
  ): number =>
      paddingTop +
      (
          1 -
          (
              value -
              minimum
          ) /
          (
              maximum -
              minimum
          )
      ) *
      plotHeight;

  const points =
      data
          .map(
              (
                  item,
                  index,
              ) =>
                  `${getX(index)},${getY(
                      item[valueKey],
                  )}`,
          )
          .join(" ");

  const horizontalLines =
      Array.from(
          {
            length: 5,
          },
          (
              _,
              index,
          ) => {
            const ratio =
                index / 4;

            const y =
                paddingTop +
                ratio *
                plotHeight;

            const value =
                maximum -
                ratio *
                (
                    maximum -
                    minimum
                );

            return {
              y,
              value,
            };
          },
      );

  return (
      <Card className="overflow-hidden p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Dữ liệu được sắp xếp theo thời gian đo.
            </p>
          </div>

          <TrendingUp className="h-5 w-5 text-fit-primary" />
        </div>

        <div className="mt-5 w-full overflow-x-auto">
          <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-[260px] min-w-[620px] w-full"
              role="img"
              aria-label={title}
          >
            {horizontalLines.map(
                (
                    line,
                    index,
                ) => (
                    <g key={index}>
                      <line
                          x1={paddingLeft}
                          y1={line.y}
                          x2={
                              width -
                              paddingRight
                          }
                          y2={line.y}
                          stroke="#e2e8f0"
                          strokeDasharray="4 4"
                      />

                      <text
                          x={
                              paddingLeft -
                              10
                          }
                          y={
                              line.y +
                              4
                          }
                          textAnchor="end"
                          fontSize="11"
                          fill="#94a3b8"
                      >
                        {formatNumber(
                            line.value,
                            1,
                        )}
                      </text>
                    </g>
                ),
            )}

            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-fit-primary"
            />

            {data.map(
                (
                    item,
                    index,
                ) => {
                  const x =
                      getX(index);

                  const y =
                      getY(
                          item[valueKey],
                      );

                  const displayLabel =
                      data.length <= 8 ||
                      index === 0 ||
                      index ===
                      data.length - 1 ||
                      index % 2 === 0;

                  return (
                      <g key={item.id}>
                        <circle
                            cx={x}
                            cy={y}
                            r="5"
                            fill="white"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-fit-primary"
                        >
                          <title>
                            {`${item.label}: ${formatNumber(
                                item[
                                    valueKey
                                    ],
                                2,
                            )} ${unit}`}
                          </title>
                        </circle>

                        {displayLabel && (
                            <text
                                x={x}
                                y={
                                    height -
                                    15
                                }
                                textAnchor="middle"
                                fontSize="11"
                                fill="#64748b"
                            >
                              {item.label}
                            </text>
                        )}
                      </g>
                  );
                },
            )}
          </svg>
        </div>
      </Card>
  );
}

export default function BodyMetricPage() {
  const {
    metrics,
    latestMetric,
    chartData,

    formData,
    formOpen,

    loading,
    saving,

    currentPage,
    totalPages,

    bmiLevel,
    bmiLabel,

    setField,

    openCreateForm,
    closeCreateForm,
    createMetric,

    changePage,
  } = useBodyMetric();

  const previousMetric =
      metrics.length > 1
          ? metrics[1]
          : null;

  const weightChange =
      latestMetric &&
      previousMetric
          ? latestMetric.weightKg -
          previousMetric.weightKg
          : null;

  if (loading && metrics.length === 0) {
    return (
        <div className="flex h-72 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />

            <p className="text-sm font-semibold text-slate-500">
              Đang tải chỉ số cơ thể...
            </p>
          </div>
        </div>
    );
  }

  return (
      <>
        <div className="mx-auto max-w-7xl space-y-6 pb-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <PageHeader
                title="Chỉ số cơ thể"
                description="Theo dõi cân nặng, BMI và sự thay đổi cơ thể theo thời gian."
            />

            <button
                type="button"
                onClick={
                  openCreateForm
                }
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-fit-primary px-5 py-3 font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-fit-primaryHover active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Ghi nhận chỉ số
            </button>
          </div>

          {!latestMetric ? (
              <Card className="p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fit-primarySoft text-fit-primary">
                  <HeartPulse className="h-8 w-8" />
                </div>

                <h2 className="mt-5 text-xl font-black text-slate-900">
                  Chưa có chỉ số cơ thể
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Hãy nhập lần đo đầu tiên để FitLife theo dõi tiến trình và cung cấp dữ liệu cho AI cá nhân hóa kế hoạch.
                </p>

                <button
                    type="button"
                    onClick={
                      openCreateForm
                    }
                    className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-fit-primary px-5 py-3 font-bold text-white hover:bg-fit-primaryHover"
                >
                  <Plus className="h-4 w-4" />
                  Thêm lần đo đầu tiên
                </button>
              </Card>
          ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <MetricCard
                      title="Cân nặng"
                      value={formatNumber(
                          latestMetric.weightKg,
                      )}
                      unit="kg"
                      subtitle={
                        weightChange === null
                            ? "Chưa có dữ liệu so sánh"
                            : `${
                                weightChange >
                                0
                                    ? "+"
                                    : ""
                            }${formatNumber(
                                weightChange,
                                1,
                            )} kg so với lần trước`
                      }
                      icon={
                        weightChange !==
                        null &&
                        weightChange < 0
                            ? TrendingDown
                            : Scale
                      }
                  />

                  <MetricCard
                      title="Chiều cao"
                      value={formatNumber(
                          latestMetric.heightCm,
                      )}
                      unit="cm"
                      icon={Ruler}
                  />

                  <Card className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">
                          BMI
                        </p>

                        <p className="mt-3 text-3xl font-black text-slate-900">
                          {formatNumber(
                              latestMetric.bmi,
                              2,
                          )}
                        </p>

                        <span
                            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${getBmiBadgeClasses(
                                bmiLevel,
                            )}`}
                        >
                        {bmiLabel}
                      </span>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fit-primarySoft text-fit-primary">
                        <Gauge className="h-5 w-5" />
                      </div>
                    </div>
                  </Card>

                  <MetricCard
                      title="Tỷ lệ mỡ"
                      value={formatNumber(
                          latestMetric.bodyFatPercent,
                      )}
                      unit="%"
                      icon={Activity}
                  />

                  <MetricCard
                      title="Khối lượng cơ"
                      value={formatNumber(
                          latestMetric.muscleMassKg,
                      )}
                      unit="kg"
                      icon={Dumbbell}
                  />
                </div>

                <Card className="p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <CalendarDays className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Lần đo mới nhất
                        </p>

                        <p className="text-xs text-slate-500">
                          {formatDateTime(
                              latestMetric.recordedAt,
                          )}
                        </p>
                      </div>
                    </div>

                    {latestMetric.note && (
                        <p className="max-w-xl text-sm text-slate-600">
                          {latestMetric.note}
                        </p>
                    )}
                  </div>
                </Card>
              </>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <SimpleLineChart
                data={chartData}
                valueKey="weightKg"
                title="Biểu đồ cân nặng"
                unit="kg"
            />

            <SimpleLineChart
                data={chartData}
                valueKey="bmi"
                title="Biểu đồ BMI"
                unit=""
            />
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-black text-slate-900">
                Lịch sử chỉ số
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Các lần đo mới nhất được hiển thị trước.
              </p>
            </div>

            {metrics.length === 0 ? (
                <div className="py-14 text-center">
                  <HeartPulse className="mx-auto h-10 w-10 text-slate-300" />

                  <p className="mt-3 font-bold text-slate-600">
                    Chưa có lịch sử đo
                  </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left font-bold text-slate-600">
                        Thời gian
                      </th>

                      <th className="px-5 py-3 text-left font-bold text-slate-600">
                        Cân nặng
                      </th>

                      <th className="px-5 py-3 text-left font-bold text-slate-600">
                        Chiều cao
                      </th>

                      <th className="px-5 py-3 text-left font-bold text-slate-600">
                        BMI
                      </th>

                      <th className="px-5 py-3 text-left font-bold text-slate-600">
                        Mỡ
                      </th>

                      <th className="px-5 py-3 text-left font-bold text-slate-600">
                        Cơ
                      </th>

                      <th className="px-5 py-3 text-left font-bold text-slate-600">
                        Ghi chú
                      </th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 bg-white">
                    {metrics.map(
                        (metric) => (
                            <tr
                                key={metric.id}
                                className="transition hover:bg-slate-50"
                            >
                              <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700">
                                {formatDateTime(
                                    metric.recordedAt,
                                )}
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 font-black text-slate-900">
                                {formatNumber(
                                    metric.weightKg,
                                )}{" "}
                                kg
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                {formatNumber(
                                    metric.heightCm,
                                )}{" "}
                                cm
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 font-bold text-fit-primary">
                                {formatNumber(
                                    metric.bmi,
                                    2,
                                )}
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                {formatNumber(
                                    metric.bodyFatPercent,
                                )}{" "}
                                %
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                {formatNumber(
                                    metric.muscleMassKg,
                                )}{" "}
                                kg
                              </td>

                              <td className="max-w-xs truncate px-5 py-4 text-slate-500">
                                {metric.note ||
                                    "--"}
                              </td>
                            </tr>
                        ),
                    )}
                    </tbody>
                  </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                  <p className="text-sm font-medium text-slate-500">
                    Trang {currentPage + 1} /{" "}
                    {totalPages}
                  </p>

                  <div className="flex gap-2">
                    <button
                        type="button"
                        disabled={
                            currentPage <= 0 ||
                            loading
                        }
                        onClick={() =>
                            void changePage(
                                currentPage -
                                1,
                            )
                        }
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Trước
                    </button>

                    <button
                        type="button"
                        disabled={
                            currentPage + 1 >=
                            totalPages ||
                            loading
                        }
                        onClick={() =>
                            void changePage(
                                currentPage +
                                1,
                            )
                        }
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Sau
                    </button>
                  </div>
                </div>
            )}
          </Card>
        </div>

        {formOpen && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                role="presentation"
                onMouseDown={(event) => {
                  if (
                      event.target ===
                      event.currentTarget
                  ) {
                    closeCreateForm();
                  }
                }}
            >
              <section
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="body-metric-form-title"
                  className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
              >
                <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                  <div>
                    <h2
                        id="body-metric-form-title"
                        className="text-xl font-black text-slate-900"
                    >
                      Ghi nhận chỉ số cơ thể
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      BMI sẽ được backend tự động tính.
                    </p>
                  </div>

                  <button
                      type="button"
                      onClick={
                        closeCreateForm
                      }
                      disabled={saving}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40"
                      aria-label="Đóng"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </header>

                <div className="space-y-5 p-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Cân nặng (kg) *
                    </span>

                      <input
                          type="number"
                          min="20"
                          max="300"
                          step="0.1"
                          value={
                            formData.weightKg
                          }
                          onChange={(event) =>
                              setField(
                                  "weightKg",
                                  event.target
                                      .value,
                              )
                          }
                          className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10"
                          placeholder="Ví dụ: 61.5"
                      />
                    </label>

                    <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Chiều cao (cm)
                    </span>

                      <input
                          type="number"
                          min="50"
                          max="250"
                          step="0.1"
                          value={
                            formData.heightCm
                          }
                          onChange={(event) =>
                              setField(
                                  "heightCm",
                                  event.target
                                      .value,
                              )
                          }
                          className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10"
                          placeholder="Ví dụ: 165"
                      />

                      <span className="mt-1 block text-xs text-slate-400">
                      Có thể dùng chiều cao từ lần đo gần nhất.
                    </span>
                    </label>

                    <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Tỷ lệ mỡ (%)
                    </span>

                      <input
                          type="number"
                          min="0"
                          max="80"
                          step="0.1"
                          value={
                            formData
                                .bodyFatPercent
                          }
                          onChange={(event) =>
                              setField(
                                  "bodyFatPercent",
                                  event.target
                                      .value,
                              )
                          }
                          className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10"
                          placeholder="Ví dụ: 18.5"
                      />
                    </label>

                    <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Khối lượng cơ (kg)
                    </span>

                      <input
                          type="number"
                          min="0"
                          max="200"
                          step="0.1"
                          value={
                            formData
                                .muscleMassKg
                          }
                          onChange={(event) =>
                              setField(
                                  "muscleMassKg",
                                  event.target
                                      .value,
                              )
                          }
                          className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10"
                          placeholder="Ví dụ: 47.2"
                      />
                    </label>
                  </div>

                  <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Thời gian đo
                  </span>

                    <input
                        type="datetime-local"
                        value={
                          formData.recordedAt
                        }
                        max={
                          new Date()
                              .toISOString()
                              .slice(0, 16)
                        }
                        onChange={(event) =>
                            setField(
                                "recordedAt",
                                event.target
                                    .value,
                            )
                        }
                        className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10"
                    />

                    <span className="mt-1 block text-xs text-slate-400">
                    Để trống để sử dụng thời gian hiện tại.
                  </span>
                  </label>

                  <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Ghi chú
                  </span>

                    <textarea
                        rows={4}
                        maxLength={1000}
                        value={
                          formData.note
                        }
                        onChange={(event) =>
                            setField(
                                "note",
                                event.target
                                    .value,
                            )
                        }
                        className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10"
                        placeholder="Tình trạng cơ thể hoặc ghi chú cho lần đo..."
                    />

                    <span className="mt-1 block text-right text-xs text-slate-400">
                    {formData.note.length}/1000
                  </span>
                  </label>

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={
                          closeCreateForm
                        }
                        disabled={saving}
                        className="min-h-12 rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Hủy
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            void createMetric()
                        }
                        disabled={saving}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-fit-primary px-5 py-3 font-black text-white transition hover:bg-fit-primaryHover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving && (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      )}

                      {saving
                          ? "Đang lưu..."
                          : "Lưu chỉ số"}
                    </button>
                  </div>
                </div>
              </section>
            </div>
        )}
      </>
  );
}