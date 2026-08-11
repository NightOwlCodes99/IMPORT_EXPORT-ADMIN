import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { setCredentials } from '../../store/slices/authSlice';
import { apiConnector } from '../../services/apiconnector';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://nexarion-production.vercel.app/api";
import { Globe, Shield, ArrowLeft, KeyRound, RefreshCw, CheckCircle, Clock } from 'lucide-react';

const AdminVerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const inputRefs = useRef([]);
  
  const email = location.state?.email;

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      toast.error('Please login first');
      navigate('/nexarion/admin/login');
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split('').forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      // Focus last filled input or last input
      const lastIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    if (timer === 0) {
      toast.error('OTP has expired. Please request a new one.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiConnector(
        'POST',
        `${BASE_URL}/auth/admin-verify-otp`,
        { email, otp: otpCode }
      );

      if (response.data?.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Update Redux store with credentials
        dispatch(setCredentials({
          user: response.data.user,
          token: response.data.token
        }));
        
        toast.success('Welcome back, Admin!');
        navigate('/admin');
      } else {
        toast.error(response.data?.message || response.data?.error || 'Invalid OTP. Please try again.');
        // Clear OTP fields on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
      // Clear OTP fields on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-violet-100 p-3 sm:p-4 lg:p-6">
      
      {/* Contained Card */}
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[480px] lg:min-h-[560px]">
      
        {/* Left Side - Security Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-600 p-6 xl:p-8 flex-col justify-between relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 space-y-3">
            {/* Header with Logo */}
            <div>
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="text-white" size={22} />
                </div>
                <div>
                  <h1 className="font-black text-lg text-white leading-none">Nexarion</h1>
                  <p className="text-white/80 text-[10px] font-medium tracking-wide">GLOBAL EXPORTS</p>
                </div>
              </Link>
            </div>

            {/* Main Title */}
            <div className="space-y-1 pt-2">
              <h2 className="text-2xl xl:text-3xl font-bold text-white leading-tight">
                Two-Factor<br /><span className="text-purple-200">Authentication</span>
              </h2>
              <p className="text-white/80 text-xs leading-relaxed max-w-xs">
                Enter the verification code sent to your email.
              </p>
            </div>
          </div>

          {/* Middle Content */}
          <div className="relative z-10 space-y-3">
            {/* Security Features */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                <div className="text-xl font-bold text-white">256-bit</div>
                <div className="text-white/70 text-[10px]">Encryption</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                <div className="text-xl font-bold text-white">10 min</div>
                <div className="text-white/70 text-[10px]">OTP Validity</div>
              </div>
            </div>

            {/* Security List */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-2 text-xs">
                <Shield size={14} />
                Security Measures
              </h3>
              <ul className="space-y-1 text-xs">
                <li className="text-white/80 flex items-center gap-2">
                  <CheckCircle size={12} className="text-green-300" />
                  One-time password verification
                </li>
                <li className="text-white/80 flex items-center gap-2">
                  <CheckCircle size={12} className="text-green-300" />
                  IP address logging enabled
                </li>
                <li className="text-white/80 flex items-center gap-2">
                  <CheckCircle size={12} className="text-green-300" />
                  Session encryption active
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-white/90 text-[10px]">Secure</span>
            </div>
            <span className="text-white/60">•</span>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-1 rounded-full">
              <Shield size={10} className="text-white/90" />
              <span className="text-white/90 text-[10px]">2FA</span>
            </div>
            <span className="text-white/60">•</span>
            <span className="text-white/60 text-[10px]">© 2026</span>
          </div>
        </div>

        {/* Right Side - OTP Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-5 sm:px-8 lg:px-10 xl:px-12 py-6 lg:py-8">
          <div className="max-w-sm mx-auto w-full">
            {/* Back Button - Enhanced */}
            <button 
              type="button"
              onClick={() => navigate('/nexarion/admin/login')}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-indigo-50 text-gray-600 hover:text-purple-700 rounded-lg border border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-300 mb-5 group cursor-pointer"
            >
              <div className="w-5 h-5 bg-white rounded flex items-center justify-center shadow-sm group-hover:bg-purple-100 transition-colors">
                <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="text-xs font-medium">Back to Login</span>
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <KeyRound className="text-purple-600" size={24} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Enter Verification Code</h2>
              <p className="text-gray-500 text-xs sm:text-sm">
                Code sent to <span className="font-medium text-gray-700 break-all">{email}</span>
              </p>
            </div>

            {/* Timer */}
            <div className={`flex items-center justify-center gap-1.5 mb-4 px-3 py-2 rounded-full mx-auto w-fit font-medium text-xs sm:text-sm ${timer < 60 ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600'}`}>
              <Clock size={14} />
              <span>{timer > 0 ? `Expires in ${formatTime(timer)}` : 'Code expired'}</span>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* OTP Input Fields */}
              <div className="flex justify-center gap-1.5 sm:gap-2 lg:gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-11 sm:w-11 sm:h-12 lg:w-12 lg:h-14 text-center text-lg sm:text-xl lg:text-2xl font-bold border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-gray-50 focus:bg-white hover:border-gray-300"
                    disabled={loading || timer === 0}
                  />
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6 || timer === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 sm:py-3.5 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    Verify & Login
                  </>
                )}
              </button>
            </form>

            {/* Resend OTP */}
            <div className="mt-4 text-center">
              <p className="text-gray-500 text-xs mb-1.5">Didn't receive the code?</p>
              <button
                onClick={() => navigate('/nexarion/admin/login')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg font-medium text-xs transition-all"
              >
                <RefreshCw size={14} />
                Go back and try again
              </button>
            </div>

            {/* Notices Row */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-700 text-[11px] leading-relaxed">
                  <strong>Security:</strong> Never share your OTP
                </p>
              </div>
              {import.meta.env.DEV && (
                <div className="flex-1 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-600 text-[11px] leading-relaxed">
                    <strong>Dev:</strong> Check console for OTP
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVerifyOTP;
