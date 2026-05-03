import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: ReactNode;
}

export default function Input({ label, helperText, className = '', ...props }: InputProps) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span> : null}
      <input
        className={`w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 ${className}`}
        {...props}
      />
      {helperText ? <span className="mt-2 block text-xs text-slate-400">{helperText}</span> : null}
    </label>
  );
}

