import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export default function Input({ label, icon, error, className = "", id, ...props }: InputProps) {
  const inputId = id || props.name;

  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      <div className={`mt-2 flex min-h-12 items-center rounded-xl border bg-white px-4 transition ${error ? "border-red-400 focus-within:ring-2 focus-within:ring-red-100" : "border-fit-border focus-within:border-fit-primary focus-within:ring-2 focus-within:ring-emerald-100"}`}>
        {icon && <span className="mr-3 text-slate-400">{icon}</span>}
        <input
          id={inputId}
          className={`w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 ${className}`}
          {...props}
        />
      </div>
      {error && <span className="block text-sm text-red-600">{error}</span>}
    </label>
  );
}
