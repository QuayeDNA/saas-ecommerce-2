import { forwardRef, useEffect, type ReactNode } from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  mode?: "dialog" | "bottom-sheet";
  closeOnOverlay?: boolean;
  className?: string;
  overlayClassName?: string;
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      isOpen,
      onClose,
      children,
      size = "md",
      mode = "dialog",
      closeOnOverlay = true,
      className = "",
      overlayClassName = "bg-black/50",
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      full: mode === "bottom-sheet" ? "w-full" : "max-w-full mx-4",
    };

    const isBottomSheet = mode === "bottom-sheet";

    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape" && isOpen) {
          onClose();
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
      return () => {
        document.body.style.overflow = "unset";
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div className={`fixed inset-0 z-[100] flex ${isBottomSheet ? 'items-end' : 'items-center'} justify-center`}>
        <div
          className={[
            "absolute inset-0 transition-opacity",
            overlayClassName,
          ].join(" ")}
          onClick={closeOnOverlay ? onClose : undefined}
        />
        <div
          ref={ref}
          className={[
            `relative w-full bg-[var(--color-surface)] shadow-xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all pb-safe-area animate-slide-in-from-bottom`,
            isBottomSheet ? 'rounded-t-[32px] rounded-b-none' : 'rounded-lg',
            sizeClasses[size],
            className,
          ].join(" ")}
          role="dialog"
          aria-modal="true"
        >
          {isBottomSheet && (
            <div className="w-full flex items-center justify-center pt-4 pb-2" aria-hidden="true" onClick={onClose} style={{ cursor: 'pointer' }}>
              <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-[10px]" />
            </div>
          )}
          {children}
        </div>
      </div>
    );
  }
);

Dialog.displayName = "Dialog";
