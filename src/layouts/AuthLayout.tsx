import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
}

