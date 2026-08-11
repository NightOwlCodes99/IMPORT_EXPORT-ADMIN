import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { reportService } from '../../services/reportService';

// Chart color palettes - Vibrant 3D style colors
const COLORS = ['#f97316', '#ec4899', '#64748b', '#3b82f6', '#10b981', '#8b5cf6'];
const BAR_COLORS = [
  { start: '#8b5cf6', end: '#a78bfa' },  // Purple
  { start: '#3b82f6', end: '#60a5fa' },  // Blue
  { start: '#10b981', end: '#34d399' },  // Green
  { start: '#f97316', end: '#fb923c' },  // Orange
  { start: '#ec4899', end: '#f472b6' },  // Pink
  { start: '#06b6d4', end: '#22d3ee' },  // Cyan
  { start: '#eab308', end: '#facc15' }   // Yellow
];
const GRADIENT_COLORS = {
  revenue: ['#10b981', '#059669'],
  orders: ['#3b82f6', '#1d4ed8'],
  users: ['#8b5cf6', '#7c3aed'],
  conversion: ['#f97316', '#ea580c']
};

// Country flag emojis mapping
const COUNTRY_FLAGS = {
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'China': '🇨🇳',
  'India': '🇮🇳',
  'Germany': '🇩🇪',
  'UAE': '🇦🇪',
  'United Kingdom': '🇬🇧',
  'UK': '🇬🇧',
  'Japan': '🇯🇵',
  'France': '🇫🇷',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺'
};

// Category icons mapping
const CATEGORY_ICONS = {
  'Electronics': 'fa-microchip',
  'Fashion': 'fa-tshirt',
  'Fashion & Apparel': 'fa-tshirt',
  'Machinery': 'fa-cogs',
  'Home & Living': 'fa-couch',
  'Food & Beverages': 'fa-utensils',
  'Sports': 'fa-football-ball',
  'Beauty': 'fa-spa',
  'Books': 'fa-book',
  'default': 'fa-box'
};

import { useAdminCurrencyFormatter } from '../../hooks/useAdminCurrency';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly');
  const [chartView, setChartView] = useState('revenue');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Currency formatter hook
  const { format: formatCurrency, isINR, symbol: currencySymbol } = useAdminCurrencyFormatter();
  
  const [emailForm, setEmailForm] = useState({
    recipients: [{ email: '', name: '' }],
    subject: '',
    message: ''
  });
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    reportType: 'weekly',
    frequency: 'weekly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '09:00',
    recipients: [{ email: '', name: '' }],
    format: 'pdf'
  });
  const [submitting, setSubmitting] = useState(false);
  const [scheduledReports, setScheduledReports] = useState([]);
  const [showScheduledReports, setShowScheduledReports] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, reportId: null, reportName: '' });
  const [reportData, setReportData] = useState({
    overview: null,
    periodReport: null,
    revenueTrend: null,
    salesByCategory: [],
    salesByRegion: [],
    topProducts: [],
    userActivity: null,
    kpiMetrics: null
  });

  // Period labels for tabs
  const periodLabels = {
    weekly: { title: 'Weekly Performance Report', period: 'Last 7 Days' },
    monthly: { title: 'Monthly Performance Report', period: 'Current Month' },
    quarterly: { title: 'Quarterly Performance Report', period: 'Current Quarter' },
    yearly: { title: 'Yearly Performance Report', period: 'Current Year' }
  };

  // Fetch all report data
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReportData(activeTab);
      
      if (response.success) {
        setReportData(response.data);
      } else {
        toast.error('Failed to load report data');
      }
    } catch (error) {toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Fetch scheduled reports
  const fetchScheduledReports = useCallback(async () => {
    try {
      const response = await reportService.getScheduledReports();
      if (response.success) {
        setScheduledReports(response.data);
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    fetchScheduledReports();
  }, [fetchScheduledReports]);

  // Toggle scheduled report status
  const handleToggleScheduledReport = async (reportId) => {
    try {
      const response = await reportService.toggleScheduledReport(reportId);
      if (response.success) {
        setScheduledReports(prev => 
          prev.map(report => report._id === reportId ? response.data : report)
        );
        toast.success('Schedule status updated');
      }
    } catch (error) {
      toast.error('Failed to update schedule');
    }
  };

  // Delete scheduled report
  const handleDeleteScheduledReport = async () => {
    if (!deleteConfirm.reportId) return;
    
    try {
      await reportService.deleteScheduledReport(deleteConfirm.reportId);
      setScheduledReports(prev => prev.filter(report => report._id !== deleteConfirm.reportId));
      toast.success('Scheduled report deleted');
      setDeleteConfirm({ show: false, reportId: null, reportName: '' });
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  // Open delete confirmation modal
  const openDeleteConfirm = (reportId, reportName) => {
    setDeleteConfirm({ show: true, reportId, reportName });
  };

  // Send scheduled report now (manual trigger)
  const handleSendScheduledReportNow = async (reportId, reportName) => {
    try {
      setSubmitting(true);
      toast.loading('Sending report...', { id: 'send-now' });
      const response = await reportService.sendScheduledReportNow(reportId);
      toast.dismiss('send-now');
      if (response.success) {
        toast.success(response.message || `Report "${reportName}" sent successfully!`);
      }
    } catch (error) {
      toast.dismiss('send-now');
      toast.error(error.response?.data?.message || 'Failed to send report');
    } finally {
      setSubmitting(false);
    }
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(parseFloat(num) || 0);
  };

  // Format percentage with sign
  const formatGrowth = (value) => {
    const num = parseFloat(value) || 0;
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    return CATEGORY_ICONS[categoryName] || CATEGORY_ICONS.default;
  };

  // Get country flag
  const getCountryFlag = (country) => {
    return COUNTRY_FLAGS[country] || '🌍';
  };

  // Get report period string
  const getReportPeriod = () => {
    const { overview } = reportData;
    if (overview?.reportPeriod) {
      const start = new Date(overview.reportPeriod.startDate);
      const end = new Date(overview.reportPeriod.endDate);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return periodLabels[activeTab].period;
  };

  // Prepare revenue trend chart data
  const getRevenueTrendData = () => {
    if (!reportData.revenueTrend?.trend) return [];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return reportData.revenueTrend.trend.map(item => ({
      name: activeTab === 'weekly' 
        ? dayNames[item._id - 1] || `Day ${item._id}`
        : activeTab === 'monthly'
        ? `Day ${item._id}`
        : monthNames[item._id - 1] || `Month ${item._id}`,
      revenue: item.revenue || 0,
      orders: item.orders || 0
    }));
  };

  // Prepare category data for pie chart with exploding slice for highest value
  const getCategoryChartData = () => {
    if (!reportData.salesByCategory?.length) return [];
    const data = reportData.salesByCategory.slice(0, 5).map((cat, index) => ({
      name: cat.category || cat.name || 'Unknown',
      value: cat.revenue || 0,
      percentage: cat.percentage || 0,
      orders: cat.orders || 0,
      fill: COLORS[index % COLORS.length]
    }));
    // Find the highest value index for exploding effect
    const maxIndex = data.reduce((maxIdx, curr, idx, arr) => 
      curr.value > arr[maxIdx].value ? idx : maxIdx, 0);
    return data.map((item, idx) => ({ ...item, explode: idx === maxIndex }));
  };

  // Custom 3D bar shape with individual gradients
  const Custom3DBar = (props) => {
    const { x, y, width, height, index } = props;
    const colors = BAR_COLORS[index % BAR_COLORS.length];
    const gradientId = `barGrad${index}`;
    
    return (
      <g>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.start} stopOpacity={1}/>
            <stop offset="100%" stopColor={colors.end} stopOpacity={0.8}/>
          </linearGradient>
        </defs>
        {/* 3D side effect */}
        <path
          d={`M${x + width} ${y + 8} L${x + width + 8} ${y} L${x + width + 8} ${y + height - 8} L${x + width} ${y + height} Z`}
          fill={colors.end}
          opacity={0.6}
        />
        {/* 3D top effect */}
        <path
          d={`M${x} ${y} L${x + 8} ${y - 8} L${x + width + 8} ${y - 8} L${x + width} ${y} Z`}
          fill={colors.start}
          opacity={0.8}
        />
        {/* Main bar */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={`url(#${gradientId})`}
          rx={4}
          ry={4}
        />
      </g>
    );
  };

  // Handle export
  const handleExport = async (format) => {
    try {
      const loadingToast = toast.loading(`Generating ${format.toUpperCase()} report...`);
      if (format === 'pdf') {
        await reportService.exportPDF(activeTab);
      } else {
        await reportService.exportCSV(activeTab);
      }
      toast.dismiss(loadingToast);
      toast.success(`${format.toUpperCase()} downloaded successfully!`);
    } catch {
      toast.dismiss();
      toast.error('Failed to generate report. Please try again.');
    }
  };

  // Handle email report
  const handleEmailReport = async () => {
    const validRecipients = emailForm.recipients.filter(r => r.email.trim());
    if (validRecipients.length === 0) {
      toast.error('Please add at least one recipient email');
      return;
    }

    try {
      setSubmitting(true);
      const response = await reportService.emailReport(
        activeTab,
        validRecipients,
        emailForm.subject || `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report - Nexarion Global Exports`,
        emailForm.message
      );
      if (response.success) {
        toast.success(response.message || 'Report sent successfully!');
        setShowEmailModal(false);
        setEmailForm({ recipients: [{ email: '', name: '' }], subject: '', message: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send report');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle schedule report
  const handleScheduleReport = async () => {
    const validRecipients = scheduleForm.recipients.filter(r => r.email.trim());
    if (!scheduleForm.name.trim()) {
      toast.error('Please enter a report name');
      return;
    }
    if (validRecipients.length === 0) {
      toast.error('Please add at least one recipient email');
      return;
    }

    try {
      setSubmitting(true);
      const response = await reportService.createScheduledReport({
        ...scheduleForm,
        recipients: validRecipients
      });
      if (response.success) {
        toast.success('Report scheduled successfully!');
        setShowScheduleModal(false);
        setShowScheduledReports(true); // Show the schedules panel
        fetchScheduledReports(); // Refresh the list
        setScheduleForm({
          name: '',
          reportType: 'weekly',
          frequency: 'weekly',
          dayOfWeek: 1,
          dayOfMonth: 1,
          time: '09:00',
          recipients: [{ email: '', name: '' }],
          format: 'pdf'
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule report');
    } finally {
      setSubmitting(false);
    }
  };

  // Add/remove recipient for email
  const addEmailRecipient = () => {
    setEmailForm(prev => ({
      ...prev,
      recipients: [...prev.recipients, { email: '', name: '' }]
    }));
  };

  const removeEmailRecipient = (index) => {
    setEmailForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const updateEmailRecipient = (index, field, value) => {
    setEmailForm(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => i === index ? { ...r, [field]: value } : r)
    }));
  };

  // Add/remove recipient for schedule
  const addScheduleRecipient = () => {
    setScheduleForm(prev => ({
      ...prev,
      recipients: [...prev.recipients, { email: '', name: '' }]
    }));
  };

  const removeScheduleRecipient = (index) => {
    setScheduleForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const updateScheduleRecipient = (index, field, value) => {
    setScheduleForm(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => i === index ? { ...r, [field]: value } : r)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-circle-notch fa-spin text-4xl text-indigo-500"></i>
          <p className="text-slate-600">Loading reports...</p>
        </div>
      </div>
    );
  }
  const { overview, periodReport, salesByCategory, salesByRegion, topProducts, userActivity, kpiMetrics } = reportData;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mb-2 flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <i className="fas fa-chart-bar text-white text-lg sm:text-xl"></i>
              </div>
              <span className="break-words">Reports & Analytics</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">Comprehensive business insights and performance metrics</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => handleExport('csv')}
              className="bg-white border-2 border-slate-200 text-slate-700 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-download"></i>
              <span className="hidden xs:inline">Export All</span>
            </button>
            <button
              onClick={() => setShowScheduledReports(!showScheduledReports)}
              className={`bg-white border-2 ${showScheduledReports ? 'border-indigo-500 text-indigo-600' : 'border-slate-200 text-slate-700'} px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2`}
            >
              <i className="fas fa-clock"></i>
              <span className="hidden sm:inline">Schedules</span>
              {scheduledReports.length > 0 && (
                <span className="bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded-full">{scheduledReports.length}</span>
              )}
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-calendar-alt"></i>
              <span className="hidden sm:inline">Schedule Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scheduled Reports List */}
      {showScheduledReports && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 mb-6 sm:mb-8 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-calendar-check text-white"></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Scheduled Reports</h3>
                  <p className="text-xs text-slate-500">Auto-generated reports sent via email</p>
                </div>
              </div>
              <div className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                <i className="fas fa-info-circle"></i>
                <span>Requires server running 24/7</span>
              </div>
            </div>
          </div>
          
          {scheduledReports.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-calendar-times text-4xl text-slate-300 mb-3"></i>
              <p className="text-slate-500 font-medium">No scheduled reports</p>
              <p className="text-xs text-slate-400 mt-1">Click "Schedule Report" to create one</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {scheduledReports.map((report) => (
                <div key={report._id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${report.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                      <div>
                        <h4 className="font-bold text-slate-800">{report.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <i className="fas fa-sync-alt"></i>
                            {report.frequency === 'daily' ? 'Daily' : 
                             report.frequency === 'weekly' ? `Weekly (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][report.dayOfWeek]})` :
                             `Monthly (Day ${report.dayOfMonth})`}
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="fas fa-clock"></i>
                            {report.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="fas fa-envelope"></i>
                            {report.recipients?.length || 0} recipient(s)
                          </span>
                        </div>
                        {report.nextScheduledAt && report.isActive && (
                          <p className="text-xs text-indigo-600 mt-1">
                            <i className="fas fa-arrow-right mr-1"></i>
                            Next: {new Date(report.nextScheduledAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-6 sm:ml-0">
                      <button
                        onClick={() => handleSendScheduledReportNow(report._id, report.name)}
                        disabled={submitting}
                        className="px-3 py-1.5 rounded-lg font-medium text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all disabled:opacity-50 flex items-center gap-1"
                        title="Send report now"
                      >
                        <i className="fas fa-paper-plane"></i>
                        <span className="hidden sm:inline">Send Now</span>
                      </button>
                      <button
                        onClick={() => handleToggleScheduledReport(report._id)}
                        className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                          report.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {report.isActive ? 'Active' : 'Paused'}
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(report._id, report.name)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Schedule"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Period Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 mb-6 sm:mb-8 overflow-hidden">
        <div className="flex flex-wrap sm:flex-nowrap overflow-x-auto">
          {['weekly', 'monthly', 'quarterly', 'yearly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[120px] px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-sm border-b-4 whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-slate-600 hover:bg-slate-50'
              }`}
            >
              <i className={`fas ${tab === 'weekly' ? 'fa-calendar-week' : tab === 'monthly' ? 'fa-calendar-alt' : tab === 'quarterly' ? 'fa-calendar' : 'fa-calendar-check'} mr-2`}></i>
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Report
            </button>
          ))}
        </div>
      </div>

      {/* Current Report Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">{periodLabels[activeTab].title}</h2>
            <p className="text-xs sm:text-sm text-indigo-100">Report Period: {getReportPeriod()}</p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none bg-white bg-opacity-20 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-opacity-30 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-print"></i> Print
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex-1 sm:flex-none bg-white text-indigo-600 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-download"></i> Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Revenue */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-slate-200 hover:border-green-500 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-dollar-sign text-green-600 text-lg sm:text-xl"></i>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
              (overview?.revenue?.growth || 0) >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
            }`}>
              <i className={`fas fa-arrow-${(overview?.revenue?.growth || 0) >= 0 ? 'up' : 'down'} text-xs`}></i> {formatGrowth(overview?.revenue?.growth)}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-600 mb-1">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Revenue</p>
          <p className="text-xl sm:text-3xl font-black text-slate-900 mb-1">{formatCurrency(overview?.revenue?.current)}</p>
          <p className="text-xs text-slate-600">vs last {activeTab === 'weekly' ? 'week' : activeTab === 'monthly' ? 'month' : activeTab === 'quarterly' ? 'quarter' : 'year'}: {formatCurrency(overview?.revenue?.current - overview?.revenue?.previous)}</p>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-slate-200 hover:border-blue-500 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-shopping-cart text-blue-600 text-lg sm:text-xl"></i>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
              (overview?.orders?.growth || 0) >= 0 ? 'text-blue-600 bg-blue-100' : 'text-red-600 bg-red-100'
            }`}>
              <i className={`fas fa-arrow-${(overview?.orders?.growth || 0) >= 0 ? 'up' : 'down'} text-xs`}></i> {formatGrowth(overview?.orders?.growth)}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-600 mb-1">Total Orders</p>
          <p className="text-xl sm:text-3xl font-black text-slate-900 mb-1">{formatNumber(overview?.orders?.current)}</p>
          <p className="text-xs text-slate-600">vs last period: +{formatNumber(overview?.orders?.current - overview?.orders?.previous)} orders</p>
        </div>

        {/* New Users */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-slate-200 hover:border-purple-500 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-user-plus text-purple-600 text-lg sm:text-xl"></i>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
              (overview?.newUsers?.growth || 0) >= 0 ? 'text-purple-600 bg-purple-100' : 'text-red-600 bg-red-100'
            }`}>
              <i className={`fas fa-arrow-${(overview?.newUsers?.growth || 0) >= 0 ? 'up' : 'down'} text-xs`}></i> {formatGrowth(overview?.newUsers?.growth)}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-600 mb-1">New Users</p>
          <p className="text-xl sm:text-3xl font-black text-slate-900 mb-1">{formatNumber(overview?.newUsers?.current)}</p>
          <p className="text-xs text-slate-600">vs last period: +{formatNumber(overview?.newUsers?.current - overview?.newUsers?.previous)} users</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-slate-200 hover:border-orange-500 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-percentage text-orange-600 text-lg sm:text-xl"></i>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
              (overview?.conversionRate?.growth || 0) >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
            }`}>
              <i className={`fas fa-arrow-${(overview?.conversionRate?.growth || 0) >= 0 ? 'up' : 'down'} text-xs`}></i> {formatGrowth(overview?.conversionRate?.growth)}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-600 mb-1">Conversion Rate</p>
          <p className="text-xl sm:text-3xl font-black text-slate-900 mb-1">{(parseFloat(overview?.conversionRate?.current) || 0).toFixed(1)}%</p>
          <p className="text-xs text-slate-600">vs last period: +{(parseFloat(overview?.conversionRate?.growth) || 0).toFixed(1)}%</p>
        </div>
      </div>

      {/* 3D Style Charts Section - 4 Charts in 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
        {/* Chart 1: Revenue Trend - Area Chart with 3D effect */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Revenue Trend</h3>
              <p className="text-xs text-slate-600">Daily breakdown for the period</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChartView('revenue')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${chartView === 'revenue' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartView('orders')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${chartView === 'orders' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Orders
              </button>
            </div>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getRevenueTrendData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue3D" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorOrders3D" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                  <filter id="areaShadow3D" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#10b981" floodOpacity="0.35"/>
                  </filter>
                  <filter id="areaGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(value) => chartView === 'revenue' ? `${currencySymbol}${isINR ? (value >= 10000000 ? (value/10000000).toFixed(0) + 'Cr' : value >= 100000 ? (value/100000).toFixed(0) + 'L' : (value/1000).toFixed(0) + 'K') : (value/1000).toFixed(0) + 'K'}` : value} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '2px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 15px 35px rgba(0,0,0,0.15)' }}
                  formatter={(value) => chartView === 'revenue' ? [formatCurrency(value), 'Revenue'] : [formatNumber(value), 'Orders']}
                />
                <Area
                  type="monotone"
                  dataKey={chartView}
                  stroke={chartView === 'revenue' ? '#059669' : '#2563eb'}
                  strokeWidth={4}
                  fill={chartView === 'revenue' ? 'url(#colorRevenue3D)' : 'url(#colorOrders3D)'}
                  filter="url(#areaGlow)"
                  dot={{ r: 4, fill: chartView === 'revenue' ? '#10b981' : '#3b82f6', strokeWidth: 2, stroke: 'white' }}
                  activeDot={{ r: 7, strokeWidth: 3, stroke: 'white', filter: 'url(#areaShadow3D)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 mt-4">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-600 mb-1">Highest Day</p>
              <p className="text-sm sm:text-lg font-black text-green-600">{periodReport?.summary?.highestDay?.day || 'N/A'} - {formatCurrency(periodReport?.summary?.highestDay?.amount)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-600 mb-1">Average Daily</p>
              <p className="text-sm sm:text-lg font-black text-blue-600">{formatCurrency(periodReport?.summary?.averageDaily)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-600 mb-1">Growth Rate</p>
              <p className="text-sm sm:text-lg font-black text-purple-600">{formatGrowth(periodReport?.summary?.growthRate)}</p>
            </div>
          </div>
        </div>

        {/* Chart 2: Category Distribution - Pie Chart with 3D effect */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Sales by Category</h3>
              <p className="text-xs text-slate-600">Category-wise revenue distribution</p>
            </div>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <filter id="pieShadow3D" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.35"/>
                  </filter>
                  <filter id="pieGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <linearGradient id="pieGrad0" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={1}/>
                    <stop offset="50%" stopColor="#f97316" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="pieGrad1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={1}/>
                    <stop offset="50%" stopColor="#ec4899" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="pieGrad2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#64748b" stopOpacity={1}/>
                    <stop offset="50%" stopColor="#64748b" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#64748b" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="pieGrad3" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="pieGrad4" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="pieGrad5" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <Pie
                  data={getCategoryChartData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  filter="url(#pieGlow)"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {getCategoryChartData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#pieGrad${index % 6})`}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
                  formatter={(value, name) => [formatCurrency(value), name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Orders by Day - Bar Chart with 3D effect */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Orders Overview</h3>
              <p className="text-xs text-slate-600">Order count by period</p>
            </div>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getRevenueTrendData()} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  {BAR_COLORS.map((colors, index) => (
                    <linearGradient key={`barGrad${index}`} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.start} stopOpacity={1}/>
                      <stop offset="100%" stopColor={colors.end} stopOpacity={0.85}/>
                    </linearGradient>
                  ))}
                  <filter id="bar3DShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="3" dy="5" stdDeviation="4" floodOpacity="0.25"/>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
                  formatter={(value) => [formatNumber(value), 'Orders']}
                />
                <Bar 
                  dataKey="orders" 
                  radius={[6, 6, 0, 0]}
                  filter="url(#bar3DShadow)"
                >
                  {getRevenueTrendData().map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={`url(#barGradient${index % BAR_COLORS.length})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Revenue vs Orders Comparison - Line Chart with 3D effect */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Revenue vs Orders</h3>
              <p className="text-xs text-slate-600">Comparison trend analysis</p>
            </div>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getRevenueTrendData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <filter id="lineShadow3D" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.35"/>
                  </filter>
                  <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <linearGradient id="lineRevGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981"/>
                    <stop offset="100%" stopColor="#059669"/>
                  </linearGradient>
                  <linearGradient id="lineOrderGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f97316"/>
                    <stop offset="100%" stopColor="#ea580c"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(value) => `${currencySymbol}${isINR ? (value >= 10000000 ? (value/10000000).toFixed(0) + 'Cr' : value >= 100000 ? (value/100000).toFixed(0) + 'L' : (value/1000).toFixed(0) + 'K') : (value/1000).toFixed(0) + 'K'}`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '2px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 15px 35px rgba(0,0,0,0.15)' }}
                  formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : formatNumber(value), name === 'revenue' ? 'Revenue' : 'Orders']}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#lineRevGrad)"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: 'white', filter: 'drop-shadow(0 2px 4px rgba(16,185,129,0.4))' }}
                  activeDot={{ r: 9, strokeWidth: 4, stroke: 'white', filter: 'drop-shadow(0 4px 8px rgba(16,185,129,0.5))' }}
                  filter="url(#lineGlow)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="url(#lineOrderGrad)"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#f97316', strokeWidth: 3, stroke: 'white', filter: 'drop-shadow(0 2px 4px rgba(249,115,22,0.4))' }}
                  activeDot={{ r: 9, strokeWidth: 4, stroke: 'white', filter: 'drop-shadow(0 4px 8px rgba(249,115,22,0.5))' }}
                  filter="url(#lineGlow)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Performance & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
        {/* Category Performance */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4">Top Categories - This {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('ly', '')}</h3>
          <div className="space-y-4">
            {salesByCategory && salesByCategory.length > 0 ? (
              salesByCategory.slice(0, 4).map((category, index) => {
                const colors = ['blue', 'pink', 'slate', 'orange'];
                const color = colors[index % colors.length];
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <i className={`fas ${getCategoryIcon(category.category || category.name)} text-${color}-600`}></i>
                        <span className="text-xs sm:text-sm font-bold text-slate-900">{category.category || category.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs sm:text-sm font-bold text-green-600">{formatCurrency(category.revenue)}</span>
                        <span className={`text-xs font-bold text-${color}-600`}>{(category.percentage || 0).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 sm:h-3">
                      <div
                        className={`bg-gradient-to-r from-${color}-500 to-${color}-600 h-2 sm:h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(category.percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{formatNumber(category.orders || 0)} orders</p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500">
                <i className="fas fa-chart-pie text-4xl mb-3 opacity-50"></i>
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4">Top Selling Products</h3>
          <div className="space-y-3 sm:space-y-4">
            {topProducts && topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((product, index) => {
                const bgColors = ['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-red-600', 'from-purple-500 to-pink-600', 'from-cyan-500 to-blue-600'];
                return (
                  <div key={index} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${bgColors[index % bgColors.length]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-black text-xs sm:text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{product.name || 'Unknown Product'}</p>
                      <p className="text-xs text-slate-600">{product.category || 'Uncategorized'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-black text-green-600">{formatCurrency(product.revenue)}</p>
                      <p className="text-xs text-slate-600">{formatNumber(product.totalSold)} units</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500">
                <i className="fas fa-box-open text-4xl mb-3 opacity-50"></i>
                <p>No product data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Geographic Performance */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <h3 className="text-base sm:text-xl font-black text-slate-900 mb-4 sm:mb-6">Geographic Performance - Top Countries</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {salesByRegion && salesByRegion.length > 0 ? (
            salesByRegion.slice(0, 5).map((region, index) => {
              const bgColors = ['from-blue-50 to-indigo-50 border-blue-200', 'from-red-50 to-orange-50 border-red-200', 'from-orange-50 to-amber-50 border-orange-200', 'from-slate-50 to-zinc-50 border-slate-200', 'from-green-50 to-emerald-50 border-green-200'];
              const textColors = ['text-blue-600', 'text-red-600', 'text-orange-600', 'text-slate-700', 'text-green-600'];
              return (
                <div key={index} className={`bg-gradient-to-br ${bgColors[index % bgColors.length]} rounded-xl p-3 sm:p-4 border-2`}>
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="text-xl sm:text-3xl">{getCountryFlag(region.country)}</span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black text-slate-900 truncate">{region.country}</p>
                      <p className="text-xs text-slate-600">{region.countryCode}</p>
                    </div>
                  </div>
                  <p className={`text-lg sm:text-2xl font-black ${textColors[index % textColors.length]} mb-1`}>{formatCurrency(region.revenue)}</p>
                  <p className="text-xs font-bold text-slate-600">{formatNumber(region.orders)} orders • {(region.percentage || 0).toFixed(1)}%</p>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-8 text-slate-500">
              <i className="fas fa-globe text-4xl mb-3 opacity-50"></i>
              <p>No geographic data available</p>
            </div>
          )}
        </div>
      </div>

      {/* User Activity & KPI Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
        {/* User Activity */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4">User Activity Overview</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user-plus text-white text-sm sm:text-base"></i>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">New Registrations</p>
                  <p className="text-xs text-slate-600">This {activeTab.replace('ly', '')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg sm:text-2xl font-black text-blue-600">{formatNumber(userActivity?.newRegistrations?.value || overview?.newUsers?.current)}</p>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">{formatGrowth(userActivity?.newRegistrations?.growth || overview?.newUsers?.growth)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-eye text-white text-sm sm:text-base"></i>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Total Page Views</p>
                  <p className="text-xs text-slate-600">This {activeTab.replace('ly', '')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg sm:text-2xl font-black text-purple-600">{formatNumber(userActivity?.totalPageViews?.value || 0)}</p>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">{formatGrowth(userActivity?.totalPageViews?.growth || 0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-white text-sm sm:text-base"></i>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Active Users</p>
                  <p className="text-xs text-slate-600">Daily average</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg sm:text-2xl font-black text-emerald-600">{formatNumber(userActivity?.activeUsers?.value || 0)}</p>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">{formatGrowth(userActivity?.activeUsers?.growth || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4">Key Performance Metrics</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-white text-sm sm:text-base"></i>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Order Success Rate</p>
                  <p className="text-xs text-slate-600">{kpiMetrics?.orderSuccessRate?.label || 'Completed orders'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg sm:text-2xl font-black text-green-600">{(parseFloat(kpiMetrics?.orderSuccessRate?.value) || 0).toFixed(1)}%</p>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">{formatGrowth(kpiMetrics?.orderSuccessRate?.growth)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-cyan-50 rounded-xl border border-cyan-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-shopping-bag text-white text-sm sm:text-base"></i>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Average Order Value</p>
                  <p className="text-xs text-slate-600">{kpiMetrics?.avgOrderValue?.label || 'Per transaction'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg sm:text-2xl font-black text-cyan-600">{formatCurrency(kpiMetrics?.avgOrderValue?.value)}</p>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">{formatGrowth(kpiMetrics?.avgOrderValue?.growth)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-pink-50 rounded-xl border border-pink-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-redo text-white text-sm sm:text-base"></i>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Customer Return Rate</p>
                  <p className="text-xs text-slate-600">{kpiMetrics?.customerReturnRate?.label || 'Repeat customers'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg sm:text-2xl font-black text-pink-600">{(parseFloat(kpiMetrics?.customerReturnRate?.value) || 0).toFixed(1)}%</p>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">{formatGrowth(kpiMetrics?.customerReturnRate?.growth)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-star text-white text-sm sm:text-base"></i>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Customer Satisfaction</p>
                  <p className="text-xs text-slate-600">{kpiMetrics?.customerSatisfaction?.label || 'Average rating'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg sm:text-2xl font-black text-indigo-600">{(parseFloat(kpiMetrics?.customerSatisfaction?.value) || 0).toFixed(1)}/5</p>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">+{(kpiMetrics?.customerSatisfaction?.growth || 0).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary & Export Options */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report Summary</h3>
            <p className="text-xs sm:text-sm text-indigo-100">
              Overall performance is <strong>{(overview?.revenue?.growth || 0) >= 10 ? 'excellent' : (overview?.revenue?.growth || 0) >= 5 ? 'good' : 'moderate'}</strong> with 
              {(overview?.revenue?.growth || 0) >= 0 ? ' growth' : ' decline'} across metrics. 
              Revenue {formatGrowth(overview?.revenue?.growth)}, new users {formatGrowth(overview?.newUsers?.growth)}, and conversion rate {formatGrowth(overview?.conversionRate?.growth)}.
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowEmailModal(true)}
              className="flex-1 sm:flex-none bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold hover:bg-opacity-30 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-envelope"></i>
              Email Report
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex-1 sm:flex-none bg-white text-indigo-600 px-4 sm:px-5 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-file-pdf"></i>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Email Report Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <i className="fas fa-envelope text-indigo-600"></i>
                  Email Report
                </h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200"
                >
                  <i className="fas fa-times text-slate-600"></i>
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-1">Send the {activeTab} report to recipients via email</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Recipients */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Recipients <span className="text-red-500">*</span>
                </label>
                {emailForm.recipients.map((recipient, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={recipient.email}
                      onChange={(e) => updateEmailRecipient(index, 'email', e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Name (optional)"
                      value={recipient.name}
                      onChange={(e) => updateEmailRecipient(index, 'name', e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
                    />
                    {emailForm.recipients.length > 1 && (
                      <button
                        onClick={() => removeEmailRecipient(index)}
                        className="w-10 h-10 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addEmailRecipient}
                  className="text-sm text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1"
                >
                  <i className="fas fa-plus"></i> Add Recipient
                </button>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subject (optional)</label>
                <input
                  type="text"
                  placeholder={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report - Nexarion Global Exports`}
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Message (optional)</label>
                <textarea
                  placeholder="Add a custom message to include in the email..."
                  value={emailForm.message}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm resize-none"
                />
              </div>

              {/* Info */}
              <div className="bg-indigo-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-info-circle text-indigo-600 mt-0.5"></i>
                  <div className="text-sm text-slate-700">
                    <p className="font-bold mb-1">Report Includes:</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• PDF attachment with full {activeTab} report</li>
                      <li>• Revenue, orders, and user metrics summary</li>
                      <li>• Charts and performance data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailReport}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Send Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Report Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <i className="fas fa-calendar-alt text-indigo-600"></i>
                  Schedule Report
                </h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200"
                >
                  <i className="fas fa-times text-slate-600"></i>
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-1">Set up automatic report generation and delivery</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Report Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Report Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Weekly Sales Report"
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
                />
              </div>

              {/* Report Type & Frequency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Report Type</label>
                  <select
                    value={scheduleForm.reportType}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, reportType: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Frequency</label>
                  <select
                    value={scheduleForm.frequency}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Day & Time */}
              <div className="grid grid-cols-2 gap-4">
                {scheduleForm.frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Day of Week</label>
                    <select
                      value={scheduleForm.dayOfWeek}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
                    >
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                  </div>
                )}
                {scheduleForm.frequency === 'monthly' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Day of Month</label>
                    <select
                      value={scheduleForm.dayOfMonth}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
                    >
                      {[...Array(28)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={scheduleForm.frequency === 'daily' ? 'col-span-2' : ''}>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Report Format</label>
                <div className="flex gap-3">
                  {['pdf', 'csv', 'excel'].map((format) => (
                    <button
                      key={format}
                      onClick={() => setScheduleForm(prev => ({ ...prev, format }))}
                      className={`flex-1 px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                        scheduleForm.format === format
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <i className={`fas fa-file-${format === 'excel' ? 'excel' : format} mr-2`}></i>
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Recipients <span className="text-red-500">*</span>
                </label>
                {scheduleForm.recipients.map((recipient, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={recipient.email}
                      onChange={(e) => updateScheduleRecipient(index, 'email', e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Name (optional)"
                      value={recipient.name}
                      onChange={(e) => updateScheduleRecipient(index, 'name', e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
                    />
                    {scheduleForm.recipients.length > 1 && (
                      <button
                        onClick={() => removeScheduleRecipient(index)}
                        className="w-10 h-10 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addScheduleRecipient}
                  className="text-sm text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1"
                >
                  <i className="fas fa-plus"></i> Add Recipient
                </button>
              </div>

              {/* Schedule Summary */}
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-clock text-green-600 mt-0.5"></i>
                  <div className="text-sm text-slate-700">
                    <p className="font-bold mb-1">Schedule Summary:</p>
                    <p className="text-xs text-slate-600">
                      {scheduleForm.name || 'Report'} will be generated and emailed{' '}
                      <strong>
                        {scheduleForm.frequency === 'daily' ? 'every day' : 
                         scheduleForm.frequency === 'weekly' ? `every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][scheduleForm.dayOfWeek]}` :
                         `on day ${scheduleForm.dayOfMonth} of each month`}
                      </strong>
                      {' '}at <strong>{scheduleForm.time}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleReport}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-calendar-check"></i>
                    Schedule Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Delete Scheduled Report</h3>
              <p className="text-slate-600">
                Are you sure you want to delete the scheduled report "<strong>{deleteConfirm.reportName}</strong>"? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, reportId: null, reportName: '' })}
                className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteScheduledReport}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg flex items-center justify-center gap-2"
              >
                <i className="fas fa-trash"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
