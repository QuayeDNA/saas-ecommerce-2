import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = "",
}) => (
  <div className={`flex flex-col items-center justify-center py-16 gap-3 ${className}`}>
    {icon && (
      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--color-background)]">
        {icon}
      </div>
    )}
    <div className="text-center">
      <p className="font-medium text-[var(--color-text)]">{title}</p>
      {description && (
        <p className="text-sm mt-0.5 text-[var(--color-secondary-text)]">{description}</p>
      )}
    </div>
    {action}
  </div>
);
