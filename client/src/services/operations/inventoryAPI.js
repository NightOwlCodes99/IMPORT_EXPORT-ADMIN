import { toast } from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { inventoryEndpoints } from "../apis";

const {
  GET_INVENTORY_OVERVIEW_API,
  GET_INVENTORY_ITEMS_API,
  UPDATE_STOCK_API,
  ADD_STOCK_API,
  REDUCE_STOCK_API,
  BULK_UPDATE_STOCK_API,
  GET_STOCK_HISTORY_API,
  EXPORT_INVENTORY_API,
  GET_LOW_STOCK_ALERTS_API,
} = inventoryEndpoints;

// ============================================
// OVERVIEW & STATS
// ============================================

// Get inventory overview with stats
export const getInventoryOverview = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_INVENTORY_OVERVIEW_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to fetch inventory overview");
    throw error;
  }
};

// ============================================
// INVENTORY ITEMS
// ============================================

// Get all inventory items with filters
export const getInventoryItems = async (token, params = {}) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_INVENTORY_ITEMS_API,
      null,
      { Authorization: `Bearer ${token}` },
      params
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to fetch inventory items");
    throw error;
  }
};

// ============================================
// STOCK OPERATIONS
// ============================================

// Update stock for a product
export const updateStock = async (productId, stockData, token) => {
  try {
    const response = await apiConnector(
      "PUT",
      UPDATE_STOCK_API(productId),
      stockData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message || "Stock updated successfully");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to update stock");
    throw error;
  }
};

// Add stock (new arrival)
export const addStock = async (productId, stockData, token) => {
  try {
    const response = await apiConnector(
      "POST",
      ADD_STOCK_API(productId),
      stockData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message || "Stock added successfully");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to add stock");
    throw error;
  }
};

// Reduce stock
export const reduceStock = async (productId, stockData, token) => {
  try {
    const response = await apiConnector(
      "POST",
      REDUCE_STOCK_API(productId),
      stockData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message || "Stock reduced successfully");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to reduce stock");
    throw error;
  }
};

// Bulk update stock for multiple products
export const bulkUpdateStock = async (updates, token) => {
  try {
    const response = await apiConnector(
      "PUT",
      BULK_UPDATE_STOCK_API,
      { updates },
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message || "Bulk stock update completed");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to perform bulk update");
    throw error;
  }
};

// ============================================
// HISTORY & REPORTS
// ============================================

// Get stock history for a product
export const getStockHistory = async (productId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_STOCK_HISTORY_API(productId),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to fetch stock history");
    throw error;
  }
};

// Export inventory report
export const exportInventory = async (format = 'json', token) => {
  try {
    const response = await apiConnector(
      "GET",
      EXPORT_INVENTORY_API,
      null,
      { Authorization: `Bearer ${token}` },
      { format }
    );

    if (format === 'csv') {
      // Handle CSV download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Inventory exported successfully");
      return { success: true };
    }

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to export inventory");
    throw error;
  }
};

// ============================================
// ALERTS
// ============================================

// Get low stock alerts
export const getLowStockAlerts = async (token, threshold = 10) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_LOW_STOCK_ALERTS_API,
      null,
      { Authorization: `Bearer ${token}` },
      { threshold }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to fetch low stock alerts");
    throw error;
  }
};
