import { Dumbbell } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto flex items-center justify-center gap-2 border-t border-slate-200/60 bg-transparent px-6 py-6 text-sm font-medium text-slate-400">
      <Dumbbell className="h-4 w-4" />
      <span>© {new Date().getFullYear()} <span className="font-bold text-slate-900 uppercase tracking-wide">FitLife</span>. No Pain No Gain.</span>
    </footer>
  );
}
