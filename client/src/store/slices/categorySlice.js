import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllCategories,
  getFeaturedCategories,
  getHotCategories,
  getTrendingCategories,
  getTopSellingCategories,
  getNewCategories,
  getCategoryStats,
} from '../../services/operations/categoryAPI';

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchFeaturedCategories = createAsyncThunk(
  'categories/fetchFeatured',
  async (limit = 6, { rejectWithValue }) => {
    try {
      const response = await getFeaturedCategories(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured categories');
    }
  }
);

export const fetchHotCategories = createAsyncThunk(
  'categories/fetchHot',
  async (limit = 4, { rejectWithValue }) => {
    try {
      const response = await getHotCategories(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hot categories');
    }
  },
  {
    // Prevent duplicate fetches if already loading or data exists
    condition: (_, { getState }) => {
      const { categories } = getState();
      if (categories.hotLoading || categories.hotCategories.length > 0) {
        return false; // Cancel the thunk
      }
      return true;
    }
  }
);

export const fetchTrendingCategories = createAsyncThunk(
  'categories/fetchTrending',
  async (limit = 4, { rejectWithValue }) => {
    try {
      const response = await getTrendingCategories(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending categories');
    }
  }
);

export const fetchTopSellingCategories = createAsyncThunk(
  'categories/fetchTopSelling',
  async (limit = 4, { rejectWithValue }) => {
    try {
      const response = await getTopSellingCategories(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top selling categories');
    }
  }
);

export const fetchNewCategories = createAsyncThunk(
  'categories/fetchNew',
  async (limit = 4, { rejectWithValue }) => {
    try {
      const response = await getNewCategories(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch new categories');
    }
  }
);

export const fetchCategoryStats = createAsyncThunk(
  'categories/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategoryStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category stats');
    }
  }
);

const initialState = {
  categories: [],
  featuredCategories: [],
  hotCategories: [],
  trendingCategories: [],
  topSellingCategories: [],
  newCategories: [],
  stats: null,
  loading: false,
  featuredLoading: false,
  hotLoading: false,
  hotFetched: false, // Track if hot categories fetch was attempted
  trendingLoading: false,
  topSellingLoading: false,
  newLoading: false,
  statsLoading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
    resetCategories: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch featured categories
      .addCase(fetchFeaturedCategories.pending, (state) => {
        state.featuredLoading = true;
      })
      .addCase(fetchFeaturedCategories.fulfilled, (state, action) => {
        state.featuredLoading = false;
        state.featuredCategories = action.payload;
      })
      .addCase(fetchFeaturedCategories.rejected, (state, action) => {
        state.featuredLoading = false;
        state.error = action.payload;
      })
      // Fetch hot categories
      .addCase(fetchHotCategories.pending, (state) => {
        state.hotLoading = true;
        state.hotFetched = true; // Mark as attempted
      })
      .addCase(fetchHotCategories.fulfilled, (state, action) => {
        state.hotLoading = false;
        state.hotCategories = action.payload;
      })
      .addCase(fetchHotCategories.rejected, (state, action) => {
        state.hotLoading = false;
        state.error = action.payload;
      })
      // Fetch trending categories
      .addCase(fetchTrendingCategories.pending, (state) => {
        state.trendingLoading = true;
      })
      .addCase(fetchTrendingCategories.fulfilled, (state, action) => {
        state.trendingLoading = false;
        state.trendingCategories = action.payload;
      })
      .addCase(fetchTrendingCategories.rejected, (state, action) => {
        state.trendingLoading = false;
        state.error = action.payload;
      })
      // Fetch top selling categories
      .addCase(fetchTopSellingCategories.pending, (state) => {
        state.topSellingLoading = true;
      })
      .addCase(fetchTopSellingCategories.fulfilled, (state, action) => {
        state.topSellingLoading = false;
        state.topSellingCategories = action.payload;
      })
      .addCase(fetchTopSellingCategories.rejected, (state, action) => {
        state.topSellingLoading = false;
        state.error = action.payload;
      })
      // Fetch new categories
      .addCase(fetchNewCategories.pending, (state) => {
        state.newLoading = true;
      })
      .addCase(fetchNewCategories.fulfilled, (state, action) => {
        state.newLoading = false;
        state.newCategories = action.payload;
      })
      .addCase(fetchNewCategories.rejected, (state, action) => {
        state.newLoading = false;
        state.error = action.payload;
      })
      // Fetch category stats
      .addCase(fetchCategoryStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchCategoryStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCategoryStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCategoryError, resetCategories } = categorySlice.actions;
export default categorySlice.reducer;
