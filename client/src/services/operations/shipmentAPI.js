import { toast } from 'react-hot-toast';
import axios from 'axios';
import { shipmentEndpoints, orderEndpoints } from '../apis';

const {
  GET_ALL_SHIPMENTS_API,
  GET_SHIPMENT_BY_ID_API,
  GET_SHIPMENT_WITH_ORDER_API,
  CREATE_SHIPMENT_API,
  UPDATE_SHIPMENT_API,
  DELETE_SHIPMENT_API,
  TRACK_SHIPMENT_API,
  UPDATE_SHIPMENT_STATUS_API,
  ADD_TRACKING_UPDATE_API,
  GET_SHIPMENT_STATS_API,
  NOTIFY_CUSTOMER_API,
  DOWNLOAD_LABEL_API,
  EXPORT_SHIPMENTS_REPORT_API,
  GET_MY_SHIPMENTS_API,
} = shipmentEndpoints;

const { GET_ORDERS_PENDING_SHIPMENT_API } = orderEndpoints;

// Helper to get auth headers
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// Get orders pending shipment (for creating new shipment)
export const getOrdersPendingShipment = async () => {
  try {
    const response = await axios.get(GET_ORDERS_PENDING_SHIPMENT_API, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {throw error;
  }
};

// Get all shipments with filters
export const getAllShipments = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    if (params.carrier && params.carrier !== 'all') {
      queryParams.append('carrier', params.carrier);
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
      ? `${GET_ALL_SHIPMENTS_API}?${queryParams.toString()}`
      : GET_ALL_SHIPMENTS_API;

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {throw error;
  }
};

// Get shipment by ID
export const getShipmentById = async (shipmentId) => {
  try {
    const response = await axios.get(GET_SHIPMENT_BY_ID_API(shipmentId), {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {throw error;
  }
};

// Get shipment with full order details
export const getShipmentWithOrder = async (shipmentId) => {
  try {
    const response = await axios.get(GET_SHIPMENT_WITH_ORDER_API(shipmentId), {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {throw error;
  }
};

// Get user's shipments
export const getMyShipments = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    if (params.page) {
      queryParams.append('page', params.page);
    }
    if (params.limit) {
      queryParams.append('limit', params.limit);
    }

    const url = queryParams.toString() 
      ? `${GET_MY_SHIPMENTS_API}?${queryParams.toString()}`
      : GET_MY_SHIPMENTS_API;

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {throw error;
  }
};

// Create new shipment
export const createShipment = async (shipmentData) => {
  const toastId = toast.loading('Creating shipment...');
  try {
    const response = await axios.post(CREATE_SHIPMENT_API, shipmentData, {
      headers: getAuthHeaders(),
    });
    toast.success('Shipment created successfully', { id: toastId });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create shipment', { id: toastId });
    throw error;
  }
};

// Update shipment
export const updateShipment = async (shipmentId, shipmentData) => {
  const toastId = toast.loading('Updating shipment...');
  try {
    const response = await axios.put(UPDATE_SHIPMENT_API(shipmentId), shipmentData, {
      headers: getAuthHeaders(),
    });
    toast.success('Shipment updated successfully', { id: toastId });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update shipment', { id: toastId });
    throw error;
  }
};

// Delete shipment
export const deleteShipment = async (shipmentId) => {
  const toastId = toast.loading('Deleting shipment...');
  try {
    const response = await axios.delete(DELETE_SHIPMENT_API(shipmentId), {
      headers: getAuthHeaders(),
    });
    toast.success('Shipment deleted successfully', { id: toastId });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete shipment', { id: toastId });
    throw error;
  }
};

// Track shipment by tracking number
export const trackShipment = async (trackingNumber) => {
  try {
    const response = await axios.get(TRACK_SHIPMENT_API(trackingNumber));
    return response.data;
  } catch (error) {throw error;
  }
};

// Update shipment status with notification options
export const updateShipmentStatus = async (shipmentId, statusData) => {
  const toastId = toast.loading('Updating status...');
  try {
    // If statusData is a string (old format), convert to object
    const payload = typeof statusData === 'string' 
      ? { status: statusData } 
      : statusData;
    
    const response = await axios.put(
      UPDATE_SHIPMENT_STATUS_API(shipmentId),
      payload,
      { headers: getAuthHeaders() }
    );
    toast.success('Status updated successfully', { id: toastId });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update status', { id: toastId });
    throw error;
  }
};

// Add tracking update
export const addTrackingUpdate = async (shipmentId, trackingData) => {
  const toastId = toast.loading('Adding tracking update...');
  try {
    const response = await axios.put(
      ADD_TRACKING_UPDATE_API(shipmentId),
      trackingData,
      { headers: getAuthHeaders() }
    );
    toast.success('Tracking update added', { id: toastId });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to add tracking update', { id: toastId });
    throw error;
  }
};

// Get shipment statistics
export const getShipmentStats = async () => {
  try {
    const response = await axios.get(GET_SHIPMENT_STATS_API, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {throw error;
  }
};

// Notify customer about shipment
export const notifyCustomer = async (shipmentId, notificationData = {}) => {
  const toastId = toast.loading('Sending notification...');
  try {
    const response = await axios.post(
      NOTIFY_CUSTOMER_API(shipmentId),
      notificationData,
      { headers: getAuthHeaders() }
    );
    toast.success('Customer notified successfully', { id: toastId });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to notify customer', { id: toastId });
    throw error;
  }
};

// Download shipping label
export const downloadLabel = async (shipmentId) => {
  try {
    const response = await axios.get(DOWNLOAD_LABEL_API(shipmentId), {
      headers: getAuthHeaders(),
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shipping-label-${shipmentId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('Label downloaded successfully');
    return true;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to download label');
    throw error;
  }
};

// Export shipments report
export const exportShipmentsReport = async (params = {}) => {
  const toastId = toast.loading('Generating report...');
  try {
    const queryParams = new URLSearchParams(params);
    const response = await axios.get(
      `${EXPORT_SHIPMENTS_REPORT_API}?${queryParams.toString()}`,
      {
        headers: getAuthHeaders(),
        responseType: 'blob',
      }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shipments-report-${new Date().toISOString().split('T')[0]}.csv`);
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
export const exportShipmentsCSV = (shipments) => {
  const headers = [
    'Tracking Number',
    'Order ID',
    'Status',
    'Carrier',
    'Origin',
    'Destination',
    'Shipped Date',
    'ETA',
    'Shipping Cost'
  ];
  
  const rows = shipments.map(shipment => [
    shipment.trackingNumber,
    shipment.order?.orderId || 'N/A',
    shipment.status,
    shipment.carrier?.name || 'N/A',
    `${shipment.origin?.city}, ${shipment.origin?.country}`,
    `${shipment.destination?.city}, ${shipment.destination?.country}`,
    new Date(shipment.createdAt).toLocaleDateString(),
    shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : 'N/A',
    `$${shipment.shippingCost?.toFixed(2) || '0.00'}`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shipments-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  toast.success('CSV exported successfully');
};
