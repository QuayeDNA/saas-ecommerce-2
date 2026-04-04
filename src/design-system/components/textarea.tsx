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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 border border-gray-300
            rounded-lg shadow-sm text-base min-h-[120px] transition-all duration-200
            placeholder-gray-400
            focus:outline-none focus:ring-[3px] focus:border-primary-500
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
            ${error
              ? "border-red-500 focus:ring-red-200"
              : "focus:ring-primary-100 hover:border-gray-400"
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
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
