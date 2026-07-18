import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  fullPage?: boolean;
  message?: string;
}

export function LoadingSpinner({
  fullPage = false,
  message = "Loading...",
}: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div role="status" aria-live="polite" className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      <span className="sr-only">{message}</span>
    </div>
  );
}
