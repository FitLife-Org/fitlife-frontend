import type { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "purple" | "default";

const variants: Record<BadgeVariant, string> = {
  success: "bg-fit-primarySoft text-fit-primary",
  warning: "bg-fit-trainerSoft text-fit-trainer",
  danger: "bg-fit-dangerSoft text-fit-danger",
  info: "bg-fit-adminSoft text-fit-admin",
  purple: "bg-slate-100 text-slate-700",
  default: "bg-slate-100 text-slate-700",
};

export default function Badge({ children, variant = "default" }: { children: ReactNode; variant?: BadgeVariant }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]}`}>{children}</span>;
}
