import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, X, Check, CheckCheck, Trash2, ExternalLink, 
  ShoppingCart, CreditCard, Truck, FileText, MessageCircle,
  Star, Package, Info, Gift, Clock, AlertCircle
} from 'lucide-react';
import {
  setNotifications,
  setUnreadCount,
  markOneAsRead,
  markAllRead,
  removeNotification,
  clearAllNotifications,
} from '../../store/slices/notificationSlice';
import {
  getAllNotifications,
  getUnreadCount as fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications as deleteAllNotifAPI,
} from '../../services/operations/notificationAPI';

const NotificationDropdown = ({ variant = 'user' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const [notifsRes, countRes] = await Promise.all([
        getAllNotifications(token),
        fetchUnreadCount(token),
      ]);
      if (notifsRes?.success) {
        dispatch(setNotifications(notifsRes.data || []));
      }
      if (countRes?.success) {
        dispatch(setUnreadCount(countRes.data?.count || 0));
      }
    } catch (error) {
}
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    pollIntervalRef.current = setInterval(fetchNotifications, 30000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle mark as read
  const handleMarkAsRead = async (notifId) => {
    dispatch(markOneAsRead(notifId));
    await markNotificationAsRead(notifId, token);
  };

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    dispatch(markAllRead());
    await markAllNotificationsAsRead(token);
  };

  // Handle delete notification
  const handleDelete = async (e, notifId) => {
    e.stopPropagation();
    dispatch(removeNotification(notifId));
    await deleteNotification(notifId, token);
  };

  // Handle clear all
  const handleClearAll = async () => {
    dispatch(clearAllNotifications());
    await deleteAllNotifAPI(token);
  };

  // Handle notification click - navigate to the link
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Get icon for notification type
  const getNotifIcon = (type) => {
    const iconMap = {
      'order': ShoppingCart,
      'payment': CreditCard,
      'shipment': Truck,
      'quote': FileText,
      'message': MessageCircle,
      'review': Star,
      'product': Package,
      'system': Info,
      'promotion': Gift,
    };
    return iconMap[type] || Bell;
  };

  // Get color for notification type
  const getNotifColor = (type) => {
    const colorMap = {
      'order': 'bg-blue-100 text-blue-600',
      'payment': 'bg-green-100 text-green-600',
      'shipment': 'bg-purple-100 text-purple-600',
      'quote': 'bg-amber-100 text-amber-600',
      'message': 'bg-cyan-100 text-cyan-600',
      'review': 'bg-yellow-100 text-yellow-600',
      'product': 'bg-orange-100 text-orange-600',
      'system': 'bg-gray-100 text-gray-600',
      'promotion': 'bg-pink-100 text-pink-600',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-600';
  };

  // Format relative time
  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const isAdmin = variant === 'admin';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      {isAdmin ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-all relative"
        >
          <i className="fas fa-bell text-slate-600 text-sm"></i>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 hover:bg-teal-900/50 rounded-lg transition-colors"
        >
          <Bell size={22} className="text-teal-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-slate-900 animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div className="fixed inset-0 bg-black/30 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
          
          <div className={`
            fixed sm:absolute 
            inset-x-2 sm:inset-x-auto sm:right-0 
            top-16 sm:top-auto sm:mt-2 
            w-auto sm:w-[380px] md:w-[420px] 
            max-h-[70vh] sm:max-h-[520px] 
            bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden 
            ${isAdmin ? '' : 'ring-1 ring-black/5'}
          `}
            style={{ animation: 'fadeInDown 0.2s ease-out' }}
          >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-gray-700 hidden sm:block" />
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 text-xs font-semibold flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  <span className="hidden sm:inline">Read all</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500 text-xs font-semibold flex items-center gap-1"
                  title="Clear all"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[50vh] sm:max-h-[380px] divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-8 sm:py-12 px-4 sm:px-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bell size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No notifications yet</p>
                <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const NotifIcon = getNotifIcon(notif.type);
                const colorClass = getNotifColor(notif.type);
                
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`
                      flex items-start gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-3.5 cursor-pointer transition-all duration-200 group
                      ${notif.isRead 
                        ? 'bg-white hover:bg-gray-50' 
                        : 'bg-blue-50/40 hover:bg-blue-50/70 border-l-3 border-l-blue-500'
                      }
                    `}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <NotifIcon size={16} className="sm:hidden" />
                      <NotifIcon size={18} className="hidden sm:block" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notif.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                          <button
                            onClick={(e) => handleDelete(e, notif._id)}
                            className="p-1 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <X size={12} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock size={10} />
                          {formatTime(notif.createdAt)}
                        </span>
                        {notif.link && (
                          <span className="text-[11px] text-blue-500 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={10} />
                            View
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 sm:px-5 py-3 bg-gradient-to-r from-gray-50 to-white">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate(isAdmin ? '/admin/notifications' : '/dashboard/notifications');
                }}
                className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
        </>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .border-l-3 {
          border-left-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
