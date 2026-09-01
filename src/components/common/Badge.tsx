import type {
  ReactNode,
} from "react";

export type BadgeVariant =
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "purple"
    | "primary"
    | "default";

interface BadgeProps {
  children: ReactNode;

  variant?: BadgeVariant;

  className?: string;
}

const variants:
    Record<BadgeVariant, string> = {
  success:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

  warning:
      "border-amber-200 bg-amber-50 text-amber-700",

  danger:
      "border-red-200 bg-red-50 text-red-700",

  info:
      "border-blue-200 bg-blue-50 text-blue-700",

  purple:
      "border-violet-200 bg-violet-50 text-violet-700",

  primary:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

  default:
      "border-slate-200 bg-slate-100 text-slate-600",
};

export default function Badge({
                                children,
                                variant = "default",
                                className = "",
                              }: BadgeProps) {
  return (
      <span
          className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-[11px]
        font-bold
        ${variants[variant]}
        ${className}
      `}
      >
      {children}
    </span>
  );
}