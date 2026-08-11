import { toast } from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { notificationEndpoints } from "../apis";

const {
  GET_ALL_NOTIFICATIONS_API,
  GET_UNREAD_NOTIFICATIONS_API,
  GET_UNREAD_COUNT_API,
  MARK_AS_READ_API,
  MARK_ALL_AS_READ_API,
  DELETE_NOTIFICATION_API,
  DELETE_ALL_NOTIFICATIONS_API,
} = notificationEndpoints;

// =============================================
// GET ALL NOTIFICATIONS
// =============================================
export const getAllNotifications = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_NOTIFICATIONS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to fetch notifications");
    }

    return response.data;
  } catch (error) {
    return { success: false, data: [] };
  }
};

// =============================================
// GET UNREAD NOTIFICATIONS
// =============================================
export const getUnreadNotifications = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_UNREAD_NOTIFICATIONS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to fetch unread notifications");
    }

    return response.data;
  } catch (error) {
    return { success: false, data: [] };
  }
};

// =============================================
// GET UNREAD COUNT
// =============================================
export const getUnreadCount = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_UNREAD_COUNT_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to fetch unread count");
    }

    return response.data;
  } catch (error) {
    return { success: false, data: { count: 0 } };
  }
};

// =============================================
// MARK NOTIFICATION AS READ
// =============================================
export const markNotificationAsRead = async (notificationId, token) => {
  try {
    const response = await apiConnector(
      "PUT",
      MARK_AS_READ_API(notificationId),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to mark notification as read");
    }

    return response.data;
  } catch (error) {
    return { success: false };
  }
};

// =============================================
// MARK ALL NOTIFICATIONS AS READ
// =============================================
export const markAllNotificationsAsRead = async (token) => {
  try {
    const response = await apiConnector(
      "PUT",
      MARK_ALL_AS_READ_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to mark all as read");
    }

    toast.success("All notifications marked as read");
    return response.data;
  } catch (error) {
    toast.error("Failed to mark all as read");
    return { success: false };
  }
};

// =============================================
// DELETE NOTIFICATION
// =============================================
export const deleteNotification = async (notificationId, token) => {
  try {
    const response = await apiConnector(
      "DELETE",
      DELETE_NOTIFICATION_API(notificationId),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to delete notification");
    }

    return response.data;
  } catch (error) {
    toast.error("Failed to delete notification");
    return { success: false };
  }
};

// =============================================
// DELETE ALL NOTIFICATIONS
// =============================================
export const deleteAllNotifications = async (token) => {
  const toastId = toast.loading("Clearing all notifications...");
  try {
    const response = await apiConnector(
      "DELETE",
      DELETE_ALL_NOTIFICATIONS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to delete all notifications");
    }

    toast.success("All notifications cleared", { id: toastId });
    return response.data;
  } catch (error) {
    toast.error("Failed to clear notifications", { id: toastId });
    return { success: false };
  }
};
