// src/components/notifications/NotificationDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  FaBell,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaExternalLinkAlt,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { NotificationManagementModal } from './NotificationManagementModal';

// ─── types ────────────────────────────────────────────────────────────────────

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    navigationLink?: string;
    creatorName?: string;
    creatorAgentCode?: string;
    [key: string]: string | undefined;
  };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateString: string): string {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

type IconMeta = { icon: React.ReactNode; dotColor: string };

function getTypeMeta(type: string): IconMeta {
  switch (type) {
    case 'success':
      return { icon: <FaCheck />, dotColor: 'var(--color-success)' };
    case 'error':
      return { icon: <FaTimes />, dotColor: 'var(--color-error)' };
    case 'warning':
      return { icon: <FaExclamationTriangle />, dotColor: 'var(--color-warning)' };
    default:
      return { icon: <FaInfoCircle />, dotColor: 'var(--color-info)' };
  }
}

// ─── notification item ────────────────────────────────────────────────────────

interface ItemProps {
  notification: Notification;
  expanded: boolean;
  onToggleExpand: () => void;
  onClick: () => void;
}

const NotificationItem: React.FC<ItemProps> = ({
  notification,
  expanded,
  onToggleExpand,
  onClick,
}) => {
  const meta = getTypeMeta(notification.type);
  const shouldTruncate = notification.message.length > 100;
  const creatorName = notification.metadata?.creatorName;
  const creatorCode = notification.metadata?.creatorAgentCode;
  const creatorLabel =
    creatorName && creatorCode
      ? `${creatorName} (${creatorCode})`
      : creatorName || creatorCode || null;

  return (
    <div className="nd-item" data-unread={!notification.read ? 'true' : undefined}>
      {!notification.read && (
        <span className="nd-item__bar" style={{ background: meta.dotColor }} />
      )}

      {/* type icon */}
      <span
        className="nd-item__icon"
        style={{ color: meta.dotColor, background: `color-mix(in srgb, ${meta.dotColor} 12%, transparent)` }}
      >
        {meta.icon}
      </span>

      {/* content */}
      <div className="nd-item__body">
        <div className="nd-item__top">
          <button className="nd-item__title" onClick={onClick}>
            {notification.title}
            {notification.metadata?.navigationLink && (
              <FaExternalLinkAlt className="nd-item__link-icon" />
            )}
          </button>
          <div className="nd-item__meta">
            <time className="nd-item__time">{timeAgo(notification.createdAt)}</time>
            {!notification.read && (
              <span className="nd-item__dot" style={{ background: meta.dotColor }} />
            )}
          </div>
        </div>

        {creatorLabel && (
          <p className="nd-item__creator">{creatorLabel}</p>
        )}

        <p className="nd-item__message">
          {expanded || !shouldTruncate
            ? notification.message
            : `${notification.message.substring(0, 100)}…`}
        </p>

        {shouldTruncate && (
          <button
            className="nd-item__expand"
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
          >
            {expanded ? 'Show less' : 'Show more'}
            {expanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── main component ───────────────────────────────────────────────────────────

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const handleClick = async (n: Notification) => {
    await markAsRead(n._id);
    if (n.metadata?.navigationLink) {
      navigate(n.metadata.navigationLink);
      setIsOpen(false);
    }
  };

  const visibleNotifications = notifications.slice(0, 10);
  const overflow = notifications.length - 10;

  return (
    <>
      {/* scoped styles */}
      <style>{`
        /* ── palette ── */
        .nd-wrap {
          --nd-bg: var(--color-surface);
          --nd-surface: var(--color-gray-100);
          --nd-border: var(--color-border);
          --nd-text: var(--color-text);
          --nd-muted: var(--color-muted-text);
          --nd-accent: var(--color-primary-500);
          --nd-accent-bg: var(--color-primary-50);
          --nd-row-hover: var(--color-control-bg);
          --nd-divider: var(--color-border);
          --nd-shadow: 0 12px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07);
          --nd-radius: 16px;
        }

        body.theme-dark .nd-wrap {
          --nd-bg: var(--color-surface);
          --nd-surface: rgba(255,255,255,0.04);
          --nd-border: var(--color-border);
          --nd-text: var(--color-text);
          --nd-muted: var(--color-muted-text);
          --nd-accent: var(--color-primary-400);
          --nd-accent-bg: rgba(59,130,246,0.1);
          --nd-row-hover: rgba(255,255,255,0.05);
          --nd-divider: var(--color-border);
          --nd-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.25);
        }

        /* ── bell button ── */
        .nd-bell {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--nd-text);
          cursor: pointer;
          transition: background 0.15s;
        }
        .nd-bell:hover { background: var(--nd-row-hover); }
        .nd-bell svg { width: 18px; height: 18px; }

        /* unread badge */
        .nd-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          border-radius: 99px;
          background: var(--color-error);
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--nd-bg);
          line-height: 1;
        }

        /* ── mobile backdrop ── */
        .nd-backdrop {
          position: fixed;
          inset: 0;
          z-index: 49;
          background: rgba(0,0,0,0.25);
          backdrop-filter: blur(2px);
        }
        @media (min-width: 640px) { .nd-backdrop { display: none; } }

        /* ── panel ── */
        .nd-panel {
          position: fixed;
          left: 12px;
          right: 12px;
          top: 64px;
          z-index: 60;
          background: var(--nd-bg);
          border: 0.5px solid var(--nd-border);
          border-radius: var(--nd-radius);
          box-shadow: var(--nd-shadow);
          color: var(--nd-text);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 80px);
          animation: nd-drop 0.18s cubic-bezier(.22,.68,0,1.2) both;
        }
        @media (min-width: 640px) {
          .nd-panel {
            position: absolute;
            left: auto;
            right: 0;
            top: calc(100% + 8px);
            width: 26rem;
            max-height: 72vh;
          }
        }

        @keyframes nd-drop {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── header ── */
        .nd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px 12px;
          border-bottom: 0.5px solid var(--nd-divider);
          flex-shrink: 0;
        }
        .nd-header-left {
          display: flex;
          align-items: baseline;
          gap: 7px;
        }
        .nd-header-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--nd-text);
        }
        .nd-header-count {
          font-size: 12px;
          font-weight: 500;
          color: var(--nd-muted);
        }
        .nd-mark-all {
          font-size: 12px;
          font-weight: 500;
          color: var(--nd-accent);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 7px;
          transition: background 0.12s;
        }
        .nd-mark-all:hover { background: var(--nd-accent-bg); }

        /* ── list ── */
        .nd-list {
          flex: 1;
          overflow-y: auto;
          overscroll-behavior: contain;
        }
        .nd-list::-webkit-scrollbar { width: 3px; }
        .nd-list::-webkit-scrollbar-thumb { background: var(--nd-divider); border-radius: 99px; }

        /* ── states ── */
        .nd-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 40px 24px;
          text-align: center;
          color: var(--nd-muted);
        }
        .nd-state-icon {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: var(--nd-surface);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          opacity: 0.5;
        }
        .nd-state-title { font-size: 13px; font-weight: 600; color: var(--nd-text); }
        .nd-state-sub { font-size: 12px; }

        /* ── item ── */
        .nd-item {
          position: relative;
          display: flex;
          gap: 10px;
          padding: 12px 16px;
          border-bottom: 0.5px solid var(--nd-divider);
          transition: background 0.12s;
        }
        .nd-item:last-child { border-bottom: none; }
        .nd-item:hover { background: var(--nd-row-hover); }
        .nd-item[data-unread] { background: color-mix(in srgb, var(--nd-accent-bg) 60%, transparent); }
        .nd-item[data-unread]:hover { background: var(--nd-accent-bg); }

        .nd-item__bar {
          position: absolute;
          left: 0;
          top: 12px;
          bottom: 12px;
          width: 3px;
          border-radius: 99px;
        }

        .nd-item__icon {
          flex-shrink: 0;
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px;
        }

        .nd-item__body { flex: 1; min-width: 0; }

        .nd-item__top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 2px;
        }

        .nd-item__title {
          font-size: 13px;
          font-weight: 600;
          color: var(--nd-text);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-align: left;
          line-height: 1.3;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: color 0.12s;
        }
        .nd-item__title:hover { color: var(--nd-accent); }

        .nd-item__link-icon {
          width: 10px; height: 10px;
          color: var(--nd-accent);
          flex-shrink: 0;
        }

        .nd-item__meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .nd-item__time {
          font-size: 11px;
          color: var(--nd-muted);
          white-space: nowrap;
        }
        .nd-item__dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .nd-item__creator {
          font-size: 11px;
          color: var(--nd-muted);
          margin-bottom: 4px;
        }

        .nd-item__message {
          font-size: 12.5px;
          color: var(--color-secondary-text, var(--nd-muted));
          line-height: 1.5;
        }

        .nd-item__expand {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          color: var(--nd-accent);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-top: 4px;
        }
        .nd-item__expand svg { width: 10px; height: 10px; }

        /* ── footer ── */
        .nd-footer {
          border-top: 0.5px solid var(--nd-divider);
          padding: 10px 12px;
          flex-shrink: 0;
        }
        .nd-view-all {
          width: 100%;
          padding: 8px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--nd-accent);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.12s;
        }
        .nd-view-all:hover { background: var(--nd-accent-bg); }
        .nd-view-all-extra {
          font-size: 11px;
          color: var(--nd-muted);
          font-weight: 400;
        }
      `}</style>

      <div className="nd-wrap" style={{ position: 'relative' }} ref={dropdownRef}>

        {/* ── BELL ─────────────────────────────────────────────────── */}
        <button
          ref={buttonRef}
          className="nd-bell"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Notifications"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <FaBell />
          {unreadCount > 0 && (
            <span className="nd-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* ── DROPDOWN ─────────────────────────────────────────────── */}
        {isOpen && (
          <>
            <div className="nd-backdrop" onClick={() => setIsOpen(false)} aria-hidden="true" />

            <div className="nd-panel" role="dialog" aria-label="Notifications">

              {/* header */}
              <div className="nd-header">
                <div className="nd-header-left">
                  <span className="nd-header-title">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="nd-header-count">{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button className="nd-mark-all" onClick={() => markAllAsRead()}>
                    Mark all read
                  </button>
                )}
              </div>

              {/* list */}
              <div className="nd-list">
                {isLoading ? (
                  <div className="nd-state">
                    <FaSpinner style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
                    <p className="nd-state-sub">Loading…</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="nd-state">
                    <div className="nd-state-icon"><FaBell /></div>
                    <p className="nd-state-title">All caught up</p>
                    <p className="nd-state-sub">No notifications to show.</p>
                  </div>
                ) : (
                  visibleNotifications.map((n) => (
                    <NotificationItem
                      key={n._id}
                      notification={n}
                      expanded={expanded.has(n._id)}
                      onToggleExpand={() => toggleExpand(n._id)}
                      onClick={() => handleClick(n)}
                    />
                  ))
                )}
              </div>

              {/* footer */}
              {notifications.length > 0 && (
                <div className="nd-footer">
                  <button
                    className="nd-view-all"
                    onClick={() => { setIsOpen(false); setShowModal(true); }}
                  >
                    View all notifications
                    {overflow > 0 && (
                      <span className="nd-view-all-extra">+{overflow} more</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* management modal */}
      <NotificationManagementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};