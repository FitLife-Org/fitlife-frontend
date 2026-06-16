import type { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "purple" | "default";

const variants: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-orange-50 text-orange-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
  purple: "bg-purple-50 text-purple-700",
  default: "bg-slate-100 text-slate-700",
};

export default function Badge({ children, variant = "default" }: { children: ReactNode; variant?: BadgeVariant }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]}`}>{children}</span>;
}
