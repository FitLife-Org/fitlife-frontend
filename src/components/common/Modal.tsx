import type { ReactNode } from "react";
import { X } from "lucide-react";
import Button from "./Button";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <section className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <Button type="button" variant="ghost" onClick={onClose} aria-label="Đóng" className="min-h-10 px-3 py-2">
            <X className="h-5 w-5" />
          </Button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
