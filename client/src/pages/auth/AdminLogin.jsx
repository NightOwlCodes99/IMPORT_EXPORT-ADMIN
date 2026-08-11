import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { setCredentials } from '../../store/slices/authSlice';
import { apiConnector } from '../../services/apiconnector';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://nexarion-production.vercel.app/api";
import { Mail, Lock, Eye, EyeOff, Globe, Shield, CheckCircle } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      // Hidden admin endpoint
      const response = await apiConnector(
        'POST',
        `${BASE_URL}/auth/admin`,
        formData
      );

      if (response.data.success) {
        // Check if OTP is required
        if (response.data.requiresOTP) {
          toast.success('OTP sent to your email');
          
          if (response.data.devOTP) {
            console.log(`%c 🔐 Admin OTP: ${response.data.devOTP} `, 'background: #222; color: #bada55; font-size: 16px;');
          }

          navigate('/nexarion/admin/verify-otp', { state: { email: response.data.email || formData.email } });
          return;
        }
        
        // Direct login (no OTP required - fallback)
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Update Redux store with credentials
        dispatch(setCredentials({
          user: response.data.user,
          token: response.data.token
        }));
        
        // Check if user is actually an admin
        if (response.data.user.role !== 'admin') {
          toast.error('Access denied. Admin privileges required.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        
        toast.success('Welcome back, Admin!');
        navigate('/admin');
      }
    } catch (error) {
toast.error(error.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-violet-100 p-4 overflow-hidden">
      
      {/* Contained Card */}
      <div className="w-full max-w-6xl h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex">
      
        {/* Left Side - Admin Branding with Glassmorphism */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-600 p-8 flex-col justify-between relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 space-y-4">
            {/* Header with Logo */}
            <div className="animate-[fadeInUp_0.6s_ease-out]">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="text-white" size={26} />
                </div>
                <div>
                  <h1 className="font-black text-xl text-white leading-none">Nexarion</h1>
                  <p className="text-[11px] text-purple-100 font-semibold uppercase tracking-wider mt-0.5">Global Exports</p>
                </div>
              </Link>
            </div>

            {/* Main Heading */}
            <div className="animate-[fadeInUp_0.8s_ease-out]">
              <h1 className="text-3xl font-black text-white mb-2 leading-tight">
                Secure Access
              </h1>
              <p className="text-sm text-white/95 leading-relaxed">
                Administrative dashboard for managing global trading operations and monitoring business performance.
              </p>
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-2 gap-2 animate-[scaleIn_1s_ease-out]">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/20 hover:bg-white/15 transition-all">
                <p className="text-lg font-black text-white mb-0.5">24/7</p>
                <p className="text-white/90 text-[11px] font-medium">System Monitoring</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/20 hover:bg-white/15 transition-all">
                <p className="text-lg font-black text-white mb-0.5">100%</p>
                <p className="text-white/90 text-[11px] font-medium">Secure Access</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/20 hover:bg-white/15 transition-all">
                <p className="text-lg font-black text-white mb-0.5">Real-time</p>
                <p className="text-white/90 text-[11px] font-medium">Data Analytics</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/20 hover:bg-white/15 transition-all">
                <p className="text-lg font-black text-white mb-0.5">Encrypted</p>
                <p className="text-white/90 text-[11px] font-medium">Communications</p>
              </div>
            </div>

            {/* Admin Features */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 animate-[fadeInUp_1.2s_ease-out]">
              <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                <CheckCircle size={15} className="text-purple-200" />
                Admin Capabilities
              </h3>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-white/95 text-xs">
                  <CheckCircle size={13} className="text-purple-200 flex-shrink-0" />
                  <span>User Management & Control</span>
                </li>
                <li className="flex items-center gap-2 text-white/95 text-xs">
                  <CheckCircle size={13} className="text-purple-200 flex-shrink-0" />
                  <span>Order & Quote Tracking</span>
                </li>
                <li className="flex items-center gap-2 text-white/95 text-xs">
                  <CheckCircle size={13} className="text-purple-200 flex-shrink-0" />
                  <span>Product & Inventory Management</span>
                </li>
                <li className="flex items-center gap-2 text-white/95 text-xs">
                  <CheckCircle size={13} className="text-purple-200 flex-shrink-0" />
                  <span>Analytics & Reports</span>
                </li>
              </ul>
            </div>

            {/* Security Notice */}
            <div className="bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 animate-[fadeInUp_1.4s_ease-out]">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Shield className="text-white" size={15} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-xs mb-0.5">
                    Enhanced Security
                  </p>
                  <p className="text-white/80 text-[11px] leading-relaxed">
                    All admin actions are logged and monitored. Use your credentials responsibly.
                  </p>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-2 gap-2 animate-[scaleIn_1.6s_ease-out]">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/20 text-center hover:bg-white/15 transition-all">
                <p className="text-white font-black text-base flex items-center justify-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
                  Online
                </p>
                <p className="text-white/80 text-[10px] font-medium">System Status</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/20 text-center hover:bg-white/15 transition-all">
                <p className="text-white font-black text-base mb-0.5">256-bit</p>
                <p className="text-white/80 text-[10px] font-medium">Encryption</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex items-center justify-center gap-3 text-white/90 text-[11px] font-medium">
            <div className="flex items-center gap-1">
              <Shield size={12} />
              <span>Secure</span>
            </div>
            <span className="text-white/50">•</span>
            <div className="flex items-center gap-1">
              <Lock size={12} />
              <span>Encrypted</span>
            </div>
            <span className="text-white/50">•</span>
            <span>© 2026 Nexarion</span>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-md space-y-6">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="text-white" size={32} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Admin Login</h2>
              <p className="text-gray-600 text-sm">Access the admin dashboard securely</p>
            </div>

            {/* Security Notice */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-start gap-2">
              <div className="w-5 h-5 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="text-white" size={12} />
              </div>
              <p className="text-purple-700 text-xs leading-relaxed">
                <span className="font-semibold">Enhanced Security:</span> OTP verification is required for all admin logins
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@nexarion.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    <span>Login to Admin Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Security Footer */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield size={12} />
                  <span>Secure login with encryption</span>
                </div>
                <span>•</span>
                <span>IP address logged</span>
              </div>
              
              <div className="text-center mt-3">
                <p className="text-xs text-gray-500">
                  Authorized personnel only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
