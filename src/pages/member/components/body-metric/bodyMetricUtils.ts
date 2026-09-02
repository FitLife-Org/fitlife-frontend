import type { BmiLevel } from "../../../../types/bodyMetric.type";

export function formatNumber(
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

export function formatDateTime(
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

export function getBmiBadgeClasses(
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
