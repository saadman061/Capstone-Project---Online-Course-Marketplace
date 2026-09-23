import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { notificationAPI } from '../api/client';
import { RootState } from '../redux/store';

interface NotificationItem {
  notificationId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationBell: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getMine();
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggle = () => {
    const next = !showDropdown;
    setShowDropdown(next);
    if (next) {
      fetchNotifications();
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    try {
      await notificationAPI.markRead(notificationId);
      setNotifications(notifications.map(n =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative text-gray-700 hover:text-secondary text-lg"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-20 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <span className="font-bold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-secondary hover:text-primary font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-500 text-center">No notifications yet</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.notificationId}
                onClick={() => handleMarkRead(n.notificationId)}
                className={`block w-full text-left px-4 py-3 text-sm border-b last:border-b-0 hover:bg-gray-50 ${
                  n.isRead ? 'text-gray-500' : 'text-gray-900 font-medium bg-blue-50'
                }`}
              >
                <p>{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
