import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  getAllPayments,
  getPaymentStats,
  getCommissionBreakdown,
  getPaymentMethodsDistribution,
  processRefund,
  processPayout,
  updatePaymentStatus,
  exportPaymentsCSV,
  createManualPayment
} from '../../services/operations/paymentAPI';
import { orderEndpoints } from '../../services/apis';
import { useAdminCurrencyFormatter } from '../../hooks/useAdminCurrency';

// Status colors and icons - Keys match backend status values
const statusConfig = {
  'Pending': { color: 'amber', icon: 'fa-clock', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
  'Processing': { color: 'blue', icon: 'fa-spinner', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  'Completed': { color: 'green', icon: 'fa-check-circle', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  'Failed': { color: 'red', icon: 'fa-times-circle', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  'Refunded': { color: 'purple', icon: 'fa-undo', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  'Cancelled': { color: 'slate', icon: 'fa-ban', bgColor: 'bg-slate-100', textColor: 'text-slate-700' }
};

// Helper to get status config (handles case variations)
const getStatusConfig = (status) => {
  const normalizedStatus = status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
  return statusConfig[normalizedStatus] || statusConfig['Pending'];
};

const paymentMethods = [
  'Credit Card', 
  'Debit Card', 
  'PayPal', 
  'Stripe', 
  'Bank Transfer', 
  'Wire Transfer', 
  'Letter of Credit',
  'Cash on Delivery',
  'Escrow',
  'Other'
];

const AdminPayments = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [commissionBreakdown, setCommissionBreakdown] = useState([]);
  const [paymentMethodsData, setPaymentMethodsData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refundModal, setRefundModal] = useState(null); 
  const [payoutModal, setPayoutModal] = useState(null);
  const [manualPaymentModal, setManualPaymentModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  
  // Currency formatter hook
  const { format: formatCurrency, formatFull: formatCurrencyFull } = useAdminCurrencyFormatter();
  
  const [manualPaymentData, setManualPaymentData] = useState({
    orderId: '',
    userId: '',
    amount: '',
    currency: 'USD',
    paymentMethod: 'Bank Transfer',
    paymentType: 'Full',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState(null);

  // Fetch data
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        status: activeTab !== 'all' ? activeTab : (statusFilter !== 'all' ? statusFilter : undefined),
        method: methodFilter !== 'all' ? methodFilter : undefined,
        endDate: dateFilter || undefined
      };

      const response = await getAllPayments(params);
      setPayments(response.data || []);
      setTotalPages(response.pages || 1);
    } catch (error) {toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, activeTab, statusFilter, methodFilter, dateFilter]);

  const fetchStats = async () => {
    try {
      const response = await getPaymentStats();
      setStats(response.data || {});
    } catch (error) {}
  };

  const fetchCommissionBreakdown = async () => {
    try {
      const response = await getCommissionBreakdown();
      setCommissionBreakdown(response.data || []);
    } catch (error) {}
  };

  const fetchPaymentMethodsData = async () => {
    try {
      const response = await getPaymentMethodsDistribution();
      setPaymentMethodsData(response.data || []);
    } catch (error) {}
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    fetchStats();
    fetchCommissionBreakdown();
    fetchPaymentMethodsData();
  }, []);

  // Handlers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setMethodFilter('all');
    setDateFilter('');
    setActiveTab('all');
    setCurrentPage(1);
  };

  const handleRefund = async () => {
    if (!refundModal || !refundAmount) return;
    try {
      await processRefund(refundModal._id, { amount: parseFloat(refundAmount), reason: refundReason });
      setRefundModal(null);
      setRefundAmount('');
      setRefundReason('');
      fetchPayments();
      fetchStats();
    } catch (error) {}
  };

  const handlePayout = async (paymentId) => {
    try {
      await processPayout(paymentId);
      fetchPayments();
      fetchStats();
      toast.success('Payout processed successfully');
    } catch (error) {}
  };

  const handleExportReport = () => {
    exportPaymentsCSV(payments);
  };

  // Fetch orders for manual payment modal
  const fetchOrdersForPayment = async () => {
    try {
      setLoadingOrders(true);
      const token = localStorage.getItem('token');
      // Use the new endpoint that specifically fetches orders with pending payment
      const response = await axios.get(orderEndpoints.GET_ORDERS_PENDING_PAYMENT_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = response.data.data || [];
      setOrders(ordersData);
    } catch (error) {toast.error('Failed to load orders with pending payment');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Handle manual payment modal open
  const handleOpenManualPaymentModal = () => {
    setManualPaymentModal(true);
    fetchOrdersForPayment();
  };

  // Handle manual payment submit
  const handleManualPaymentSubmit = async () => {
    if (!manualPaymentData.orderId || !manualPaymentData.userId || !manualPaymentData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createManualPayment(manualPaymentData);
      setManualPaymentModal(false);
      setManualPaymentData({
        orderId: '',
        userId: '',
        amount: '',
        currency: 'USD',
        paymentMethod: 'Bank Transfer',
        paymentType: 'Full',
        notes: '',
        paymentDate: new Date().toISOString().split('T')[0]
      });
      fetchPayments();
      fetchStats();
    } catch (error) {}
  };

  // Handle order selection - auto-fill user
  const handleOrderSelect = (orderId) => {
    const selectedOrder = orders.find(o => o._id === orderId);
    if (selectedOrder) {
      setManualPaymentData(prev => ({
        ...prev,
        orderId: orderId,
        userId: selectedOrder.buyer?._id || '',
        amount: selectedOrder.pricing?.totalPrice || ''
      }));
    }
  };

  // Get method icon
  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'credit card': return 'fa-credit-card';
      case 'paypal': return 'fa-brands fa-paypal';
      case 'bank transfer': return 'fa-university';
      case 'wire transfer': return 'fa-exchange-alt';
      case 'crypto': return 'fa-bitcoin';
      default: return 'fa-money-bill';
    }
  };

  // Get method color
  const getMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case 'credit card': return 'text-blue-600 bg-blue-100';
      case 'paypal': return 'text-indigo-600 bg-indigo-100';
      case 'bank transfer': return 'text-green-600 bg-green-100';
      case 'wire transfer': return 'text-purple-600 bg-purple-100';
      case 'crypto': return 'text-amber-600 bg-amber-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  // Loading state
  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-circle-notch fa-spin text-4xl text-green-500"></i>
          <p className="text-slate-600">Loading payments...</p>
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-dollar-sign text-white text-sm sm:text-lg lg:text-xl"></i>
              </div>
              Payments & Commission
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">Track revenue, commissions and manage payouts</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button 
              onClick={handleOpenManualPaymentModal}
              className="flex-1 sm:flex-none bg-white border-2 border-blue-500 text-blue-600 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus-circle"></i>
              <span className="hidden sm:inline">Add Manual Payment</span>
              <span className="sm:hidden">Add Payment</span>
            </button>
            <button 
              onClick={handleExportReport}
              className="flex-1 sm:flex-none bg-white border-2 border-slate-200 text-slate-700 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:border-green-500 hover:text-green-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <i className="fas fa-download"></i>
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button 
              onClick={() => setPayoutModal(true)}
              className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <i className="fas fa-money-bill-wave"></i>
              <span className="hidden sm:inline">Process Payouts</span>
              <span className="sm:hidden">Payouts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 animate-fadeIn">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-lg border-2 border-slate-200 hover:border-green-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-chart-line text-green-600 text-xs sm:text-sm lg:text-lg"></i>
            </div>
            {stats.revenueGrowth > 0 && (
              <span className="text-[10px] sm:text-xs font-bold text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">
                <i className="fas fa-arrow-up text-[8px] sm:text-xs"></i> {stats.revenueGrowth}%
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-1">Total Revenue</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{formatCurrency(stats.totalRevenue || 0)}</p>
        </div>

        {/* Commission */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-lg border-2 border-slate-200 hover:border-emerald-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-percent text-emerald-600 text-xs sm:text-sm lg:text-lg"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">15%</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-1">Commission</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{formatCurrency(stats.totalCommission || 0)}</p>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-lg border-2 border-slate-200 hover:border-amber-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-clock text-amber-600 text-xs sm:text-sm lg:text-lg"></i>
            </div>
            {(stats.pendingPayouts || 0) > 50000 && (
              <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-red-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">Urgent</span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-1">Pending Payouts</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{formatCurrency(stats.pendingPayouts || 0)}</p>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-lg border-2 border-slate-200 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-check-circle text-blue-600 text-xs sm:text-sm lg:text-lg"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">
              {stats.successRate || 0}%
            </span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-1">Completed</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.completed?.toLocaleString() || 0}</p>
        </div>

        {/* Failed/Refunds */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-lg border-2 border-slate-200 hover:border-red-500 hover:-translate-y-1 transition-all duration-300 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-red-600 text-xs sm:text-sm lg:text-lg"></i>
            </div>
            {(stats.failed + stats.refunded) > 100 && (
              <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-red-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">Alert</span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-1">Failed/Refunds</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{((stats.failed || 0) + (stats.refunded || 0)).toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 animate-fadeIn">
        {/* Payment Status Overview - 3D Pie Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-slate-200">
          <h3 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
            <i className="fas fa-chart-pie text-blue-600"></i>
            Payment Status Overview
          </h3>
          {(() => {
            const statusData = [
              { label: 'Completed', count: stats.completed || 0, color: '#22c55e', darkColor: '#16a34a', bgLight: 'bg-green-100', textColor: 'text-green-700', icon: 'fa-check-circle' },
              { label: 'Pending', count: stats.pending || 0, color: '#f59e0b', darkColor: '#d97706', bgLight: 'bg-amber-100', textColor: 'text-amber-700', icon: 'fa-clock' },
              { label: 'Processing', count: stats.processing || 0, color: '#3b82f6', darkColor: '#2563eb', bgLight: 'bg-blue-100', textColor: 'text-blue-700', icon: 'fa-spinner' },
              { label: 'Failed', count: stats.failed || 0, color: '#ef4444', darkColor: '#dc2626', bgLight: 'bg-red-100', textColor: 'text-red-700', icon: 'fa-times-circle' },
              { label: 'Refunded', count: stats.refunded || 0, color: '#a855f7', darkColor: '#9333ea', bgLight: 'bg-purple-100', textColor: 'text-purple-700', icon: 'fa-undo' }
            ];
            const totalCount = statusData.reduce((sum, item) => sum + item.count, 0) || 1;
            
            // Build conic gradient for pie chart
            let gradientParts = [];
            let currentAngle = 0;
            statusData.forEach((item) => {
              const percentage = (item.count / totalCount) * 100;
              if (percentage > 0) {
                const endAngle = currentAngle + percentage;
                gradientParts.push(`${item.color} ${currentAngle}% ${endAngle}%`);
                currentAngle = endAngle;
              }
            });
            const conicGradient = gradientParts.length > 0 
              ? `conic-gradient(${gradientParts.join(', ')})` 
              : 'conic-gradient(#e2e8f0 0% 100%)';

            return (
              <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
                {/* 3D Pie Chart */}
                <div className="relative flex-shrink-0">
                  <div 
                    className="relative"
                    style={{ 
                      perspective: '800px',
                      perspectiveOrigin: 'center center'
                    }}
                  >
                    {/* 3D Shadow/Depth layers */}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          width: '180px',
                          height: '180px',
                          background: conicGradient,
                          transform: `rotateX(65deg) translateZ(${-i * 3}px)`,
                          filter: `brightness(${0.6 - i * 0.05})`,
                          opacity: 1 - i * 0.1
                        }}
                      />
                    ))}
                    {/* Main pie surface */}
                    <div
                      className="relative rounded-full shadow-2xl"
                      style={{
                        width: '180px',
                        height: '180px',
                        background: conicGradient,
                        transform: 'rotateX(65deg)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.3)'
                      }}
                    >
                      {/* Inner highlight for 3D effect */}
                      <div 
                        className="absolute inset-4 rounded-full bg-white"
                        style={{
                          boxShadow: 'inset 0 -5px 15px rgba(0,0,0,0.1), inset 0 5px 15px rgba(255,255,255,0.8)'
                        }}
                      />
                    </div>
                  </div>
                  {/* Center label */}
                  <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-20px' }}>
                    <div className="text-center">
                      <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Total</p>
                    </div>
                  </div>
                </div>

                {/* Legend & Stats */}
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                    {statusData.map((item, index) => {
                      const percentage = ((item.count / totalCount) * 100).toFixed(1);
                      return (
                        <div key={index} className={`p-2 sm:p-3 ${item.bgLight} rounded-xl hover:scale-105 transition-transform duration-300`}>
                          <div className="flex items-center gap-2 mb-1">
                            <div 
                              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className={`font-bold ${item.textColor} text-xs sm:text-sm`}>{item.label}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <p className="text-lg sm:text-xl font-black text-slate-900">{item.count.toLocaleString()}</p>
                            <p className="text-[10px] sm:text-xs text-slate-500">({percentage}%)</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Stats */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                      <span className="text-[10px] sm:text-xs text-slate-600">Success: <strong className="text-green-600">{((stats.completed || 0) / totalCount * 100).toFixed(1)}%</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                      <span className="text-[10px] sm:text-xs text-slate-600">Failed: <strong className="text-red-600">{((stats.failed || 0) / totalCount * 100).toFixed(1)}%</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-slate-200">
          <h3 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
            <i className="fas fa-credit-card text-blue-600"></i>
            Payment Methods
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {paymentMethodsData.length > 0 ? (
              paymentMethodsData.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-xl hover:bg-blue-50 transition-all duration-300">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${getMethodColor(method.method)}`}>
                      <i className={`fas ${getMethodIcon(method.method)} text-xs sm:text-sm`}></i>
                    </div>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{method.method || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-xs sm:text-sm">{method.count || 0}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500">{method.percentage || 0}%</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8">
                <i className="fas fa-credit-card text-3xl sm:text-4xl text-slate-300 mb-2"></i>
                <p className="text-slate-500 text-xs sm:text-sm">No payment methods data</p>
              </div>
            )}
          </div>
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
                placeholder="Search by transaction ID, order..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-9 sm:pl-11 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-green-500 focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:border-green-500 focus:outline-none transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            {/* Method Filter */}
            <select 
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:border-green-500 focus:outline-none transition-all duration-300 hidden md:block"
            >
              <option value="all">All Methods</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>

            {/* Date Filter */}
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:border-green-500 focus:outline-none transition-all duration-300 hidden lg:block"
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
            { id: 'Completed', label: 'Completed', count: stats.completed, icon: 'fa-check-circle' },
            { id: 'Pending', label: 'Pending', count: stats.pending, icon: 'fa-clock' },
            { id: 'Failed', label: 'Failed', count: stats.failed, icon: 'fa-times-circle' },
            { id: 'Refunded', label: 'Refunded', count: stats.refunded, icon: 'fa-undo' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 min-w-[80px] sm:min-w-[100px] px-2 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 font-semibold text-[10px] sm:text-xs lg:text-sm border-b-4 whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'border-green-500 text-green-600 bg-green-50 font-bold' 
                  : 'border-transparent text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className={`fas ${tab.icon} mr-1 sm:mr-2`}></i>
              <span className="hidden sm:inline">{tab.label}</span> ({tab.count || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden animate-fadeIn">
        {/* Mobile Card View */}
        <div className="lg:hidden">
          {payments.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <i className="fas fa-dollar-sign text-4xl sm:text-5xl text-slate-300 mb-3 sm:mb-4"></i>
              <p className="text-slate-600 font-semibold text-sm">No payments found</p>
              <p className="text-slate-500 text-xs mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {payments.map((payment) => (
                <div key={payment._id} className="p-3 sm:p-4 hover:bg-slate-50 transition-all duration-300">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{payment.transactionId || 'N/A'}</p>
                      <p className="text-xs text-slate-500">Order: #{payment.order?.orderId || 'N/A'}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold ${getStatusConfig(payment.status)?.bgColor || 'bg-slate-100'} ${getStatusConfig(payment.status)?.textColor || 'text-slate-700'}`}>
                      <i className={`fas ${getStatusConfig(payment.status)?.icon || 'fa-circle'}`}></i>
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-emerald-600 text-base sm:text-lg">{formatCurrency(payment.amount)}</p>
                      <p className="text-[10px] text-slate-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setViewDetailsModal(payment)}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-all"
                      >
                        <i className="fas fa-eye text-xs sm:text-sm"></i>
                      </button>
                      {payment.status?.toLowerCase() === 'completed' && (
                        <button 
                          onClick={() => setRefundModal(payment)}
                          className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg flex items-center justify-center transition-all"
                        >
                          <i className="fas fa-undo text-xs sm:text-sm"></i>
                        </button>
                      )}
                      {payment.status?.toLowerCase() === 'pending' && (
                        <button 
                          onClick={() => handlePayout(payment._id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg flex items-center justify-center transition-all"
                        >
                          <i className="fas fa-money-bill-wave text-xs sm:text-sm"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Transaction</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Commission</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Method</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <i className="fas fa-dollar-sign text-6xl text-slate-300 mb-4"></i>
                    <p className="text-slate-600 font-semibold">No payments found</p>
                    <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50 transition-all">
                    {/* Transaction */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{payment.transactionId || 'N/A'}</p>
                        <p className="text-xs text-slate-500">
                          Order: #{payment.order?.orderId || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                          {payment.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {payment.user?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-500">{payment.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <p className="font-black text-emerald-600 text-lg">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-slate-500">{payment.currency || 'USD'}</p>
                    </td>

                    {/* Commission */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <p className="font-bold text-green-600">{formatCurrency(payment.amount * 0.15)}</p>
                      <p className="text-xs text-slate-500">15% rate</p>
                    </td>

                    {/* Method */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getMethodColor(payment.paymentMethod)}`}>
                        <i className={`fas ${getMethodIcon(payment.paymentMethod)} text-sm`}></i>
                        <span className="text-xs font-bold">{payment.paymentMethod || 'Unknown'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusConfig(payment.status)?.bgColor || 'bg-slate-100'} ${getStatusConfig(payment.status)?.textColor || 'text-slate-700'}`}>
                        <i className={`fas ${getStatusConfig(payment.status)?.icon || 'fa-circle'}`}></i>
                        {payment.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setViewDetailsModal(payment)}
                          className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-all"
                          title="View Details"
                        >
                          <i className="fas fa-eye text-sm"></i>
                        </button>
                        {payment.status?.toLowerCase() === 'completed' && (
                          <button 
                            onClick={() => setRefundModal(payment)}
                            className="w-8 h-8 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg flex items-center justify-center transition-all"
                            title="Process Refund"
                          >
                            <i className="fas fa-undo text-sm"></i>
                          </button>
                        )}
                        {payment.status?.toLowerCase() === 'pending' && (
                          <button 
                            onClick={() => handlePayout(payment._id)}
                            className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg flex items-center justify-center transition-all"
                            title="Process Payout"
                          >
                            <i className="fas fa-money-bill-wave text-sm"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 animate-fadeIn">
          <span className="text-xs sm:text-sm font-bold text-slate-600 order-2 sm:order-1">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:border-green-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-300"
            >
              <i className="fas fa-chevron-left"></i>
              <span className="hidden sm:inline ml-1">Prev</span>
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:border-green-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-300"
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setRefundModal(null)}>
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">Process Refund</h2>
                <button onClick={() => setRefundModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fas fa-times text-lg sm:text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-slate-600">Transaction: <span className="font-bold text-slate-900">{refundModal.transactionId}</span></p>
                <p className="text-xs sm:text-sm text-slate-600">Original Amount: <span className="font-bold text-emerald-600">{formatCurrencyFull(refundModal.amount)}</span></p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Refund Amount</label>
                <input 
                  type="number" 
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={refundModal.amount}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-green-500 focus:outline-none transition-all"
                  placeholder="Enter refund amount"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Reason</label>
                <textarea 
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-green-500 focus:outline-none transition-all"
                  rows="3"
                  placeholder="Enter refund reason..."
                />
              </div>
              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button 
                  onClick={() => setRefundModal(null)}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-200 transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRefund}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold text-xs sm:text-sm hover:shadow-xl transition-all duration-300"
                >
                  Process Refund
                </button>
              </div>
              <button 
                onClick={() => setRefundModal(null)}
                className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-200 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <i className="fas fa-times"></i>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setViewDetailsModal(null)}>
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-lg w-full overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">Payment Details</h2>
                <button onClick={() => setViewDetailsModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fas fa-times text-lg sm:text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
              {/* Transaction Info */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3 sm:p-4 text-white">
                <p className="text-xs sm:text-sm opacity-80">Transaction ID</p>
                <p className="text-sm sm:text-lg font-black">{viewDetailsModal.transactionId}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-slate-600 mb-1">Amount</p>
                  <p className="text-lg sm:text-xl font-black text-emerald-600">{formatCurrencyFull(viewDetailsModal.amount)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-slate-600 mb-1">Commission (15%)</p>
                  <p className="text-lg sm:text-xl font-black text-green-600">{formatCurrencyFull(viewDetailsModal.amount * 0.15)}</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs sm:text-sm text-slate-600">Order ID</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">#{viewDetailsModal.order?.orderId || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs sm:text-sm text-slate-600">Customer</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{viewDetailsModal.user?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs sm:text-sm text-slate-600">Email</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[150px]">{viewDetailsModal.user?.email}</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs sm:text-sm text-slate-600">Payment Method</span>
                  <span className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm ${getMethodColor(viewDetailsModal.paymentMethod)}`}>
                    <i className={`fas ${getMethodIcon(viewDetailsModal.paymentMethod)}`}></i>
                    {viewDetailsModal.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs sm:text-sm text-slate-600">Status</span>
                  <span className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold ${getStatusConfig(viewDetailsModal.status)?.bgColor} ${getStatusConfig(viewDetailsModal.status)?.textColor}`}>
                    {viewDetailsModal.status}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs sm:text-sm text-slate-600">Date</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{new Date(viewDetailsModal.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => setViewDetailsModal(null)}
                className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-200 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <i className="fas fa-times"></i>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {payoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setPayoutModal(false)}>
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">Process Payouts</h2>
                <button onClick={() => setPayoutModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fas fa-times text-lg sm:text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <i className="fas fa-exclamation-triangle text-amber-600 text-lg sm:text-xl"></i>
                  <div>
                    <p className="font-bold text-amber-900 text-sm sm:text-base">Pending Payouts</p>
                    <p className="text-lg sm:text-2xl font-black text-amber-700">{formatCurrency(stats.pendingPayouts || 0)}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6">
                This will process all pending supplier payouts. Make sure you have verified all transactions before proceeding.
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button 
                  onClick={() => setPayoutModal(false)}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-200 transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    toast.success('Batch payout processing initiated');
                    setPayoutModal(false);
                  }}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-xs sm:text-sm hover:shadow-xl transition-all duration-300"
                >
                  Process All
                </button>
              </div>
              <button 
                onClick={() => setPayoutModal(false)}
                className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-200 transition-all duration-300 mt-3 flex items-center justify-center gap-2"
              >
                <i className="fas fa-times"></i>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Payment Modal */}
      {manualPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setManualPaymentModal(false)}>
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-lg w-full overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <i className="fas fa-plus-circle text-blue-600"></i>
                  Add Manual Payment
                </h2>
                <button onClick={() => setManualPaymentModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fas fa-times text-lg sm:text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {/* Info Banner */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <i className="fas fa-info-circle text-blue-600 text-lg mt-0.5"></i>
                  <div>
                    <p className="font-bold text-blue-900 text-sm">Manual Payment Entry</p>
                    <p className="text-xs text-blue-700 mt-1">Record a payment that was received outside the system (e.g., bank transfer, cash, cheque).</p>
                  </div>
                </div>
              </div>

              {/* Order Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Select Order <span className="text-red-500">*</span>
                </label>
                {loadingOrders ? (
                  <div className="flex items-center gap-2 text-slate-500 py-3">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span className="text-sm">Loading orders...</span>
                  </div>
                ) : (
                  <select
                    value={manualPaymentData.orderId}
                    onChange={(e) => handleOrderSelect(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                  >
                    <option value="">-- Select an Order --</option>
                    {orders.map(order => (
                      <option key={order._id} value={order._id}>
                        #{order.orderId} - {order.buyer?.name || 'Unknown'} - ${order.pricing?.totalPrice?.toFixed(2) || '0.00'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={manualPaymentData.amount}
                    onChange={(e) => setManualPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Currency</label>
                  <select
                    value={manualPaymentData.currency}
                    onChange={(e) => setManualPaymentData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>

              {/* Payment Method & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
                  <select
                    value={manualPaymentData.paymentMethod}
                    onChange={(e) => setManualPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Wire Transfer">Wire Transfer</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Payment Type</label>
                  <select
                    value={manualPaymentData.paymentType}
                    onChange={(e) => setManualPaymentData(prev => ({ ...prev, paymentType: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                  >
                    <option value="Full">Full Payment</option>
                    <option value="Advance">Advance Payment</option>
                    <option value="Remaining">Remaining Balance</option>
                    <option value="Partial">Partial Payment</option>
                  </select>
                </div>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Payment Date</label>
                <input
                  type="date"
                  value={manualPaymentData.paymentDate}
                  onChange={(e) => setManualPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={manualPaymentData.notes}
                  onChange={(e) => setManualPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this payment..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setManualPaymentModal(false)}
                  className="flex-1 px-4 sm:px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleManualPaymentSubmit}
                  disabled={!manualPaymentData.orderId || !manualPaymentData.userId || !manualPaymentData.amount}
                  className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <i className="fas fa-check"></i>
                  Record Payment
                </button>
              </div>
              <button 
                onClick={() => setManualPaymentModal(false)}
                className="w-full px-4 sm:px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all duration-300 mt-3 flex items-center justify-center gap-2"
              >
                <i className="fas fa-times"></i>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
