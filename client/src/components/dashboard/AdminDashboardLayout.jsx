import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { logout } from '../../store/slices/authSlice';
import nexarionLogo from '../../assets/nexarion_logo.png';
import NotificationDropdown from './NotificationDropdown';
import { AdminCurrencyProvider } from '../../hooks/useAdminCurrency';
import AdminCurrencyToggle, { AdminCurrencyToggleCompact } from '../admin/AdminCurrencyToggle';

const AdminDashboardLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar helper
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dispatch logout
    dispatch(logout());
    toast.success('Logged out successfully');
    // Hard navigate to ensure clean state
    window.location.href = '/nexarion/admin/login';
  };

  const navItems = [
    {
      section: 'Overview',
      items: [
        { path: '/admin/dashboard', icon: 'fa-chart-line', label: 'Dashboard', gradient: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50', iconColor: 'text-emerald-500' }
      ]
    },
    {
      section: 'Management',
      items: [
        { path: '/admin/users', icon: 'fa-users', label: 'Users', gradient: 'from-blue-500 to-indigo-600', bgLight: 'bg-blue-50', iconColor: 'text-blue-500' },
        { path: '/admin/suppliers', icon: 'fa-building', label: 'Suppliers', gradient: 'from-purple-500 to-violet-600', bgLight: 'bg-purple-50', iconColor: 'text-purple-500' },
        { path: '/admin/products', icon: 'fa-box', label: 'Products', gradient: 'from-orange-500 to-amber-600', bgLight: 'bg-orange-50', iconColor: 'text-orange-500' },
        { path: '/admin/orders', icon: 'fa-shopping-cart', label: 'Orders', gradient: 'from-pink-500 to-rose-600', bgLight: 'bg-pink-50', iconColor: 'text-pink-500' }
      ]
    },
    {
      section: 'Operations',
      items: [
        { path: '/admin/shipments', icon: 'fa-shipping-fast', label: 'Shipping', gradient: 'from-cyan-500 to-teal-600', bgLight: 'bg-cyan-50', iconColor: 'text-cyan-500' },
        { path: '/admin/payments', icon: 'fa-dollar-sign', label: 'Payments', gradient: 'from-green-500 to-emerald-600', bgLight: 'bg-green-50', iconColor: 'text-green-500' },
        { path: '/admin/quotes', icon: 'fa-file-invoice', label: 'Quote Requests', gradient: 'from-violet-500 to-purple-600', bgLight: 'bg-violet-50', iconColor: 'text-violet-500' }
      ]
    },
    {
      section: 'Inventory',
      items: [
        { path: '/admin/inventory', icon: 'fa-warehouse', label: 'Manage Inventory', gradient: 'from-violet-500 to-purple-600', bgLight: 'bg-violet-50', iconColor: 'text-violet-500' },
        { path: '/admin/categories', icon: 'fa-tags', label: 'Categories', gradient: 'from-amber-500 to-yellow-600', bgLight: 'bg-amber-50', iconColor: 'text-amber-500' },
        { path: '/admin/brands', icon: 'fa-copyright', label: 'Brands', gradient: 'from-rose-500 to-red-600', bgLight: 'bg-rose-50', iconColor: 'text-rose-500' },
        { path: '/admin/catalogs', icon: 'fa-book', label: 'Catalogs', gradient: 'from-teal-500 to-emerald-600', bgLight: 'bg-teal-50', iconColor: 'text-teal-500' }
      ]
    },
    {
      section: 'System',
      items: [
        { path: '/admin/site-stats', icon: 'fa-chart-bar', label: 'Site Statistics', gradient: 'from-lime-500 to-green-600', bgLight: 'bg-lime-50', iconColor: 'text-lime-500' },
        { path: '/admin/meetings', icon: 'fa-calendar-check', label: 'Meeting Requests', gradient: 'from-amber-500 to-orange-600', bgLight: 'bg-amber-50', iconColor: 'text-amber-500' },
        { path: '/admin/support-tickets', icon: 'fa-headset', label: 'Support Tickets', gradient: 'from-teal-500 to-cyan-600', bgLight: 'bg-teal-50', iconColor: 'text-teal-500' },
        { path: '/admin/contacts', icon: 'fa-envelope', label: 'Contact Messages', gradient: 'from-indigo-500 to-blue-600', bgLight: 'bg-indigo-50', iconColor: 'text-indigo-500' },
        { path: '/admin/reports', icon: 'fa-chart-bar', label: 'Reports', gradient: 'from-sky-500 to-blue-600', bgLight: 'bg-sky-50', iconColor: 'text-sky-500' }
      ]
    }
  ];

  return (
    <AdminCurrencyProvider>
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileSidebar}
      />

      {/* LEFT SIDEBAR - Desktop (Hidden on Mobile) */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl flex-col transition-all duration-300 h-screen sticky top-0 flex-shrink-0 hidden lg:flex`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700/50">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden">
                <img src={nexarionLogo} alt="Nexarion" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">Nexarion</h1>
                <p className="text-[10px] text-emerald-400 font-semibold">Admin Panel</p>
              </div>
            </div>
          ) : (
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto overflow-hidden">
              <img src={nexarionLogo} alt="Nexarion" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Sidebar Navigation - Scrollable without visible scrollbar */}
        <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="space-y-1">
            {navItems.map((section, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-5' : ''}>
                {isSidebarOpen && (
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 mb-3">
                    {section.section}
                  </p>
                )}
                
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all mb-1 ${
                        isActive
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.gradient.split('-')[1]}-500/30`
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      } ${!isSidebarOpen ? 'justify-center' : ''}`
                    }
                    title={!isSidebarOpen ? item.label : ''}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : `${item.bgLight}`}`}>
                          <i className={`fas ${item.icon} text-sm ${isActive ? 'text-white' : item.iconColor}`}></i>
                        </div>
                        {isSidebarOpen && <span>{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </nav>

        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold text-sm transition-all"
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <i className={`fas fa-${isSidebarOpen ? 'angle-left' : 'angle-right'}`}></i>
            {isSidebarOpen && <span>Collapse</span>}
          </button>
        </div>

      </aside>

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl flex flex-col z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Sidebar Header */}
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden">
              <img src={nexarionLogo} alt="Nexarion" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white">Nexarion</h1>
              <p className="text-[9px] text-emerald-400 font-semibold">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={closeMobileSidebar}
            className="w-10 h-10 rounded-xl bg-slate-700/50 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Mobile Sidebar Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="space-y-1">
            {navItems.map((section, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-4' : ''}>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
                  {section.section}
                </p>
                
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all mb-1 ${
                        isActive
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : `${item.bgLight}`}`}>
                          <i className={`fas ${item.icon} text-xs ${isActive ? 'text-white' : item.iconColor}`}></i>
                        </div>
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </nav>

        {/* Mobile Sidebar Footer */}
        <div className="p-3 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl font-bold text-sm transition-all"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto h-screen">
        
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-4">
              
              {/* Mobile Menu Button + Breadcrumb */}
              <div className="flex items-center gap-3">
                {/* Hamburger Menu - Mobile Only */}
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-all"
                >
                  <i className="fas fa-bars text-lg"></i>
                </button>
                
                {/* Breadcrumb */}
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="text-slate-900 font-semibold">Admin Panel</span>
                </div>
                
                {/* Mobile Logo */}
                <div className="sm:hidden flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src={nexarionLogo} alt="Nexarion" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-slate-900 text-sm">Admin</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Currency Toggle - Compact on mobile, full on desktop */}
                <AdminCurrencyToggleCompact className="sm:hidden" />
                <AdminCurrencyToggle className="hidden sm:flex" />
                
                {/* Welcome Text - Hidden on Mobile */}
                <div className="hidden md:block text-sm text-slate-700">
                  Welcome, <strong className="text-slate-900">{user?.name || 'Nexarion Admin'}</strong>
                </div>
                
                {/* Notification Bell */}
                <NotificationDropdown variant="admin" />
                
                {/* Logout Button - Desktop Only */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold text-sm transition-all"
                  title="Logout"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Outlet for nested routes */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>

      </div>
    </div>
    </AdminCurrencyProvider>
  );
};

export default AdminDashboardLayout;
