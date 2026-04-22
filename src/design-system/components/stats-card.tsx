import React from "react";
import { Card, CardBody } from "./card";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  trend?: string | null;
  trendLabel?: string;
  trendUp?: boolean;
  variant?: "solid" | "wallet";
  children?: React.ReactNode; // Optional children allowing injection of action buttons like in the mockup
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  size = "md",
  iconOnly = false,
  trend,
  trendLabel,
  trendUp,
  variant = "solid",
  children,
}) => {
  const sizeClasses = {
    sm: {
      title: "text-xs font-medium",
      value: "text-base sm:text-lg font-bold",
      subtitle: "text-xs mt-0.5 sm:mt-1",
      icon: "text-xs sm:text-sm",
      iconContainer: "p-1.5 sm:p-2",
    },
    md: {
      title: "text-xs sm:text-sm font-medium",
      value: "text-2xl sm:text-3xl font-bold tracking-tight",
      subtitle: "text-xs sm:text-sm mt-0.5 sm:mt-1",
      icon: "text-sm sm:text-base lg:text-lg",
      iconContainer: "p-2 sm:p-2.5 lg:p-3",
    },
    lg: {
      title: "text-sm sm:text-base font-medium",
      value: "text-3xl sm:text-4xl font-bold tracking-tight",
      subtitle: "text-xs sm:text-sm mt-0.5 sm:mt-1",
      icon: "text-base sm:text-lg lg:text-xl",
      iconContainer: "p-2 sm:p-3 lg:p-4",
    },
  };

  const classes = sizeClasses[size];
  const isWallet = variant === "wallet";

  const cardStyle = isWallet
    ? { backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text)" }
    : { backgroundColor: "var(--color-primary-500)", borderColor: "var(--color-primary-600)", color: "white" };

  return (
    <Card
      className={`transition-colors duration-200 h-full relative overflow-hidden ${isWallet ? 'shadow-lg' : ''}`}
      style={cardStyle}
    >
      {/* Decorative background element for wallet variant */}
      {isWallet && (
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--color-primary-50)] rounded-full opacity-50 pointer-events-none" />
      )}

      <CardBody className={`h-full relative z-10 flex flex-col gap-4 sm:gap-6`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`${classes.title} mb-1 sm:mb-2 truncate ${isWallet ? 'text-[var(--color-muted-text)]' : 'text-[var(--color-primary-100)]'}`}>
              {title}
            </p>
            <p className={`${classes.value} leading-none ${isWallet ? 'text-[var(--color-text)]' : 'text-white'}`}>{value}</p>
            {subtitle && (
              <p
                className={`${classes.subtitle} mt-1`}
                style={{ color: isWallet ? "var(--color-muted-text)" : "var(--color-primary-200, #bfdbfe)" }}
              >
                {subtitle}
              </p>
            )}
            {(trend || trendLabel) && (
              <p
                className={`text-sm mt-2 flex items-center ${trendUp !== undefined
                  ? trendUp
                    ? isWallet ? "text-[var(--color-primary-600)]" : "text-[var(--color-success)]"
                    : "text-[var(--color-error)]"
                  : isWallet ? "text-[var(--color-muted-text)]" : "text-[var(--color-primary-200)]"
                  }`}
              >
                {trendUp !== undefined && trendUp && <span className="mr-1">↑</span>}
                {trendUp !== undefined && !trendUp && <span className="mr-1">↓</span>}
                {trend && <span>{trend}</span>}
                {trendLabel && (
                  <span className={`ml-1 ${isWallet ? "text-[var(--color-muted-text)]" : "text-[var(--color-primary-200)]"}`}>{trendLabel}</span>
                )}
              </p>
            )}
          </div>
          {!iconOnly && icon && (
            <div
              className={`${classes.iconContainer} ${isWallet ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-500)]' : 'bg-white/20 text-white'} rounded-full flex-shrink-0 flex items-center justify-center`}
            >
              <div className={`${classes.icon}`}>{icon}</div>
            </div>
          )}
        </div>

        {/* Render optional children (e.g. Action buttons for Wallet) */}
        {children && (
          <div className="mt-2 w-full">
            {children}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export interface StatsGridProps {
  stats: StatCardProps[];
  columns?: 2 | 3 | 4 | 6;
  gap?: "xs" | "sm" | "md" | "lg";
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = 4,
  gap = "lg",
}) => {
  // Adjust columns based on number of items for better layout
  const effectiveColumns =
    stats.length === 1 ? 1 : Math.min(columns, stats.length);

  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2 sm:grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  };

  const gapClasses = {
    xs: "gap-2 sm:gap-3",
    sm: "gap-3 sm:gap-4",
    md: "gap-4 sm:gap-5",
    lg: "gap-4 sm:gap-6 lg:gap-8",
  };

  return (
    <div
      className={`grid ${gridClasses[effectiveColumns as keyof typeof gridClasses]
        } ${gapClasses[gap]} w-full`}
    >
      {stats.map((stat, index) => (
        <StatCard key={`${stat.title}-${index}`} {...stat} />
      ))}
    </div>
  );
};
