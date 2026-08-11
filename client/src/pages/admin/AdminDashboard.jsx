import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { apiConnector } from '../../services/apiconnector';
import { adminEndpoints } from '../../services/apis';
import { useAdminCurrencyFormatter } from '../../hooks/useAdminCurrency';

const { GET_ADMIN_DASHBOARD_API } = adminEndpoints;

// Helper function to format relative time
const formatTimeAgo = (date) => {
  if (!date) return 'Recently';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('monthly');
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    orderStats: {},
    recentActivity: {},
    revenueTrend: [],
    topCategories: [],
    activityFeed: []
  });
  
  // Currency formatting hook
  const { format: formatCurrency, isINR } = useAdminCurrencyFormatter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiConnector(
        'GET',
        GET_ADMIN_DASHBOARD_API,
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-circle-notch fa-spin text-4xl text-emerald-500"></i>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mb-2 flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <i className="fas fa-chart-line text-white text-lg sm:text-xl"></i>
              </div>
              <span className="break-words">Dashboard Overview</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">Welcome back, Admin! Here's what's happening today.</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={fetchDashboardData}
              className="flex-1 sm:flex-none bg-white border-2 border-slate-200 text-slate-700 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-download"></i>
              <span className="hidden xs:inline">Export Report</span>
              <span className="xs:hidden">Export</span>
            </button>
            <button 
              onClick={fetchDashboardData}
              className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        
        {/* Total Revenue Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white opacity-10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <i className={`fas ${isINR ? 'fa-rupee-sign' : 'fa-dollar-sign'} text-white text-lg sm:text-xl`}></i>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-100 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
                <i className={`fas fa-arrow-${(dashboardData.overview.revenueGrowth || 0) >= 0 ? 'up' : 'down'} text-xs`}></i> {Math.abs(dashboardData.overview.revenueGrowth || 0)}%
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 mb-1">Total Revenue</p>
            <p className="text-2xl sm:text-3xl font-black text-white mb-2">
              {formatCurrency(dashboardData.overview.totalRevenue || 0)}
            </p>
            <p className="text-[10px] sm:text-xs text-emerald-100">vs last month: {(dashboardData.overview.revenueDiff || 0) >= 0 ? '+' : '-'}{formatCurrency(Math.abs(dashboardData.overview.revenueDiff || 0))}</p>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white opacity-10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <i className="fas fa-users text-white text-lg sm:text-xl"></i>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-blue-100 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
                <i className={`fas fa-arrow-${(dashboardData.overview.userGrowth || 0) >= 0 ? 'up' : 'down'} text-xs`}></i> {Math.abs(dashboardData.overview.userGrowth || 0)}%
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 mb-1">Active Users</p>
            <p className="text-2xl sm:text-3xl font-black text-white mb-2">
              {(dashboardData.overview.totalUsers || 0).toLocaleString()}
            </p>
            <p className="text-[10px] sm:text-xs text-blue-100">Total registered users</p>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white opacity-10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <i className="fas fa-shopping-cart text-white text-lg sm:text-xl"></i>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-purple-100 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
                <i className={`fas fa-arrow-${(dashboardData.overview.orderGrowth || 0) >= 0 ? 'up' : 'down'} text-xs`}></i> {Math.abs(dashboardData.overview.orderGrowth || 0)}%
              </span>
            </div>
            <p className="text-xs sm:text-sm text-purple-100 mb-1">Total Orders</p>
            <p className="text-2xl sm:text-3xl font-black text-white mb-2">
              {(dashboardData.overview.totalOrders || 0).toLocaleString()}
            </p>
            <p className="text-[10px] sm:text-xs text-purple-100">Pending: {dashboardData.orderStats?.pending || 0} | Completed: {dashboardData.orderStats?.completed || 0}</p>
          </div>
        </div>

        {/* Products Listed Card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white opacity-10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <i className="fas fa-box text-white text-lg sm:text-xl"></i>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-orange-100 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
                <i className={`fas fa-arrow-${(dashboardData.overview.productGrowth || 0) >= 0 ? 'up' : 'down'} text-xs`}></i> {Math.abs(dashboardData.overview.productGrowth || 0)}%
              </span>
            </div>
            <p className="text-xs sm:text-sm text-orange-100 mb-1">Products Listed</p>
            <p className="text-2xl sm:text-3xl font-black text-white mb-2">
              {(dashboardData.overview.totalProducts || 0).toLocaleString()}
            </p>
            <p className="text-[10px] sm:text-xs text-orange-100">Active products in catalog</p>
          </div>
        </div>

      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        
        {/* Pending Verifications */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all border-2 border-slate-200 hover:border-amber-500">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-clock text-amber-600 text-sm sm:text-lg"></i>
            </div>
            <span className="text-lg sm:text-xl font-black text-amber-600">{dashboardData.overview.pendingVerifications || 0}</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 sm:mb-1">Pending Verifications</p>
          <p className="text-[10px] sm:text-xs text-slate-600 hidden sm:block">Suppliers awaiting approval</p>
        </div>

        {/* Active Shipments */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all border-2 border-slate-200 hover:border-cyan-500">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-shipping-fast text-cyan-600 text-sm sm:text-lg"></i>
            </div>
            <span className="text-lg sm:text-xl font-black text-cyan-600">
              {dashboardData.overview.totalShipments || 0}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 sm:mb-1">Active Shipments</p>
          <p className="text-[10px] sm:text-xs text-slate-600 hidden sm:block">Currently in transit</p>
        </div>

        {/* Commission Earned */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all border-2 border-slate-200 hover:border-green-500">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-percentage text-green-600 text-sm sm:text-lg"></i>
            </div>
            <span className="text-lg sm:text-xl font-black text-green-600">{formatCurrency(dashboardData.overview.commissionEarned || 0)}</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 sm:mb-1">Commission</p>
          <p className="text-[10px] sm:text-xs text-slate-600 hidden sm:block">This month</p>
        </div>

        {/* Quote Requests */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all border-2 border-slate-200 hover:border-violet-500">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-file-invoice text-violet-600 text-sm sm:text-lg"></i>
            </div>
            <span className="text-lg sm:text-xl font-black text-violet-600">
              {dashboardData.overview.totalQuotes || 0}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 sm:mb-1">Quote Requests</p>
          <p className="text-[10px] sm:text-xs text-slate-600 hidden sm:block">New RFQs this week</p>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Revenue Trend</h3>
              <p className="text-[10px] sm:text-xs text-slate-600">Last 6 months performance</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setChartView('monthly')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${chartView === 'monthly' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setChartView('weekly')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${chartView === 'weekly' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Weekly
              </button>
            </div>
          </div>
          
          {/* Chart */}
          {dashboardData.revenueTrend && dashboardData.revenueTrend.length > 0 ? (
            <>
              <div className="flex items-end justify-between h-32 sm:h-48 gap-1.5 sm:gap-3">
                {dashboardData.revenueTrend.map((item, index) => {
                  const maxRevenue = Math.max(...dashboardData.revenueTrend.map(t => t.revenue), 1);
                  const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 5;
                  return (
                    <div 
                      key={index}
                      className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-500 rounded-t-md sm:rounded-t-lg transition-all hover:opacity-80 relative group cursor-pointer"
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <p className="font-bold">{formatCurrency(item.revenue)}</p>
                        <p className="text-slate-300">{item.orders} orders</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 sm:mt-3">
                {dashboardData.revenueTrend.map((item, index) => (
                  <span key={index} className="text-[9px] sm:text-xs text-slate-500 font-semibold">{item.month}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-32 sm:h-48 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-chart-bar text-3xl sm:text-4xl text-slate-300 mb-2"></i>
                <p className="text-slate-500 text-xs sm:text-sm">No revenue data yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-slate-200">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-black text-slate-900">Top Categories</h3>
            <p className="text-[10px] sm:text-xs text-slate-600">By order volume</p>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {dashboardData.topCategories && dashboardData.topCategories.length > 0 ? (
              dashboardData.topCategories.map((category, index) => {
                const colorClasses = {
                  blue: { bar: 'from-blue-500 to-indigo-600', text: 'text-blue-600' },
                  pink: { bar: 'from-pink-500 to-rose-600', text: 'text-pink-600' },
                  slate: { bar: 'from-slate-500 to-slate-600', text: 'text-slate-600' },
                  orange: { bar: 'from-orange-500 to-amber-600', text: 'text-orange-600' },
                  emerald: { bar: 'from-emerald-500 to-teal-600', text: 'text-emerald-600' }
                };
                const colors = colorClasses[category.color] || colorClasses.slate;
                
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[60%]">{category.name}</span>
                      <span className={`text-xs sm:text-sm font-bold ${colors.text}`}>{category.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 sm:h-3">
                      <div 
                        className={`bg-gradient-to-r ${colors.bar} h-2 sm:h-3 rounded-full transition-all`} 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-32 sm:h-40 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-folder-open text-3xl sm:text-4xl text-slate-300 mb-2"></i>
                  <p className="text-slate-500 text-xs sm:text-sm">No category data yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-slate-200">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">Recent Activity</h3>
            <p className="text-[10px] sm:text-xs text-slate-600">Latest platform updates</p>
          </div>
          <button className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-all">
            View All
            <i className="fas fa-arrow-right text-xs"></i>
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {dashboardData.activityFeed && dashboardData.activityFeed.length > 0 ? (
            dashboardData.activityFeed.map((activity, index) => {
              const colorMap = {
                emerald: 'from-emerald-500 to-teal-600',
                blue: 'from-blue-500 to-indigo-600',
                purple: 'from-purple-500 to-pink-600',
                violet: 'from-violet-500 to-purple-600',
                amber: 'from-amber-500 to-orange-600'
              };
              const bgColor = colorMap[activity.color] || colorMap.emerald;
              
              return (
                <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <i className={`fas fa-${activity.icon} text-white text-xs sm:text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{activity.title}</p>
                    <p className="text-[10px] sm:text-xs text-slate-600 mb-0.5 sm:mb-1 line-clamp-2">{activity.description}</p>
                    <span className="text-[10px] sm:text-xs text-slate-500">
                      {formatTimeAgo(activity.time)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 sm:py-8 text-center">
              <i className="fas fa-history text-3xl sm:text-4xl text-slate-300 mb-2"></i>
              <p className="text-slate-500 text-xs sm:text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
