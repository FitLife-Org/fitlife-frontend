import {
  useEffect,
  type MouseEvent,
  type ReactNode,
} from "react";

import { X } from "lucide-react";

import Button from "./Button";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;

  /**
   * Khi true:
   * - Không đóng bằng nút X.
   * - Không đóng bằng Escape.
   * - Không đóng khi click nền.
   */
  disableClose?: boolean;

  /**
   * Có cho phép click nền để đóng modal hay không.
   */
  closeOnBackdrop?: boolean;
}

export default function Modal({
                                title,
                                open,
                                onClose,
                                children,
                                disableClose = false,
                                closeOnBackdrop = true,
                                className = "",
                              }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
        event: KeyboardEvent,
    ) => {
      if (
          event.key === "Escape" &&
          !disableClose
      ) {
        onClose();
      }
    };

    document.addEventListener(
        "keydown",
        handleKeyDown,
    );

    /*
     * Chặn scroll trang phía sau khi modal mở.
     */
    const previousOverflow =
        document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
          "keydown",
          handleKeyDown,
      );

      document.body.style.overflow =
          previousOverflow;
    };
  }, [open, disableClose, onClose]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (
      event: MouseEvent<HTMLDivElement>,
  ) => {
    if (
        disableClose ||
        !closeOnBackdrop
    ) {
      return;
    }

    /*
     * Chỉ đóng khi click đúng backdrop,
     * không đóng khi click phần nội dung modal.
     */
    if (
        event.target === event.currentTarget
    ) {
      onClose();
    }
  };

  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={handleBackdropClick}
      >
        <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={`w-full overflow-hidden rounded-2xl bg-white shadow-2xl ${className ? className : "max-w-lg"}`}
        >
          <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2
                id="modal-title"
                className="text-lg font-semibold text-slate-950"
            >
              {title}
            </h2>

            <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={disableClose}
                aria-label="Đóng"
                className="min-h-10 px-3 py-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </header>

          <div className="p-5">
            {children}
          </div>
        </section>
      </div>
  );
}