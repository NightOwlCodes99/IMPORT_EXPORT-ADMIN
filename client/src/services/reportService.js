import { apiconnector } from './apiconnector';
import { reportEndpoints } from './apis';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const reportService = {
  getAllReportData: async (period) => {
    const endpoint = period === 'weekly' 
      ? reportEndpoints.GET_WEEKLY_REPORT_API 
      : period === 'monthly' 
        ? reportEndpoints.GET_MONTHLY_REPORT_API 
        : period === 'quarterly'
          ? reportEndpoints.GET_QUARTERLY_REPORT_API
          : reportEndpoints.GET_YEARLY_REPORT_API;
    const response = await apiconnector('GET', endpoint, null, getAuthHeaders());
    return response.data;
  },

  getScheduledReports: async () => {
    const response = await apiconnector('GET', reportEndpoints.GET_SCHEDULED_REPORTS_API, null, getAuthHeaders());
    return response.data;
  },

  createScheduledReport: async (data) => {
    const response = await apiconnector('POST', reportEndpoints.CREATE_SCHEDULED_REPORT_API, data, getAuthHeaders());
    return response.data;
  },

  toggleScheduledReport: async (id) => {
    const response = await apiconnector('PUT', reportEndpoints.TOGGLE_SCHEDULED_REPORT_API(id), null, getAuthHeaders());
    return response.data;
  },

  deleteScheduledReport: async (id) => {
    const response = await apiconnector('DELETE', reportEndpoints.DELETE_SCHEDULED_REPORT_API(id), null, getAuthHeaders());
    return response.data;
  },

  sendScheduledReportNow: async (id) => {
    const response = await apiconnector('POST', reportEndpoints.SEND_SCHEDULED_REPORT_NOW_API(id), null, getAuthHeaders());
    return response.data;
  },

  exportPDF: async (period) => {
    const response = await apiconnector('GET', reportEndpoints.EXPORT_REPORT_PDF_API, null, getAuthHeaders(), { period });
    return response.data;
  },

  exportCSV: async (period) => {
    const response = await apiconnector('GET', reportEndpoints.EXPORT_REPORT_CSV_API, null, getAuthHeaders(), { period });
    return response.data;
  },

  emailReport: async (data) => {
    const response = await apiconnector('POST', reportEndpoints.EMAIL_REPORT_API, data, getAuthHeaders());
    return response.data;
  },
};

export default reportService;
