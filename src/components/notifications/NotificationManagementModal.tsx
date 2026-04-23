// src/components/notifications/NotificationManagementModal.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  Dialog,
  Pagination,
  Spinner,
} from '../../design-system';
import {
  FaBell,
  FaCheck,
  FaTimes,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaExternalLinkAlt,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../services/notification.service';

interface NotificationManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── tiny helpers ─────────────────────────────────────────────────────────────

type FilterType = 'all' | 'read' | 'unread';
type NotifType = 'success' | 'error' | 'warning' | 'info';

const TYPE_META: Record<
  NotifType,
  { icon: React.ReactNode; pill: string; dot: string }
> = {
  success: {
    icon: <FaCheck />,
    pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  error: {
    icon: <FaTimes />,
    pill: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    dot: 'bg-red-500',
  },
  warning: {
    icon: <FaExclamationTriangle />,
    pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    dot: 'bg-amber-400',
  },
  info: {
    icon: <FaInfoCircle />,
    pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
};

function getMeta(type: string) {
  return TYPE_META[type as NotifType] ?? TYPE_META.info;
}

function timeAgo(dateString: string) {
  const diff = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 60000
  );
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

// ─── single notification row ──────────────────────────────────────────────────

interface RowProps {
  notification: Notification;
  selected: boolean;
  onSelect: () => void;
  onView: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
}

const NotificationRow: React.FC<RowProps> = ({
  notification,
  selected,
  onSelect,
  onView,
  onToggleRead,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const meta = getMeta(notification.type);
  const creatorName = notification.metadata?.creatorName;
  const creatorCode = notification.metadata?.creatorAgentCode;
  const creatorLabel =
    creatorName && creatorCode
      ? `${creatorName} (${creatorCode})`
      : creatorName || creatorCode || null;

  return (
    <div
      className={[
        'nm-row group relative flex gap-3 rounded-xl px-4 py-3 transition-all duration-200',
        selected
          ? 'nm-row--selected'
          : 'hover:nm-row--hover',
        !notification.read ? 'nm-row--unread' : '',
      ].join(' ')}
    >
      {/* unread accent bar */}
      {!notification.read && (
        <span className="nm-unread-bar absolute left-0 top-3 bottom-3 w-[3px] rounded-full" />
      )}

      {/* checkbox */}
      <label className="nm-checkbox-wrap flex items-start pt-[3px] cursor-pointer select-none">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="nm-checkbox sr-only"
        />
        <span className="nm-checkbox-box flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors">
          {selected && <FaCheck className="h-2.5 w-2.5" />}
        </span>
      </label>

      {/* icon badge */}
      <span className={`nm-type-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] ${meta.pill}`}>
        {meta.icon}
      </span>

      {/* content */}
      <div className="min-w-0 flex-1">
        <button
          className="w-full text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="nm-title text-sm font-semibold leading-snug">
              {notification.title}
            </p>
            <time className="nm-time shrink-0 text-[11px] leading-snug mt-[2px]">
              {timeAgo(notification.createdAt)}
            </time>
          </div>
          {creatorLabel && (
            <p className="nm-creator text-[11px] mt-0.5 truncate">
              {creatorLabel}
            </p>
          )}
          <p
            className={`nm-body mt-1.5 text-xs leading-relaxed ${
              expanded ? '' : 'line-clamp-2'
            }`}
          >
            {notification.message}
          </p>
        </button>

        {/* action strip */}
        <div className="nm-actions mt-2.5 flex flex-wrap items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {notification.metadata?.navigationLink && (
            <button onClick={onView} className="nm-action-btn nm-action-btn--view">
              <FaExternalLinkAlt className="h-2.5 w-2.5" />
              View
            </button>
          )}
          <button onClick={onToggleRead} className="nm-action-btn">
            {notification.read ? (
              <>
                <FaEyeSlash className="h-2.5 w-2.5" />
                Mark unread
              </>
            ) : (
              <>
                <FaEye className="h-2.5 w-2.5" />
                Mark read
              </>
            )}
          </button>
          <button onClick={onDelete} className="nm-action-btn nm-action-btn--delete">
            <FaTrash className="h-2.5 w-2.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── main modal ───────────────────────────────────────────────────────────────

export const NotificationManagementModal: React.FC<
  NotificationManagementModalProps
> = ({ isOpen, onClose }) => {
  const {
    fetchAllNotifications,
    deleteNotification,
    deleteMultipleNotifications,
    clearReadNotifications,
    clearAllNotifications,
    markAsRead,
    markAsUnread,
  } = useNotifications();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<{
    page: number; limit: number; skip: number; total: number; pages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (page = 1, f: FilterType = filter) => {
      setIsLoading(true);
      setError(null);
      try {
        const readFilter = f === 'read' ? true : f === 'unread' ? false : undefined;
        const res = await fetchAllNotifications(page, 20, readFilter);
        setNotifications(res.notifications || []);
        setPagination(res.pagination || null);
      } catch {
        setError('Failed to load notifications. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAllNotifications, filter]
  );

  useEffect(() => {
    if (isOpen) load(1, filter);
  }, [isOpen, filter]);

  const changeFilter = (f: FilterType) => {
    setFilter(f);
    setCurrentPage(1);
    setSelected([]);
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const allIds = notifications.filter((n) => n?._id).map((n) => n._id);
  const allSelected = allIds.length > 0 && selected.length === allIds.length;

  const handleSelectAll = () =>
    setSelected(allSelected ? [] : allIds);

  const handleDeleteSelected = async () => {
    if (!selected.length) return;
    if (window.confirm(`Delete ${selected.length} notification(s)?`)) {
      await deleteMultipleNotifications(selected);
      setSelected([]);
      load(currentPage, filter);
    }
  };

  const handleClearRead = async () => {
    if (window.confirm('Clear all read notifications?')) {
      await clearReadNotifications();
      load(currentPage, filter);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear ALL notifications? This cannot be undone.')) {
      await clearAllNotifications();
      setNotifications([]);
      setSelected([]);
    }
  };

  const handleView = async (n: Notification) => {
    if (!n.read) await markAsRead(n._id);
    if (n.metadata?.navigationLink) {
      navigate(n.metadata.navigationLink);
      onClose();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* scoped styles */}
      <style>{`
        /* ── palette ── */
        .nm-modal {
          --nm-bg: var(--color-surface);
          --nm-surface: var(--color-gray-50);
          --nm-border: var(--color-border);
          --nm-text: var(--color-text);
          --nm-muted: var(--color-muted-text);
          --nm-accent: var(--color-primary-500);
          --nm-accent-light: var(--color-primary-50);
          --nm-accent-hover: var(--color-primary-600);
          --nm-danger: var(--color-error);
          --nm-danger-bg: #fef2f2;
          --nm-unread-bar: var(--color-primary-400);
          --nm-row-hover: var(--color-gray-100);
          --nm-row-selected: var(--color-primary-50);
          --nm-row-unread-bg: color-mix(in srgb, var(--color-primary-50) 60%, transparent);
          --nm-shadow: 0 8px 40px rgba(0,0,0,0.14);
        }

        /* dark-mode overrides via body class */
        body.theme-dark .nm-modal {
          --nm-bg: var(--color-surface);
          --nm-surface: #0f172a;
          --nm-border: var(--color-border);
          --nm-text: var(--color-text);
          --nm-muted: var(--color-muted-text);
          --nm-accent: var(--color-primary-400);
          --nm-accent-light: rgba(59,130,246,0.12);
          --nm-accent-hover: var(--color-primary-300);
          --nm-danger: #f87171;
          --nm-danger-bg: rgba(239,68,68,0.12);
          --nm-unread-bar: var(--color-primary-400);
          --nm-row-hover: rgba(255,255,255,0.04);
          --nm-row-selected: rgba(59,130,246,0.12);
          --nm-row-unread-bg: rgba(59,130,246,0.06);
          --nm-shadow: 0 8px 40px rgba(0,0,0,0.45);
        }

        /* ── shell ── */
        .nm-shell {
          background: var(--nm-bg);
          color: var(--nm-text);
          display: flex;
          flex-direction: column;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--nm-shadow);
        }

        /* ── header ── */
        .nm-header {
          background: var(--nm-bg);
          border-bottom: 1px solid var(--nm-border);
          padding: 18px 20px 14px;
          flex-shrink: 0;
        }
        .nm-header-row1 {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }
        .nm-title-block {}
        .nm-heading {
          font-size: 1rem;
          font-weight: 700;
          color: var(--nm-text);
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .nm-subheading {
          font-size: 0.72rem;
          color: var(--nm-muted);
          margin-top: 2px;
        }
        .nm-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--nm-accent);
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          border-radius: 99px;
          padding: 2px 8px;
          margin-left: 8px;
          vertical-align: middle;
        }
        .nm-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .nm-hdr-btn {
          font-size: 11px;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 8px;
          border: 1px solid var(--nm-border);
          background: transparent;
          color: var(--nm-muted);
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .nm-hdr-btn:hover {
          color: var(--nm-text);
          background: var(--nm-row-hover);
        }
        .nm-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 9px;
          border: 1px solid var(--nm-border);
          background: transparent;
          color: var(--nm-muted);
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .nm-close-btn:hover {
          background: var(--nm-row-hover);
          color: var(--nm-text);
        }

        /* ── filter tabs ── */
        .nm-tabs {
          display: flex;
          gap: 4px;
          background: var(--nm-surface);
          border-radius: 10px;
          padding: 3px;
        }
        .nm-tab {
          flex: 1;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          color: var(--nm-muted);
          background: transparent;
          white-space: nowrap;
        }
        .nm-tab--active {
          background: var(--nm-bg);
          color: var(--nm-text);
          font-weight: 600;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        body.theme-dark .nm-tab--active {
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }

        /* ── body / list ── */
        .nm-body {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: var(--nm-bg);
          padding: 0;
        }

        .nm-bulk-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 20px;
          border-bottom: 1px solid var(--nm-border);
          font-size: 12px;
          background: var(--nm-surface);
          flex-shrink: 0;
        }
        .nm-select-all-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--nm-muted);
          cursor: pointer;
          user-select: none;
        }
        .nm-select-all-label input[type="checkbox"] { display: none; }
        .nm-checkbox-box2 {
          width: 15px;
          height: 15px;
          border: 1.5px solid var(--nm-border);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          color: #fff;
          font-size: 9px;
          flex-shrink: 0;
        }
        .nm-checkbox-box2--checked {
          background: var(--nm-accent);
          border-color: var(--nm-accent);
        }
        .nm-delete-selected {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 7px;
          border: 1.5px solid var(--nm-danger);
          color: var(--nm-danger);
          background: var(--nm-danger-bg);
          cursor: pointer;
          transition: all 0.15s;
        }
        .nm-delete-selected:hover {
          filter: brightness(1.08);
        }

        .nm-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px 12px;
          scroll-behavior: smooth;
        }
        .nm-list::-webkit-scrollbar { width: 4px; }
        .nm-list::-webkit-scrollbar-track { background: transparent; }
        .nm-list::-webkit-scrollbar-thumb { background: var(--nm-border); border-radius: 99px; }

        /* ── row ── */
        .nm-row {
          position: relative;
          display: flex;
          gap: 10px;
          border-radius: 12px;
          padding: 12px 12px 10px;
          margin-bottom: 4px;
          transition: background 0.15s;
          background: transparent;
          cursor: default;
        }
        .nm-row--hover:hover, .nm-row:hover { background: var(--nm-row-hover); }
        .nm-row--selected { background: var(--nm-row-selected) !important; }
        .nm-row--unread { background: var(--nm-row-unread-bg); }
        .nm-unread-bar {
          position: absolute;
          left: 0;
          top: 10px;
          bottom: 10px;
          width: 3px;
          border-radius: 99px;
          background: var(--nm-unread-bar);
        }

        /* checkbox */
        .nm-checkbox-wrap { display: flex; align-items: flex-start; padding-top: 2px; }
        .nm-checkbox { display: none; }
        .nm-checkbox-box {
          width: 15px; height: 15px;
          border: 1.5px solid var(--nm-border);
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          font-size: 9px;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .nm-checkbox:checked + .nm-checkbox-box {
          background: var(--nm-accent);
          border-color: var(--nm-accent);
        }

        /* icon */
        .nm-type-icon {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px;
          flex-shrink: 0;
        }

        /* text */
        .nm-title { font-size: 13px; font-weight: 600; color: var(--nm-text); line-height: 1.3; }
        .nm-time { font-size: 11px; color: var(--nm-muted); }
        .nm-creator { font-size: 11px; color: var(--nm-muted); }
        .nm-body { font-size: 12.5px; color: var(--color-secondary-text, var(--nm-muted)); line-height: 1.55; }

        /* actions */
        .nm-actions { display: flex; flex-wrap: wrap; gap: 4px; }
        .nm-action-btn {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 500;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid var(--nm-border);
          background: var(--nm-bg);
          color: var(--nm-muted);
          cursor: pointer;
          transition: all 0.12s;
        }
        .nm-action-btn:hover { color: var(--nm-text); border-color: var(--nm-text); }
        .nm-action-btn--view:hover { color: var(--nm-accent); border-color: var(--nm-accent); }
        .nm-action-btn--delete { color: var(--nm-danger) !important; }
        .nm-action-btn--delete:hover { border-color: var(--nm-danger); background: var(--nm-danger-bg); }

        /* ── empty / loading states ── */
        .nm-state {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; padding: 48px 24px; text-align: center;
          color: var(--nm-muted);
        }
        .nm-state-icon { font-size: 36px; opacity: 0.3; }
        .nm-state-title { font-size: 14px; font-weight: 600; color: var(--nm-text); }
        .nm-state-sub { font-size: 12px; }

        /* ── error ── */
        .nm-error {
          margin: 10px 20px;
          padding: 10px 14px;
          border-radius: 10px;
          background: var(--nm-danger-bg);
          color: var(--nm-danger);
          font-size: 12.5px;
          border: 1px solid color-mix(in srgb, var(--nm-danger) 20%, transparent);
        }

        /* ── footer ── */
        .nm-footer {
          border-top: 1px solid var(--nm-border);
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-shrink: 0;
          background: var(--nm-bg);
        }
        .nm-footer-meta {
          font-size: 11px;
          color: var(--nm-muted);
        }
        .nm-close-footer {
          font-size: 12px; font-weight: 600;
          padding: 7px 18px;
          border-radius: 9px;
          border: 1px solid var(--nm-border);
          background: transparent;
          color: var(--nm-text);
          cursor: pointer;
          transition: all 0.15s;
        }
        .nm-close-footer:hover { background: var(--nm-row-hover); }

        /* ── pagination wrapper ── */
        .nm-pagination {
          border-top: 1px solid var(--nm-border);
          padding: 8px 16px;
          flex-shrink: 0;
        }

        /* ── mobile ── */
        @media (max-width: 480px) {
          .nm-header { padding: 14px 16px 12px; }
          .nm-hdr-btn { display: none; }
          .nm-list { padding: 6px 8px; }
          .nm-bulk-bar { padding: 8px 14px; }
          .nm-footer { padding: 10px 16px; }
        }

        /* ── animation ── */
        @keyframes nm-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nm-row { animation: nm-fadein 0.18s ease both; }
      `}</style>

      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        className="sm:max-w-[600px] sm:rounded-[20px] h-[70vh] p-0"
        overlayClassName="bg-slate-900/70 backdrop-blur-sm"
      >
        <div className="nm-modal nm-shell">

          {/* ── HEADER ─────────────────────────────────────────────── */}
          <header className="nm-header">
            <div className="nm-header-row1">
              <div className="nm-title-block">
                <h2 className="nm-heading">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="nm-badge">{unreadCount} new</span>
                  )}
                </h2>
                <p className="nm-subheading">Manage your alerts &amp; history</p>
              </div>
              <div className="nm-header-actions">
                <button className="nm-hdr-btn" onClick={handleClearRead} disabled={isLoading}>
                  Clear read
                </button>
                <button className="nm-hdr-btn" onClick={handleClearAll} disabled={isLoading}>
                  Clear all
                </button>
                <button className="nm-close-btn" onClick={onClose} aria-label="Close">
                  <FaTimes style={{ width: 12, height: 12 }} />
                </button>
              </div>
            </div>

            {/* filter tabs */}
            <div className="nm-tabs">
              {(['all', 'unread', 'read'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  className={`nm-tab ${filter === f ? 'nm-tab--active' : ''}`}
                  onClick={() => changeFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </header>

          {/* ── ERROR ─────────────────────────────────────────────── */}
          {error && <div className="nm-error">{error}</div>}

          {/* ── BULK BAR ──────────────────────────────────────────── */}
          {!isLoading && notifications.length > 0 && (
            <div className="nm-bulk-bar">
              <label className="nm-select-all-label">
                <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
                <span className={`nm-checkbox-box2 ${allSelected ? 'nm-checkbox-box2--checked' : ''}`}>
                  {allSelected && <FaCheck />}
                </span>
                <span>
                  {selected.length > 0
                    ? `${selected.length} selected`
                    : `Select all (${notifications.length})`}
                </span>
              </label>

              {selected.length > 0 && (
                <button className="nm-delete-selected" onClick={handleDeleteSelected}>
                  <FaTrash style={{ width: 10, height: 10 }} />
                  Delete {selected.length}
                </button>
              )}
            </div>
          )}

          {/* ── BODY ──────────────────────────────────────────────── */}
          <div className="nm-body">
            {isLoading ? (
              <div className="nm-state">
                <Spinner size="lg" />
                <p className="nm-state-sub">Loading notifications…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="nm-state">
                <FaBell className="nm-state-icon" />
                <p className="nm-state-title">You're all caught up</p>
                <p className="nm-state-sub">No notifications to show.</p>
              </div>
            ) : (
              <div className="nm-list" ref={listRef}>
                {notifications.map((n) => (
                  <NotificationRow
                    key={n._id}
                    notification={n}
                    selected={selected.includes(n._id)}
                    onSelect={() => toggleSelect(n._id)}
                    onView={() => handleView(n)}
                    onToggleRead={() =>
                      n.read ? markAsUnread(n._id) : markAsRead(n._id)
                    }
                    onDelete={() => deleteNotification(n._id)}
                  />
                ))}
              </div>
            )}

            {/* pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="nm-pagination">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.pages}
                  totalItems={pagination.total}
                  itemsPerPage={20}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    load(p, filter);
                  }}
                  showPerPageSelector={false}
                  size="sm"
                  variant="compact"
                />
              </div>
            )}
          </div>

          {/* ── FOOTER ────────────────────────────────────────────── */}
          <footer className="nm-footer">
            <span className="nm-footer-meta">
              {pagination
                ? `${pagination.total} total notification${pagination.total !== 1 ? 's' : ''}`
                : ''}
            </span>
            <button className="nm-close-footer" onClick={onClose}>
              Close
            </button>
          </footer>
        </div>
      </Dialog>
    </>
  );
};