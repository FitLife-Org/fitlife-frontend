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
} from "lucide-react";

import Card from "../../../../components/common/Card";
import type { BodyMetric, BmiLevel } from "../../../../types/bodyMetric.type";
import { formatNumber, formatDateTime, getBmiBadgeClasses } from "./bodyMetricUtils";

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  icon: typeof Scale;
}

function MetricCard({
                      title,
                      value,
                      unit,
                      subtitle,
                      icon: Icon,
                    }: MetricCardProps) {
  return (
      <Card className="p-5 gsap-animate">
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

interface BodyMetricCardsProps {
  latestMetric: BodyMetric | null;
  previousMetric: BodyMetric | null;
  bmiLevel: BmiLevel | null;
  bmiLabel: string;
  openCreateForm: () => void;
}

export function BodyMetricCards({ latestMetric, previousMetric, bmiLevel, bmiLabel, openCreateForm }: BodyMetricCardsProps) {
  if (!latestMetric) {
    return (
        <Card className="p-10 text-center gsap-animate">
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
              onClick={openCreateForm}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-fit-primary px-5 py-3 font-bold text-white hover:bg-fit-primaryHover"
          >
            <Plus className="h-4 w-4" />
            Thêm lần đo đầu tiên
          </button>
        </Card>
    );
  }

  const weightChange = previousMetric
      ? latestMetric.weightKg - previousMetric.weightKg
      : null;

  return (
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
                        weightChange > 0 ? "+" : ""
                    }${formatNumber(weightChange, 1)} kg so với lần trước`
              }
              icon={
                weightChange !== null && weightChange < 0
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

          <Card className="p-5 gsap-animate">
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

        <Card className="p-5 gsap-animate">
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
  );
}
