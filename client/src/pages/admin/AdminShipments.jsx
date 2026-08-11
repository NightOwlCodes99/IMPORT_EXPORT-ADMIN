import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { shipmentEndpoints } from '../../services/apis';
import {
  getAllShipments,
  getShipmentStats,
  getShipmentWithOrder,
  updateShipmentStatus,
  addTrackingUpdate,
  createShipment,
  deleteShipment,
  exportShipmentsCSV,
  getOrdersPendingShipment
} from '../../services/operations/shipmentAPI';

const {
  NOTIFY_CUSTOMER_API
} = shipmentEndpoints;

// Status colors and icons
const statusConfig = {
  'Pending Pickup': { color: 'amber', icon: 'fa-clock', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
  'Picked Up': { color: 'blue', icon: 'fa-box', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  'In Transit': { color: 'cyan', icon: 'fa-truck', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
  'Customs Clearance': { color: 'purple', icon: 'fa-shield-alt', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  'Out for Delivery': { color: 'indigo', icon: 'fa-shipping-fast', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
  'Delivered': { color: 'green', icon: 'fa-check-circle', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  'Delayed': { color: 'red', icon: 'fa-exclamation-triangle', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  'Failed Delivery': { color: 'red', icon: 'fa-times-circle', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  'Returned': { color: 'slate', icon: 'fa-undo', bgColor: 'bg-slate-100', textColor: 'text-slate-700' }
};

const carriers = ['DHL Express', 'FedEx', 'UPS', 'Maersk', 'Local Courier', 'Other'];

const AdminShipments = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedShipment, setExpandedShipment] = useState(null);
  const [newShipmentModal, setNewShipmentModal] = useState(false);
  const [trackingModal, setTrackingModal] = useState(null);
  const [orderDetailsModal, setOrderDetailsModal] = useState(null);
  const [orderDetailsData, setOrderDetailsData] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loadingPendingOrders, setLoadingPendingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    location: '',
    description: '',
    notes: '',
    sendNotification: true,
    delayReason: '',
    newEstimatedDelivery: ''
  });
  const [newShipmentData, setNewShipmentData] = useState({
    order: '',
    carrier: { name: 'DHL Express', service: 'Express International' },
    origin: { name: '', company: '', address: '', city: '', country: '', zipCode: '' },
    destination: { name: '', company: '', address: '', city: '', country: '', zipCode: '' },
    packageInfo: { weight: { value: 0 }, dimensions: { length: 0, width: 0, height: 0 }, numberOfPackages: 1 },
    estimatedDelivery: '',
    shippingCost: 0,
    shippingMethod: 'Express'
  });
  const [newTrackingUpdate, setNewTrackingUpdate] = useState({
    status: '',
    description: '',
    location: '',
    sendNotification: true
  });

  // Fetch pending orders when modal opens
  const fetchPendingOrders = async () => {
    try {
      setLoadingPendingOrders(true);
      const response = await getOrdersPendingShipment();
      setPendingOrders(response.data || []);
    } catch (error) {toast.error('Failed to load orders pending shipment');
    } finally {
      setLoadingPendingOrders(false);
    }
  };

  // Handle order selection
  const handleOrderSelect = (orderId) => {
    const order = pendingOrders.find(o => o._id === orderId);
    setSelectedOrder(order);
    
    if (order) {
      // Auto-fill destination from order's shipping address
      setNewShipmentData(prev => ({
        ...prev,
        order: order._id,
        destination: {
          name: order.shippingAddress?.fullName || order.buyer?.name || '',
          company: order.shippingAddress?.company || '',
          address: order.shippingAddress?.street || '',
          city: order.shippingAddress?.city || '',
          country: order.shippingAddress?.country || '',
          zipCode: order.shippingAddress?.zipCode || '',
          phone: order.shippingAddress?.phone || order.buyer?.phone || ''
        }
      }));
    } else {
      setNewShipmentData(prev => ({
        ...prev,
        order: '',
        destination: { name: '', company: '', address: '', city: '', country: '', zipCode: '' }
      }));
    }
  };

  // Open new shipment modal
  const openNewShipmentModal = () => {
    setNewShipmentModal(true);
    fetchPendingOrders();
    setSelectedOrder(null);
    setNewShipmentData({
      order: '',
      carrier: { name: 'DHL Express', service: 'Express International' },
      origin: { name: '', company: '', address: '', city: '', country: '', zipCode: '' },
      destination: { name: '', company: '', address: '', city: '', country: '', zipCode: '' },
      packageInfo: { weight: { value: 0 }, dimensions: { length: 0, width: 0, height: 0 }, numberOfPackages: 1 },
      estimatedDelivery: '',
      shippingCost: 0,
      shippingMethod: 'Express'
    });
  };

  // Fetch data
  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        status: activeTab !== 'all' ? activeTab : (statusFilter !== 'all' ? statusFilter : undefined),
        carrier: carrierFilter !== 'all' ? carrierFilter : undefined,
        endDate: dateFilter || undefined
      };

      const response = await getAllShipments(params);
      setShipments(response.data || []);
      setTotalPages(response.pages || 1);
    } catch (error) {toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, activeTab, statusFilter, carrierFilter, dateFilter]);

  const fetchStats = async () => {
    try {
      const response = await getShipmentStats();
      setStats(response.data || {});
    } catch (error) {}
  };

  useEffect(() => {
    fetchShipments();
    fetchStats();
  }, [fetchShipments]);

  // Handlers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCarrierFilter('all');
    setDateFilter('');
    setActiveTab('all');
    setCurrentPage(1);
  };

  // Open status update modal
  const openStatusUpdateModal = (shipment) => {
    setStatusUpdateModal(shipment);
    setStatusUpdateData({
      status: '', // Empty so user must select a new status
      location: shipment.currentLocation || '',
      description: '',
      notes: '',
      sendNotification: true,
      delayReason: '',
      newEstimatedDelivery: ''
    });
  };

  // Handle status update with notification
  const handleStatusUpdateSubmit = async () => {
    if (!statusUpdateModal || !statusUpdateData.status) {
      toast.error('Please select a new status');
      return;
    }
    try {
      await updateShipmentStatus(statusUpdateModal._id, {
        status: statusUpdateData.status,
        location: statusUpdateData.location,
        description: statusUpdateData.description,
        notes: statusUpdateData.notes,
        sendNotification: statusUpdateData.sendNotification,
        delayReason: statusUpdateData.delayReason,
        newEstimatedDelivery: statusUpdateData.newEstimatedDelivery
      });
      setStatusUpdateModal(null);
      setStatusUpdateData({
        status: '',
        location: '',
        description: '',
        notes: '',
        sendNotification: true,
        delayReason: '',
        newEstimatedDelivery: ''
      });
      fetchShipments();
      fetchStats();
    } catch (error) {}
  };

  const handleStatusUpdate = async (shipmentId, newStatus) => {
    try {
      await updateShipmentStatus(shipmentId, { 
        status: newStatus,
        sendNotification: true 
      });
      fetchShipments();
      fetchStats();
    } catch (error) {}
  };

  // Fetch and show order details modal
  const handleViewOrderDetails = async (shipmentId) => {
    try {
      setLoadingOrderDetails(true);
      setOrderDetailsModal(shipmentId);
      const response = await getShipmentWithOrder(shipmentId);
      setOrderDetailsData(response.data);
    } catch (error) {toast.error('Failed to load order details');
      setOrderDetailsModal(null);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const closeOrderDetailsModal = () => {
    setOrderDetailsModal(null);
    setOrderDetailsData(null);
  };

  const handleAddTrackingUpdate = async () => {
    if (!trackingModal || !newTrackingUpdate.status) {
      toast.error('Please select a status');
      return;
    }
    try {
      await addTrackingUpdate(trackingModal._id, newTrackingUpdate);
      setTrackingModal(null);
      setNewTrackingUpdate({ status: '', description: '', location: '', sendNotification: true });
      fetchShipments();
    } catch (error) {}
  };

  // Get statuses that have already been used in a shipment's timeline
  const getUsedStatuses = (shipment) => {
    if (!shipment?.timeline) return [];
    const usedStatuses = shipment.timeline.map(t => t.status);
    // Also include current status
    if (shipment.status) usedStatuses.push(shipment.status);
    return [...new Set(usedStatuses)];
  };

  // Get available statuses (excluding already used ones)
  const getAvailableStatuses = (shipment) => {
    const usedStatuses = getUsedStatuses(shipment);
    return Object.keys(statusConfig).filter(status => !usedStatuses.includes(status));
  };

  const handleNotifyCustomer = async (shipmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        NOTIFY_CUSTOMER_API(shipmentId),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Customer notified successfully');
    } catch (error) {
      toast.error('Failed to notify customer');
    }
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      await createShipment(newShipmentData);
      setNewShipmentModal(false);
      setNewShipmentData({
        order: '',
        carrier: { name: 'DHL Express', service: 'Express International' },
        origin: { name: '', company: '', address: '', city: '', country: '', zipCode: '' },
        destination: { name: '', company: '', address: '', city: '', country: '', zipCode: '' },
        packageInfo: { weight: { value: 0 }, dimensions: { length: 0, width: 0, height: 0 }, numberOfPackages: 1 },
        estimatedDelivery: '',
        shippingCost: 0,
        shippingMethod: 'Express'
      });
      fetchShipments();
      fetchStats();
    } catch (error) {}
  };

  const handleExportReport = () => {
    exportShipmentsCSV(shipments);
  };

  // Calculate progress for shipment
  const calculateProgress = (shipment) => {
    const statusOrder = ['Pending Pickup', 'Picked Up', 'In Transit', 'Customs Clearance', 'Out for Delivery', 'Delivered'];
    const currentIndex = statusOrder.indexOf(shipment.status);
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / statusOrder.length) * 100);
  };

  // Calculate days remaining
  const getDaysRemaining = (estimatedDelivery) => {
    if (!estimatedDelivery) return null;
    const eta = new Date(estimatedDelivery);
    const now = new Date();
    const diffTime = eta - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Loading state
  if (loading && shipments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-circle-notch fa-spin text-4xl text-cyan-500"></i>
          <p className="text-slate-600">Loading shipments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-shipping-fast text-white text-sm sm:text-lg lg:text-xl"></i>
              </div>
              Shipping & Logistics
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">Track and manage all shipments in real-time</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button 
              onClick={handleExportReport}
              className="flex-1 sm:flex-none bg-white border-2 border-slate-200 text-slate-700 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:border-cyan-500 hover:text-cyan-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <i className="fas fa-download"></i>
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button 
              onClick={openNewShipmentModal}
              className="flex-1 sm:flex-none bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i>
              <span className="hidden sm:inline">New Shipment</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 animate-fadeIn">
        {/* Total Shipments */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-lg border-2 border-slate-200 hover:border-cyan-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-shipping-fast text-cyan-600 text-xs sm:text-sm lg:text-lg"></i>
            </div>
            {stats.monthlyGrowth > 0 && (
              <span className="text-[10px] sm:text-xs font-bold text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">
                <i className="fas fa-arrow-up text-[8px] sm:text-xs"></i> {stats.monthlyGrowth}%
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-1">Total Shipments</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.total?.toLocaleString() || 0}</p>
        </div>

        {/* In Transit */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-lg border-2 border-slate-200 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-truck text-blue-600 text-xs sm:text-sm lg:text-lg"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">Live</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-1">In Transit</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.inTransit?.toLocaleString() || 0}</p>
        </div>

        {/* Delivered */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-lg border-2 border-slate-200 hover:border-green-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600 text-xs sm:text-sm lg:text-lg"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">{stats.deliveryRate || 0}%</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-1">Delivered</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.delivered?.toLocaleString() || 0}</p>
        </div>

        {/* Pending Pickup */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-lg border-2 border-slate-200 hover:border-amber-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-clock text-amber-600 text-xs sm:text-sm lg:text-lg"></i>
            </div>
            {stats.pendingPickup > 0 && (
              <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-red-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">Urgent</span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-1">Pending Pickup</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.pendingPickup?.toLocaleString() || 0}</p>
        </div>

        {/* Issues/Delays */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-lg border-2 border-slate-200 hover:border-red-500 hover:-translate-y-1 transition-all duration-300 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-red-600 text-xs sm:text-sm lg:text-lg"></i>
            </div>
            {stats.issues > 0 && (
              <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-red-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">Alert</span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-1">Issues/Delays</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.issues?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-slate-200 animate-fadeIn">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <i className="fas fa-search absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs sm:text-sm"></i>
              <input 
                type="text" 
                placeholder="Search by tracking number, order ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-9 sm:pl-11 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-cyan-500 focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:border-cyan-500 focus:outline-none transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Pending Pickup">Pending Pickup</option>
              <option value="Delayed">Delayed</option>
              <option value="Customs Clearance">Customs Clearance</option>
            </select>

            {/* Carrier Filter */}
            <select 
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:border-cyan-500 focus:outline-none transition-all duration-300 hidden md:block"
            >
              <option value="all">All Carriers</option>
              {carriers.map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>

            {/* Date Filter */}
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:border-cyan-500 focus:outline-none transition-all duration-300 hidden lg:block"
            />

            {/* Reset Button */}
            <button 
              onClick={handleReset}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300"
            >
              <i className="fas fa-redo text-xs"></i> <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 animate-fadeIn">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All', count: stats.total, icon: 'fa-list' },
            { id: 'In Transit', label: 'In Transit', count: stats.inTransit, icon: 'fa-truck' },
            { id: 'Pending Pickup', label: 'Pending', count: stats.pendingPickup, icon: 'fa-clock' },
            { id: 'Customs Clearance', label: 'Customs', count: stats.customsClearance, icon: 'fa-shield-alt' },
            { id: 'Delayed', label: 'Issues', count: stats.issues, icon: 'fa-exclamation-triangle' },
            { id: 'Delivered', label: 'Delivered', count: stats.delivered, icon: 'fa-check-circle' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 min-w-[80px] sm:min-w-[100px] px-2 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 font-semibold text-[10px] sm:text-xs lg:text-sm border-b-4 whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'border-cyan-500 text-cyan-600 bg-cyan-50 font-bold' 
                  : 'border-transparent text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className={`fas ${tab.icon} mr-1 sm:mr-2`}></i>
              <span className="hidden sm:inline">{tab.label}</span> ({tab.count || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Shipments List */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 animate-fadeIn">
        {shipments.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 shadow-lg border-2 border-slate-200 text-center">
            <i className="fas fa-shipping-fast text-4xl sm:text-5xl lg:text-6xl text-slate-300 mb-3 sm:mb-4"></i>
            <p className="text-slate-600 font-semibold text-sm sm:text-base">No shipments found</p>
            <p className="text-slate-500 text-xs sm:text-sm mt-2">Try adjusting your filters or create a new shipment</p>
          </div>
        ) : (
          shipments.map((shipment) => (
            <div 
              key={shipment._id} 
              className={`bg-white rounded-xl lg:rounded-2xl shadow-lg border-2 ${
                shipment.status === 'Delayed' || shipment.status === 'Failed Delivery' 
                  ? 'border-red-300 hover:border-red-500' 
                  : 'border-slate-200 hover:border-cyan-500'
              } transition-all overflow-hidden`}
            >
              {/* Header */}
              <div className={`px-4 lg:px-6 py-3 lg:py-4 ${
                shipment.status === 'Delayed' || shipment.status === 'Failed Delivery'
                  ? 'bg-gradient-to-r from-red-500 to-orange-600'
                  : shipment.status === 'Delivered'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <i className="fas fa-shipping-fast text-white text-lg lg:text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-base lg:text-lg font-black text-white mb-0.5 lg:mb-1">
                        Tracking #: {shipment.trackingNumber}
                      </h3>
                      <p className="text-xs text-cyan-100">
                        Order ID: #{shipment.order?.orderId || 'N/A'} • Shipped: {new Date(shipment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3">
                    <span className="px-3 lg:px-4 py-1.5 lg:py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg text-xs lg:text-sm font-bold">
                      <i className={`fas ${statusConfig[shipment.status]?.icon || 'fa-box'} mr-1`}></i>
                      {shipment.status}
                    </span>
                    <button 
                      onClick={() => setExpandedShipment(expandedShipment === shipment._id ? null : shipment._id)}
                      className="w-8 h-8 lg:w-10 lg:h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-all"
                    >
                      <i className={`fas ${expandedShipment === shipment._id ? 'fa-chevron-up' : 'fa-chevron-down'} text-white`}></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedShipment === shipment._id && (
                <div className="p-4 lg:p-6">
                  {/* Timeline */}
                  <div className="mb-4 lg:mb-6">
                    <h4 className="text-sm font-black text-slate-900 mb-3 lg:mb-4">Shipping Timeline</h4>
                    <div className="relative max-h-[350px] overflow-y-auto scrollbar-hide">
                      {/* Progress Line */}
                      <div className="absolute left-5 lg:left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                      <div 
                        className="absolute left-5 lg:left-6 top-0 w-0.5 bg-cyan-500" 
                        style={{ height: `${calculateProgress(shipment)}%` }}
                      ></div>

                      {/* Timeline Items */}
                      <div className="space-y-4 lg:space-y-6 pr-2">
                        {shipment.timeline?.map((item, index) => (
                          <div key={index} className={`flex items-start gap-3 lg:gap-4 relative ${!item.isCompleted && item.status !== shipment.status ? 'opacity-50' : ''}`}>
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-lg ${
                              item.isCompleted 
                                ? 'bg-green-500' 
                                : item.status === shipment.status 
                                  ? 'bg-cyan-500 animate-pulse' 
                                  : 'bg-slate-300'
                            }`}>
                              <i className={`fas ${item.isCompleted ? 'fa-check' : statusConfig[item.status]?.icon || 'fa-circle'} text-white text-sm lg:text-base`}></i>
                            </div>
                            <div className="flex-1 pt-1 lg:pt-2">
                              <p className="text-sm font-bold text-slate-900">{item.status}</p>
                              <p className="text-xs text-slate-600 mb-1">{item.description}</p>
                              {item.location && (
                                <p className="text-xs text-cyan-600 font-semibold">
                                  <i className="fas fa-map-marker-alt mr-1"></i>
                                  {item.location} • {new Date(item.timestamp).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-cyan-500 h-2 rounded-full transition-all" 
                          style={{ width: `${calculateProgress(shipment)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-cyan-600">{calculateProgress(shipment)}%</span>
                    </div>
                  </div>

                  {/* Shipment Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
                    {/* Origin */}
                    <div className="bg-blue-50 rounded-xl p-3 lg:p-4 border border-blue-200">
                      <h5 className="text-xs font-black text-blue-900 mb-1 lg:mb-2 uppercase flex items-center gap-2">
                        <i className="fas fa-map-marker-alt"></i> Origin
                      </h5>
                      <p className="text-sm font-bold text-slate-900">{shipment.origin?.city}, {shipment.origin?.country}</p>
                      <p className="text-xs text-slate-600">{shipment.origin?.company || shipment.origin?.name}</p>
                    </div>

                    {/* Destination */}
                    <div className="bg-purple-50 rounded-xl p-3 lg:p-4 border border-purple-200">
                      <h5 className="text-xs font-black text-purple-900 mb-1 lg:mb-2 uppercase flex items-center gap-2">
                        <i className="fas fa-map-marker-alt"></i> Destination
                      </h5>
                      <p className="text-sm font-bold text-slate-900">{shipment.destination?.city}, {shipment.destination?.country}</p>
                      <p className="text-xs text-slate-600">{shipment.destination?.company || shipment.destination?.name}</p>
                    </div>

                    {/* Carrier */}
                    <div className="bg-amber-50 rounded-xl p-3 lg:p-4 border border-amber-200">
                      <h5 className="text-xs font-black text-amber-900 mb-1 lg:mb-2 uppercase flex items-center gap-2">
                        <i className="fas fa-truck"></i> Carrier
                      </h5>
                      <p className="text-sm font-bold text-slate-900">{shipment.carrier?.name}</p>
                      <p className="text-xs text-slate-600">{shipment.carrier?.service || shipment.shippingMethod}</p>
                    </div>

                    {/* ETA */}
                    <div className="bg-green-50 rounded-xl p-3 lg:p-4 border border-green-200">
                      <h5 className="text-xs font-black text-green-900 mb-1 lg:mb-2 uppercase flex items-center gap-2">
                        <i className="fas fa-calendar-check"></i> ETA
                      </h5>
                      <p className="text-sm font-bold text-slate-900">
                        {shipment.estimatedDelivery 
                          ? new Date(shipment.estimatedDelivery).toLocaleDateString() 
                          : 'N/A'}
                      </p>
                      {getDaysRemaining(shipment.estimatedDelivery) !== null && (
                        <p className="text-xs text-slate-600">
                          {getDaysRemaining(shipment.estimatedDelivery) > 0 
                            ? `${getDaysRemaining(shipment.estimatedDelivery)} days remaining`
                            : getDaysRemaining(shipment.estimatedDelivery) === 0 
                              ? 'Arriving today'
                              : 'Past due'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="bg-slate-50 rounded-xl p-3 lg:p-4 mb-4">
                    <h5 className="text-sm font-black text-slate-900 mb-2 lg:mb-3">Package Information</h5>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Weight</p>
                        <p className="text-sm font-bold text-slate-900">
                          {shipment.packageInfo?.weight?.value || 0} {shipment.packageInfo?.weight?.unit || 'kg'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Dimensions</p>
                        <p className="text-sm font-bold text-slate-900">
                          {shipment.packageInfo?.dimensions?.length || 0}×
                          {shipment.packageInfo?.dimensions?.width || 0}×
                          {shipment.packageInfo?.dimensions?.height || 0} {shipment.packageInfo?.dimensions?.unit || 'cm'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Packages</p>
                        <p className="text-sm font-bold text-slate-900">
                          {shipment.packageInfo?.numberOfPackages || 1} {shipment.packageInfo?.packageType || 'boxes'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Shipping Cost</p>
                        <p className="text-sm font-bold text-emerald-600">${shipment.shippingCost?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                    <button 
                      onClick={() => setTrackingModal(shipment)}
                      className="bg-cyan-100 hover:bg-cyan-200 text-cyan-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all flex items-center justify-center gap-1 lg:gap-2"
                    >
                      <i className="fas fa-plus"></i> <span className="hidden sm:inline">Add</span> Update
                    </button>
                    <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all flex items-center justify-center gap-1 lg:gap-2">
                      <i className="fas fa-file-pdf"></i> <span className="hidden sm:inline">Download</span> Label
                    </button>
                    <button 
                      onClick={() => handleNotifyCustomer(shipment._id)}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all flex items-center justify-center gap-1 lg:gap-2"
                    >
                      <i className="fas fa-envelope"></i> Notify
                    </button>
                    <select 
                      value={shipment.status}
                      onChange={(e) => handleStatusUpdate(shipment._id, e.target.value)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer"
                    >
                      <option value={shipment.status}>{shipment.status}</option>
                      {getAvailableStatuses(shipment).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Collapsed View - Quick Info with Order Details */}
              {expandedShipment !== shipment._id && (
                <div className="p-3 lg:p-4">
                  {/* Order Info Card */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-3 lg:p-4 mb-3 border border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-shopping-bag text-cyan-600"></i>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase">Order Information</p>
                          <p className="text-sm font-black text-slate-900">
                            Order #{shipment.order?.orderId || shipment.order?.orderNumber || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {shipment.order?.buyer && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Customer</p>
                            <p className="text-sm font-bold text-slate-700">{shipment.order.buyer.name || 'N/A'}</p>
                          </div>
                        )}
                        {shipment.order?.totalPrice && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Total</p>
                            <p className="text-sm font-bold text-emerald-600">${shipment.order.totalPrice.toFixed(2)}</p>
                          </div>
                        )}
                        <button
                          onClick={() => handleViewOrderDetails(shipment._id)}
                          className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <i className="fas fa-eye"></i>
                          <span className="hidden sm:inline">View Order Details</span>
                          <span className="sm:hidden">View</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Shipment Quick Info */}
                  <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-blue-500"></i>
                      <span className="text-slate-600">{shipment.origin?.city} → {shipment.destination?.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-truck text-amber-500"></i>
                      <span className="text-slate-600">{shipment.carrier?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-calendar text-green-500"></i>
                      <span className="text-slate-600">
                        ETA: {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <button 
                        onClick={() => openStatusUpdateModal(shipment)}
                        className="text-purple-600 font-bold hover:text-purple-700 text-xs"
                      >
                        <i className="fas fa-edit mr-1"></i> Update Status
                      </button>
                      <button 
                        onClick={() => setExpandedShipment(shipment._id)}
                        className="text-cyan-600 font-bold hover:text-cyan-700"
                      >
                        View Details <i className="fas fa-chevron-down ml-1"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 mt-4 sm:mt-6 animate-fadeIn">
          <span className="text-xs sm:text-sm font-bold text-slate-600 order-2 sm:order-1">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:border-cyan-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-300"
            >
              <i className="fas fa-chevron-left"></i>
              <span className="hidden sm:inline ml-1">Prev</span>
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:border-cyan-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-300"
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* New Shipment Modal */}
      {newShipmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide animate-fadeIn">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">Create New Shipment</h2>
                <button onClick={() => setNewShipmentModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fas fa-times text-lg sm:text-xl"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateShipment} className="p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
              {/* Order Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Select Order <span className="text-red-500">*</span>
                </label>
                {loadingPendingOrders ? (
                  <div className="flex items-center justify-center py-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <i className="fas fa-spinner fa-spin text-cyan-500 mr-2"></i>
                    <span className="text-slate-500">Loading orders...</span>
                  </div>
                ) : pendingOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <i className="fas fa-inbox text-slate-300 text-2xl mb-2"></i>
                    <span className="text-slate-500 text-sm">No orders pending shipment</span>
                  </div>
                ) : (
                  <>
                    <select 
                      value={newShipmentData.order}
                      onChange={(e) => handleOrderSelect(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white"
                      required
                    >
                      <option value="">-- Select an Order --</option>
                      {pendingOrders.map(order => (
                        <option key={order._id} value={order._id}>
                          {order.orderId} | {order.orderItems?.[0]?.product?.name?.substring(0, 20) || 'Product'}... | {order.buyer?.name} | {order.buyer?.phone || order.shippingAddress?.phone || 'N/A'}
                        </option>
                      ))}
                    </select>

                    {/* Selected Order Preview */}
                    {selectedOrder && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-slate-200">
                            {selectedOrder.orderItems?.[0]?.product?.images?.[0] ? (
                              <img 
                                src={selectedOrder.orderItems[0].product.images[0]} 
                                alt={selectedOrder.orderItems[0].product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                <i className="fas fa-box text-slate-400"></i>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-cyan-600">{selectedOrder.orderId}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                selectedOrder.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {selectedOrder.orderStatus}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {selectedOrder.orderItems?.[0]?.product?.name}
                              {selectedOrder.orderItems?.length > 1 && ` +${selectedOrder.orderItems.length - 1} more`}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span><i className="fas fa-user mr-1"></i>{selectedOrder.buyer?.name}</span>
                              <span><i className="fas fa-phone mr-1"></i>{selectedOrder.buyer?.phone || selectedOrder.shippingAddress?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span><i className="fas fa-map-marker-alt mr-1"></i>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}</span>
                              <span className="font-bold text-emerald-600">${selectedOrder.pricing?.totalPrice?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Carrier Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Carrier</label>
                  <select 
                    value={newShipmentData.carrier.name}
                    onChange={(e) => setNewShipmentData({...newShipmentData, carrier: {...newShipmentData.carrier, name: e.target.value}})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                  >
                    {carriers.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Shipping Method</label>
                  <select 
                    value={newShipmentData.shippingMethod}
                    onChange={(e) => setNewShipmentData({...newShipmentData, shippingMethod: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Air">Air</option>
                    <option value="Sea">Sea</option>
                    <option value="Land">Land</option>
                    <option value="Express">Express</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </div>

              {/* Origin */}
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-2">Origin</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="City"
                    value={newShipmentData.origin.city}
                    onChange={(e) => setNewShipmentData({...newShipmentData, origin: {...newShipmentData.origin, city: e.target.value}})}
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Country"
                    value={newShipmentData.origin.country}
                    onChange={(e) => setNewShipmentData({...newShipmentData, origin: {...newShipmentData.origin, country: e.target.value}})}
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Address"
                  value={newShipmentData.origin.address}
                  onChange={(e) => setNewShipmentData({...newShipmentData, origin: {...newShipmentData.origin, address: e.target.value}})}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none mt-2"
                  required
                />
              </div>

              {/* Destination */}
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-2">
                  Destination 
                  {selectedOrder && <span className="font-normal text-slate-500 ml-2">(Auto-filled from order)</span>}
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <input 
                    type="text" 
                    placeholder="Recipient Name"
                    value={newShipmentData.destination.name}
                    onChange={(e) => setNewShipmentData({...newShipmentData, destination: {...newShipmentData.destination, name: e.target.value}})}
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Phone"
                    value={newShipmentData.destination.phone || ''}
                    onChange={(e) => setNewShipmentData({...newShipmentData, destination: {...newShipmentData.destination, phone: e.target.value}})}
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="City"
                    value={newShipmentData.destination.city}
                    onChange={(e) => setNewShipmentData({...newShipmentData, destination: {...newShipmentData.destination, city: e.target.value}})}
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Country"
                    value={newShipmentData.destination.country}
                    onChange={(e) => setNewShipmentData({...newShipmentData, destination: {...newShipmentData.destination, country: e.target.value}})}
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Address"
                  value={newShipmentData.destination.address}
                  onChange={(e) => setNewShipmentData({...newShipmentData, destination: {...newShipmentData.destination, address: e.target.value}})}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none mt-2"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Zip Code"
                  value={newShipmentData.destination.zipCode || ''}
                  onChange={(e) => setNewShipmentData({...newShipmentData, destination: {...newShipmentData.destination, zipCode: e.target.value}})}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none mt-2"
                />
              </div>

              {/* Package Info & Cost */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={newShipmentData.packageInfo.weight.value}
                    onChange={(e) => setNewShipmentData({
                      ...newShipmentData, 
                      packageInfo: {
                        ...newShipmentData.packageInfo, 
                        weight: {...newShipmentData.packageInfo.weight, value: parseFloat(e.target.value)}
                      }
                    })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ETA</label>
                  <input 
                    type="date" 
                    value={newShipmentData.estimatedDelivery}
                    onChange={(e) => setNewShipmentData({...newShipmentData, estimatedDelivery: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cost ($)</label>
                  <input 
                    type="number" 
                    value={newShipmentData.shippingCost}
                    onChange={(e) => setNewShipmentData({...newShipmentData, shippingCost: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setNewShipmentModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
                >
                  Create Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Tracking Update Modal */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide animate-fadeIn">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">Add Tracking Update</h2>
                  <p className="text-slate-500 text-xs">Tracking #: {trackingModal.trackingNumber}</p>
                </div>
                <button onClick={() => setTrackingModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fas fa-times text-lg sm:text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                {getAvailableStatuses(trackingModal).length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-sm">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    All statuses have been used for this shipment.
                  </div>
                ) : (
                  <select 
                    value={newTrackingUpdate.status}
                    onChange={(e) => setNewTrackingUpdate({...newTrackingUpdate, status: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                    required
                  >
                    <option value="">Select Status</option>
                    {getAvailableStatuses(trackingModal).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea 
                  value={newTrackingUpdate.description}
                  onChange={(e) => setNewTrackingUpdate({...newTrackingUpdate, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                  rows="3"
                  placeholder="Enter update description..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                <input 
                  type="text" 
                  value={newTrackingUpdate.location}
                  onChange={(e) => setNewTrackingUpdate({...newTrackingUpdate, location: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g., Singapore Hub"
                />
              </div>
              
              {/* Email Notification Toggle */}
              <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={newTrackingUpdate.sendNotification}
                    onChange={(e) => setNewTrackingUpdate({...newTrackingUpdate, sendNotification: e.target.checked})}
                    className="w-5 h-5 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <div>
                    <p className="font-bold text-slate-900">Send Email Notification</p>
                    <p className="text-xs text-slate-600">
                      Customer will receive an email about this update
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setTrackingModal(null)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddTrackingUpdate}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
                >
                  Add Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {orderDetailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto scrollbar-hide animate-fadeIn">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-600 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <i className="fas fa-shopping-bag text-white text-xl"></i>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      Order #{orderDetailsData?.order?.orderId || 'Loading...'}
                    </h2>
                    <p className="text-cyan-100 text-xs sm:text-sm">Complete Order & Shipment Details</p>
                  </div>
                </div>
                <button 
                  onClick={closeOrderDetailsModal} 
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <i className="fas fa-times text-white text-lg"></i>
                </button>
              </div>
            </div>

            {loadingOrderDetails ? (
              <div className="p-8 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <i className="fas fa-circle-notch fa-spin text-4xl text-cyan-500"></i>
                  <p className="text-slate-600">Loading order details...</p>
                </div>
              </div>
            ) : orderDetailsData ? (
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Order Status Banner */}
                <div className={`p-4 rounded-xl ${
                  orderDetailsData.order?.orderStatus === 'Delivered' 
                    ? 'bg-green-50 border border-green-200' 
                    : orderDetailsData.order?.orderStatus === 'Cancelled'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <i className={`fas ${
                        orderDetailsData.order?.orderStatus === 'Delivered' ? 'fa-check-circle text-green-600' :
                        orderDetailsData.order?.orderStatus === 'Cancelled' ? 'fa-times-circle text-red-600' :
                        'fa-truck text-blue-600'
                      } text-2xl`}></i>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Order Status</p>
                        <p className="text-lg font-black">{orderDetailsData.order?.orderStatus || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Payment Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        orderDetailsData.order?.paymentStatus === 'Paid' || orderDetailsData.order?.isPaid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {orderDetailsData.order?.paymentStatus || (orderDetailsData.order?.isPaid ? 'Paid' : 'Pending')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer & Supplier Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Info */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                      <i className="fas fa-user text-cyan-500"></i> Customer Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {orderDetailsData.order?.buyer?.profileImage ? (
                          <img 
                            src={orderDetailsData.order.buyer.profileImage} 
                            alt="Customer" 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-cyan-600"></i>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{orderDetailsData.order?.buyer?.name || 'N/A'}</p>
                          <p className="text-xs text-slate-600">{orderDetailsData.order?.buyer?.email || 'N/A'}</p>
                        </div>
                      </div>
                      {orderDetailsData.order?.buyer?.phone && (
                        <p className="text-sm text-slate-600">
                          <i className="fas fa-phone text-slate-400 mr-2"></i>
                          {orderDetailsData.order.buyer.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Supplier Info */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                      <i className="fas fa-store text-purple-500"></i> Supplier Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {orderDetailsData.order?.supplier?.logo ? (
                          <img 
                            src={orderDetailsData.order.supplier.logo} 
                            alt="Supplier" 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-store text-purple-600"></i>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{orderDetailsData.order?.supplier?.companyName || 'N/A'}</p>
                          <p className="text-xs text-slate-600">{orderDetailsData.order?.supplier?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping & Billing Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Shipping Address */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h3 className="text-sm font-black text-blue-900 mb-3 flex items-center gap-2">
                      <i className="fas fa-truck"></i> Shipping Address
                    </h3>
                    {orderDetailsData.order?.shippingAddress ? (
                      <div className="text-sm text-slate-700 space-y-1">
                        <p className="font-bold">{orderDetailsData.order.shippingAddress.name || orderDetailsData.order?.buyer?.name}</p>
                        <p>{orderDetailsData.order.shippingAddress.address || orderDetailsData.order.shippingAddress.street}</p>
                        <p>
                          {orderDetailsData.order.shippingAddress.city}, {orderDetailsData.order.shippingAddress.state} {orderDetailsData.order.shippingAddress.zipCode || orderDetailsData.order.shippingAddress.postalCode}
                        </p>
                        <p>{orderDetailsData.order.shippingAddress.country}</p>
                        {orderDetailsData.order.shippingAddress.phone && (
                          <p className="text-slate-500">
                            <i className="fas fa-phone text-xs mr-1"></i> {orderDetailsData.order.shippingAddress.phone}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No shipping address available</p>
                    )}
                  </div>

                  {/* Billing Address */}
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <h3 className="text-sm font-black text-purple-900 mb-3 flex items-center gap-2">
                      <i className="fas fa-file-invoice"></i> Billing Address
                    </h3>
                    {orderDetailsData.order?.billingAddress ? (
                      <div className="text-sm text-slate-700 space-y-1">
                        <p className="font-bold">{orderDetailsData.order.billingAddress.name || orderDetailsData.order?.buyer?.name}</p>
                        <p>{orderDetailsData.order.billingAddress.address || orderDetailsData.order.billingAddress.street}</p>
                        <p>
                          {orderDetailsData.order.billingAddress.city}, {orderDetailsData.order.billingAddress.state} {orderDetailsData.order.billingAddress.zipCode || orderDetailsData.order.billingAddress.postalCode}
                        </p>
                        <p>{orderDetailsData.order.billingAddress.country}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Same as shipping address</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <i className="fas fa-box text-amber-500"></i> Order Items ({orderDetailsData.order?.orderItems?.length || 0})
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto scrollbar-hide">
                    {orderDetailsData.order?.orderItems?.map((item, index) => (
                      <div key={index} className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product?.images?.[0] || item.image ? (
                            <img 
                              src={item.product?.images?.[0] || item.image} 
                              alt={item.product?.name || item.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="fas fa-image text-slate-400"></i>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.product?.name || item.name}</p>
                          <p className="text-xs text-slate-500">
                            SKU: {item.product?.sku || item.sku || 'N/A'} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">${((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                          <p className="text-xs text-slate-500">${(item.price || item.product?.price || 0).toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white">
                  <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                    <i className="fas fa-receipt text-cyan-400"></i> Order Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Subtotal</span>
                      <span>${(orderDetailsData.order?.pricing?.subtotal || orderDetailsData.order?.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Shipping</span>
                      <span>${(orderDetailsData.order?.pricing?.shipping || orderDetailsData.order?.shippingPrice || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Tax</span>
                      <span>${(orderDetailsData.order?.pricing?.tax || orderDetailsData.order?.taxPrice || 0).toFixed(2)}</span>
                    </div>
                    {(orderDetailsData.order?.pricing?.discount || orderDetailsData.order?.discount) > 0 && (
                      <div className="flex justify-between text-sm text-green-400">
                        <span>Discount</span>
                        <span>-${(orderDetailsData.order?.pricing?.discount || orderDetailsData.order?.discount || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-700 pt-2 mt-2">
                      <div className="flex justify-between text-lg font-black">
                        <span>Total</span>
                        <span className="text-cyan-400">${(orderDetailsData.order?.pricing?.total || orderDetailsData.order?.totalPrice || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipment Info */}
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <h3 className="text-sm font-black text-cyan-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-shipping-fast"></i> Shipment Information
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Tracking #</p>
                      <p className="text-sm font-bold text-slate-900">{orderDetailsData.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Carrier</p>
                      <p className="text-sm font-bold text-slate-900">{orderDetailsData.carrier?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Status</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${statusConfig[orderDetailsData.status]?.bgColor} ${statusConfig[orderDetailsData.status]?.textColor}`}>
                        {orderDetailsData.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">ETA</p>
                      <p className="text-sm font-bold text-slate-900">
                        {orderDetailsData.estimatedDelivery ? new Date(orderDetailsData.estimatedDelivery).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-history text-blue-500"></i> Tracking Timeline
                  </h3>
                  <div className="relative max-h-[300px] overflow-y-auto scrollbar-hide">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                    <div className="space-y-4 pr-2">
                      {orderDetailsData.timeline?.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                            item.isCompleted ? 'bg-green-500' : 
                            index === 0 ? 'bg-cyan-500 animate-pulse' : 'bg-slate-300'
                          }`}>
                            <i className={`fas ${item.isCompleted ? 'fa-check' : statusConfig[item.status]?.icon || 'fa-circle'} text-white text-sm`}></i>
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-sm font-bold text-slate-900">{item.status}</p>
                            <p className="text-xs text-slate-600">{item.description}</p>
                            {item.location && (
                              <p className="text-xs text-cyan-600 font-semibold mt-1">
                                <i className="fas fa-map-marker-alt mr-1"></i>
                                {item.location} • {new Date(item.timestamp).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 sm:p-6 flex justify-end gap-3">
              <button 
                onClick={closeOrderDetailsModal}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  closeOrderDetailsModal();
                  openStatusUpdateModal(orderDetailsData);
                }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
              >
                <i className="fas fa-edit mr-2"></i> Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal with Notification Options */}
      {statusUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hide animate-fadeIn">
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white">Update Shipment Status</h2>
                  <p className="text-purple-100 text-xs sm:text-sm">Tracking #: {statusUpdateModal.trackingNumber}</p>
                </div>
                <button 
                  onClick={() => setStatusUpdateModal(null)} 
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <i className="fas fa-times text-white text-lg"></i>
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {/* Current Status */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Current Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${statusConfig[statusUpdateModal.status]?.bgColor} ${statusConfig[statusUpdateModal.status]?.textColor}`}>
                  <i className={`fas ${statusConfig[statusUpdateModal.status]?.icon} mr-1`}></i>
                  {statusUpdateModal.status}
                </span>
              </div>

              {/* New Status */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Status</label>
                {getAvailableStatuses(statusUpdateModal).length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-sm">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    All statuses have been used for this shipment.
                  </div>
                ) : (
                  <select 
                    value={statusUpdateData.status}
                    onChange={(e) => setStatusUpdateData({...statusUpdateData, status: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Select New Status</option>
                    {getAvailableStatuses(statusUpdateModal).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Current Location</label>
                <input 
                  type="text" 
                  value={statusUpdateData.location}
                  onChange={(e) => setStatusUpdateData({...statusUpdateData, location: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., Singapore Hub, Customs Office"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description (Optional)</label>
                <textarea 
                  value={statusUpdateData.description}
                  onChange={(e) => setStatusUpdateData({...statusUpdateData, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  rows="2"
                  placeholder="Additional details about this status update..."
                />
              </div>

              {/* Delay Reason (only show if status is Delayed) */}
              {statusUpdateData.status === 'Delayed' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Delay Reason</label>
                    <select 
                      value={statusUpdateData.delayReason}
                      onChange={(e) => setStatusUpdateData({...statusUpdateData, delayReason: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Select reason...</option>
                      <option value="Weather conditions">Weather conditions</option>
                      <option value="Customs processing">Customs processing</option>
                      <option value="Logistic issues">Logistic issues</option>
                      <option value="High volume">High volume of shipments</option>
                      <option value="Address issues">Address verification needed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">New Estimated Delivery</label>
                    <input 
                      type="date" 
                      value={statusUpdateData.newEstimatedDelivery}
                      onChange={(e) => setStatusUpdateData({...statusUpdateData, newEstimatedDelivery: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Internal Notes (Optional)</label>
                <textarea 
                  value={statusUpdateData.notes}
                  onChange={(e) => setStatusUpdateData({...statusUpdateData, notes: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  rows="2"
                  placeholder="Notes for internal reference..."
                />
              </div>

              {/* Email Notification Toggle */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={statusUpdateData.sendNotification}
                    onChange={(e) => setStatusUpdateData({...statusUpdateData, sendNotification: e.target.checked})}
                    className="w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <p className="font-bold text-slate-900">Send Email Notification</p>
                    <p className="text-xs text-slate-600">
                      Customer will receive an email about this status update
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setStatusUpdateModal(null)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleStatusUpdateSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
                >
                  <i className="fas fa-save mr-2"></i> Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShipments;
