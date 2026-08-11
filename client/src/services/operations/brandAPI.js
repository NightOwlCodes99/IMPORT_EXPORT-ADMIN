import { toast } from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { brandEndpoints } from "../apis";

const {
  GET_ALL_BRANDS_API,
  GET_BRAND_STATS_API,
  GET_BRAND_BY_ID_API,
  CREATE_BRAND_API,
  UPDATE_BRAND_API,
  DELETE_BRAND_API,
  TOGGLE_BRAND_ACTIVE_API,
  TOGGLE_BRAND_FEATURED_API,
  UPLOAD_BRAND_LOGO_API,
} = brandEndpoints;

// Get all brands (Admin)
export const getAllBrands = async (token, params = {}) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_BRANDS_API,
      null,
      { Authorization: `Bearer ${token}` },
      params
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to fetch brands");
    throw error;
  }
};

// Get brand statistics (Admin)
export const getBrandStats = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_BRAND_STATS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to fetch brand stats");
    throw error;
  }
};

// Get brand by ID (Admin)
export const getBrandById = async (brandId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_BRAND_BY_ID_API(brandId),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to fetch brand");
    throw error;
  }
};

// Create brand (Admin)
export const createBrand = async (brandData, token) => {
  const toastId = toast.loading("Creating brand...");
  try {
    const response = await apiConnector(
      "POST",
      CREATE_BRAND_API,
      brandData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Brand created successfully!");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to create brand");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Update brand (Admin)
export const updateBrand = async (brandId, brandData, token) => {
  const toastId = toast.loading("Updating brand...");
  try {
    const response = await apiConnector(
      "PUT",
      UPDATE_BRAND_API(brandId),
      brandData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Brand updated successfully!");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to update brand");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Delete brand (Admin)
export const deleteBrand = async (brandId, token) => {
  const toastId = toast.loading("Deleting brand...");
  try {
    const response = await apiConnector(
      "DELETE",
      DELETE_BRAND_API(brandId),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Brand deleted successfully!");
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to delete brand");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Toggle brand active status (Admin)
export const toggleBrandActive = async (brandId, token) => {
  const toastId = toast.loading("Updating brand status...");
  try {
    const response = await apiConnector(
      "PATCH",
      TOGGLE_BRAND_ACTIVE_API(brandId),
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message);
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to update brand status");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

// Toggle brand featured status (Admin)
export const toggleBrandFeatured = async (brandId, token) => {
  const toastId = toast.loading("Updating featured status...");
  try {
    const response = await apiConnector(
      "PATCH",
      TOGGLE_BRAND_FEATURED_API(brandId),
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

// Upload brand logo (Admin)
export const uploadBrandLogo = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append("logo", file);

    const response = await apiConnector(
      "POST",
      UPLOAD_BRAND_LOGO_API,
      formData,
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data; // Returns { public_id, url }
  } catch (error) {toast.error(error.response?.data?.message || "Failed to upload logo");
    throw error;
  }
};
