import React from "react";
import { Card, CardBody } from "./card";
import { ArrowUp, ArrowDown } from "lucide-react";

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
  variant?: "solid" | "wallet" | "surface";
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
      title: "text-[10px] sm:text-xs font-medium",
      value: "text-sm sm:text-lg md:text-xl font-bold",
      subtitle: "text-[10px] sm:text-xs mt-0.5 sm:mt-1",
      icon: "text-xs sm:text-sm",
      iconContainer: "p-1.5 sm:p-2",
      gap: "gap-2 sm:gap-3",
    },
    md: {
      title: "text-[10px] sm:text-sm font-medium",
      value: "text-base sm:text-2xl md:text-3xl font-bold tracking-tight",
      subtitle: "text-[10px] sm:text-sm mt-0.5 sm:mt-1",
      icon: "text-sm sm:text-base md:text-lg",
      iconContainer: "p-1.5 sm:p-2.5 md:p-3",
      gap: "gap-2 sm:gap-4 md:gap-5",
    },
    lg: {
      title: "text-xs sm:text-base font-medium",
      value: "text-lg sm:text-3xl md:text-4xl font-bold tracking-tight",
      subtitle: "text-[10px] sm:text-sm mt-0.5 sm:mt-1",
      icon: "text-base sm:text-lg md:text-xl",
      iconContainer: "p-2 sm:p-3 md:p-4",
      gap: "gap-2.5 sm:gap-5 md:gap-6",
    },
  };

  const classes = sizeClasses[size];

  // Determine variant styling dynamically using CSS variables to guarantee theme-awareness
  const isSolid = variant === "solid";
  const isWallet = variant === "wallet";

  // Base background and text colors
  const cardBgStyle = isSolid
    ? {
        backgroundColor: "var(--color-primary-600)",
        borderColor: "var(--color-primary-700)",
      }
    : {
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      };

  const titleColor = isSolid
    ? "text-[white] opacity-90"
    : "text-[var(--color-muted-text)]";
  const valueColor = isSolid ? "text-white" : "text-[var(--color-text)]";
  const subtitleColor = isSolid
    ? "text-[white] opacity-75"
    : "text-[var(--color-secondary-text)]";

  // Icon styling mapping perfectly with light/dark modes
  const iconContainerBg = isSolid
    ? "bg-white/20"
    : isWallet
      ? "bg-[var(--color-primary-100)]"
      : "bg-[var(--color-control-bg)]";
  const iconColor = isSolid
    ? "text-white"
    : isWallet
      ? "text-[var(--color-primary-600)]"
      : "text-[var(--color-text)]";

  // Trend indication colors
  const getTrendColor = () => {
    if (trendUp === undefined)
      return isSolid
        ? "text-white opacity-80"
        : "text-[var(--color-muted-text)]";
    if (trendUp)
      return isSolid ? "text-[#a7f3d0]" : "text-[var(--color-success)]"; // #a7f3d0 is highly visible light green for solid
    return isSolid ? "text-[#fecaca]" : "text-[var(--color-error)]"; // #fecaca is highly visible light red for solid
  };

  return (
    <Card
      className={`transition-all duration-300 h-full relative overflow-hidden group ${
        isWallet ? "shadow-md hover:shadow-lg" : "shadow-sm"
      }`}
      style={cardBgStyle}
    >
      {/* Decorative ambient elements */}
      {isWallet && (
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-[var(--color-primary-500)] rounded-full opacity-[0.05] pointer-events-none blur-2xl transition-transform group-hover:scale-110" />
      )}
      {isSolid && (
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white rounded-full opacity-[0.08] pointer-events-none blur-xl" />
      )}

      <CardBody className={`h-full relative z-10 flex flex-col ${classes.gap}`}>
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className={`${classes.title} mb-0.5 sm:mb-1.5 truncate ${titleColor}`}>
              {title}
            </p>
            <p className={`${classes.value} leading-none break-words ${valueColor}`}>
              {value}
            </p>

            {subtitle && (
              <p className={`${classes.subtitle} ${subtitleColor} line-clamp-2`}>
                {subtitle}
              </p>
            )}

            {(trend || trendLabel) && (
              <div
                className={`flex items-center text-[10px] sm:text-sm mt-1.5 sm:mt-3 ${getTrendColor()} font-medium`}
              >
                {trendUp !== undefined && (
                  <span className="mr-1 sm:mr-1.5 flex items-center">
                    {trendUp ? <ArrowUp size={12} className="sm:w-4 sm:h-4" /> : <ArrowDown size={12} className="sm:w-4 sm:h-4" />}
                  </span>
                )}
                {trend && <span className="truncate">{trend}</span>}
                {trendLabel && (
                  <span
                    className={`ml-1 sm:ml-2 text-[9px] sm:text-xs font-normal truncate ${isSolid ? "text-white opacity-75" : "text-[var(--color-muted-text)]"}`}
                  >
                    {trendLabel}
                  </span>
                )}
              </div>
            )}
          </div>

          {!iconOnly && icon && (
            <div
              className={`${classes.iconContainer} ${iconContainerBg} ${iconColor} rounded-lg sm:rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm`}
            >
              <div className={`${classes.icon}`}>{icon}</div>
            </div>
          )}
        </div>

        {/* Action components injection area */}
        {children && <div className="mt-auto pt-1 sm:pt-2 w-full">{children}</div>}
      </CardBody>
    </Card>
  );
};

export interface StatsGridProps {
  stats: StatCardProps[];
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: "xs" | "sm" | "md" | "lg";
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = 4,
  gap = "lg",
}) => {
  const effectiveColumns =
    stats.length === 1 ? 1 : Math.min(columns, stats.length);

  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2 sm:grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  };

  const gapClasses = {
    xs: "gap-2 sm:gap-3",
    sm: "gap-2.5 sm:gap-4",
    md: "gap-3 sm:gap-4 md:gap-5",
    lg: "gap-3 sm:gap-5 md:gap-6",
  };

  return (
    <div
      className={`grid ${gridClasses[effectiveColumns as keyof typeof gridClasses]} ${gapClasses[gap]} w-full`}
    >
      {stats.map((stat, index) => (
        <StatCard key={`${stat.title}-${index}`} {...stat} />
      ))}
    </div>
  );
};