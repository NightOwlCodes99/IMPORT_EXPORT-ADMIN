import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminDashboardLayout from './components/dashboard/AdminDashboardLayout';
import SplashScreen from './components/SplashScreen';
import ScrollToTop from './components/ScrollToTop';
import SessionTimeout from './components/SessionTimeout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/auth/AdminLogin';
import AdminVerifyOTP from './pages/auth/AdminVerifyOTP';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminShipments from './pages/admin/AdminShipments';
import AdminPayments from './pages/admin/AdminPayments';
import AdminQuotes from './pages/admin/AdminQuotes';
import AdminContacts from './pages/admin/AdminContacts';
import AdminReports from './pages/admin/AdminReports';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBrands from './pages/admin/AdminBrands';
import AdminCatalogs from './pages/admin/AdminCatalogs';
import AdminInventory from './pages/admin/AdminInventory';
import AdminSupportTickets from './pages/admin/AdminSupportTickets';
import AdminMeetings from './pages/admin/AdminMeetings';
import AdminSiteStats from './pages/admin/AdminSiteStats';
import NotificationsPage from './components/dashboard/NotificationsPage';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <h1 className="text-6xl font-black text-slate-900 mb-4">404</h1>
        <p className="text-xl text-slate-600 mb-6">Page Not Found</p>
        <p className="text-sm text-slate-500 mb-8">The page you are looking for does not exist.</p>
        <a
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm hover:shadow-xl transition-all"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <SplashScreen />
      <SessionTimeout />
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 20,
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,
          className: '',
          style: {
            background: '#ffffff',
            color: '#1f2937',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            fontWeight: '500',
            fontSize: '14px',
            maxWidth: '500px',
            minWidth: '300px',
          },
          success: {
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              color: '#065f46',
              border: '1px solid #10b981',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              color: '#991b1b',
              border: '1px solid #ef4444',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
          loading: {
            style: {
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              color: '#1e3a8a',
              border: '1px solid #3b82f6',
            },
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <ScrollToTop />
      <Routes>
        {/* Admin Login Route - Hidden path for security */}
        <Route path="/nexarion/admin/login" element={<AdminLogin />} />
        <Route path="/nexarion/admin/verify-otp" element={<AdminVerifyOTP />} />

        {/* Admin Dashboard routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/create" element={<AdminProductForm />} />
          <Route path="products/edit/:id" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="catalogs" element={<AdminCatalogs />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="shipments" element={<AdminShipments />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="quotes" element={<AdminQuotes />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="meetings" element={<AdminMeetings />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="site-stats" element={<AdminSiteStats />} />
          <Route path="support-tickets" element={<AdminSupportTickets />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Default redirect to admin login */}
        <Route path="/" element={<Navigate to="/nexarion/admin/login" replace />} />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
