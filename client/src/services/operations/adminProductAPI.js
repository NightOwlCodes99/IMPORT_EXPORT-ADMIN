import { toast } from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { adminEndpoints } from "../apis";
import axios from "axios";

const {
  GET_ALL_PRODUCTS_API,
  GET_PRODUCT_STATS_API,
  GET_PRODUCT_BY_ID_API,
  CREATE_PRODUCT_API,
  UPLOAD_PRODUCT_IMAGE_API,
  UPDATE_PRODUCT_API,
  DELETE_PRODUCT_API,
  APPROVE_PRODUCT_API,
  REJECT_PRODUCT_API,
  TOGGLE_PRODUCT_ACTIVE_API,
  TOGGLE_PRODUCT_FEATURED_API,
} = adminEndpoints;

// Get all products (Admin)
export const getAllAdminProducts = async (token, params = {}) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_PRODUCTS_API,
      null,
      { Authorization: `Bearer ${token}` },
      params
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to fetch products");
    throw error;
  }
};

// Get product statistics (Admin)
export const getProductStats = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_PRODUCT_STATS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to fetch product stats");
    throw error;
  }
};

// Get single product by ID (Admin)
export const getAdminProductById = async (id, token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_PRODUCT_BY_ID_API(id),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to fetch product");
    throw error;
  }
};

// Update product (Admin)
export const updateAdminProduct = async (id, productData, token) => {
  const toastId = toast.loading("Updating product...");
  try {
    const response = await apiConnector(
      "PUT",
      UPDATE_PRODUCT_API(id),
      productData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Product updated successfully!");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to update product");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Delete product (Admin)
export const deleteAdminProduct = async (id, token) => {
  const toastId = toast.loading("Deleting product...");
  try {
    const response = await apiConnector(
      "DELETE",
      DELETE_PRODUCT_API(id),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Product deleted successfully!");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to delete product");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Approve product (Admin)
export const approveProduct = async (id, token) => {
  const toastId = toast.loading("Approving product...");
  try {
    const response = await apiConnector(
      "PUT",
      APPROVE_PRODUCT_API(id),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Product approved successfully!");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to approve product");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Reject product (Admin)
export const rejectProduct = async (id, token) => {
  const toastId = toast.loading("Rejecting product...");
  try {
    const response = await apiConnector(
      "PUT",
      REJECT_PRODUCT_API(id),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Product rejected successfully!");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to reject product");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Toggle product active status (Admin)
export const toggleProductActive = async (id, token) => {
  const toastId = toast.loading("Updating product status...");
  try {
    const response = await apiConnector(
      "PATCH",
      TOGGLE_PRODUCT_ACTIVE_API(id),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message || "Product status updated!");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to update product status");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Upload single product image (Admin) - uploads immediately to Cloudinary
export const uploadProductImage = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(UPLOAD_PRODUCT_IMAGE_API, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data; // Returns { public_id, url }
  } catch (error) {toast.error(error.response?.data?.message || "Failed to upload image");
    throw error;
  }
};

// Create product (Admin)
export const createAdminProduct = async (productData, token) => {
  const toastId = toast.loading("Creating product...");
  try {
    const response = await apiConnector(
      "POST",
      CREATE_PRODUCT_API,
      productData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Product created successfully!");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to create product");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Toggle product featured status (Admin)
export const toggleProductFeatured = async (productId, token) => {
  const toastId = toast.loading("Updating featured status...");
  try {
    const response = await apiConnector(
      "PATCH",
      TOGGLE_PRODUCT_FEATURED_API(productId),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message);
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to update featured status");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Update product summary (Admin)
export const updateProductSummary = async (productId, summary, token) => {
  const toastId = toast.loading("Updating product summary...");
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/products/${productId}/summary`,
      { summary },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Product summary updated successfully!");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to update product summary");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};
