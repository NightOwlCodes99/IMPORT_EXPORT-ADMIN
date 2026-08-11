import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Trash2, CheckCheck, Filter, Search, 
  ShoppingCart, CreditCard, Truck, FileText, MessageCircle,
  Star, Package, Info, Gift, Clock, ExternalLink, X, AlertCircle
} from 'lucide-react';
import {
  setNotifications,
  setUnreadCount,
  markOneAsRead,
  markAllRead,
  removeNotification,
  clearAllNotifications,
  setNotificationLoading,
} from '../../store/slices/notificationSlice';
import {
  getAllNotifications,
  getUnreadCount as fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications as deleteAllNotifAPI,
} from '../../services/operations/notificationAPI';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.role === 'admin';

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    dispatch(setNotificationLoading(true));
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
    } catch (error) {} finally {
      dispatch(setNotificationLoading(false));
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

  // Handle delete
  const handleDelete = async (notifId) => {
    dispatch(removeNotification(notifId));
    await deleteNotification(notifId, token);
  };

  // Handle clear all
  const handleClearAll = async () => {
    dispatch(clearAllNotifications());
    await deleteAllNotifAPI(token);
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Icon for type
  const getNotifIcon = (type) => {
    const iconMap = {
      order: ShoppingCart, payment: CreditCard, shipment: Truck,
      quote: FileText, message: MessageCircle, review: Star,
      product: Package, system: Info, promotion: Gift,
    };
    return iconMap[type] || Bell;
  };

  // Color for type
  const getNotifColor = (type) => {
    const colorMap = {
      order: 'bg-blue-100 text-blue-600 border-blue-200',
      payment: 'bg-green-100 text-green-600 border-green-200',
      shipment: 'bg-purple-100 text-purple-600 border-purple-200',
      quote: 'bg-amber-100 text-amber-600 border-amber-200',
      message: 'bg-cyan-100 text-cyan-600 border-cyan-200',
      review: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      product: 'bg-orange-100 text-orange-600 border-orange-200',
      system: 'bg-gray-100 text-gray-600 border-gray-200',
      promotion: 'bg-pink-100 text-pink-600 border-pink-200',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // Badge color for type
  const getBadgeColor = (type) => {
    const colorMap = {
      order: 'bg-blue-500', payment: 'bg-green-500', shipment: 'bg-purple-500',
      quote: 'bg-amber-500', message: 'bg-cyan-500', review: 'bg-yellow-500',
      product: 'bg-orange-500', system: 'bg-gray-500', promotion: 'bg-pink-500',
    };
    return colorMap[type] || 'bg-gray-500';
  };

  // Format time
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
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (filterType !== 'all' && notif.type !== filterType) return false;
    if (filterStatus === 'unread' && notif.isRead) return false;
    if (filterStatus === 'read' && !notif.isRead) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return notif.title?.toLowerCase().includes(q) || notif.message?.toLowerCase().includes(q);
    }
    return true;
  });

  // All notification types for the filter
  const notifTypes = ['all', 'order', 'payment', 'shipment', 'quote', 'message', 'review', 'product', 'system', 'promotion'];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${isAdmin ? 'text-slate-900' : 'text-white'}`}>
              Notifications
            </h1>
            <p className={`text-sm mt-1 ${isAdmin ? 'text-slate-500' : 'text-teal-400/70'}`}>
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-semibold text-sm transition-all"
              >
                <CheckCheck size={16} />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-semibold text-sm transition-all"
              >
                <Trash2 size={16} />
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`rounded-2xl border p-4 mb-6 ${isAdmin ? 'bg-white border-gray-200 shadow-sm' : 'bg-slate-800/60 border-teal-700/30'}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isAdmin ? 'text-gray-400' : 'text-teal-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${
                isAdmin
                  ? 'bg-gray-50 border border-gray-200 focus:border-blue-400 text-gray-900 placeholder-gray-400'
                  : 'bg-slate-700/50 border border-teal-700/50 focus:border-teal-400 text-white placeholder-teal-500'
              }`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} className={isAdmin ? 'text-gray-400' : 'text-teal-500'} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            {['all', 'unread', 'read'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filterStatus === status
                    ? isAdmin
                      ? 'bg-blue-600 text-white'
                      : 'bg-teal-600 text-white'
                    : isAdmin
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-slate-700/50 text-teal-400 hover:bg-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Type Pills */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <Filter size={14} className={isAdmin ? 'text-gray-400' : 'text-teal-500'} />
          {notifTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition-all ${
                filterType === type
                  ? isAdmin
                    ? 'bg-blue-600 text-white'
                    : 'bg-teal-600 text-white'
                  : isAdmin
                    ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    : 'bg-slate-700/50 text-teal-400/70 hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className={`rounded-2xl border overflow-hidden ${isAdmin ? 'bg-white border-gray-200 shadow-sm' : 'bg-slate-800/60 border-teal-700/30'}`}>
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className={isAdmin ? 'text-gray-500' : 'text-teal-400'}>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${isAdmin ? 'bg-gray-100' : 'bg-slate-700/50'}`}>
              <Bell size={36} className={isAdmin ? 'text-gray-300' : 'text-teal-700'} />
            </div>
            <p className={`font-semibold text-lg ${isAdmin ? 'text-gray-600' : 'text-teal-300'}`}>
              {notifications.length === 0 ? 'No notifications yet' : 'No matching notifications'}
            </p>
            <p className={`text-sm mt-1 ${isAdmin ? 'text-gray-400' : 'text-teal-500/70'}`}>
              {notifications.length === 0 
                ? 'When you get notifications, they will appear here' 
                : 'Try adjusting your filters'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notif) => {
              const NotifIcon = getNotifIcon(notif.type);
              const colorClass = getNotifColor(notif.type);

              return (
                <div
                  key={notif._id}
                  className={`
                    flex items-start gap-4 px-5 sm:px-6 py-4 cursor-pointer transition-all duration-200 group
                    ${notif.isRead
                      ? isAdmin
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-transparent hover:bg-slate-700/30'
                      : isAdmin
                        ? 'bg-blue-50/50 hover:bg-blue-50 border-l-4 border-l-blue-500'
                        : 'bg-teal-900/20 hover:bg-teal-900/30 border-l-4 border-l-teal-400'
                    }
                  `}
                  onClick={() => handleNotificationClick(notif)}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
                    <NotifIcon size={20} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${
                          notif.isRead
                            ? isAdmin ? 'text-gray-700' : 'text-teal-300/80'
                            : isAdmin ? 'text-gray-900' : 'text-white'
                        }`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white capitalize ${getBadgeColor(notif.type)}`}>
                          {notif.type}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm mt-0.5 ${isAdmin ? 'text-gray-500' : 'text-teal-400/60'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs flex items-center gap-1 ${isAdmin ? 'text-gray-400' : 'text-teal-500/60'}`}>
                        <Clock size={12} />
                        {formatTime(notif.createdAt)}
                      </span>
                      {notif.link && (
                        <span className="text-xs text-blue-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink size={12} />
                          View details
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif._id); }}
                        className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-500 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {filteredNotifications.length > 0 && (
        <div className={`text-center mt-4 text-xs ${isAdmin ? 'text-gray-400' : 'text-teal-500/60'}`}>
          Showing {filteredNotifications.length} of {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
