import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-secondary-text)] mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 border border-[var(--color-border)]
            rounded-lg shadow-sm text-base min-h-[120px] transition-all duration-200
            placeholder:text-[var(--color-muted-text)]
            bg-[var(--color-input-bg)] text-[var(--color-text)]
            focus:outline-none focus:ring-[3px] focus:border-[var(--color-primary-500)]
            disabled:bg-[var(--color-border)] disabled:cursor-not-allowed disabled:text-[var(--color-muted-text)]
            ${error
              ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
              : "focus:ring-[var(--color-primary-100)] hover:border-[var(--color-border)]"
            }
            ${className}
          `}
          style={
            !error
              ? ({
                "--tw-ring-color": "var(--color-primary-500)",
              } as React.CSSProperties)
              : undefined
          }
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
