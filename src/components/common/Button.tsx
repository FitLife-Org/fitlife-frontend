import type {
    ButtonHTMLAttributes,
    ReactNode,
} from "react";

import {
    Loader2,
} from "lucide-react";

export type ButtonVariant =
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

const variants:
    Record<ButtonVariant, string> = {
    primary: `
    bg-fit-primary
    text-white
    shadow-sm
    hover:bg-fit-primaryHover
    hover:shadow-md
    focus-visible:ring-fit-primary/30
  `,

    outline: `
    border
    border-slate-200
    bg-white
    text-slate-700
    shadow-sm
    hover:border-slate-300
    hover:bg-slate-50
    focus-visible:ring-slate-300/40
  `,

    danger: `
    bg-red-600
    text-white
    shadow-sm
    hover:bg-red-700
    focus-visible:ring-red-500/30
  `,

    ghost: `
    bg-transparent
    text-slate-600
    hover:bg-slate-100
    hover:text-slate-900
    focus-visible:ring-slate-300/40
  `,
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
            disabled={
                disabled ||
                isLoading
            }
            aria-busy={
                isLoading
            }
            className={`
        inline-flex
        min-h-11
        items-center
        justify-center
        gap-2
        rounded-xl
        px-5
        py-2.5
        text-sm
        font-bold
        transition-all
        duration-200

        focus:outline-none
        focus-visible:ring-4

        disabled:cursor-not-allowed
        disabled:opacity-60

        ${variants[variant]}
        ${className}
      `}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    <span>
            {loadingText}
          </span>
                </>
            ) : (
                children
            )}
        </button>
    );
}