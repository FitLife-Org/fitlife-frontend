import { Loader2 } from "lucide-react";

export default function Loading({ label = "Đang tải dữ liệu" }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 text-slate-600">
      <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
