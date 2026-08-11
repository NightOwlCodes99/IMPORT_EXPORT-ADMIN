import { toast } from 'react-hot-toast';
import axios from 'axios';
import { paymentEndpoints, adminEndpoints } from '../apis';

const {
  GET_ALL_PAYMENTS_API,
  GET_PAYMENT_BY_ID_API,
  CREATE_PAYMENT_API,
  CREATE_MANUAL_PAYMENT_API,
  VERIFY_PAYMENT_API,
  REFUND_PAYMENT_API,
  UPDATE_PAYMENT_STATUS_API,
  GET_PAYMENT_STATS_API,
  GET_MY_PAYMENTS_API,
  PROCESS_PAYOUT_API,
  GET_COMMISSION_BREAKDOWN_API,
  GET_PAYMENT_METHODS_DISTRIBUTION_API,
  EXPORT_PAYMENTS_REPORT_API,
} = paymentEndpoints;

// Helper to get auth headers
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// Get all payments with filters
export const getAllPayments = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    if (params.paymentMethod && params.paymentMethod !== 'all') {
      queryParams.append('paymentMethod', params.paymentMethod);
    }
    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    if (params.dateRange) {
      queryParams.append('dateRange', params.dateRange);
    }
    if (params.page) {
      queryParams.append('page', params.page);
    }
    if (params.limit) {
      queryParams.append('limit', params.limit);
    }
    if (params.sort) {
      queryParams.append('sort', params.sort);
    }

    const url = queryParams.toString() 
      ? `${GET_ALL_PAYMENTS_API}?${queryParams.toString()}`
      : GET_ALL_PAYMENTS_API;

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {throw error;
  }
};

// Get payment by ID
export const getPaymentById = async (paymentId) => {
  try {
    const response = await axios.get(GET_PAYMENT_BY_ID_API(paymentId), {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {throw error;
  }
};

// Create new payment
export const createPayment = async (paymentData) => {
  const toastId = toast.loading('Processing payment...');
  try {
    const response = await axios.post(CREATE_PAYMENT_API, paymentData, {
      headers: getAuthHeaders(),
    });
    toast.success('Payment processed successfully', { id: toastId });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Payment failed', { id: toastId });
    throw error;
  }
};

// Verify payment
export const verifyPayment = async (paymentId) => {
  const toastId = toast.loading('Verifying payment...');
  try {
    const response = await axios.put(VERIFY_PAYMENT_API(paymentId), {}, {
      headers: getAuthHeaders(),
    });
    toast.success('Payment verified', { id: toastId });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Verification failed', { id: toastId });
    throw error;
  }
};

// Process refund
export const processRefund = async (paymentId, refundData) => {
  const toastId = toast.loading('Processing refund...');
  try {
    const response = await axios.put(REFUND_PAYMENT_API(paymentId), refundData, {
      headers: getAuthHeaders(),
    });
    toast.success('Refund processed successfully', { id: toastId });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Refund failed', { id: toastId });
    throw error;
  }
};

// Update payment status
export const updatePaymentStatus = async (paymentId, status) => {
  const toastId = toast.loading('Updating payment status...');
  try {
    const response = await axios.put(
      UPDATE_PAYMENT_STATUS_API(paymentId),
      { status },
      { headers: getAuthHeaders() }
    );
    toast.success('Payment status updated', { id: toastId });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update status', { id: toastId });
    throw error;
  }
};

// Get payment statistics
export const getPaymentStats = async () => {
  try {
    const response = await axios.get(GET_PAYMENT_STATS_API, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {throw error;
  }
};

// Get my payments (for users)
export const getMyPayments = async () => {
  try {
    const response = await axios.get(GET_MY_PAYMENTS_API, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {throw error;
  }
};

// Process payout to supplier
export const processPayout = async (paymentId, payoutData = {}) => {
  const toastId = toast.loading('Processing payout...');
  try {
    const response = await axios.post(
      PROCESS_PAYOUT_API(paymentId),
      payoutData,
      { headers: getAuthHeaders() }
    );
    toast.success('Payout processed successfully', { id: toastId });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to process payout', { id: toastId });
    throw error;
  }
};

// Get commission breakdown
export const getCommissionBreakdown = async () => {
  try {
    const response = await axios.get(GET_COMMISSION_BREAKDOWN_API, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {throw error;
  }
};

// Get payment methods distribution
export const getPaymentMethodsDistribution = async () => {
  try {
    const response = await axios.get(GET_PAYMENT_METHODS_DISTRIBUTION_API, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {throw error;
  }
};

// Export payments report
export const exportPaymentsReport = async (params = {}) => {
  const toastId = toast.loading('Generating report...');
  try {
    const queryParams = new URLSearchParams(params);
    const response = await axios.get(
      `${EXPORT_PAYMENTS_REPORT_API}?${queryParams.toString()}`,
      {
        headers: getAuthHeaders(),
        responseType: 'blob',
      }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payments-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully', { id: toastId });
    return true;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to export report', { id: toastId });
    throw error;
  }
};

// Export local function for CSV generation
export const exportPaymentsCSV = (payments) => {
  const headers = [
    'Transaction ID',
    'Date',
    'User',
    'Order ID',
    'Amount',
    'Commission',
    'Payment Method',
    'Status'
  ];
  
  const rows = payments.map(payment => [
    payment.transactionId,
    new Date(payment.createdAt).toLocaleDateString(),
    payment.user?.name || 'N/A',
    payment.order?.orderId || 'N/A',
    `$${payment.amount?.toFixed(2) || '0.00'}`,
    `$${((payment.amount || 0) * 0.15).toFixed(2)}`,
    payment.paymentMethod,
    payment.status
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  toast.success('CSV exported successfully');
};

// Retry failed payment
export const retryPayment = async (paymentId) => {
  const toastId = toast.loading('Retrying payment...');
  try {
    const response = await axios.post(
      `${GET_PAYMENT_BY_ID_API(paymentId)}/retry`,
      {},
      { headers: getAuthHeaders() }
    );
    toast.success('Payment retry initiated', { id: toastId });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Retry failed', { id: toastId });
    throw error;
  }
};

// Create manual payment (Admin only)
export const createManualPayment = async (paymentData) => {
  const toastId = toast.loading('Recording payment...');
  try {
    const response = await axios.post(
      CREATE_MANUAL_PAYMENT_API,
      paymentData,
      { headers: getAuthHeaders() }
    );
    toast.success('Manual payment recorded successfully', { id: toastId });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to record payment', { id: toastId });
    throw error;
  }
};
