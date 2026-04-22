import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
} from "react";

// ============================================================================
// DROPDOWN COMPONENT
// ============================================================================

// Dropdown option type
interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

// Dropdown sizes
type DropdownSize = "xs" | "sm" | "md" | "lg";

// Dropdown color schemes
type DropdownColorScheme =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "gray";

// Dropdown props interface
interface DropdownProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: DropdownOption[];
  value?: string | number;
  placeholder?: string;
  size?: DropdownSize;
  colorScheme?: DropdownColorScheme;
  isDisabled?: boolean;
  isInvalid?: boolean;
  fullWidth?: boolean;
  className?: string;
  useThemeColor?: boolean;
  onChange?: (value: string | number) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      options,
      value,
      placeholder = "Select an option...",
      size = "md",
      colorScheme = "default",
      isDisabled = false,
      isInvalid = false,
      fullWidth = false,
      className = "",
      useThemeColor = true,
      onChange,
      label,
      helperText,
      errorText,
      required = false,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Size classes
    const sizeClasses = {
      trigger: {
        xs: "text-base h-8 px-2",
        sm: "text-base h-10 px-3",
        md: "text-base h-12 px-4", // standard height 48px
        lg: "text-base h-14 px-4",
      },
      label: {
        xs: "text-xs font-medium",
        sm: "text-sm font-medium",
        md: "text-sm font-medium",
        lg: "text-base font-medium",
      },
      helperText: {
        xs: "text-xs",
        sm: "text-xs",
        md: "text-xs",
        lg: "text-sm",
      },
      option: {
        xs: "text-base px-4 py-3", // increased padding for mobile
        sm: "text-base px-4 py-3",
        md: "text-base px-4 py-4", // massive touch targets for the lists
        lg: "text-lg px-5 py-4",
      },
    };

    // Get theme color classes
    const getThemeColorClasses = () => {
      return {
        border: "border-[var(--color-primary-500)]",
        ring: "ring ring-[var(--color-primary-100)]",
        focus: "focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-100)]",
        optionHover: "hover:bg-[var(--color-primary-50)]",
        optionSelected: "bg-[var(--color-primary-100)] text-[var(--color-primary-900)]",
      };
    };

    const getSemanticColorClasses = (
      scheme: DropdownColorScheme
    ): {
      border: string;
      ring: string;
      focus: string;
      optionHover: string;
      optionSelected: string;
    } => {
      switch (scheme) {
        case "success":
          return {
            border: "border-[var(--color-success)]",
            ring: "ring ring-[var(--color-success-bg)]",
            focus: "focus:border-[var(--color-success)] focus:ring-[var(--color-success-bg)]",
            optionHover: "hover:bg-[var(--color-success-bg)]",
            optionSelected: "bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
          };
        case "error":
          return {
            border: "border-[var(--color-error)]",
            ring: "ring ring-[var(--color-failed-bg)]",
            focus: "focus:border-[var(--color-error)] focus:ring-[var(--color-failed-bg)]",
            optionHover: "hover:bg-[var(--color-failed-bg)]",
            optionSelected: "bg-[var(--color-failed-bg)] text-[var(--color-failed-text)]",
          };
        case "warning":
          return {
            border: "border-[var(--color-warning)]",
            ring: "ring ring-[var(--color-pending-bg)]",
            focus: "focus:border-[var(--color-warning)] focus:ring-[var(--color-pending-bg)]",
            optionHover: "hover:bg-[var(--color-pending-bg)]",
            optionSelected: "bg-[var(--color-pending-bg)] text-[var(--color-pending-text)]",
          };
        case "info":
          return {
            border: "border-[var(--color-info)]",
            ring: "ring ring-[var(--color-primary-100)]",
            focus: "focus:border-[var(--color-info)] focus:ring-[var(--color-primary-100)]",
            optionHover: "hover:bg-[var(--color-primary-50)]",
            optionSelected: "bg-[var(--color-primary-100)] text-[var(--color-primary-900)]",
          };
        case "gray":
          return {
            border: "border-[var(--color-border)]",
            ring: "ring ring-[var(--color-border)]",
            focus: "focus:border-[var(--color-border)] focus:ring-[var(--color-border)]",
            optionHover: "hover:bg-[var(--color-surface)]",
            optionSelected: "bg-[var(--color-border)] text-[var(--color-text)]",
          };
        case "default":
        default:
          return getThemeColorClasses();
      }
    };

    const getColorClasses = () => {
      if (isInvalid) {
        return {
          border: "border-[var(--color-error)]",
          ring: "ring ring-[var(--color-failed-bg)]",
          focus: "focus:border-[var(--color-error)] focus:ring-[var(--color-failed-bg)]",
          optionHover: "hover:bg-[var(--color-failed-bg)]",
          optionSelected: "bg-[var(--color-failed-bg)] text-[var(--color-failed-text)]",
        };
      }

      if (colorScheme === "default" && useThemeColor) {
        return getThemeColorClasses();
      }

      return getSemanticColorClasses(colorScheme);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (
          event.key === "Enter" ||
          event.key === " " ||
          event.key === "ArrowDown"
        ) {
          event.preventDefault();
          setIsOpen(true);
          setFocusedIndex(0);
        }
        return;
      }

      switch (event.key) {
        case "Escape":
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          event.preventDefault();
          if (focusedIndex >= 0 && !options[focusedIndex]?.disabled) {
            handleOptionSelect(options[focusedIndex].value);
          }
          break;
      }
    };

    const handleOptionSelect = (optionValue: string | number) => {
      onChange?.(optionValue);
      setIsOpen(false);
      setFocusedIndex(-1);
    };

    const selectedOption = options.find((opt) => opt.value === value);
    const colors = getColorClasses();

    const triggerClasses = [
      "relative flex items-center justify-between w-full",
      "bg-[var(--color-surface)] rounded-lg cursor-pointer transition duration-200",
      sizeClasses.trigger[size],
      isOpen ? `${colors.border} ${colors.ring}` : "border border-[var(--color-border)] hover:border-[var(--color-border)] focus:ring-[3px] focus:ring-[var(--color-primary-100)]",
      isInvalid ? "border-[var(--color-error)] text-[var(--color-error)]" : "text-[var(--color-text)]",
      isDisabled ? "bg-[var(--color-border)] text-[var(--color-muted-text)] cursor-not-allowed" : "",
      className,
    ].join(" ");

    const uniqueId = `dropdown-${Math.random().toString(36).slice(2, 11)}`;

    return (
      <div
        className={`relative ${fullWidth ? "w-full" : ""}`}
        ref={dropdownRef}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={uniqueId}
            className={`block ${sizeClasses.label[size]} font-medium text-[var(--color-secondary-text)] mb-1`}
          >
            {label}
            {required && <span className="text-[var(--color-error)] ml-1">*</span>}
          </label>
        )}

        {/* Trigger */}
        <div
          ref={ref}
          id={uniqueId}
          className={triggerClasses}
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={isDisabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          {...props}
        >
          <span className={selectedOption ? "text-[var(--color-text)]" : "text-[var(--color-muted-text)]"}>
            {selectedOption ? (
              <div className="flex items-center">
                {selectedOption.icon && (
                  <span className="mr-2">{selectedOption.icon}</span>
                )}
                {selectedOption.label}
              </div>
            ) : (
              placeholder
            )}
          </span>
          <svg
            className={`w-5 h-5 text-[var(--color-muted-text)] transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Options */}
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 z-40 sm:hidden animate-fade-in"
              onClick={() => setIsOpen(false)}
            />
            {/* Options Container (Bottom Sheet on Mobile, Absolute on Desktop) */}
            <div className="fixed sm:absolute inset-x-0 bottom-0 sm:bottom-auto sm:top-full z-50 sm:mt-1 bg-[var(--color-surface)] sm:border border-[var(--color-border)] rounded-t-[32px] sm:rounded-lg shadow-xl sm:shadow-lg max-h-[60vh] sm:max-h-60 overflow-hidden sm:overflow-auto pb-safe-area sm:pb-0 transition-transform duration-300 translate-y-0 sm:translate-y-0 animate-slide-in-from-bottom sm:animate-none">
              <div className="sm:hidden w-full flex justify-center py-3">
                <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full" />
              </div>
              <div className="overflow-y-auto max-h-[calc(60vh-40px)] sm:max-h-60">
                {options.map((option, index) => (
                  <div
                    key={option.value}
                    className={[
                      "cursor-pointer transition-colors duration-150 border-b border-[var(--color-border)] sm:border-none",
                      sizeClasses.option[size],
                      option.disabled
                        ? "text-[var(--color-muted-text)] cursor-not-allowed bg-[var(--color-surface)]"
                        : "text-[var(--color-text)]",
                      !option.disabled && colors.optionHover,
                      option.value === value ? colors.optionSelected : "",
                      index === focusedIndex ? "bg-[var(--color-border)]/50" : "",
                    ].join(" ")}
                    onClick={() =>
                      !option.disabled && handleOptionSelect(option.value)
                    }
                    role="option"
                    aria-selected={option.value === value}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {option.icon && <span className="mr-3">{option.icon}</span>}
                        <span className={option.value === value ? "font-semibold" : ""}>{option.label}</span>
                      </div>
                      {option.value === value && (
                        <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Helper text or Error text */}
        {(helperText || (isInvalid && errorText)) && (
          <div className={`mt-1 ${sizeClasses.helperText[size]}`}>
            {isInvalid && errorText ? (
              <p className="text-[var(--color-error)]">{errorText}</p>
            ) : (
              helperText && <p className="text-[var(--color-muted-text)]">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Dropdown.displayName = "Dropdown";
