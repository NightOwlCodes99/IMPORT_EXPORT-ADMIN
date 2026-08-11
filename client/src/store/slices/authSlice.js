import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

const initialState = {
  user: user || null,
  token: token || null,
  isAuthenticated: !!token,
  isLoading: false,
  error: null,
};

// Admin Login
export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.adminLogin(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Verify Admin OTP
export const verifyAdminOTP = createAsyncThunk(
  'auth/verifyAdminOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await authService.verifyAdminOTP(otpData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

// Get current user
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update admin details
export const updateDetails = createAsyncThunk(
  'auth/updateDetails',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authService.updateDetails(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify Admin OTP
      .addCase(verifyAdminOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyAdminOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(verifyAdminOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Get Me
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      // Update Details
      .addCase(updateDetails.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  },
});

export const { clearError, setCredentials, setUser } = authSlice.actions;
export default authSlice.reducer;
