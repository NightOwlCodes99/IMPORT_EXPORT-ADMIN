import axios from 'axios';
import { toast } from 'react-hot-toast';
import { reportEndpoints } from '../apis';

const {
  GET_REPORT_OVERVIEW_API,
  GET_WEEKLY_REPORT_API,
  GET_MONTHLY_REPORT_API,
  GET_QUARTERLY_REPORT_API,
  GET_YEARLY_REPORT_API,
  GET_CUSTOM_REPORT_API,
  GET_REVENUE_REPORT_API,
  GET_REVENUE_TREND_API,
  GET_SALES_BY_CATEGORY_API,
  GET_SALES_BY_REGION_API,
  GET_TOP_SELLING_PRODUCTS_API,
  GET_USER_ACTIVITY_REPORT_API,
  GET_NEW_REGISTRATIONS_API,
  GET_USER_DEMOGRAPHICS_API,
  GET_KPI_METRICS_API,
  GET_ORDER_SUCCESS_RATE_API,
  GET_AVG_ORDER_VALUE_API,
  GET_CUSTOMER_RETENTION_API,
  GET_CUSTOMER_SATISFACTION_API,
  EXPORT_REPORT_PDF_API,
  EXPORT_REPORT_CSV_API,
  EXPORT_REPORT_EXCEL_API,
  GET_SCHEDULED_REPORTS_API,
  CREATE_SCHEDULED_REPORT_API,
  UPDATE_SCHEDULED_REPORT_API,
  DELETE_SCHEDULED_REPORT_API
} = reportEndpoints;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Get Report Overview
export const getReportOverview = async () => {
  try {
    const response = await axios.get(GET_REPORT_OVERVIEW_API, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch report overview');
    throw error;
  }
};

// Get Weekly Report
export const getWeeklyReport = async (params = {}) => {
  try {
    const response = await axios.get(GET_WEEKLY_REPORT_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch weekly report');
    throw error;
  }
};

// Get Monthly Report
export const getMonthlyReport = async (params = {}) => {
  try {
    const response = await axios.get(GET_MONTHLY_REPORT_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch monthly report');
    throw error;
  }
};

// Get Quarterly Report
export const getQuarterlyReport = async (params = {}) => {
  try {
    const response = await axios.get(GET_QUARTERLY_REPORT_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch quarterly report');
    throw error;
  }
};

// Get Yearly Report
export const getYearlyReport = async (params = {}) => {
  try {
    const response = await axios.get(GET_YEARLY_REPORT_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch yearly report');
    throw error;
  }
};

// Get Custom Report
export const getCustomReport = async (params) => {
  try {
    const response = await axios.get(GET_CUSTOM_REPORT_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch custom report');
    throw error;
  }
};

// Get Revenue Report
export const getRevenueReport = async (params = {}) => {
  try {
    const response = await axios.get(GET_REVENUE_REPORT_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch revenue report');
    throw error;
  }
};

// Get Revenue Trend
export const getRevenueTrend = async (period = 'weekly') => {
  try {
    const response = await axios.get(GET_REVENUE_TREND_API, {
      headers: getAuthHeaders(),
      params: { period }
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch revenue trend');
    throw error;
  }
};

// Get Sales by Category
export const getSalesByCategory = async (params = {}) => {
  try {
    const response = await axios.get(GET_SALES_BY_CATEGORY_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch category sales');
    throw error;
  }
};

// Get Sales by Region
export const getSalesByRegion = async (params = {}) => {
  try {
    const response = await axios.get(GET_SALES_BY_REGION_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch regional sales');
    throw error;
  }
};

// Get Top Selling Products
export const getTopSellingProducts = async (limit = 10) => {
  try {
    const response = await axios.get(GET_TOP_SELLING_PRODUCTS_API, {
      headers: getAuthHeaders(),
      params: { limit }
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch top products');
    throw error;
  }
};

// Get User Activity Report
export const getUserActivityReport = async (params = {}) => {
  try {
    const response = await axios.get(GET_USER_ACTIVITY_REPORT_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch user activity');
    throw error;
  }
};

// Get New Registrations
export const getNewRegistrations = async (params = {}) => {
  try {
    const response = await axios.get(GET_NEW_REGISTRATIONS_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch registrations');
    throw error;
  }
};

// Get User Demographics
export const getUserDemographics = async () => {
  try {
    const response = await axios.get(GET_USER_DEMOGRAPHICS_API, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch demographics');
    throw error;
  }
};

// Get KPI Metrics
export const getKPIMetrics = async (params = {}) => {
  try {
    const response = await axios.get(GET_KPI_METRICS_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch KPI metrics');
    throw error;
  }
};

// Get Order Success Rate
export const getOrderSuccessRate = async (params = {}) => {
  try {
    const response = await axios.get(GET_ORDER_SUCCESS_RATE_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch success rate');
    throw error;
  }
};

// Get Average Order Value
export const getAverageOrderValue = async (params = {}) => {
  try {
    const response = await axios.get(GET_AVG_ORDER_VALUE_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch avg order value');
    throw error;
  }
};

// Get Customer Retention Rate
export const getCustomerRetention = async (params = {}) => {
  try {
    const response = await axios.get(GET_CUSTOMER_RETENTION_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch retention rate');
    throw error;
  }
};

// Get Customer Satisfaction
export const getCustomerSatisfaction = async (params = {}) => {
  try {
    const response = await axios.get(GET_CUSTOMER_SATISFACTION_API, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch satisfaction rate');
    throw error;
  }
};

// Export Report as PDF
export const exportReportPDF = async (reportType, params = {}) => {
  try {
    const response = await axios.get(EXPORT_REPORT_PDF_API, {
      headers: getAuthHeaders(),
      params: { reportType, ...params },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}-report-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast.success('Report downloaded successfully');
    return true;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to export PDF report');
    throw error;
  }
};

// Export Report as CSV
export const exportReportCSV = async (reportType, params = {}) => {
  try {
    const response = await axios.get(EXPORT_REPORT_CSV_API, {
      headers: getAuthHeaders(),
      params: { reportType, ...params },
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast.success('Report exported successfully');
    return true;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to export CSV report');
    throw error;
  }
};

// Export Report as Excel
export const exportReportExcel = async (reportType, params = {}) => {
  try {
    const response = await axios.get(EXPORT_REPORT_EXCEL_API, {
      headers: getAuthHeaders(),
      params: { reportType, ...params },
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}-report-${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast.success('Report exported successfully');
    return true;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to export Excel report');
    throw error;
  }
};

// Get Scheduled Reports
export const getScheduledReports = async () => {
  try {
    const response = await axios.get(GET_SCHEDULED_REPORTS_API, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to fetch scheduled reports');
    throw error;
  }
};

// Create Scheduled Report
export const createScheduledReport = async (data) => {
  try {
    const response = await axios.post(CREATE_SCHEDULED_REPORT_API, data, {
      headers: getAuthHeaders()
    });
    toast.success('Scheduled report created successfully');
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to create scheduled report');
    throw error;
  }
};

// Update Scheduled Report
export const updateScheduledReport = async (reportId, data) => {
  try {
    const response = await axios.put(UPDATE_SCHEDULED_REPORT_API(reportId), data, {
      headers: getAuthHeaders()
    });
    toast.success('Scheduled report updated successfully');
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to update scheduled report');
    throw error;
  }
};

// Delete Scheduled Report
export const deleteScheduledReport = async (reportId) => {
  try {
    const response = await axios.delete(DELETE_SCHEDULED_REPORT_API(reportId), {
      headers: getAuthHeaders()
    });
    toast.success('Scheduled report deleted successfully');
    return response.data;
  } catch (error) {toast.error(error.response?.data?.message || 'Failed to delete scheduled report');
    throw error;
  }
};

// Helper to generate local report data (for client-side report generation)
export const generateLocalReportData = (reportData, reportType) => {
  const csvRows = [];
  const headers = Object.keys(reportData[0] || {});
  csvRows.push(headers.join(','));
  
  for (const row of reportData) {
    const values = headers.map(header => {
      const val = row[header];
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${reportType}-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  toast.success('Report exported successfully');
};
