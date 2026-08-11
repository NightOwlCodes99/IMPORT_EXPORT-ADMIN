import { apiconnector } from './apiconnector';
import { authEndpoints } from './apis';

const {
  ADMIN_LOGIN_API,
  ADMIN_VERIFY_OTP_API,
  LOGOUT_API,
  GET_ME_API,
  UPDATE_PROFILE_API,
  UPDATE_PASSWORD_API,
} = authEndpoints;

export const authService = {
  // Admin Login
  adminLogin: async (credentials) => {
    const response = await apiconnector('POST', ADMIN_LOGIN_API, credentials);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Admin Verify OTP
  verifyAdminOTP: async (otpData) => {
    const response = await apiconnector('POST', ADMIN_VERIFY_OTP_API, otpData);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      await apiconnector('POST', LOGOUT_API, null, {
        Authorization: `Bearer ${token}`,
      });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getMe: async () => {
    const token = localStorage.getItem('token');
    const response = await apiconnector('GET', GET_ME_API, null, {
      Authorization: `Bearer ${token}`,
    });
    if (response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Update profile
  updateDetails: async (data) => {
    const token = localStorage.getItem('token');
    const response = await apiconnector('PUT', UPDATE_PROFILE_API, data, {
      Authorization: `Bearer ${token}`,
    });
    if (response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Update password
  updatePassword: async (data) => {
    const token = localStorage.getItem('token');
    const response = await apiconnector('PUT', UPDATE_PASSWORD_API, data, {
      Authorization: `Bearer ${token}`,
    });
    return response.data;
  },
};

export default authService;
