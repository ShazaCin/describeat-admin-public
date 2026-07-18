import { useToastStore } from "@/stores/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: "border-green-800 bg-green-950 text-green-300",
  error: "border-red-800 bg-red-950 text-red-300",
  warning: "border-yellow-800 bg-yellow-950 text-yellow-300",
  info: "border-blue-800 bg-blue-950 text-blue-300",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] ?? icons.info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex w-80 items-start gap-3 rounded-lg border p-3 shadow-lg ${colors[toast.type]}`}
              role="alert"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1 text-sm">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
