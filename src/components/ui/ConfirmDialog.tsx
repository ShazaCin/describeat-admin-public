import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
}: ConfirmDialogProps) {
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setConfirming(true);
    setConfirmError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={confirming}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:outline-none disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-slate-500 focus:outline-none disabled:opacity-50 ${
              destructive
                ? "bg-red-700 text-white hover:bg-red-600"
                : "bg-slate-700 text-white hover:bg-slate-600"
            }`}
          >
            {confirming ? <Loader2 size={14} className="inline animate-spin mr-1" /> : null}
            {confirming ? "Confirming..." : confirmText}
          </button>
        </>
      }
    >
      <p className="text-slate-300">{message}</p>
      {confirmError && (
        <p className="mt-2 text-sm text-red-400">{confirmError}</p>
      )}
    </Modal>
  );
}