import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllAdminProducts,
  getProductStats,
  deleteAdminProduct,
  approveProduct,
  rejectProduct,
  toggleProductActive,
  toggleProductFeatured
} from '../../services/operations/adminProductAPI';
import { apiConnector } from '../../services/apiconnector';
import { categoryEndpoints, supplierEndpoints } from '../../services/apis';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    featured: 0
  });
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    supplier: '',
    page: 1,
    limit: 12
  });
  const [sortBy, setSortBy] = useState('latest');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, productId: null });
  const [activeTab, setActiveTab] = useState('all');
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const token = localStorage.getItem('token');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
    fetchStats(); // Fetch stats only once on mount
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.status,
    filters.category,
    filters.supplier,
    filters.page,
    filters.limit,
    sortBy
  ]);

  const fetchCategories = async () => {
    try {
      const response = await apiConnector('GET', categoryEndpoints.GET_ALL_CATEGORIES_API);
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {}
  };

  const fetchSuppliers = async () => {
    try {
      const response = await apiConnector('GET', supplierEndpoints.GET_ALL_SUPPLIERS_API);
      if (response.data.success) {
        setSuppliers(response.data.data || []);
      }
    } catch (error) {}
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters - only send what backend expects
      const params = {
        page: filters.page,
        limit: filters.limit
      };
      
      // Add filters only if they have values
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.supplier) params.supplier = filters.supplier;
      
      // Add status filter as isApproved (what backend expects)
      if (filters.status && filters.status !== 'featured') {
        params.isApproved = filters.status;
      }
      
      // Add featured filter
      if (filters.status === 'featured') {
        params.isFeatured = 'true';
      }
      
      // Add sorting parameters
      if (sortBy === 'priceAsc') {
        params.sort = 'price';
      } else if (sortBy === 'priceDesc') {
        params.sort = '-price';
      } else if (sortBy === 'name') {
        params.sort = 'name';
      } else {
        params.sort = '-createdAt'; // Latest (default)
      }
      
      const response = await getAllAdminProducts(token, params);

      if (response.success) {
        setProducts(response.data || []);
        setPagination({
          page: response.page,
          pages: response.pages,
          total: response.total
        });
      }
    } catch (error) {} finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getProductStats(token);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {}
  };

  const handleDelete = async (productId) => {
    try {
      await deleteAdminProduct(productId, token);
      setDeleteModal({ show: false, productId: null });
      fetchProducts();
      fetchStats();
    } catch (error) {}
  };

  const handleApprove = async (productId) => {
    try {
      await approveProduct(productId, token);
      fetchProducts();
      fetchStats();
    } catch (error) {}
  };

  const handleReject = async (productId) => {
    try {
      await rejectProduct(productId, token);
      fetchProducts();
      fetchStats();
    } catch (error) {}
  };

  const handleToggleActive = async (productId) => {
    try {
      await toggleProductActive(productId, token);
      fetchProducts();
      fetchStats();
    } catch (error) {}
  };

  const handleToggleFeatured = async (productId) => {
    try {
      await toggleProductFeatured(productId, token);
      fetchProducts();
      fetchStats();
    } catch (error) {}
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleResetFilters = (e) => {
    if (e) e.preventDefault();
    setSearchInput('');
    setFilters({ search: '', status: '', category: '', supplier: '', page: 1, limit: 12 });
    setSortBy('latest');
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-circle-notch fa-spin text-4xl text-orange-500"></i>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-orange-50/20 to-amber-50/30 min-h-screen">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-1">
              Products Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">All product listings</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm hover:bg-slate-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
            >
              <i className="fas fa-download"></i>
              <span className="hidden xs:inline">Export CSV</span>
              <span className="xs:hidden">Export</span>
            </button>
            <button 
              onClick={() => navigate('/admin/products/create')}
              className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-500 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
            >
              <i className="fas fa-plus"></i>
              <span className="hidden xs:inline">Add Product</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        {/* Total/Growth Card */}
        <div className="group bg-gradient-to-br from-white to-emerald-50/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 border-2 border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-arrow-up text-white text-xs sm:text-sm lg:text-lg"></i>
            </div>
            <span className="text-emerald-600 text-[10px] sm:text-xs font-bold bg-emerald-50 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">↑ 6.2%</span>
          </div>
          <div>
            <p className="text-lg sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-slate-900 to-emerald-700 bg-clip-text text-transparent mb-0.5 sm:mb-1">{stats.total}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Total Products</p>
          </div>
        </div>

        {/* Approved */}
        <div className="group bg-gradient-to-br from-white to-emerald-50/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 border-2 border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] flex flex-col justify-between" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-check-circle text-white text-xs sm:text-sm lg:text-lg"></i>
            </div>
            <span className="text-emerald-600 bg-emerald-50 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">97%</span>
          </div>
          <div>
            <p className="text-lg sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-slate-900 to-emerald-700 bg-clip-text text-transparent mb-0.5 sm:mb-1">{stats.approved?.toLocaleString() || '0'}</p>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Approved</p>
          </div>
        </div>

        {/* Pending */}
        <div className="group bg-gradient-to-br from-white to-amber-50/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 border-2 border-amber-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] flex flex-col justify-between" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-clock text-white text-xs sm:text-sm lg:text-lg"></i>
            </div>
            <span className="text-red-600 bg-red-50 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">Review</span>
          </div>
          <div>
            <p className="text-lg sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-slate-900 to-amber-700 bg-clip-text text-transparent mb-0.5 sm:mb-1">{stats.pending?.toLocaleString() || '0'}</p>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Pending</p>
          </div>
        </div>

        {/* Featured */}
        <div className="group bg-gradient-to-br from-white to-purple-50/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 border-2 border-purple-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] flex flex-col justify-between" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-star text-white text-xs sm:text-sm lg:text-lg"></i>
            </div>
            <span className="text-purple-600 bg-purple-50 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">Hot</span>
          </div>
          <div>
            <p className="text-lg sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-slate-900 to-purple-700 bg-clip-text text-transparent mb-0.5 sm:mb-1">{stats.featured}</p>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Featured</p>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="group bg-gradient-to-br from-white to-red-50/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 border-2 border-red-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] flex flex-col justify-between col-span-2 sm:col-span-1" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="bg-gradient-to-br from-red-400 to-pink-500 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-exclamation-triangle text-white text-xs sm:text-sm lg:text-lg"></i>
            </div>
            <span className="text-red-600 bg-red-50 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">Alert</span>
          </div>
          <div>
            <p className="text-lg sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-slate-900 to-red-700 bg-clip-text text-transparent mb-0.5 sm:mb-1">{stats.inactive || '0'}</p>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-orange-100/50 shadow-md mb-4 sm:mb-6 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search by name, SKU, supplier..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all duration-300"
            />
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="px-2 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white transition-all duration-300 hover:border-orange-300"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-2 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white transition-all duration-300 hover:border-orange-300"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filters.supplier}
              onChange={(e) => setFilters({ ...filters, supplier: e.target.value, page: 1 })}
              className="px-2 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white transition-all duration-300 hover:border-orange-300 hidden lg:block"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((sup) => (
                <option key={sup._id} value={sup._id}>{sup.companyName}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-2 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white transition-all duration-300 hover:border-orange-300"
            >
              <option value="latest">Latest</option>
              <option value="priceAsc">Price ↑</option>
              <option value="priceDesc">Price ↓</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
          <button 
            type="button"
            onClick={handleResetFilters}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:border-orange-200 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
          >
            <i className="fas fa-redo"></i>
            Reset
          </button>
        </div>
      </div>

      {/* Products Section with Tabs */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl border border-orange-100/50 shadow-lg overflow-hidden animate-fadeIn" style={{ animationDelay: '0.6s' }}>
        {/* Tabs */}
        <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50/30 via-amber-50/30 to-orange-50/30 overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max">
            <button
              onClick={() => {
                setActiveTab('all');
                setFilters(prev => ({ ...prev, status: '', page: 1 }));
              }}
              className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-300 relative whitespace-nowrap ${
                activeTab === 'all'
                  ? 'text-orange-600 bg-gradient-to-r from-orange-50 to-amber-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <i className="fas fa-th mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">All Products</span>
              <span className="sm:hidden">All</span> ({stats.total || '0'})
              {activeTab === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('pending');
                setFilters(prev => ({ ...prev, status: 'pending', page: 1 }));
              }}
              className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-300 relative whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'text-orange-600 bg-gradient-to-r from-orange-50 to-amber-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <i className="fas fa-clock mr-1 sm:mr-2"></i>
              Pending ({stats.pending || '0'})
              {activeTab === 'pending' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('approved');
                setFilters(prev => ({ ...prev, status: 'approved', page: 1 }));
              }}
              className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-300 relative whitespace-nowrap ${
                activeTab === 'approved'
                  ? 'text-orange-600 bg-gradient-to-r from-orange-50 to-amber-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <i className="fas fa-check-circle mr-1 sm:mr-2"></i>
              Approved ({stats.approved || '0'})
              {activeTab === 'approved' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('featured');
                setFilters(prev => ({ ...prev, status: 'featured', page: 1 }));
              }}
              className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-300 relative whitespace-nowrap hidden sm:block ${
                activeTab === 'featured'
                  ? 'text-orange-600 bg-gradient-to-r from-orange-50 to-amber-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <i className="fas fa-star mr-1 sm:mr-2"></i>
              Featured ({stats.featured || '0'})
              {activeTab === 'featured' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('rejected');
                setFilters(prev => ({ ...prev, status: 'rejected', page: 1 }));
              }}
              className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-300 relative whitespace-nowrap ${
                activeTab === 'rejected'
                  ? 'text-orange-600 bg-gradient-to-r from-orange-50 to-amber-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <i className="fas fa-times-circle mr-1 sm:mr-2"></i>
              Rejected ({stats.rejected || '0'})
              {activeTab === 'rejected' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Products Content */}
        <div className="p-3 sm:p-4 lg:p-6">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                {products.map((product, index) => (
                  <div 
                    key={product._id} 
                    className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group bg-white cursor-pointer animate-fadeIn"
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    {/* Product Image */}
                    <div className="relative h-28 sm:h-36 lg:h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
                      {product.images?.[0]?.url ? (
                        <img 
                          src={product.images[0].url} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <i className="fas fa-box text-3xl sm:text-4xl lg:text-6xl text-slate-300"></i>
                      )}
                      {/* Badge */}
                      <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-bold flex items-center gap-0.5 sm:gap-1 ${
                          product.isApproved === 'approved' ? 'bg-emerald-500 text-white' :
                          product.isApproved === 'rejected' ? 'bg-red-500 text-white' :
                          'bg-amber-500 text-white'
                        }`}>
                          <i className={`fas fa-${
                            product.isApproved === 'approved' ? 'check' :
                            product.isApproved === 'rejected' ? 'times' : 'clock'
                          } text-[8px] sm:text-xs`}></i>
                          <span className="hidden sm:inline">{product.isApproved === 'approved' ? 'Approved' :
                           product.isApproved === 'rejected' ? 'Rejected' : 'Pending'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-1.5 sm:p-2">
                      <h4 className="font-semibold text-slate-900 mb-1 sm:mb-1.5 line-clamp-2 text-[10px] sm:text-xs">
                        {product.name}
                      </h4>
                      
                      <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                        <div>
                          <p className="text-[8px] sm:text-[10px] text-slate-500 mb-0.5">Price</p>
                          <p className="text-[10px] sm:text-sm font-bold text-slate-900">
                            ${product.price || 0}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] sm:text-[10px] text-slate-500 mb-0.5">Stock</p>
                          <p className="text-[10px] sm:text-sm font-bold text-emerald-600">{product.stock || 0}</p>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-2 mb-1.5 pb-1.5 border-b border-slate-100">
                        <div className="flex-1">
                          <p className="text-[10px] text-slate-500">Category</p>
                          <p className="text-[10px] font-semibold text-slate-700 truncate">{product.category?.name || 'N/A'}</p>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-[10px] text-slate-500">MOQ</p>
                          <p className="text-[10px] font-semibold text-slate-700">{product.moq} units</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-4 gap-0.5 sm:gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${product._id}`);
                          }}
                          className="bg-indigo-500 text-white px-1 sm:px-2 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[8px] sm:text-xs font-semibold hover:bg-indigo-600 transition-colors"
                          title="View Product"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/products/edit/${product._id}`);
                          }}
                          className="bg-blue-500 text-white px-1 sm:px-2 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[8px] sm:text-xs font-semibold hover:bg-blue-600 transition-colors"
                          title="Edit Product"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFeatured(product._id);
                          }}
                          className={`px-1 sm:px-2 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[8px] sm:text-xs font-semibold transition-colors ${
                            product.isFeatured 
                              ? 'bg-amber-500 text-white hover:bg-amber-600' 
                              : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                          }`}
                          title={product.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                        >
                          <i className="fas fa-star"></i>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({ show: true, productId: product._id });
                          }}
                          className="bg-red-500 text-white px-1 sm:px-2 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[8px] sm:text-xs font-semibold hover:bg-red-600 transition-colors"
                          title="Delete Product"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>

                      {/* Approval Actions */}
                      {product.isApproved === 'pending' && (
                        <div className="grid grid-cols-2 gap-1 sm:gap-2 mt-1 sm:mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(product._id);
                            }}
                            className="bg-emerald-500 text-white px-1 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg text-[8px] sm:text-xs font-semibold hover:bg-emerald-600 transition-colors"
                          >
                            <i className="fas fa-check mr-0.5 sm:mr-1"></i>
                            <span className="hidden xs:inline">Approve</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(product._id);
                            }}
                            className="bg-red-500 text-white px-1 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg text-[8px] sm:text-xs font-semibold hover:bg-red-600 transition-colors"
                          >
                            <i className="fas fa-times mr-0.5 sm:mr-1"></i>
                            <span className="hidden xs:inline">Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4 sm:mt-6">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page === 1}
                    className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-300 rounded-lg font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  
                  <span className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700">
                    <span className="hidden sm:inline">Page </span>{pagination.page} / {pagination.pages}
                  </span>
                  
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={filters.page === pagination.pages}
                    className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-300 rounded-lg font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 sm:gap-3 py-8 sm:py-16">
              <i className="fas fa-box-open text-4xl sm:text-6xl text-slate-300"></i>
              <p className="text-slate-500 text-base sm:text-lg font-semibold">No products found</p>
              <p className="text-slate-400 text-xs sm:text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full animate-fadeIn">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <i className="fas fa-trash text-red-600 text-lg sm:text-2xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1 sm:mb-2">Delete Product?</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, productId: null })}
                  className="flex-1 bg-slate-200 text-slate-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.productId)}
                  className="flex-1 bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
