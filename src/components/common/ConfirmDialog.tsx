import Button from "./Button";
import Modal from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDialog({
                                        open,
                                        title,
                                        message,
                                        confirmText = "Xác nhận",
                                        cancelText = "Hủy",
                                        loading = false,
                                        onConfirm,
                                        onCancel,
                                      }: ConfirmDialogProps) {
  const handleConfirm = () => {
    void onConfirm();
  };

  return (
      <Modal
          title={title}
          open={open}
          onClose={onCancel}
          disableClose={loading}
          closeOnBackdrop
      >
        <p className="text-sm leading-6 text-slate-600">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
              type="button"
              variant="danger"
              onClick={handleConfirm}
              isLoading={loading}
              loadingText="Đang đăng xuất..."
          >
            {confirmText}
          </Button>
        </div>
      </Modal>
  );
}