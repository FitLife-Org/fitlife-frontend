import { TrendingUp, Activity } from "lucide-react";
import Card from "../../../../components/common/Card";
import type { BodyMetricChartPoint } from "../../../../types/bodyMetric.type";
import { formatNumber } from "./bodyMetricUtils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SimpleLineChartProps {
  data: BodyMetricChartPoint[];
  valueKey: "weightKg" | "bmi";
  title: string;
  unit: string;
  color: string;
  icon: React.ReactNode;
}

function SimpleLineChart({
                           data,
                           valueKey,
                           title,
                           unit,
                           color,
                           icon,
                         }: SimpleLineChartProps) {
  const values = data
      .map((item) => item[valueKey])
      .filter((value): value is number => Number.isFinite(value));

  if (values.length === 0) {
    return (
        <Card className="p-6 gsap-animate">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-2.5 text-white`} style={{ backgroundColor: color }}>
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{title}</h2>
              <p className="text-sm text-slate-500">Chưa đủ dữ liệu hiển thị.</p>
            </div>
          </div>
          <div className="mt-5 flex h-[260px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-sm font-medium text-slate-400">
              Không có dữ liệu
            </p>
          </div>
        </Card>
    );
  }

  let minimum = Math.min(...values);
  let maximum = Math.max(...values);

  if (minimum === maximum) {
    minimum = Math.max(0, minimum - 5);
    maximum += 5;
  } else {
    const margin = (maximum - minimum) * 0.15;
    minimum = Math.max(0, minimum - margin);
    maximum += margin;
  }

  return (
      <Card className="overflow-hidden p-6 shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-md gsap-animate">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 text-white`} style={{ backgroundColor: color }}>
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dữ liệu sắp xếp theo thời gian đo gần nhất
            </p>
          </div>
        </div>

        <div className="mt-6 h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`color-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
              />
              <YAxis
                  domain={[minimum, maximum]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(val) => formatNumber(val, 0)}
                  dx={-10}
              />
              <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                          <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-lg">
                            <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
                            <p className="text-sm font-bold" style={{ color }}>
                              {formatNumber(payload[0].value as number, 2)} {unit}
                            </p>
                          </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <Area
                  type="monotone"
                  dataKey={valueKey}
                  stroke={color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#color-${valueKey})`}
                  activeDot={{ r: 6, strokeWidth: 0, fill: color }}
              />
            </AreaChart>
          </ResponsiveContainer>
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
            title="Biểu đồ Cân nặng"
            unit="kg"
            color="#3b82f6" // blue-500
            icon={<TrendingUp className="h-5 w-5" />}
        />
        <SimpleLineChart
            data={chartData}
            valueKey="bmi"
            title="Biểu đồ BMI"
            unit=""
            color="#10b981" // emerald-500
            icon={<Activity className="h-5 w-5" />}
        />
      </div>
  );
}
