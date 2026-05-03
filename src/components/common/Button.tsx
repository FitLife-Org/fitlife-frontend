import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const variantClassNames: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-sky-500 text-white hover:bg-sky-400',
  secondary: 'bg-slate-900 text-slate-100 border border-slate-700 hover:bg-slate-800',
  danger: 'bg-red-500 text-white hover:bg-red-400',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${variantClassNames[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

