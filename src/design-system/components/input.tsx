import { forwardRef, useState } from "react";
import type { ReactNode, InputHTMLAttributes } from "react";

// Input sizes
type InputSize = "xs" | "sm" | "md" | "lg";

// Input variants
type InputVariant = "outline" | "filled" | "flushed";

// Input color schemes - use 'default' to use theme primary color
type InputColorScheme =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "gray";

// Input props interface
interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  variant?: InputVariant;
  colorScheme?: InputColorScheme;
  isInvalid?: boolean;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  label?: string;
  helperText?: string;
  errorText?: string;
  fullWidth?: boolean;
  className?: string;
  useThemeColor?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      variant = "outline",
      colorScheme = "default",
      isInvalid = false,
      isDisabled = false,
      leftIcon,
      rightIcon,
      label,
      helperText,
      errorText,
      fullWidth = false,
      className = "",
      required = false,
      useThemeColor = true,
      id,
      type = "text",
      ...props
    },
    ref
  ) => {
    // Focus state for enhanced focus styles
    const [isFocused, setIsFocused] = useState(false);

    // Size classes for different elements (Mobile-first sizes)
    const sizeClasses = {
      input: {
        xs: "text-base h-[52px] px-3",
        sm: "text-base h-[52px] px-4",
        md: "text-base h-[52px] px-4",
        lg: "text-base h-[52px] px-4",
      },
      label: {
        xs: "text-sm font-medium",
        sm: "text-sm font-medium",
        md: "text-sm font-medium",
        lg: "text-sm font-medium",
      },
      helperText: {
        xs: "text-sm",
        sm: "text-sm",
        md: "text-sm",
        lg: "text-sm",
      },
      iconSize: {
        xs: "w-5 h-5",
        sm: "w-5 h-5",
        md: "w-5 h-5",
        lg: "w-5 h-5",
      },
      iconPadding: {
        xs: leftIcon ? "pl-11" : "pl-4",
        sm: leftIcon ? "pl-11" : "pl-4",
        md: leftIcon ? "pl-11" : "pl-4",
        lg: leftIcon ? "pl-11" : "pl-4",
      },
      rightIconPadding: {
        xs: rightIcon ? "pr-11" : "pr-4",
        sm: rightIcon ? "pr-11" : "pr-4",
        md: rightIcon ? "pr-11" : "pr-4",
        lg: rightIcon ? "pr-11" : "pr-4",
      },
    };

    // Variant specific styles
    const variantClasses = {
      outline: "border border-[var(--color-border)] bg-[var(--color-surface)] rounded-[14px] transition-all duration-200 hover:border-[var(--color-primary-300)] focus:ring-[3px] focus:ring-[var(--color-primary-100)]",
      filled: "border border-transparent bg-[var(--color-control-bg)] rounded-[14px] transition-all duration-200 hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] focus:ring-[3px] focus:ring-[var(--color-primary-100)]",
      flushed: "border-b-2 border-[var(--color-border)] rounded-none px-0 transition-all duration-200 hover:border-[var(--color-primary-400)] focus:border-[var(--color-primary-500)]",
    };

    // Get theme color classes based on the current primary color from the theme
    const getThemeColorClasses = () => {
      return {
        border: "border-[var(--color-primary-500)]",
        ring: "ring-[var(--color-primary-100)]",
        focus: "focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-100)]",
      };
    };

    const getSemanticColorClasses = (
      scheme: InputColorScheme
    ): { border: string; ring: string; focus: string } => {
      switch (scheme) {
        case "success":
          return {
            border: "border-[var(--color-success-icon)]",
            ring: "ring-[var(--color-success-bg)]",
            focus: "focus:border-[var(--color-success-icon)] focus:ring-[var(--color-success-bg)]",
          };
        case "error":
          return {
            border: "border-[var(--color-error)]",
            ring: "ring-[var(--color-failed-bg)]",
            focus: "focus:border-[var(--color-error)] focus:ring-[var(--color-failed-bg)]",
          };
        case "warning":
          return {
            border: "border-[var(--color-warning)]",
            ring: "ring-[var(--color-pending-bg)]",
            focus: "focus:border-[var(--color-warning)] focus:ring-[var(--color-pending-bg)]",
          };
        case "info":
          return {
            border: "border-[var(--color-primary-500)]",
            ring: "ring-[var(--color-primary-100)]",
            focus: "focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-100)]",
          };
        case "gray":
          return {
            border: "border-[var(--color-border)]",
            ring: "ring-[var(--color-gray-200)]",
            focus: "focus:border-[var(--color-border)] focus:ring-[var(--color-gray-200)]",
          };
        case "default":
        default:
          return getThemeColorClasses();
      }
    };

    // Get the appropriate color classes based on whether using theme color, invalid state, etc.
    const getColorClasses = () => {
      // Always use error colors for invalid state
      if (isInvalid) {
        return {
          border: "border-red-500",
          ring: "ring ring-red-200",
          focus: "focus:border-red-500 focus:ring-red-100",
        };
      }

      // If using default colorScheme and theme colors are enabled, use theme's primary color
      if (colorScheme === "default" && useThemeColor) {
        return getThemeColorClasses();
      }

      // Otherwise, use the specified semantic color
      return getSemanticColorClasses(colorScheme);
    };

    // Focus classes
    const getFocusClasses = () => {
      const colors = getColorClasses();
      return `focus:outline-none ${colors.focus}`;
    };

    // Combine all classes for the input
    const inputClasses = [
      "form-input w-full",
      sizeClasses.input[size],
      sizeClasses.iconPadding[size],
      sizeClasses.rightIconPadding[size],
      variantClasses[variant],
      getFocusClasses(),
      "transition duration-200",
    ];

    // Add focused state classes
    if (isFocused) {
      const colors = getColorClasses();
      inputClasses.push(`${colors.border} ${colors.ring}`);
    }

    // Add invalid state classes
    if (isInvalid) {
      inputClasses.push("border-[var(--color-error)] text-[var(--color-error)] placeholder:text-[var(--color-error)]");
    }

    // Add disabled state classes
    if (isDisabled) {
      inputClasses.push("bg-[var(--color-control-bg)] text-[var(--color-secondary-text)] cursor-not-allowed");
    }

    // Add custom classes
    if (className) {
      inputClasses.push(className);
    }

    // Generate a unique ID if not provided
    const uniqueId = id ?? `input-${Math.random().toString(36).slice(2, 11)}`;

    // Helper function to determine helper/error text display
    const renderHelperText = () => {
      if (isInvalid && errorText) {
        return <p className="text-[var(--color-error)]">{errorText}</p>;
      }

      if (helperText) {
        return <p className="text-[var(--color-secondary-text)]">{helperText}</p>;
      }

      return null;
    };

    return (
      <div className={`flex flex-col ${fullWidth ? "w-full" : ""}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={uniqueId}
            className={`block ${sizeClasses.label[size]} font-medium text-[var(--color-text)] mb-1`}
          >
            {label}
            {required && <span className="text-[var(--color-error)] ml-1">*</span>}
          </label>
        )}

        {/* Input container for positioning icons */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className={`text-slate-400 ${sizeClasses.iconSize[size]}`}>
                {leftIcon}
              </div>
            </div>
          )}

          {/* Input element */}
          <input
            ref={ref}
            id={uniqueId}
            type={type}
            disabled={isDisabled}
            className={inputClasses.join(" ")}
            onFocus={(e) => {
              setIsFocused(true);
              if (props.onFocus) {
                props.onFocus(e);
              }
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (props.onBlur) {
                props.onBlur(e);
              }
            }}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className={`text-gray-400 ${sizeClasses.iconSize[size]}`}>
                {rightIcon}
              </div>
            </div>
          )}
        </div>

        {/* Helper text or Error text */}
        {(helperText || (isInvalid && errorText)) && (
          <div className={`mt-1 ${sizeClasses.helperText[size]}`}>
            {renderHelperText()}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
