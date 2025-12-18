import React, { useState, useEffect, useCallback } from "react";
import api from '../../components/auth/api'

// Icon for "Check/Mark as Read"
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// Icon for "Bell"
const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" />
  </svg>
);

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval}y ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval}mo ago`;
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval}d ago`;
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval}h ago`;
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval}m ago`;
  return `Just now`;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const [notifResponse, countResponse] = await Promise.all([
        api.get("/employee/notifications"),
        api.get("/employee/notifications/unread-count"),
      ]);
      setNotifications(notifResponse.data.notifications);
      setUnreadCount(countResponse.data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark ALL as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/employee/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Mark SINGLE as read
  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/employee/notification/${id}/read`);
      
      // Update local state immediately for UI responsiveness
      setNotifications((prev) => 
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
      
      // Decrease count locally
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><BellIcon /></span>
                Notifications
              </h1>
              <p className="text-gray-500 text-sm mt-1 ml-12">
                You have {unreadCount} unread messages
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
               <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === 'all' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === 'unread' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Unread
              </button>
            </div>
            
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="hidden md:block text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Mark all as read
            </button>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`group relative flex items-start gap-4 p-5 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    notif.isRead 
                      ? "bg-white border-gray-100" 
                      : "bg-white border-blue-100 shadow-sm ring-1 ring-blue-50"
                  }`}
                >
                  {/* Status Dot */}
                  <div className="mt-2">
                    {!notif.isRead ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm ring-4 ring-blue-50"></div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className={`text-sm md:text-base leading-relaxed ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        title="Mark as read"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <CheckIcon />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <BellIcon />
                </div>
                <p className="text-gray-500 font-medium">No notifications found.</p>
                {filter === 'unread' && <button onClick={() => setFilter('all')} className="text-blue-500 text-sm mt-2 hover:underline">View all notifications</button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};