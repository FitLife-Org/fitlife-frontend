import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";

import { X } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import Button from "./Button";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;

  /**
   * Khi true:
   * - Không đóng bằng nút X.
   * - Không đóng bằng phím Escape.
   * - Không đóng khi click backdrop.
   */
  disableClose?: boolean;

  /**
   * Cho phép click backdrop để đóng modal.
   */
  closeOnBackdrop?: boolean;

  /** Kích thước nội dung modal trên màn hình lớn. */
  size?: "md" | "xl";
}

export default function Modal({
                                title,
                                open,
                                onClose,
                                children,
                                disableClose = false,
                                closeOnBackdrop = true,
                                size = "md",
                              }: ModalProps) {
  const generatedId = useId();

  const titleId =
      `modal-title-${generatedId}`;

  const dialogRef =
      useRef<HTMLElement>(null);

  /**
   * Giữ callback onClose mới nhất trong ref.
   *
   * Nhờ vậy useEffect không phải phụ thuộc trực tiếp
   * vào onClose và không chạy lại sau mỗi lần parent render.
   */
  const onCloseRef =
      useRef(onClose);

  useEffect(() => {
    onCloseRef.current =
        onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocusedElement =
        document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

    const previousOverflow =
        document.body.style.overflow;

    document.body.style.overflow =
        "hidden";

    /**
     * Chỉ focus dialog một lần khi modal vừa mở.
     * Không focus lại sau mỗi ký tự người dùng nhập.
     */
    window.requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    const handleKeyDown = (
        event: KeyboardEvent,
    ) => {
      if (
          event.key === "Escape" &&
          !disableClose
      ) {
        onCloseRef.current();
      }
    };

    document.addEventListener(
        "keydown",
        handleKeyDown,
    );

    return () => {
      document.removeEventListener(
          "keydown",
          handleKeyDown,
      );

      document.body.style.overflow =
          previousOverflow;

      /**
       * Trả focus về phần tử đã mở modal.
       */
      previouslyFocusedElement?.focus();
    };
  }, [
    disableClose,
    open,
  ]);

  const handleBackdropMouseDown = (
      event: MouseEvent<HTMLDivElement>,
  ) => {
    if (
        disableClose ||
        !closeOnBackdrop
    ) {
      return;
    }

    if (
        event.target ===
        event.currentTarget
    ) {
      onCloseRef.current();
    }
  };

  useGSAP(() => {
    if (open) {
      gsap.fromTo(
        ".gsap-backdrop",
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        dialogRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }
      );
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
      <div
          className="gsap-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={
            handleBackdropMouseDown
          }
      >
        <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`w-full ${
                size === "xl"
                    ? "max-w-2xl"
                    : "max-w-lg"
            } max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl bg-white shadow-2xl outline-none`}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
        >
          <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2
                id={titleId}
                className="text-lg font-semibold text-slate-950"
            >
              {title}
            </h2>

            <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onCloseRef.current();
                }}
                disabled={disableClose}
                aria-label="Đóng modal"
                className="min-h-10 px-3 py-2"
            >
              <X
                  className="h-5 w-5"
                  aria-hidden="true"
              />
            </Button>
          </header>

          <div className="p-5">
            {children}
          </div>
        </section>
      </div>
  );
}
