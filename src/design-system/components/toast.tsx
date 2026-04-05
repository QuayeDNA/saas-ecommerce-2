/**
 * Toast — DirectData design system
 *
 * Visual spec:
 *   • Dark #1a1a2e pill, border-radius 14px
 *   • Left: semantic icon (lucide) in brand color
 *   • Center: white 13px DM Sans 500 message
 *   • Right: × close button
 *   • Bottom edge: progress drain bar (Framer Motion width 100%→0%)
 *   • Slides down from top safe area on mobile, top-right on desktop
 *
 * FIX: Framer Motion transition.duration expects SECONDS.
 *      The duration prop is stored in milliseconds (e.g. 5000).
 *      The progress bar transition now uses `duration / 1000`.
 */

/* eslint-disable react-refresh/only-export-components */

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheckBig, CircleAlert, TriangleAlert, Info, X } from "lucide-react";
import { createPortal } from "react-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface QueuedToast {
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  toasts: Toast[];
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ─── Design tokens ────────────────────────────────────────────────────────────

const TOAST_ICON_COLOR: Record<ToastType, string> = {
  success: "var(--color-success-icon)",
  error:   "var(--color-error)",
  warning: "var(--color-warning)",
  info:    "var(--color-info)",
};

const TOAST_BAR_COLOR: Record<ToastType, string> = {
  success: "var(--color-success-icon)",
  error:   "var(--color-error)",
  warning: "var(--color-warning)",
  info:    "var(--color-info)",
};

const TOAST_ICON: Record<ToastType, typeof CircleCheckBig> = {
  success: CircleCheckBig,
  error:   CircleAlert,
  warning: TriangleAlert,
  info:    Info,
};

// ─── Session queue (for toasts fired before the provider mounts) ──────────────

const QUEUED_TOASTS_KEY   = "__dd_queued_toasts__";
const QUEUED_TOASTS_EVENT = "toast:flush-queued";

const readQueuedToasts = (): QueuedToast[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(QUEUED_TOASTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedToast[];
    sessionStorage.removeItem(QUEUED_TOASTS_KEY);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    sessionStorage.removeItem(QUEUED_TOASTS_KEY);
    return [];
  }
};

export const queueToast = (message: string, type: ToastType, duration = 5000) => {
  if (typeof window === "undefined") return;
  try {
    const raw      = sessionStorage.getItem(QUEUED_TOASTS_KEY);
    const existing = raw ? (JSON.parse(raw) as QueuedToast[]) : [];
    sessionStorage.setItem(
      QUEUED_TOASTS_KEY,
      JSON.stringify([...(Array.isArray(existing) ? existing : []), { message, type, duration }]),
    );
    window.dispatchEvent(new CustomEvent(QUEUED_TOASTS_EVENT));
  } catch { /* silently ignore */ }
};

// ─── Container responsive styles ─────────────────────────────────────────────

const CONTAINER_CSS = `
  ._dd_tc {
    position: fixed;
    top: calc(env(safe-area-inset-top, 0px) + 64px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    width: calc(100% - 32px);
    max-width: 400px;
    pointer-events: none;
  }
  @media (min-width: 768px) {
    ._dd_tc {
      left: auto;
      right: 16px;
      top: 16px;
      transform: none;
      align-items: flex-end;
    }
  }
`;

// ─── ToastItem ────────────────────────────────────────────────────────────────

interface ToastItemProps extends Toast {
  onClose: (id: string) => void;
}

const ToastItem = ({ id, message, type, duration = 5000, onClose }: ToastItemProps) => {
  const Icon = TOAST_ICON[type];

  const handleClose = useCallback(() => onClose(id), [id, onClose]);

  // Auto-dismiss — duration is in ms, setTimeout is in ms ✓
  useEffect(() => {
    const t = window.setTimeout(handleClose, duration);
    return () => window.clearTimeout(t);
  }, [duration, handleClose]);

  return (
    <motion.div
      role="alert"
      aria-live="assertive"
      layout
      initial={{ opacity: 0, y: -14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0,   scale: 1    }}
      exit={{    opacity: 0, y: -10,  scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex w-full items-center gap-3 overflow-hidden rounded-[14px] border border-white/10 bg-[#1a1a2e] px-3.5 py-3 text-white shadow-[0_8px_24px_rgba(0,0,0,0.22),0_2px_8px_rgba(0,0,0,0.12)]"
      style={{ pointerEvents: "auto" }}
    >
      {/* Icon */}
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0"
        style={{ color: TOAST_ICON_COLOR[type] }}
        strokeWidth={2.25}
      />

      {/* Message */}
      <span className="min-w-0 flex-1 break-words text-[13px] font-medium leading-5 text-white/95">
        {message}
      </span>

      {/* Close button */}
      <button
        onClick={handleClose}
        type="button"
        aria-label="Dismiss"
        className="ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" strokeWidth={2.5} />
      </button>

      {/*
       * Progress drain bar
       *
       * BUG FIXED: Framer Motion's transition.duration is in SECONDS.
       * The duration prop is in MILLISECONDS (e.g. 5000 ms = 5 s).
       * Previously this was `duration: duration` which told Framer to
       * animate over 5000 seconds — making the bar appear completely frozen.
       *
       * Fix: divide by 1000 → `duration: duration / 1000`
       */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-0.5 rounded-b-[14px]"
        style={{ backgroundColor: TOAST_BAR_COLOR[type], opacity: 0.72 }}
        initial={{ width: "100%" }}
        animate={{ width: "0%"   }}
        transition={{
          duration: duration / 1000, // ← ms → seconds
          ease: "linear",
        }}
      />
    </motion.div>
  );
};

// ─── ToastContainer ───────────────────────────────────────────────────────────

const ToastContainer = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  const { toasts, removeToast } = context;

  return createPortal(
    <>
      <style>{CONTAINER_CSS}</style>
      <div className="_dd_tc" aria-label="Notifications">
        <AnimatePresence initial={false} mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} {...toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </>,
    document.body,
  );
};

// ─── ToastProvider ────────────────────────────────────────────────────────────

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, duration = 5000) => {
      const id = Math.random().toString(36).substring(2);
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      // Safety net — item's own timer fires first in practice
      setTimeout(() => removeToast(id), duration + 500);
    },
    [removeToast],
  );

  // Flush any toasts queued before the provider mounted (e.g. during auth redirect)
  useEffect(() => {
    const flush = () => {
      const queued = readQueuedToasts();
      if (!queued.length) return;
      setToasts((prev) => [
        ...prev,
        ...queued.map((t) => ({
          id: Math.random().toString(36).substring(2),
          message:  t.message,
          type:     t.type,
          duration: t.duration,
        })),
      ]);
    };

    flush();
    window.addEventListener(QUEUED_TOASTS_EVENT, flush);
    return () => window.removeEventListener(QUEUED_TOASTS_EVENT, flush);
  }, []);

  const contextValue = useMemo(() => {
    const showToast = (message: string, type: ToastType = "info", duration?: number) =>
      addToast(message, type, duration);
    return { toasts, addToast, removeToast, showToast };
  }, [toasts, addToast, removeToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) throw new Error("useToast must be used within a ToastProvider");
  return context;
};