import { forwardRef, type TextareaHTMLAttributes, useId } from "react";
import clsx from "clsx";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-slate-300"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className={clsx(
            "block w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500",
            "focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500",
            "min-h-[100px] resize-y",
            error ? "border-red-700" : "border-slate-700",
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
