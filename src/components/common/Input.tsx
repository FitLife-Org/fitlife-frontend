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
      {label && <span className="text-sm font-medium text-fit-text">{label}</span>}
      <div className="relative mt-2">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fit-muted">{icon}</span>}
        <input
          id={inputId}
          className={`fit-auth-input w-full outline-none placeholder:text-fit-muted ${icon ? 'pl-11 pr-4' : 'px-4'} ${error ? "border-fit-danger focus:border-fit-danger focus:ring-fit-danger/10" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="mt-1 block text-sm text-fit-danger">{error}</span>}
    </label>
  );
}
