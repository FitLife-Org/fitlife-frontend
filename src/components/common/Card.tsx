import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return <section className={`rounded-3xl border border-fit-border bg-white shadow-card ${className}`}>{children}</section>;
}
