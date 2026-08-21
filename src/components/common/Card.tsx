import type {
  HTMLAttributes,
  ReactNode,
} from "react";

interface CardProps
    extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export default function Card({
                               children,
                               className = "",
                               ...props
                             }: CardProps) {
  return (
      <section
          className={`
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        shadow-sm
        ${className}
      `}
          {...props}
      >
        {children}
      </section>
  );
}