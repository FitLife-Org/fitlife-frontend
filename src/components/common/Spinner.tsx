import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  label?: string;
}

export default function Spinner({ label = 'Đang tải...' }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-3 text-slate-300">
      <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
      <span>{label}</span>
    </div>
  );
}

