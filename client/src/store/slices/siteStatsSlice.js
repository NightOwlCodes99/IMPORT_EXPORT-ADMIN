import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: null,
  loading: false,
  error: null,
};

const siteStatsSlice = createSlice({
  name: 'siteStats',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearStats: (state) => {
      state.stats = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setStats, setError, clearStats } = siteStatsSlice.actions;
export default siteStatsSlice.reducer;
