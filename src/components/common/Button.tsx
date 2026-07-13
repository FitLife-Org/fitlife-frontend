import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { Loader2 } from "lucide-react";

type ButtonVariant =
    | "primary"
    | "outline"
    | "danger"
    | "ghost";

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

const variants: Record<
    ButtonVariant,
    string
> = {
  primary:
      "bg-fit-primary text-white hover:bg-fit-primaryHover focus:ring-emerald-500",

  outline:
      "border border-fit-border bg-white text-fit-text hover:bg-slate-50 focus:ring-emerald-500",

  danger:
      "bg-fit-danger text-white hover:bg-red-600 focus:ring-red-500",

  ghost:
      "bg-transparent text-fit-text hover:bg-slate-100 focus:ring-slate-300",
};

export default function Button({
                                 variant = "primary",
                                 isLoading = false,
                                 loadingText = "Đang xử lý...",
                                 children,
                                 className = "",
                                 disabled,
                                 type = "button",
                                 ...props
                               }: ButtonProps) {
  return (
      <button
          type={type}
          className={`
        inline-flex min-h-11 items-center justify-center gap-2
        rounded-xl px-5 py-3 text-sm font-semibold
        transition
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-60
        ${variants[variant]}
        ${className}
      `}
          disabled={disabled || isLoading}
          aria-busy={isLoading}
          {...props}
      >
        {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{loadingText}</span>
            </>
        ) : (
            children
        )}
      </button>
  );
}