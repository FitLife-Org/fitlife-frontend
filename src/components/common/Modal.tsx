import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";

import {
  X,
} from "lucide-react";

import Button from "./Button";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;

  disableClose?: boolean;
  closeOnBackdrop?: boolean;
}

export default function Modal({
                                title,
                                open,
                                onClose,
                                children,
                                disableClose = false,
                                closeOnBackdrop = true,
                              }: ModalProps) {
  const generatedId = useId();

  const titleId =
      `modal-title-${generatedId}`;

  const dialogRef =
      useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
        document.body.style.overflow;

    document.body.style.overflow =
        "hidden";

    dialogRef.current?.focus();

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

    return () => {
      document.removeEventListener(
          "keydown",
          handleKeyDown,
      );

      document.body.style.overflow =
          previousOverflow;
    };
  }, [
    disableClose,
    onClose,
    open,
  ]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (
      event:
      MouseEvent<HTMLDivElement>,
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
      onClose();
    }
  };

  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={
            handleBackdropClick
          }
      >
        <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl outline-none"
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
                onClick={onClose}
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