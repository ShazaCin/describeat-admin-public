import { forwardRef, type SelectHTMLAttributes, useId } from "react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-300"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className={clsx(
            "block w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-slate-200",
            "focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500",
            error ? "border-red-700" : "border-slate-700",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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

Select.displayName = "Select";
