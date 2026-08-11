import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastFetched: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationLoading: (state, action) => {
      state.loading = action.payload;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.loading = false;
      state.error = null;
      state.lastFetched = Date.now();
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    markOneAsRead: (state, action) => {
      const notifId = action.payload;
      const notification = state.notifications.find(n => n._id === notifId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead: (state) => {
      state.notifications.forEach(n => {
        n.isRead = true;
        n.readAt = new Date().toISOString();
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action) => {
      const notifId = action.payload;
      const notification = state.notifications.find(n => n._id === notifId);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n._id !== notifId);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    setNotificationError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    resetNotifications: () => initialState,
  },
});

export const {
  setNotificationLoading,
  setNotifications,
  setUnreadCount,
  markOneAsRead,
  markAllRead,
  removeNotification,
  clearAllNotifications,
  addNotification,
  setNotificationError,
  resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
