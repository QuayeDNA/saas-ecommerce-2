import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes } from "react";

// Badge variants
type BadgeVariant = "solid" | "subtle" | "outline";

// Badge sizes
type BadgeSize = "xs" | "sm" | "md" | "lg";

// Badge color schemes - separate theme colors from semantic colors
type BadgeColorScheme =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "gray";

// Badge props interface
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  colorScheme?: BadgeColorScheme;
  className?: string;
  rounded?: boolean;
  useThemeColor?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = "subtle",
      size = "sm",
      colorScheme = "default",
      className = "",
      rounded = true,
      useThemeColor = true,
      ...props
    },
    ref
  ) => {
    // Size styles
    const sizeClasses = {
      xs: "text-xs px-1.5 py-0.5",
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-2.5 py-1",
      lg: "text-sm px-3 py-1.5",
    };

    // Helper function to get theme-based color classes
    const getThemeColorClasses = () => {
      return {
        solid: "bg-[var(--color-primary-500)] text-white",
        subtle: "bg-[var(--color-primary-100)] text-[var(--color-primary-800)]",
        outline: "bg-transparent border border-[var(--color-primary-500)] text-[var(--color-primary-700)]",
      };
    };

    // Helper function to get semantic color classes
    const getSemanticColorClasses = (
      scheme: BadgeColorScheme
    ): Record<BadgeVariant, string> => {
      switch (scheme) {
        case "success":
          return {
            solid: "bg-green-500 text-white",
            subtle: "bg-green-100 text-green-800",
            outline: "bg-transparent border border-green-500 text-green-700",
          };
        case "warning":
          return {
            solid: "bg-yellow-500 text-white",
            subtle: "bg-yellow-100 text-yellow-800",
            outline: "bg-transparent border border-yellow-500 text-yellow-700",
          };
        case "error":
          return {
            solid: "bg-red-500 text-white",
            subtle: "bg-red-100 text-red-800",
            outline: "bg-transparent border border-red-500 text-red-700",
          };
        case "info":
          return {
            solid: "bg-blue-500 text-white",
            subtle: "bg-blue-100 text-blue-800",
            outline: "bg-transparent border border-blue-500 text-blue-700",
          };
        case "gray":
          return {
            solid: "bg-gray-500 text-white",
            subtle: "bg-gray-100 text-gray-800",
            outline: "bg-transparent border border-gray-500 text-gray-700",
          };
        default:
          return getThemeColorClasses(); // Use theme colors as default
      }
    };

    // Determine which color classes to use
    const getColorClasses = () => {
      // If using theme color as default or explicitly set to default
      if (colorScheme === "default" && useThemeColor) {
        return getThemeColorClasses()[variant];
      }
      // Otherwise use the semantic colors
      return getSemanticColorClasses(colorScheme)[variant];
    };

    // Combine all classes
    const badgeClasses = [
      "inline-flex items-center justify-center",
      "font-medium",
      rounded ? "rounded-full" : "rounded-[14px]",
      sizeClasses[size],
      getColorClasses(),
      className,
    ].join(" ");

    // Return the badge component
    return (
      <span ref={ref} className={badgeClasses} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
