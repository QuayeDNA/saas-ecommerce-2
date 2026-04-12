// src/components/notifications/NotificationManagementModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Card,
  Pagination,
  Badge,
  Spinner,
  Alert
} from '../../design-system';
import {
  FaBell,
  FaCheck,
  FaTimes,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaFilter,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../services/notification.service';

interface NotificationManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationManagementModal: React.FC<NotificationManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    fetchAllNotifications,
    deleteNotification,
    deleteMultipleNotifications,
    clearReadNotifications,
    clearAllNotifications,
    markAsRead,
    markAsUnread
  } = useNotifications();

  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    skip: number;
    total: number;
    pages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load all notifications
  const loadNotifications = useCallback(async (page = 1, filterType = filter) => {
    setIsLoading(true);
    setError(null);

    try {
      const readFilter = filterType === 'read' ? true : filterType === 'unread' ? false : undefined;
      const result = await fetchAllNotifications(page, 20, readFilter);
      setAllNotifications(result.notifications || []);
      setPagination(result.pagination || null);
    } catch {
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllNotifications, filter]);

  // Load notifications when modal opens or filter changes
  useEffect(() => {
    if (isOpen) {
      loadNotifications(1, filter);
    }
  }, [isOpen, filter]);

  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'read' | 'unread') => {
    setFilter(newFilter);
    setCurrentPage(1);
    setSelectedNotifications([]);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadNotifications(page, filter);
  };

  // Handle notification selection
  const handleNotificationSelect = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedNotifications.length === allNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(allNotifications.filter(n => n?._id).map(n => n?._id));
    }
  };

  // Handle delete selected
  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notification(s)?`)) {
      await deleteMultipleNotifications(selectedNotifications);
      setSelectedNotifications([]);
      loadNotifications(currentPage, filter);
    }
  };

  // Handle clear read
  const handleClearRead = async () => {
    if (window.confirm('Are you sure you want to clear all read notifications?')) {
      await clearReadNotifications();
      loadNotifications(currentPage, filter);
    }
  };

  // Handle clear all
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      await clearAllNotifications();
      setAllNotifications([]);
      setSelectedNotifications([]);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Navigate if navigation link exists
    if (notification.metadata?.navigationLink) {
      navigate(notification.metadata.navigationLink);
      onClose();
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getCreatorLabel = (notification: Notification) => {
    const creatorName = notification.metadata?.creatorName;
    const creatorAgentCode = notification.metadata?.creatorAgentCode;
    if (!creatorName && !creatorAgentCode) return null;
    if (creatorName && creatorAgentCode) {
      return `${creatorName} (${creatorAgentCode})`;
    }
    return creatorName || creatorAgentCode || null;
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FaCheck className="w-4 h-4 text-green-500" />;
      case 'error':
        return <FaTimes className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <FaTimes className="w-4 h-4 text-yellow-500" />;
      default:
        return <FaBell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      className="sm:max-w-3xl sm:rounded-[24px] h-full sm:h-auto"
      overlayClassName="bg-slate-900/80"
    >
      <DialogHeader className="px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 truncate">Notifications</h3>
            <p className="text-xs text-slate-500">Manage alerts and history</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearRead}
              disabled={isLoading}
              className="text-xs px-2 py-1 text-slate-100 hover:text-white"
            >
              Clear read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoading}
              className="text-xs px-2 py-1 text-slate-100 hover:text-white"
            >
              Clear all
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close notifications"
              className="text-slate-100 hover:text-white p-1"
            >
              <FaTimes className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogHeader>

      <DialogBody className="px-4 py-3 sm:px-5 sm:py-4 overflow-hidden bg-white">
        <div className="flex min-h-0 flex-col gap-3">
          <Card variant="outlined" size="sm" className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <FaFilter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Filter</span>
              </div>

              {selectedNotifications.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>{selectedNotifications.length} selected</span>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleDeleteSelected}
                    disabled={isLoading}
                    className="text-xs px-2 py-1"
                  >
                    <FaTrash className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant={filter === 'all' ? 'primary' : 'secondary'}
                onClick={() => handleFilterChange('all')}
                className="text-sm"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === 'unread' ? 'primary' : 'secondary'}
                onClick={() => handleFilterChange('unread')}
                className="text-sm"
              >
                Unread
              </Button>
              <Button
                size="sm"
                variant={filter === 'read' ? 'primary' : 'secondary'}
                onClick={() => handleFilterChange('read')}
                className="text-sm"
              >
                Read
              </Button>
            </div>
          </Card>

          {error && (
            <Alert status="error" className="text-sm">
              {error}
            </Alert>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <div className="flex h-full min-h-[220px] items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <Spinner size="lg" />
                  <p className="text-sm text-slate-500">Loading notifications…</p>
                </div>
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 py-8 text-center">
                <FaBell className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-medium text-slate-900">No notifications found</p>
                <p className="text-xs text-slate-500">You're all caught up.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === allNotifications.length && allNotifications.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium">Select all ({allNotifications.length})</span>
                  </div>
                  {selectedNotifications.length > 0 && (
                    <span className="text-xs text-slate-500">{selectedNotifications.length} selected</span>
                  )}
                </div>

                <div className="space-y-2">
                  {allNotifications.map((notification) => {
                    const creatorLabel = getCreatorLabel(notification);
                    return (
                      <Card
                        key={notification._id}
                        variant="outlined"
                        size="sm"
                        className={!notification.read ? 'ring-1 ring-blue-200 bg-blue-50/20' : ''}
                      >
                        <div className="flex gap-3">
                          <div className="flex flex-col items-start gap-2 pt-1">
                            <input
                              type="checkbox"
                              checked={selectedNotifications.includes(notification._id)}
                              onChange={() => handleNotificationSelect(notification._id)}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            {!notification.read && (
                              <Badge size="sm" colorScheme="info">
                                New
                              </Badge>
                            )}
                          </div>

                          <div className="flex-shrink-0 pt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0 py-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <h4 className="text-sm font-semibold text-slate-900 truncate">
                                  {notification.title}
                                </h4>
                                {creatorLabel && (
                                  <p className="text-xs text-slate-500 truncate">
                                    {creatorLabel}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 whitespace-nowrap">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-slate-600 leading-6 line-clamp-3">
                              {notification.message}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleNotificationClick(notification)}
                                className="text-xs px-2 py-1 text-slate-700"
                              >
                                <FaExternalLinkAlt className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => notification.read ? markAsUnread(notification._id) : markAsRead(notification._id)}
                                className="text-xs px-2 py-1 text-slate-700"
                              >
                                {notification.read ? (
                                  <>
                                    <FaEyeSlash className="w-3 h-3 mr-1" />
                                    Mark unread
                                  </>
                                ) : (
                                  <>
                                    <FaEye className="w-3 h-3 mr-1" />
                                    Mark read
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotification(notification._id)}
                                className="text-xs px-2 py-1 text-red-600"
                              >
                                <FaTrash className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="border-t border-slate-200 pt-3">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                itemsPerPage={20}
                onPageChange={handlePageChange}
                showPerPageSelector={false}
                size="sm"
                variant="compact"
              />
            </div>
          )}
        </div>
      </DialogBody>

      <DialogFooter justify="end" className="px-4 py-3 sm:px-5 sm:py-4">
        <Button variant="secondary" size="sm" onClick={onClose} className="w-full sm:w-auto text-sm">
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}; 