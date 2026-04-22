import { forwardRef, createContext, useContext } from "react";
import type {
  ReactNode,
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

// View Mode
export type TableViewMode = "table" | "list" | "auto";

// Context for View Mode
const TableContext = createContext<{ viewMode: TableViewMode }>({
  viewMode: "auto",
});

const useTableContext = () => useContext(TableContext);

// Table variants
type TableVariant = "simple" | "striped" | "bordered";

// Table sizes
type TableSize = "sm" | "md" | "lg";

// Table color schemes
type TableColorScheme =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "gray";

// Base table props
interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  variant?: TableVariant;
  size?: TableSize;
  colorScheme?: TableColorScheme;
  fullWidth?: boolean;
  stickyHeader?: boolean;
  className?: string;
  useThemeColor?: boolean;
  viewMode?: TableViewMode;
}

// Table header props
interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
  className?: string;
}

// Table body props
interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
  className?: string;
}

// Table row props
interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  className?: string;
  isSelected?: boolean;
  isHoverable?: boolean;
}

// Table header cell props
interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
}

// Table cell props
interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
  numeric?: boolean;
  label?: string; // Optional label for mobile card view
}

// Table caption props
interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {
  children: ReactNode;
  className?: string;
}

// Main Table component
export const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      children,
      variant = "simple",
      size = "md",
      colorScheme = "default",
      fullWidth = true,
      stickyHeader = false,
      className = "",
      useThemeColor = true,
      viewMode = "auto",
      ...props
    },
    ref
  ) => {
    // Size classes
    const sizeClasses = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };

    // Helper function to get theme-based color classes
    const getThemeColorClasses = () => {
      return {
        border: "border-[var(--color-border)]",
        headerBg: "bg-[var(--color-primary-50)]",
        headerText: "text-[var(--color-primary-900)]",
        stripedBg: "even:bg-[var(--color-primary-50)]",
        selectedBg: "bg-[var(--color-primary-100)]",
        hoverBg: "hover:bg-[var(--color-primary-50)]",
      };
    };

    const getSemanticColorClasses = (
      scheme: TableColorScheme
    ): {
      border: string;
      headerBg: string;
      headerText: string;
      stripedBg: string;
      selectedBg: string;
      hoverBg: string;
    } => {
      switch (scheme) {
        case "success":
          return {
            border: "border-green-200",
            headerBg: "bg-green-50",
            headerText: "text-green-900",
            stripedBg: "even:bg-green-25",
            selectedBg: "bg-green-100",
            hoverBg: "hover:bg-green-50",
          };
        case "warning":
          return {
            border: "border-yellow-200",
            headerBg: "bg-yellow-50",
            headerText: "text-yellow-900",
            stripedBg: "even:bg-yellow-25",
            selectedBg: "bg-yellow-100",
            hoverBg: "hover:bg-yellow-50",
          };
        case "error":
          return {
            border: "border-red-200",
            headerBg: "bg-red-50",
            headerText: "text-red-900",
            stripedBg: "even:bg-red-25",
            selectedBg: "bg-red-100",
            hoverBg: "hover:bg-red-50",
          };
        case "info":
          return {
            border: "border-blue-200",
            headerBg: "bg-blue-50",
            headerText: "text-blue-900",
            stripedBg: "even:bg-blue-25",
            selectedBg: "bg-blue-100",
            hoverBg: "hover:bg-blue-50",
          };
        case "gray":
          return {
            border: "border-gray-200",
            headerBg: "bg-gray-50",
            headerText: "text-gray-900",
            stripedBg: "even:bg-gray-25",
            selectedBg: "bg-gray-100",
            hoverBg: "hover:bg-gray-50",
          };
        case "default":
        default:
          return getThemeColorClasses();
      }
    };

    // Get color classes
    const getColorClasses = () => {
      if (colorScheme === "default" && useThemeColor) {
        return getThemeColorClasses();
      }
      return getSemanticColorClasses(colorScheme);
    };

    // Variant classes
    const getVariantClasses = () => {
      const colors = getColorClasses();

      switch (variant) {
        case "simple":
          return "border-collapse";
        case "striped":
          return `border-collapse [&_tbody_tr:nth-child(even)]:bg-[var(--color-primary-50)]`;
        case "bordered":
          return `border-collapse border ${colors.border}`;
        default:
          return "border-collapse";
      }
    };

    const getViewModeClasses = () => {
      switch (viewMode) {
        case "list":
          return "block w-full"; // Force block
        case "table":
          return "table"; // Force table
        case "auto":
        default:
          return "block sm:table w-full"; // Block on mobile, table on desktop
      }
    };

    const tableClasses = [
      "table-auto",
      sizeClasses[size],
      getVariantClasses(),
      fullWidth ? "w-full" : "",
      getViewModeClasses(),
      className,
    ].join(" ");

    return (
      <TableContext.Provider value={{ viewMode }}>
        <div className={`rounded-[16px] overflow-hidden ${stickyHeader ? "overflow-auto" : ""} ${variant === "bordered" ? "border border-[var(--color-border)]" : ""}`}>
          <table ref={ref} className={tableClasses} {...props}>
            {children}
          </table>
        </div>
      </TableContext.Provider>
    );
  }
);

// Table Header component
export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ children, className = "", ...props }, ref) => {
  const { viewMode } = useTableContext();

  const getHeaderClasses = () => {
    switch (viewMode) {
      case "list":
        return "hidden"; // Hide header in list mode
      case "table":
        return "table-header-group";
      case "auto":
      default:
        return "hidden sm:table-header-group"; // Hide on mobile, show on desktop
    }
  };

  return (
    <thead ref={ref} className={`${getHeaderClasses()} ${className}`} {...props}>
      {children}
    </thead>
  );
});

// Table Body component
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className = "", ...props }, ref) => {
    const { viewMode } = useTableContext();

    const getBodyClasses = () => {
      switch (viewMode) {
        case "list":
          return "block w-full"; // Block layout
        case "table":
          return "table-row-group";
        case "auto":
        default:
          return "block sm:table-row-group w-full"; // Block on mobile, table on desktop
      }
    };

    return (
      <tbody ref={ref} className={`${getBodyClasses()} ${className}`} {...props}>
        {children}
      </tbody>
    );
  }
);

// Table Row component
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  (
    {
      children,
      className = "",
      isSelected = false,
      isHoverable = true,
      ...props
    },
    ref
  ) => {
    const { viewMode } = useTableContext();

    const getRowClasses = () => {
      switch (viewMode) {
        case "list":
          return "block w-full p-4 mb-4 bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] rounded-[16px] last:mb-0";
        case "table":
          return "table-row border-b border-[var(--color-border)]";
        case "auto":
        default:
          return "block w-full p-4 mb-4 bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] rounded-[16px] last:mb-0 sm:table-row sm:bg-transparent sm:shadow-none sm:border sm:rounded-none sm:p-0 sm:mb-0 sm:border-b sm:border-[var(--color-border)]";
      }
    };

    const rowClasses = [
      getRowClasses(),
      isHoverable ? "hover:bg-[var(--color-border)]/20" : "",
      isSelected ? "bg-[var(--color-primary-100)]" : "",
      "transition-colors duration-150",
      className,
    ].join(" ");

    return (
      <tr ref={ref} className={rowClasses} {...props}>
        {children}
      </tr>
    );
  }
);

// Table Header Cell component
export const TableHeaderCell = forwardRef<
  HTMLTableCellElement,
  TableHeaderCellProps
>(
  (
    {
      children,
      className = "",
      sortable = false,
      sortDirection = null,
      onSort,
      ...props
    },
    ref
  ) => {
    const { viewMode } = useTableContext();

    const getThemeColors = () => {
      return "bg-[var(--color-primary-50)] text-[var(--color-primary-900)]";
    };

    const getHeaderCellClasses = () => {
      switch (viewMode) {
        case "list":
          return "hidden"; // Hidden in list
        case "table":
          return "table-cell";
        case "auto":
        default:
          return "hidden sm:table-cell"; // Hidden on mobile, cell on desktop
      }
    };

    const headerClasses = [
      getHeaderCellClasses(),
      "px-4 py-3",
      "text-left text-xs font-medium uppercase tracking-wider",
      getThemeColors(),
      "border-b border-[var(--color-border)]",
      sortable ? "cursor-pointer hover:bg-opacity-80 select-none" : "",
      className,
    ].join(" ");

    const handleClick = () => {
      if (sortable && onSort) {
        onSort();
      }
    };

    return (
      <th ref={ref} className={headerClasses} onClick={handleClick} {...props}>
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          {sortable && (
            <span className="ml-1">
              {(() => {
                if (sortDirection === "asc") {
                  return (
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  );
                } else if (sortDirection === "desc") {
                  return (
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  );
                } else {
                  return (
                    <svg
                      className="w-3 h-3 opacity-50"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5 12l5-5 5 5H5z" />
                    </svg>
                  );
                }
              })()}
            </span>
          )}
        </div>
      </th>
    );
  }
);

// Table Cell component
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className = "", numeric = false, label, ...props }, ref) => {
    const { viewMode } = useTableContext();

    const getCellBaseClasses = () => {
      switch (viewMode) {
        case "list":
          return "flex justify-between items-center w-full py-2 px-0 text-sm bg-transparent border-b border-[var(--color-border)] last:border-0";
        case "table":
          return "table-cell px-4 py-3 text-sm border-b border-[var(--color-border)]";
        case "auto":
        default:
          return "flex justify-between items-center py-2 px-0 text-sm border-b border-[var(--color-border)] last:border-0 sm:table-cell sm:px-4 sm:py-3 sm:border-[var(--color-border)] sm:last:border-b"; // flex on mobile, table-cell on desktop
      }
    };

    const cellClasses = [
      getCellBaseClasses(),
      "text-[var(--color-text)]",
      numeric && viewMode !== "list" ? "sm:text-right font-mono" : "text-left",
      className,
    ].join(" ");

    return (
      <td ref={ref} className={cellClasses} {...props}>
        {label && (
          <span className={`text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide mr-4 ${viewMode === "list" ? "block" : viewMode === "auto" ? "block sm:hidden" : "hidden"}`}>
            {label}
          </span>
        )}
        <div className={`flex-grow ${viewMode !== "table" && numeric ? (viewMode === "list" ? "text-right" : "text-right sm:text-left") : ""} ${numeric && viewMode !== "list" ? "sm:text-right font-mono" : ""}`}>
          {children}
        </div>
      </td>
    );
  }
);

// Table Caption component
export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ children, className = "", ...props }, ref) => {
  return (
    <caption
      ref={ref}
      className={`text-sm text-[var(--color-muted-text)] text-left py-2 ${className}`}
      {...props}
    >
      {children}
    </caption>
  );
});

// Set display names
Table.displayName = "Table";
TableHeader.displayName = "TableHeader";
TableBody.displayName = "TableBody";
TableRow.displayName = "TableRow";
TableHeaderCell.displayName = "TableHeaderCell";
TableCell.displayName = "TableCell";
TableCaption.displayName = "TableCaption";
