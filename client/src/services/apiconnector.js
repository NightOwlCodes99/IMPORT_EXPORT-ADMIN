import axios from "axios";

export const axiosInstance = axios.create({
  timeout: 120000, // 120 seconds timeout for file uploads
  validateStatus: (status) => status < 500, // Only throw for server errors
});

const apiConnector = (method, url, bodyData, headers, params) => {
  // Handle headers based on data type
  let combinedHeaders = headers;

  if (bodyData) {
    if (bodyData instanceof FormData) {
      // For FormData, don't set Content-Type - let browser set it with boundary
      combinedHeaders = { ...headers };
    } else {
      // For regular JSON data
      combinedHeaders = { ...headers, "Content-Type": "application/json" };
    }
  }

  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: combinedHeaders,
    params: params ? params : null,
  }).catch((error) => {
    throw error;
  });
};

// Export with both naming conventions for compatibility
export { apiConnector };
export const apiconnector = apiConnector;
