import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { adminEndpoints } from '../../services/apis';
import axios from 'axios';
import { useAdminCurrencyFormatter } from '../../hooks/useAdminCurrency';

const { 
  GET_ALL_ORDERS_API, 
  GET_ORDER_STATS_API,
  GET_ORDER_BY_ID_API,
  UPDATE_ORDER_STATUS_API,
  DELETE_ORDER_API,
  CREATE_ORDER_API
} = adminEndpoints;

const AdminOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOrderModalOpen, setViewOrderModalOpen] = useState(false);
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const actionMenuRef = useRef(null);
  
  // Currency formatter hook
  const { format: formatCurrency, formatFull: formatCurrencyFull, isINR } = useAdminCurrencyFormatter();

  const [newOrderData, setNewOrderData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
    // Product Details
    productName: '',
    productDescription: '',
    quantity: '',
    unitPrice: '',
    // Pricing
    itemsPrice: '',
    taxPrice: '',
    shippingPrice: '',
    paymentStatus: 'Pending',
    notes: ''
  });

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setOpenActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(GET_ORDER_STATS_API, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats(response.data.data);
    } catch (error) {}
  };

  // Fetch orders and stats
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        // Tab filter (order status from tabs) - backend capitalizes first letter
        if (activeTab !== 'all') {
          params.append('status', activeTab);
        }
        
        // Additional status filter dropdown (only if tab is 'all')
        if (statusFilter !== 'all' && activeTab === 'all') {
          params.append('status', statusFilter);
        }
        
        // Search filter
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        
        // Payment status filter
        if (paymentFilter !== 'all') {
          params.append('paymentStatus', paymentFilter);
        }
        
        // Time/Date filter
        if (timeFilter !== 'all') {
          const now = new Date();
          let startDate;
          
          switch (timeFilter) {
            case 'today':
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              break;
            case 'week':
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case 'month':
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case 'year':
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            default:
              startDate = null;
          }
          
          if (startDate) {
            params.append('startDate', startDate.toISOString());
            params.append('endDate', now.toISOString());
          }
        }
        
        params.append('page', currentPage);
        params.append('limit', 20);const response = await axios.get(`${GET_ALL_ORDERS_API}?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setOrders(response.data.data);
        setTotalPages(response.data.pages || 1);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    fetchStats();
  }, [activeTab, searchQuery, statusFilter, timeFilter, paymentFilter, currentPage]);

  const refetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (activeTab !== 'all') {
        params.append('status', activeTab);
      }
      if (statusFilter !== 'all' && activeTab === 'all') {
        params.append('status', statusFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (paymentFilter !== 'all') {
        params.append('paymentStatus', paymentFilter);
      }
      if (timeFilter !== 'all') {
        const now = new Date();
        let startDate;
        switch (timeFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = null;
        }
        if (startDate) {
          params.append('startDate', startDate.toISOString());
          params.append('endDate', new Date().toISOString());
        }
      }
      params.append('page', currentPage);
      params.append('limit', 20);

      const response = await axios.get(`${GET_ALL_ORDERS_API}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setOrders(response.data.data);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await axios.get(GET_ORDER_BY_ID_API(orderId), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSelectedOrder(response.data.data);
      setViewOrderModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch order details');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await axios.put(
        UPDATE_ORDER_STATUS_API(orderId),
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      toast.success('Order status updated successfully');
      refetchOrders();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await axios.put(
        UPDATE_ORDER_STATUS_API(orderId),
        { paymentStatus: newPaymentStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      toast.success(`Payment status updated to ${newPaymentStatus}`);
      refetchOrders();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Order ID', 'Customer', 'Date', 'Status', 'Payment', 'Total'];
    const rows = orders.map(order => [
      order.orderId,
      order.shippingAddress?.fullName || 'N/A',
      new Date(order.createdAt).toLocaleDateString(),
      order.orderStatus,
      order.paymentStatus,
      `$${order.pricing?.totalPrice?.toFixed(2) || '0.00'}`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTimeFilter('all');
    setPaymentFilter('all');
    setCurrentPage(1);
    setActiveTab('all');
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      // Calculate itemsPrice from quantity and unit price if not manually set
      const calculatedItemsPrice = newOrderData.itemsPrice 
        ? parseFloat(newOrderData.itemsPrice) 
        : (parseFloat(newOrderData.quantity) || 0) * (parseFloat(newOrderData.unitPrice) || 0);
      
      const orderPayload = {
        buyer: null, // Admin creates order without buyer ID
        supplier: null, // Can be null for now
        orderItems: [{
          productName: newOrderData.productName || 'Negotiated Product',
          productDescription: newOrderData.productDescription || '',
          quantity: parseInt(newOrderData.quantity) || 1,
          unitPrice: parseFloat(newOrderData.unitPrice) || calculatedItemsPrice,
          price: calculatedItemsPrice
        }],
        shippingAddress: {
          fullName: newOrderData.customerName,
          email: newOrderData.customerEmail,
          phone: newOrderData.customerPhone,
          street: newOrderData.address,
          city: newOrderData.city,
          country: newOrderData.country,
          zipCode: newOrderData.zipCode
        },
        pricing: {
          itemsPrice: calculatedItemsPrice,
          taxPrice: parseFloat(newOrderData.taxPrice) || 0,
          shippingPrice: parseFloat(newOrderData.shippingPrice) || 0,
          totalPrice: calculatedItemsPrice + (parseFloat(newOrderData.taxPrice) || 0) + (parseFloat(newOrderData.shippingPrice) || 0)
        },
        paymentStatus: newOrderData.paymentStatus,
        notes: newOrderData.notes || ''
      };
      
      await axios.post(
        CREATE_ORDER_API,
        orderPayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success('Order created successfully!');
      setNewOrderModalOpen(false);
      setNewOrderData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        address: '',
        city: '',
        country: '',
        zipCode: '',
        productName: '',
        productDescription: '',
        quantity: '',
        unitPrice: '',
        itemsPrice: '',
        taxPrice: '',
        shippingPrice: '',
        paymentStatus: 'Pending',
        notes: ''
      });
      refetchOrders();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-amber-100 text-amber-700',
      'Processing': 'bg-blue-100 text-blue-700',
      'Confirmed': 'bg-cyan-100 text-cyan-700',
      'Shipped': 'bg-indigo-100 text-indigo-700',
      'Delivered': 'bg-emerald-100 text-emerald-700',
      'Cancelled': 'bg-red-100 text-red-700',
      'Refunded': 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-amber-100 text-amber-700',
      'Paid': 'bg-emerald-100 text-emerald-700',
      'Failed': 'bg-red-100 text-red-700',
      'Refunded': 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-slate-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 lg:w-14 sm:h-12 lg:h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <i className="fas fa-shopping-cart text-lg sm:text-xl lg:text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Orders Management</h1>
              <p className="text-slate-600 text-xs sm:text-sm">Track and manage all orders across the platform</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <i className="fas fa-download"></i>
              <span className="hidden xs:inline">Export CSV</span>
              <span className="xs:hidden">Export</span>
            </button>
            <button
              onClick={() => setNewOrderModalOpen(true)}
              className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:shadow-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i>
              <span className="hidden xs:inline">New Order</span>
              <span className="xs:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        {/* Total Orders */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 bg-pink-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-shopping-cart text-pink-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-0.5 sm:gap-1">
              <i className="fas fa-arrow-up"></i>
              {stats.growthPercentage || 0}%
            </span>
          </div>
          <p className="text-slate-600 text-[10px] sm:text-xs lg:text-sm font-bold mb-0.5 sm:mb-1">Total Orders</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.totalOrders?.toLocaleString() || 0}</p>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-clock text-amber-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-red-100 text-red-700 rounded-lg text-[10px] sm:text-xs font-bold">
              Action
            </span>
          </div>
          <p className="text-slate-600 text-[10px] sm:text-xs lg:text-sm font-bold mb-0.5 sm:mb-1">Pending</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.pending?.toLocaleString() || 0}</p>
        </div>

        {/* Processing */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-sync text-blue-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] sm:text-xs font-bold">
              Active
            </span>
          </div>
          <p className="text-slate-600 text-[10px] sm:text-xs lg:text-sm font-bold mb-0.5 sm:mb-1">Processing</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.processing?.toLocaleString() || 0}</p>
        </div>

        {/* Shipped */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hidden sm:block">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 bg-indigo-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-truck text-indigo-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-cyan-100 text-cyan-700 rounded-lg text-[10px] sm:text-xs font-bold">
              Transit
            </span>
          </div>
          <p className="text-slate-600 text-[10px] sm:text-xs lg:text-sm font-bold mb-0.5 sm:mb-1">Shipped</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.shipped?.toLocaleString() || 0}</p>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hidden lg:block">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-check-circle text-emerald-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] sm:text-xs font-bold">
              Done
            </span>
          </div>
          <p className="text-slate-600 text-[10px] sm:text-xs lg:text-sm font-bold mb-0.5 sm:mb-1">Completed</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.completed?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className={`fas ${isINR ? 'fa-rupee-sign' : 'fa-dollar-sign'} text-emerald-600 text-sm sm:text-xl`}></i>
            </div>
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] sm:text-xs font-bold hidden xs:block">
              This Month
            </span>
          </div>
          <p className="text-slate-600 text-[10px] sm:text-xs lg:text-sm font-bold mb-0.5 sm:mb-1">Revenue</p>
          <p className="text-base sm:text-xl lg:text-3xl font-black text-slate-900">{formatCurrency(stats.monthlyRevenue)}</p>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-chart-line text-purple-600 text-sm"></i>
            </div>
          </div>
          <p className="text-slate-600 text-[10px] sm:text-xs lg:text-sm font-bold mb-0.5 sm:mb-1">Avg Value</p>
          <p className="text-base sm:text-xl lg:text-3xl font-black text-slate-900">{formatCurrency(stats.avgOrderValue)}</p>
        </div>

        {/* Cancelled */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-times-circle text-red-600 text-sm"></i>
            </div>
          </div>
          <p className="text-slate-600 text-[10px] sm:text-xs lg:text-sm font-bold mb-0.5 sm:mb-1">Cancelled</p>
          <p className="text-base sm:text-xl lg:text-3xl font-black text-slate-900">{stats.cancelled || 0}</p>
        </div>

        {/* Returns */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-undo text-orange-600 text-sm"></i>
            </div>
          </div>
          <p className="text-slate-600 text-[10px] sm:text-xs lg:text-sm font-bold mb-0.5 sm:mb-1">Returns</p>
          <p className="text-base sm:text-xl lg:text-3xl font-black text-slate-900">{stats.returns || 0}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative w-full">
            <i className="fas fa-search absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search by Order ID, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
            />
          </div>
          
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 min-w-[100px] sm:flex-none px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none font-bold text-slate-700 text-xs sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="flex-1 min-w-[100px] sm:flex-none px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none font-bold text-slate-700 text-xs sm:text-sm hidden sm:block"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="flex-1 min-w-[100px] sm:flex-none px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none font-bold text-slate-700 text-xs sm:text-sm"
            >
              <option value="all">Payment</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
            </select>
            <button
              onClick={handleReset}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all flex items-center gap-2 text-xs sm:text-sm"
            >
              <i className="fas fa-redo text-xs"></i>
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 mb-4 sm:mb-6 overflow-hidden">
        <div className="flex border-b-2 border-slate-200 overflow-x-auto scrollbar-hide">
          {[
            { key: 'all', label: 'All Orders', shortLabel: 'All', count: stats.totalOrders, icon: 'fa-list' },
            { key: 'pending', label: 'Pending', shortLabel: 'Pending', count: stats.pending, icon: 'fa-clock' },
            { key: 'processing', label: 'Processing', shortLabel: 'Process', count: stats.processing, icon: 'fa-sync' },
            { key: 'shipped', label: 'Shipped', shortLabel: 'Shipped', count: stats.shipped, icon: 'fa-truck' },
            { key: 'delivered', label: 'Completed', shortLabel: 'Done', count: stats.completed, icon: 'fa-check-circle' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`flex-1 min-w-[80px] sm:min-w-[120px] px-2 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 font-bold text-[10px] sm:text-xs lg:text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white border-b-4 border-pink-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className={`fas ${tab.icon} text-xs sm:text-sm`}></i>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="text-[8px] sm:text-xs">({tab.count || 0})</span>
            </button>
          ))}
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {orders.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {orders.map((order) => (
                <div key={order._id} className="p-3 sm:p-4 hover:bg-slate-50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-bold text-purple-600 text-sm">{order.orderId}</span>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{order.shippingAddress?.fullName || 'N/A'}</p>
                      <p className="text-xs text-slate-600">{order.orderItems?.length || 0} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 text-lg">{formatCurrency(order.pricing?.totalPrice)}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleViewOrder(order._id)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-1"
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                    <div className="relative" ref={openActionMenu === `mobile-${order._id}` ? actionMenuRef : null}>
                      <button
                        onClick={() => setOpenActionMenu(openActionMenu === `mobile-${order._id}` ? null : `mobile-${order._id}`)}
                        disabled={updatingOrderId === order._id}
                        className="px-3 py-2 bg-purple-100 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-200 transition-all disabled:opacity-50"
                      >
                        {updatingOrderId === order._id ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-ellipsis-v"></i>
                        )}
                      </button>
                      {openActionMenu === `mobile-${order._id}` && (
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-slate-200 py-2 z-50 max-h-64 overflow-y-auto">
                          <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase">Order Status</div>
                          {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                handleUpdateStatus(order._id, status);
                                setOpenActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2"
                            >
                              <i className={`fas ${status === 'Processing' ? 'fa-sync' : status === 'Shipped' ? 'fa-truck' : status === 'Delivered' ? 'fa-check-circle' : 'fa-times-circle'} ${status === 'Processing' ? 'text-purple-500' : status === 'Shipped' ? 'text-blue-500' : status === 'Delivered' ? 'text-green-500' : 'text-red-500'}`}></i>
                              {status}
                            </button>
                          ))}
                          <div className="border-t border-slate-200 my-1"></div>
                          <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase">Payment Status</div>
                          {['Pending', 'Paid', 'Failed', 'Refunded'].map((pStatus) => (
                            <button
                              key={pStatus}
                              onClick={() => {
                                handleUpdatePaymentStatus(order._id, pStatus);
                                setOpenActionMenu(null);
                              }}
                              className={`w-full px-4 py-2 text-left text-xs hover:bg-slate-50 font-bold flex items-center gap-2 ${order.paymentStatus === pStatus ? 'bg-slate-100 text-slate-400' : 'text-slate-700'}`}
                              disabled={order.paymentStatus === pStatus}
                            >
                              <i className={`fas ${pStatus === 'Paid' ? 'fa-check-circle text-emerald-500' : pStatus === 'Pending' ? 'fa-clock text-amber-500' : pStatus === 'Failed' ? 'fa-times-circle text-red-500' : 'fa-undo text-orange-500'}`}></i>
                              {pStatus}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <i className="fas fa-shopping-cart text-5xl text-slate-300 mb-3"></i>
              <p className="text-base font-bold text-slate-600">No orders found</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          {orders.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-purple-600">{order.orderId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{order.shippingAddress?.fullName || 'N/A'}</p>
                        <p className="text-xs text-slate-600">{order.shippingAddress?.email || ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-600">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">{order.orderItems?.length || 0} items</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-slate-900 text-lg">{formatCurrency(order.pricing?.totalPrice)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewOrder(order._id)}
                          className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all flex items-center justify-center"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <div className="relative" ref={openActionMenu === order._id ? actionMenuRef : null}>
                          <button 
                            onClick={() => setOpenActionMenu(openActionMenu === order._id ? null : order._id)}
                            disabled={updatingOrderId === order._id}
                            className="w-8 h-8 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
                          >
                            {updatingOrderId === order._id ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-ellipsis-v"></i>
                            )}
                          </button>
                          {openActionMenu === order._id && (
                            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border-2 border-slate-200 py-2 z-50 max-h-72 overflow-y-auto">
                              <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase">Order Status</div>
                              {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => {
                                    handleUpdateStatus(order._id, status);
                                    setOpenActionMenu(null);
                                  }}
                                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 font-bold flex items-center gap-2 ${order.orderStatus === status ? 'bg-slate-100 text-slate-400' : 'text-slate-700'}`}
                                  disabled={order.orderStatus === status}
                                >
                                  <i className={`fas ${status === 'Processing' ? 'fa-sync' : status === 'Shipped' ? 'fa-truck' : status === 'Delivered' ? 'fa-check-circle' : 'fa-times-circle'} ${status === 'Processing' ? 'text-purple-500' : status === 'Shipped' ? 'text-blue-500' : status === 'Delivered' ? 'text-green-500' : 'text-red-500'}`}></i>
                                  {status}
                                </button>
                              ))}
                              <div className="border-t border-slate-200 my-1"></div>
                              <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase">Payment Status</div>
                              {['Pending', 'Paid', 'Failed', 'Refunded'].map((pStatus) => (
                                <button
                                  key={pStatus}
                                  onClick={() => {
                                    handleUpdatePaymentStatus(order._id, pStatus);
                                    setOpenActionMenu(null);
                                  }}
                                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 font-bold flex items-center gap-2 ${order.paymentStatus === pStatus ? 'bg-slate-100 text-slate-400' : 'text-slate-700'}`}
                                  disabled={order.paymentStatus === pStatus}
                                >
                                  <i className={`fas ${pStatus === 'Paid' ? 'fa-check-circle text-emerald-500' : pStatus === 'Pending' ? 'fa-clock text-amber-500' : pStatus === 'Failed' ? 'fa-times-circle text-red-500' : 'fa-undo text-orange-500'}`}></i>
                                  {pStatus}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <i className="fas fa-shopping-cart text-6xl text-slate-300 mb-4"></i>
              <p className="text-xl font-bold text-slate-600">No orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {orders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6">
          <div className="text-xs sm:text-sm text-slate-600">
            Showing <span className="font-bold">{orders.length}</span> orders
          </div>
          <div className="flex gap-1 sm:gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs sm:text-sm transition-all"
            >
              <i className="fas fa-chevron-left mr-1 sm:mr-2"></i><span className="hidden sm:inline">Previous</span>
            </button>
            <div className="flex gap-1">
              {[...Array(Math.min(totalPages, 5))].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                    currentPage === idx + 1
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs sm:text-sm transition-all"
            >
              <span className="hidden sm:inline">Next</span><i className="fas fa-chevron-right ml-1 sm:ml-2"></i>
            </button>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {viewOrderModalOpen && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setViewOrderModalOpen(false)}
        >
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto scrollbar-hide animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-4 sm:p-6 text-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">Order Details</h3>
                  <p className="text-xs sm:text-sm text-white/80 truncate">Order ID: {selectedOrder.orderId}</p>
                </div>
                <button onClick={() => setViewOrderModalOpen(false)} className="text-white/80 hover:text-white p-2">
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Order Info - 3 columns on larger screens, stacked on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-slate-50 p-3 sm:p-4 rounded-xl flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
                  <p className="text-xs sm:text-sm font-bold text-slate-600">Order Status</p>
                  <span className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${getStatusColor(selectedOrder.orderStatus)}`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-xl flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
                  <p className="text-xs sm:text-sm font-bold text-slate-600">Payment Status</p>
                  <span className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-xl flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
                  <p className="text-xs sm:text-sm font-bold text-slate-600">Order Date</p>
                  <p className="text-xs sm:text-sm text-slate-900 font-bold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-blue-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                <h4 className="text-base sm:text-lg font-black text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <i className="fas fa-user text-blue-500 text-sm"></i>
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-600">Name</p>
                    <p className="text-sm sm:text-base text-slate-900 break-words">{selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-600">Email</p>
                    <p className="text-sm sm:text-base text-slate-900 break-all">{selectedOrder.shippingAddress?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-600">Phone</p>
                    <p className="text-sm sm:text-base text-slate-900">{selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-600">Address</p>
                    <p className="text-sm sm:text-base text-slate-900 break-words">
                      {[selectedOrder.shippingAddress?.street, selectedOrder.shippingAddress?.city, selectedOrder.shippingAddress?.country].filter(Boolean).join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-purple-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                <h4 className="text-base sm:text-lg font-black text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <i className="fas fa-box text-purple-500 text-sm"></i>
                  Order Items
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {selectedOrder.orderItems?.length > 0 ? selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <i className="fas fa-cube text-slate-400"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm sm:text-base truncate">{item.name || item.productName || 'Product'}</p>
                        <p className="text-xs sm:text-sm text-slate-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-black text-slate-900 text-sm sm:text-base flex-shrink-0">${(item.price || 0).toFixed(2)}</p>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-slate-500 text-sm">No items</div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-emerald-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                <h4 className="text-base sm:text-lg font-black text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <i className="fas fa-dollar-sign text-emerald-500 text-sm"></i>
                  Pricing Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-600">Items Price:</span>
                    <span className="font-bold text-slate-900">{formatCurrencyFull(selectedOrder.pricing?.itemsPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-600">Tax:</span>
                    <span className="font-bold text-slate-900">{formatCurrencyFull(selectedOrder.pricing?.taxPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-600">Shipping:</span>
                    <span className="font-bold text-slate-900">{formatCurrencyFull(selectedOrder.pricing?.shippingPrice || 0)}</span>
                  </div>
                  <div className="border-t-2 border-emerald-200 pt-2 mt-2 flex justify-between items-center">
                    <span className="font-black text-slate-900">Total:</span>
                    <span className="font-black text-xl sm:text-2xl text-emerald-600">{formatCurrencyFull(selectedOrder.pricing?.totalPrice || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setViewOrderModalOpen(false)}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {newOrderModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setNewOrderModalOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Create New Order</h3>
                  <p className="text-sm text-white/80">Add order details for manual order creation</p>
                </div>
                <button onClick={() => setNewOrderModalOpen(false)} className="text-white/80 hover:text-white">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateOrder} className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="bg-blue-50 p-6 rounded-2xl">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-user text-blue-600"></i>
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newOrderData.customerName}
                      onChange={(e) => setNewOrderData({ ...newOrderData, customerName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newOrderData.customerEmail}
                      onChange={(e) => setNewOrderData({ ...newOrderData, customerEmail: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      placeholder="customer@example.com"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={newOrderData.customerPhone}
                      onChange={(e) => setNewOrderData({ ...newOrderData, customerPhone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      placeholder="+1 234 567 8900"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-orange-50 p-6 rounded-2xl">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-box text-orange-600"></i>
                  Product Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newOrderData.productName}
                      onChange={(e) => setNewOrderData({ ...newOrderData, productName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      placeholder="e.g., Industrial Steel Pipes"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Product Description
                    </label>
                    <textarea
                      value={newOrderData.productDescription}
                      onChange={(e) => setNewOrderData({ ...newOrderData, productDescription: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none resize-none"
                      rows="2"
                      placeholder="Brief description of the product..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newOrderData.quantity}
                      onChange={(e) => setNewOrderData({ ...newOrderData, quantity: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      placeholder="e.g., 100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Unit Price ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newOrderData.unitPrice}
                      onChange={(e) => setNewOrderData({ ...newOrderData, unitPrice: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      placeholder="e.g., 25.00"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="p-3 bg-white rounded-xl border-2 border-orange-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">Calculated Items Price:</span>
                        <span className="text-lg font-black text-orange-600">
                          ${((parseFloat(newOrderData.quantity) || 0) * (parseFloat(newOrderData.unitPrice) || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-purple-50 p-6 rounded-2xl">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-map-marker-alt text-purple-600"></i>
                  Shipping Address
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newOrderData.address}
                      onChange={(e) => setNewOrderData({ ...newOrderData, address: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      placeholder="123 Main Street"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newOrderData.city}
                      onChange={(e) => setNewOrderData({ ...newOrderData, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newOrderData.country}
                      onChange={(e) => setNewOrderData({ ...newOrderData, country: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      placeholder="United States"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Zip Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newOrderData.zipCode}
                      onChange={(e) => setNewOrderData({ ...newOrderData, zipCode: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      placeholder="10001"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="bg-emerald-50 p-6 rounded-2xl">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-dollar-sign text-emerald-600"></i>
                  Pricing Details
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Items Price <span className="text-slate-400 text-xs">(auto)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newOrderData.itemsPrice || ((parseFloat(newOrderData.quantity) || 0) * (parseFloat(newOrderData.unitPrice) || 0)) || ''}
                      onChange={(e) => setNewOrderData({ ...newOrderData, itemsPrice: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-pink-500 focus:outline-none bg-emerald-100/50"
                      placeholder="Auto-calculated"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tax Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newOrderData.taxPrice}
                      onChange={(e) => setNewOrderData({ ...newOrderData, taxPrice: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Shipping Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newOrderData.shippingPrice}
                      onChange={(e) => setNewOrderData({ ...newOrderData, shippingPrice: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white rounded-xl border-2 border-emerald-300">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-900">Total Price:</span>
                    <span className="text-2xl font-black text-emerald-600">
                      ${(
                        (parseFloat(newOrderData.itemsPrice) || (parseFloat(newOrderData.quantity) || 0) * (parseFloat(newOrderData.unitPrice) || 0)) + 
                        (parseFloat(newOrderData.taxPrice) || 0) + 
                        (parseFloat(newOrderData.shippingPrice) || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-slate-50 p-6 rounded-2xl">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-sticky-note text-slate-600"></i>
                  Order Notes
                </h4>
                <textarea
                  value={newOrderData.notes}
                  onChange={(e) => setNewOrderData({ ...newOrderData, notes: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none resize-none"
                  rows="3"
                  placeholder="Any special instructions or notes about this order..."
                />
              </div>

              {/* Payment Status */}
              <div className="bg-amber-50 p-6 rounded-2xl">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-credit-card text-amber-600"></i>
                  Payment Status
                </h4>
                <select
                  value={newOrderData.paymentStatus}
                  onChange={(e) => setNewOrderData({ ...newOrderData, paymentStatus: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none font-bold text-slate-700"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-check"></i>
                  Create Order
                </button>
                <button
                  type="button"
                  onClick={() => setNewOrderModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
