import { toast } from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { adminEndpoints } from "../apis";

const {
  GET_ALL_QUOTES_API,
  GET_QUOTE_STATS_API,
  GET_QUOTE_BY_ID_API,
  CREATE_ADMIN_QUOTE_API,
  UPDATE_QUOTE_STATUS_API,
  SEND_QUOTE_RESPONSE_API,
  ADMIN_ACCEPT_QUOTE_API,
  ASSIGN_QUOTE_API,
  CONVERT_QUOTE_TO_ORDER_API,
  DELETE_QUOTE_API,
  CONTACT_BUYER_API,
} = adminEndpoints;

// Create RFQ (Admin)
export const createAdminQuote = async (quoteData, token) => {
  const toastId = toast.loading("Creating RFQ...");
  try {
    const response = await apiConnector(
      "POST",
      CREATE_ADMIN_QUOTE_API,
      quoteData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("RFQ created successfully");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to create RFQ");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Get all quotes with filters
export const getAllQuotes = async (token, params = {}) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_QUOTES_API,
      null,
      { Authorization: `Bearer ${token}` },
      params
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to fetch quotes");
    throw error;
  }
};

// Get quote statistics
export const getQuoteStats = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_QUOTE_STATS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {throw error;
  }
};

// Get single quote by ID
export const getQuoteById = async (quoteId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_QUOTE_BY_ID_API(quoteId),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to fetch quote");
    throw error;
  }
};

// Update quote status
export const updateQuoteStatus = async (quoteId, status, token) => {
  const toastId = toast.loading("Updating status...");
  try {
    const response = await apiConnector(
      "PATCH",
      UPDATE_QUOTE_STATUS_API(quoteId),
      { status },
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Status updated successfully");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to update status");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Send quote response to customer
export const sendQuoteResponse = async (quoteId, responseData, token) => {
  const toastId = toast.loading("Sending quote response...");
  try {
    const response = await apiConnector(
      "POST",
      SEND_QUOTE_RESPONSE_API(quoteId),
      responseData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Quote response sent successfully");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to send response");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Admin directly accepts quote
export const adminAcceptQuote = async (quoteId, data, token) => {
  const toastId = toast.loading("Accepting quote...");
  try {
    const response = await apiConnector(
      "POST",
      ADMIN_ACCEPT_QUOTE_API(quoteId),
      data,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Quote accepted successfully! Ready to convert to order.");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to accept quote");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Assign quote to admin/user
export const assignQuote = async (quoteId, userId, token) => {
  const toastId = toast.loading("Assigning quote...");
  try {
    const response = await apiConnector(
      "PATCH",
      ASSIGN_QUOTE_API(quoteId),
      { assignedTo: userId },
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Quote assigned successfully");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to assign quote");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Delete quote
export const deleteQuote = async (quoteId, token) => {
  const toastId = toast.loading("Deleting quote...");
  try {
    const response = await apiConnector(
      "DELETE",
      DELETE_QUOTE_API(quoteId),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Quote deleted successfully");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to delete quote");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Convert quote to order
export const convertQuoteToOrder = async (quoteId, orderData, token) => {
  const toastId = toast.loading("Converting quote to order...");
  try {
    const response = await apiConnector(
      "POST",
      CONVERT_QUOTE_TO_ORDER_API(quoteId),
      orderData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Quote converted to order successfully!");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to convert quote to order");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Contact buyer via email
export const contactBuyer = async (quoteId, contactData, token) => {
  const toastId = toast.loading("Sending email to buyer...");
  try {
    const response = await apiConnector(
      "POST",
      CONTACT_BUYER_API(quoteId),
      contactData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message || "Email sent successfully!");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to send email");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};
