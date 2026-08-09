import { TrendingUp } from "lucide-react";
import Card from "../../../../components/common/Card";
import type { BodyMetricChartPoint } from "../../../../types/bodyMetric.type";
import { formatNumber } from "./bodyMetricUtils";

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

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const values = data
      .map((item) => item[valueKey])
      .filter((value): value is number => Number.isFinite(value));

  if (values.length === 0) {
    return (
        <Card className="p-6 gsap-animate">
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
          <div className="mt-5 flex h-52 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-sm font-medium text-slate-400">
              Chưa đủ dữ liệu để hiển thị biểu đồ.
            </p>
          </div>
        </Card>
    );
  }

  let minimum = Math.min(...values);
  let maximum = Math.max(...values);

  if (minimum === maximum) {
    minimum -= 1;
    maximum += 1;
  } else {
    const margin = (maximum - minimum) * 0.15;
    minimum -= margin;
    maximum += margin;
  }

  const getX = (index: number): number => {
    if (data.length <= 1) {
      return paddingLeft + plotWidth / 2;
    }
    return paddingLeft + (index / (data.length - 1)) * plotWidth;
  };

  const getY = (value: number): number =>
      paddingTop + (1 - (value - minimum) / (maximum - minimum)) * plotHeight;

  const points = data
      .map((item, index) => `${getX(index)},${getY(item[valueKey])}`)
      .join(" ");

  const horizontalLines = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const y = paddingTop + ratio * plotHeight;
    const value = maximum - ratio * (maximum - minimum);
    return { y, value };
  });

  return (
      <Card className="overflow-hidden p-6 gsap-animate">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">{title}</h2>
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
            {horizontalLines.map((line, index) => (
                <g key={index}>
                  <line
                      x1={paddingLeft}
                      y1={line.y}
                      x2={width - paddingRight}
                      y2={line.y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                  />
                  <text
                      x={paddingLeft - 10}
                      y={line.y + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="#94a3b8"
                  >
                    {formatNumber(line.value, 1)}
                  </text>
                </g>
            ))}

            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-fit-primary"
            />

            {data.map((item, index) => {
              const x = getX(index);
              const y = getY(item[valueKey]);
              const displayLabel =
                  data.length <= 8 ||
                  index === 0 ||
                  index === data.length - 1 ||
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
                        {`${item.label}: ${formatNumber(item[valueKey], 2)} ${unit}`}
                      </title>
                    </circle>

                    {displayLabel && (
                        <text
                            x={x}
                            y={height - 15}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#64748b"
                        >
                          {item.label}
                        </text>
                    )}
                  </g>
              );
            })}
          </svg>
        </div>
      </Card>
  );
}

interface BodyMetricChartsProps {
  chartData: BodyMetricChartPoint[];
}

export function BodyMetricCharts({ chartData }: BodyMetricChartsProps) {
  return (
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
  );
}
