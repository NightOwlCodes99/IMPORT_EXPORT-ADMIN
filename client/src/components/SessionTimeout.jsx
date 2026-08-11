import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const SessionTimeout = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const timeoutRef = useRef(null);

  // Session timeout duration (30 minutes for admin, 60 minutes for regular users)
  const SESSION_TIMEOUT = user?.role === 'admin' ? 30 * 60 * 1000 : 60 * 60 * 1000;

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dispatch logout
    dispatch(logout());
    // Hard navigate to appropriate login page
    window.location.href = user?.role === 'admin' ? '/nexarion/admin/login' : '/login';
  };

  const resetTimer = () => {
    // Clear existing timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!isAuthenticated) return;

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Events that reset the timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Reset timer on user activity
    const resetOnActivity = () => resetTimer();

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetOnActivity);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetOnActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isAuthenticated, user?.role]);

  return null; // This component doesn't render anything
};

export default SessionTimeout;
