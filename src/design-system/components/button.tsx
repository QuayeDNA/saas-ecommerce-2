import { forwardRef } from "react";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import { useTheme } from "../../hooks/use-theme";
import { Loader2 } from "lucide-react";

// Button variants
type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "accent"
  | "danger"
  | "success"
  | "warning"
  | "info";

// Button sizes
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

// Button color schemes (beyond the variant)
type ButtonColorScheme =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "danger";

/**
 * Button component props
 *
 * Usage with icons:
 * - Icon-only: <Button iconOnly leftIcon={<PlusIcon />} aria-label="Add item" />
 * - Left icon: <Button leftIcon={<UserIcon />}>Profile</Button>
 * - Right icon: <Button rightIcon={<ArrowRightIcon />}>Next</Button>
 * - Loading: <Button isLoading loadingText="Processing...">Submit</Button>
 *
 * Both Lucide React icons and React Icons are supported:
 * - Lucide: import { Home } from 'lucide-react'
 * - React Icons: import { FaHome } from 'react-icons/fa'
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode; // Optional for icon-only buttons
  variant?: ButtonVariant;
  size?: ButtonSize;
  colorScheme?: ButtonColorScheme;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  rounded?: boolean; // For fully rounded buttons
  useThemeColor?: boolean;
  iconOnly?: boolean; // For buttons that only display an icon (should include aria-label)
  loadingText?: string; // Optional text to display while loading
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      colorScheme = "default",
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled = false,
      type = "button",
      rounded = false,
      useThemeColor = true,
      iconOnly = false,
      loadingText,
      ...props
    },
    ref
  ) => {
    // Access theme
    const { primaryColor } = useTheme();

    // Size styles for regular buttons
    const sizeClasses = {
      xs: "text-sm px-3 h-[48px] font-medium",
      sm: "text-sm px-4 h-[48px] font-medium",
      md: "text-base px-5 h-[52px] font-medium",
      lg: "text-base px-6 h-[52px] font-semibold",
      xl: "text-lg px-8 h-[56px] font-bold",
    };

    // Size styles for icon-only buttons (equal width and height)
    const iconOnlySizeClasses = {
      xs: "p-1.5 h-[48px] w-[48px]",
      sm: "p-2 h-[48px] w-[48px]",
      md: "p-3 h-[52px] w-[52px]",
      lg: "p-4 h-[52px] w-[52px]",
      xl: "p-5 h-[56px] w-[56px]",
    };

    // Helper function to get theme-based color classes
    const getThemeColorClasses = () => {
      return {
        solid:
          "bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] active:bg-[var(--color-primary-700)] shadow-sm",
        outline:
          "bg-transparent border border-[var(--color-primary-500)] text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] active:bg-[var(--color-primary-100)]",
        ghost:
          "bg-transparent text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] active:bg-[var(--color-primary-100)]",
        link: "bg-transparent text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] hover:underline p-0 h-auto",
        focusRing: "focus:ring-[var(--color-primary-500)]",
      };
    };

    // Helper functions for semantic color classes
    const getSemanticColorClasses = (
      scheme: ButtonColorScheme
    ): {
      solid: string;
      outline: string;
      ghost: string;
      link: string;
      focusRing: string;
    } => {
      switch (scheme) {
        case "success":
          return {
            solid:
              "bg-[var(--color-success)] text-white hover:bg-[var(--color-success-icon)] active:bg-[var(--color-success-icon)] shadow-sm",
            outline:
              "bg-transparent border border-[var(--color-success-icon)] text-[var(--color-success-icon)] hover:bg-[var(--color-success-bg)] active:bg-[var(--color-success-bg)]",
            ghost:
              "bg-transparent text-[var(--color-success-icon)] hover:bg-[var(--color-success-bg)] active:bg-[var(--color-success-bg)]",
            link: "bg-transparent text-[var(--color-success-icon)] hover:text-[var(--color-success-text)] hover:underline p-0 h-auto",
            focusRing: "focus:ring-[var(--color-success-icon)]",
          };
        case "warning":
          return {
            solid:
              "bg-[var(--color-warning)] text-white hover:bg-[var(--color-warning)] active:bg-[var(--color-warning)] shadow-sm",
            outline:
              "bg-transparent border border-[var(--color-warning)] text-[var(--color-warning)] hover:bg-[var(--color-pending-bg)] active:bg-[var(--color-pending-bg)]",
            ghost:
              "bg-transparent text-[var(--color-warning)] hover:bg-[var(--color-pending-bg)] active:bg-[var(--color-pending-bg)]",
            link: "bg-transparent text-[var(--color-warning)] hover:text-[var(--color-pending-text)] hover:underline p-0 h-auto",
            focusRing: "focus:ring-[var(--color-warning)]",
          };
        case "error":
          return {
            solid:
              "bg-[var(--color-error)] text-white hover:bg-[var(--color-error)] active:bg-[var(--color-error)] shadow-sm",
            outline:
              "bg-transparent border border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-failed-bg)] active:bg-[var(--color-failed-bg)]",
            ghost:
              "bg-transparent text-[var(--color-error)] hover:bg-[var(--color-failed-bg)] active:bg-[var(--color-failed-bg)]",
            link: "bg-transparent text-[var(--color-error)] hover:text-[var(--color-failed-text)] hover:underline p-0 h-auto",
            focusRing: "focus:ring-[var(--color-error)]",
          };
        case "info":
          return {
            solid:
              "bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] active:bg-[var(--color-primary-800)] shadow-sm",
            outline:
              "bg-transparent border border-[var(--color-primary-500)] text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] active:bg-[var(--color-primary-100)]",
            ghost:
              "bg-transparent text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] active:bg-[var(--color-primary-100)]",
            link: "bg-transparent text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] hover:underline p-0 h-auto",
            focusRing: "focus:ring-[var(--color-primary-500)]",
          };
        case "default":
        default:
          return getThemeColorClasses();
      }
    };

    // Get appropriate color classes
    const getColorClasses = () => {
      // If using default colorScheme and theme colors are enabled, use theme's primary color
      if (colorScheme === "default" && useThemeColor) {
        return getThemeColorClasses();
      }

      // Otherwise use semantic colors
      return getSemanticColorClasses(colorScheme);
    };

    // Get base variant styles based on color scheme
    const getVariantClasses = () => {
      // Get color palette based on colorScheme
      const colors = getColorClasses();

      // Return classes based on variant
      switch (variant) {
        case "primary":
          return colors.solid;

        case "secondary":
          return "bg-[var(--color-control-bg)] text-[var(--color-text)] hover:bg-[var(--color-surface)] active:bg-[var(--color-gray-200)] shadow-sm border border-[var(--color-border)]";

        case "accent":
          return "bg-[var(--color-secondary-500)] text-white hover:bg-[var(--color-secondary-600)] active:bg-[var(--color-secondary-700)] shadow-sm";

        case "outline":
          return colors.outline;

        case "ghost":
          return colors.ghost;

        case "link":
          return colors.link;

        default:
          return colors.solid;
      }
    };

    // Focus ring color based on variant and color scheme
    const getFocusRingClass = () => {
      if (variant === "link") return "focus:outline-none";

      const colors = getColorClasses();
      return `focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.focusRing}`;
    };

    // Combine all classes
    const buttonClasses = [
      "inline-flex items-center justify-center",
      rounded ? "rounded-full" : "rounded-[14px]",
      getFocusRingClass(),
      "transition-all duration-200",
      iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
      getVariantClasses(),
      fullWidth ? "w-full" : "",
      disabled || isLoading ? "opacity-60 cursor-not-allowed" : "",
      className,
    ].join(" ");

    // Get inline styles for theme colors
    const getThemeStyles = (): React.CSSProperties => {
      if (!useThemeColor || colorScheme !== "default") return {};

      const baseStyles: React.CSSProperties = {};

      if (variant === "primary") {
        baseStyles.backgroundColor = "var(--color-primary-500)";
        baseStyles.color = "white";
      } else if (variant === "accent") {
        baseStyles.backgroundColor = "var(--color-secondary-500)";
        baseStyles.color = "white";
      } else if (variant === "outline") {
        baseStyles.borderColor = "var(--color-primary-500)";
        baseStyles.color = "var(--color-primary-500)";
      } else if (variant === "ghost" || variant === "link") {
        baseStyles.color = "var(--color-primary-500)";
      }

      return baseStyles;
    };

    // Return the button component
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        style={{ ...getThemeStyles(), ...props.style }}
        disabled={disabled || isLoading}
        onMouseEnter={(e) => {
          if (
            useThemeColor &&
            colorScheme === "default" &&
            !disabled &&
            !isLoading
          ) {
            if (variant === "primary") {
              e.currentTarget.style.backgroundColor =
                "var(--color-primary-600)";
            } else if (variant === "accent") {
              e.currentTarget.style.backgroundColor =
                "var(--color-secondary-600)";
            } else if (variant === "outline") {
              e.currentTarget.style.backgroundColor = "var(--color-primary-50)";
            } else if (variant === "ghost") {
              e.currentTarget.style.backgroundColor = "var(--color-primary-50)";
            }
          }
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (
            useThemeColor &&
            colorScheme === "default" &&
            !disabled &&
            !isLoading
          ) {
            if (variant === "primary") {
              e.currentTarget.style.backgroundColor =
                "var(--color-primary-500)";
            } else if (variant === "accent") {
              e.currentTarget.style.backgroundColor =
                "var(--color-secondary-500)";
            } else if (variant === "outline" || variant === "ghost") {
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }
          props.onMouseLeave?.(e);
        }}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText && <span className="ml-2">{loadingText}</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className={`flex items-center ${children ? "mr-2" : ""}`}>
                {leftIcon}
              </span>
            )}
            {children && (
              <span
                className={`flex items-center ${iconOnly ? "sr-only" : ""}`}
              >
                {children}
              </span>
            )}
            {rightIcon && (
              <span className={`flex items-center ${children ? "ml-2" : ""}`}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
