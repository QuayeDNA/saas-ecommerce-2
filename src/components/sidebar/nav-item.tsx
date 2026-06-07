import { memo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Check } from "lucide-react";
import type { NavItem as NavItemConfig } from "./nav-config";

/* ─── Types ────────────────────────────────────────────────────────────────── */

interface NavItemProps {
  item: NavItemConfig;
  level: number;
  isActive: boolean;
  isExpanded: boolean;
  hasActiveChild: boolean;
  checkActive: (path: string) => boolean;
  onToggle: (path: string) => void;
  onClose: () => void;
  newOrderCount?: number;
  isOrdersPage?: boolean;
}

/* ─── Shared row classes ────────────────────────────────────────────────────
 *
 * Why CSS variables here instead of static Tailwind color utilities?
 * Using `var(--sb-*)` tokens makes the component respond to the sidebar's
 * own token set — no hardcoded colors that break if branding changes.
 *
 * Tokens are defined once in Sidebar.tsx.
 * ─────────────────────────────────────────────────────────────────────────── */

/* Outer row / link container */
const baseRow =
  "group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 " +
  "transition-colors duration-150 " +
  "text-[var(--sb-text-secondary)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sb-accent)] focus-visible:ring-offset-0";

const activeRow =
  "bg-[var(--sb-active-bg)] text-[var(--sb-text-primary)] shadow-sm shadow-[var(--sb-active-shadow)] " +
  "hover:bg-[var(--sb-active-bg)]";

/* Icon container (Caskmaf's 40×40 rounded-2xl wrapper) */
const iconBox =
  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-lg transition-colors duration-150";

const iconActive = "bg-[var(--sb-accent)] text-white";
const iconInactive =
  "bg-[var(--sb-icon-bg)] text-[var(--sb-text-muted)] group-hover:bg-[var(--sb-accent)] group-hover:text-white";

/* Label text */
const labelBase = "text-sm font-semibold truncate";
const labelActive = "text-[var(--sb-text-primary)]";
const labelInactive = "text-[var(--sb-text-secondary)] group-hover:text-[var(--sb-text-primary)]";

/* ─── Active check icon ──────────────────────────────────────────────────── */

const ActiveCheck = () => (
  <Check size={16} className="flex-shrink-0 text-[var(--sb-accent)]" />
);

/* ─── NavItem ───────────────────────────────────────────────────────────── */

export const NavItem = memo(function NavItem({
  item,
  level,
  isActive,
  isExpanded,
  hasActiveChild,
  checkActive,
  onToggle,
  onClose,
  newOrderCount = 0,
  isOrdersPage = false,
}: NavItemProps) {
  const hasChildren = !!item.children?.length;

  /* Parent group (expandable) */
  if (hasChildren) {
    const parentActive = hasActiveChild;

    return (
      <li>
        <button
          type="button"
          onClick={() => onToggle(item.path)}
          aria-expanded={isExpanded}
          className={[
            baseRow,
            parentActive ? activeRow : "hover:bg-[var(--sb-hover-bg)] hover:text-[var(--sb-text-primary)]",
            level > 0 ? "pl-8" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={[iconBox, parentActive ? iconActive : iconInactive].join(" ")}>
            {item.icon}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className={[labelBase, parentActive ? labelActive : labelInactive].join(" ")}>
              {item.label}
            </span>
          </span>
          <ChevronRight
            size={16}
            aria-hidden="true"
            className={[
              "flex-shrink-0 transition-transform duration-200",
              isExpanded ? "rotate-90" : "",
              parentActive
                ? "text-[var(--sb-text-primary)]"
                : "text-[var(--sb-text-muted)] group-hover:text-[var(--sb-text-secondary)]",
            ].join(" ")}
          />
        </button>
        {isExpanded && (
          <ul className="mt-2 space-y-2 pl-8" role="list">
            {item.children!.map((child) => (
              <NavItem
                key={child.path}
                item={child}
                level={level + 1}
                isActive={checkActive(child.path)}
                isExpanded={false}
                hasActiveChild={false}
                checkActive={checkActive}
                onToggle={onToggle}
                onClose={onClose}
                newOrderCount={newOrderCount}
                isOrdersPage={isOrdersPage}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  /* Leaf item (link) */
  const showBadge =
    item.path.includes("/orders") && newOrderCount > 0 && !isActive;

  return (
    <li>
      <Link
        to={item.path}
        onClick={onClose}
        aria-current={isActive ? "page" : undefined}
        className={[
          baseRow,
          isActive ? activeRow : "hover:bg-[var(--sb-hover-bg)] hover:text-[var(--sb-text-primary)]",
          level > 0 ? "pl-8" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={[iconBox, isActive ? iconActive : iconInactive].join(" ")}>
          {item.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className={[labelBase, isActive ? labelActive : labelInactive].join(" ")}>
            {item.label}
          </span>
        </span>
        {showBadge && (
          <span
            className="flex-shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-[var(--color-danger-500)] text-white text-[10px] font-semibold px-1"
          >
            {newOrderCount > 99 ? "99+" : newOrderCount}
          </span>
        )}
        {isActive && <ActiveCheck />}
      </Link>
    </li>
  );
});
