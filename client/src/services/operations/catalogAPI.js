import { toast } from "react-hot-toast";
import { apiconnector } from "../apiconnector";
import { catalogEndpoints } from "../apis";

const {
  GET_ALL_CATALOGS_API,
  GET_CATALOG_BY_ID_API,
  GET_FEATURED_CATALOGS_API,
  GET_CATALOGS_BY_CATEGORY_API,
  GET_CATEGORIES_WITH_COUNTS_API,
  DOWNLOAD_CATALOG_API,
  TRACK_CATALOG_VIEW_API,
  GET_ALL_CATALOGS_ADMIN_API,
  GET_CATALOG_STATS_API,
  CREATE_CATALOG_API,
  UPDATE_CATALOG_API,
  DELETE_CATALOG_API,
  UPLOAD_CATALOG_PDF_API,
  UPLOAD_CATALOG_COVER_API,
  TOGGLE_CATALOG_ACTIVE_API,
  TOGGLE_CATALOG_FEATURED_API,
} = catalogEndpoints;

// ==================== PUBLIC ENDPOINTS ====================

// Get all catalogs (public)
export const getAllCatalogs = async (params = {}) => {
  try {
    const response = await apiconnector("GET", GET_ALL_CATALOGS_API, null, null, params);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {throw error;
  }
};

// Get single catalog by ID
export const getCatalogById = async (id) => {
  try {
    const response = await apiconnector("GET", GET_CATALOG_BY_ID_API(id));

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {throw error;
  }
};

// Get featured catalogs
export const getFeaturedCatalogs = async (limit = 6) => {
  try {
    const response = await apiconnector("GET", GET_FEATURED_CATALOGS_API, null, null, { limit });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {throw error;
  }
};

// Get catalogs by category
export const getCatalogsByCategory = async (categoryId) => {
  try {
    const response = await apiconnector("GET", GET_CATALOGS_BY_CATEGORY_API(categoryId));

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {throw error;
  }
};

// Get categories with catalog counts
export const getCategoriesWithCatalogCounts = async () => {
  try {
    const response = await apiconnector("GET", GET_CATEGORIES_WITH_COUNTS_API);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {throw error;
  }
};

// Download catalog (with optional email)
export const downloadCatalog = async (id, data = {}) => {
  try {
    const response = await apiconnector("POST", DOWNLOAD_CATALOG_API(id), data);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {throw error;
  }
};

// Track catalog view
export const trackCatalogView = async (id) => {
  try {
    const response = await apiconnector("POST", TRACK_CATALOG_VIEW_API(id));
    return response.data;
  } catch (error) {// Don't throw - view tracking shouldn't break user experience
    return null;
  }
};

// ==================== ADMIN ENDPOINTS ====================

// Get all catalogs (admin)
export const getAllCatalogsAdmin = async (token, params = {}) => {
  try {
    const response = await apiconnector(
      "GET",
      GET_ALL_CATALOGS_ADMIN_API,
      null,
      { Authorization: `Bearer ${token}` },
      params
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {throw error;
  }
};

// Get catalog statistics
export const getCatalogStats = async (token) => {
  try {
    const response = await apiconnector("GET", GET_CATALOG_STATS_API, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {throw error;
  }
};

// Create catalog
export const createCatalog = async (token, data) => {
  const toastId = toast.loading("Creating catalog...");
  try {
    const response = await apiconnector("POST", CREATE_CATALOG_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Catalog created successfully", { id: toastId });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to create catalog", { id: toastId });
    throw error;
  }
};

// Update catalog
export const updateCatalog = async (token, id, data) => {
  const toastId = toast.loading("Updating catalog...");
  try {
    const response = await apiconnector("PUT", UPDATE_CATALOG_API(id), data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Catalog updated successfully", { id: toastId });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to update catalog", { id: toastId });
    throw error;
  }
};

// Delete catalog
export const deleteCatalog = async (token, id) => {
  const toastId = toast.loading("Deleting catalog...");
  try {
    const response = await apiconnector("DELETE", DELETE_CATALOG_API(id), null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Catalog deleted successfully", { id: toastId });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to delete catalog", { id: toastId });
    throw error;
  }
};

// Upload catalog PDF
export const uploadCatalogPdf = async (token, file) => {
  const toastId = toast.loading("Uploading PDF...");
  try {
    const formData = new FormData();
    formData.append("pdf", file);

    const response = await apiconnector("POST", UPLOAD_CATALOG_PDF_API, formData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("PDF uploaded successfully", { id: toastId });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to upload PDF", { id: toastId });
    throw error;
  }
};

// Upload catalog cover image
export const uploadCatalogCover = async (token, file) => {
  const toastId = toast.loading("Uploading cover image...");
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiconnector("POST", UPLOAD_CATALOG_COVER_API, formData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Cover image uploaded successfully", { id: toastId });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to upload cover image", { id: toastId });
    throw error;
  }
};

// Toggle catalog active status
export const toggleCatalogActive = async (token, id) => {
  try {
    const response = await apiconnector("PATCH", TOGGLE_CATALOG_ACTIVE_API(id), null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message);
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to toggle catalog status");
    throw error;
  }
};

// Toggle catalog featured status
export const toggleCatalogFeatured = async (token, id) => {
  try {
    const response = await apiconnector("PATCH", TOGGLE_CATALOG_FEATURED_API(id), null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message);
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || "Failed to toggle featured status");
    throw error;
  }
};
