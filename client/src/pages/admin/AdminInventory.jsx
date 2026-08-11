import { useState, useEffect, useCallback } from 'react';
import {
  getInventoryOverview,
  getInventoryItems,
  updateStock,
  addStock,
  reduceStock,
  exportInventory,
  getLowStockAlerts
} from '../../services/operations/inventoryAPI';
import { useAdminCurrencyFormatter } from '../../hooks/useAdminCurrency';

// Format numbers with K, M, B notation (for quantities only)
const formatCompactNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const absNum = Math.abs(num);
  
  if (absNum >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (absNum >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

const AdminInventory = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showReduceStockModal, setShowReduceStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, alerts
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  
  // Currency formatter hook
  const { format: formatCurrency, isINR } = useAdminCurrencyFormatter();
  
  const [filters, setFilters] = useState({
    search: '',
    stockStatus: '',
    category: '',
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  // Stock update form
  const [stockForm, setStockForm] = useState({
    stock: 0,
    reason: '',
    notifyUser: false
  });

  // Add stock form
  const [addStockForm, setAddStockForm] = useState({
    quantity: '',
    reason: '',
    supplierReference: '',
    arrivalDate: '',
    notifySupplier: false
  });

  // Reduce stock form
  const [reduceStockForm, setReduceStockForm] = useState({
    quantity: '',
    reason: '',
    orderId: ''
  });

  const token = localStorage.getItem('token');

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getInventoryOverview(token);
      if (response.success) {
        setOverview(response.data);
      }
    } catch (error) {} finally {
      setLoading(false);
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getInventoryItems(token, filters);
      if (response.success) {
        setProducts(response.data || []);
        setPagination(response.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (error) {} finally {
      setLoading(false);
    }
  }, [token, filters]);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getLowStockAlerts(token, 10);
      if (response.success) {
        setLowStockAlerts(response.data);
      }
    } catch (error) {} finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverview();
    } else if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'alerts') {
      fetchAlerts();
    }
  }, [activeTab, fetchOverview, fetchProducts, fetchAlerts]);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await updateStock(selectedProduct._id, stockForm, token);
      setShowStockModal(false);
      resetForms();
      if (activeTab === 'products') {
        fetchProducts();
      } else {
        fetchOverview();
      }
    } catch (error) {}
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await addStock(selectedProduct._id, addStockForm, token);
      setShowAddStockModal(false);
      resetForms();
      if (activeTab === 'products') {
        fetchProducts();
      } else {
        fetchOverview();
      }
    } catch (error) {}
  };

  const handleReduceStock = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await reduceStock(selectedProduct._id, reduceStockForm, token);
      setShowReduceStockModal(false);
      resetForms();
      if (activeTab === 'products') {
        fetchProducts();
      } else {
        fetchOverview();
      }
    } catch (error) {}
  };

  const handleExport = async (format) => {
    try {
      await exportInventory(format, token);
    } catch (error) {}
  };

  const resetForms = () => {
    setSelectedProduct(null);
    setStockForm({ stock: 0, reason: '', notifyUser: false });
    setAddStockForm({ quantity: '', reason: '', supplierReference: '', arrivalDate: '', notifySupplier: false });
    setReduceStockForm({ quantity: '', reason: '', orderId: '' });
  };

  const openStockModal = (product, type) => {
    setSelectedProduct(product);
    if (type === 'update') {
      setStockForm({ stock: product.stock, reason: '', notifyUser: false });
      setShowStockModal(true);
    } else if (type === 'add') {
      setShowAddStockModal(true);
    } else if (type === 'reduce') {
      setShowReduceStockModal(true);
    }
  };

  const getStockStatusColor = (stock) => {
    if (stock === 0) return 'text-red-600 bg-red-50 border-red-200';
    if (stock <= 10) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStockStatusLabel = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  };

  if (loading && !overview && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-circle-notch fa-spin text-4xl text-teal-500"></i>
          <p className="text-slate-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fas fa-warehouse text-sm sm:text-lg lg:text-2xl"></i>
              </div>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">Manage Inventory</h2>
            </div>
            <p className="text-white/90 text-xs sm:text-sm lg:text-base ml-10 sm:ml-13 lg:ml-15">Track stock levels and manage inventory</p>
          </div>
          <div className="flex gap-2 sm:gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex-1 sm:flex-none bg-white/20 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <i className="fas fa-download"></i>
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex-1 sm:flex-none bg-white text-purple-600 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <i className="fas fa-file-code"></i>
              <span className="hidden sm:inline">Export JSON</span>
              <span className="sm:hidden">JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 sm:p-1.5 flex gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <i className="fas fa-chart-pie text-xs sm:text-sm"></i>
          <span className="hidden sm:inline">Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
            activeTab === 'products'
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <i className="fas fa-boxes-stacked text-xs sm:text-sm"></i>  
          <span className="hidden sm:inline">Products</span>
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
            activeTab === 'alerts'
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <i className="fas fa-triangle-exclamation text-xs sm:text-sm"></i>
          <span className="hidden sm:inline">Alerts</span>
          {lowStockAlerts?.totalAlerts > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {lowStockAlerts.totalAlerts}
            </span>
          )}
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-4 sm:space-y-6 animate-fadeIn">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            <StatCard
              title="Total Products"
              value={overview.stats.totalProducts}
              icon="fa-boxes-stacked"
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              title="In Stock"
              value={overview.stats.inStock}
              icon="fa-check-circle"
              color="from-green-500 to-emerald-600"
            />
            <StatCard
              title="Low Stock"
              value={overview.stats.lowStock}
              icon="fa-exclamation-triangle"
              color="from-orange-500 to-amber-600"
            />
            <StatCard
              title="Out of Stock"
              value={overview.stats.outOfStock}
              icon="fa-times-circle"
              color="from-red-500 to-rose-600"
            />
            <StatCard
              title="Total Units"
              value={formatCompactNumber(overview.stats.totalUnits)}
              icon="fa-cubes"
              color="from-purple-500 to-violet-600"
            />
            <StatCard
              title="Stock Value"
              value={formatCurrency(overview.stats.stockValue || 0)}
              icon={isINR ? "fa-rupee-sign" : "fa-dollar-sign"}
              color="from-teal-500 to-cyan-600"
            />
          </div>

          {/* Category Stock & Low Stock Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Category Stock */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                <i className="fas fa-layer-group text-purple-500 text-sm sm:text-base"></i>
                <span className="text-sm sm:text-base">Stock by Category</span>
              </h3>
              <div className="space-y-2 sm:space-y-3 max-h-80 overflow-y-auto">
                {overview.categoryStock?.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm sm:text-base truncate">{cat.categoryName || 'Uncategorized'}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500">{cat.productCount} products</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-bold text-purple-600 text-sm sm:text-base">{formatCompactNumber(cat.totalStock)} units</p>
                      <p className="text-[10px] sm:text-xs text-slate-500">{formatCurrency(cat.stockValue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Products */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                <i className="fas fa-exclamation-circle text-orange-500 text-sm sm:text-base"></i>
                <span className="text-sm sm:text-base">Low Stock Products</span>
              </h3>
              <div className="space-y-2 sm:space-y-3 max-h-80 overflow-y-auto">
                {overview.lowStockProducts?.map((product) => (
                  <div key={product._id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <img
                      src={product.images?.[0]?.url || '/placeholder-product.png'}
                      alt={product.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm sm:text-base truncate">{product.name}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm sm:text-base ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                        {product.stock} left
                      </p>
                      <button
                        onClick={() => openStockModal(product, 'add')}
                        className="text-[10px] sm:text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        + Add Stock
                      </button>
                    </div>
                  </div>
                ))}
                {(!overview.lowStockProducts || overview.lowStockProducts.length === 0) && (
                  <div className="text-center py-8 text-slate-500">
                    <i className="fas fa-check-circle text-4xl text-green-400 mb-2"></i>
                    <p className="text-sm">All products are well stocked!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-3 sm:space-y-4 animate-fadeIn">
          {/* Filters */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 sm:p-4 lg:p-6 border border-slate-200">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="relative flex-1">
                <i className="fas fa-search absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-purple-500 text-xs sm:text-sm"></i>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <select
                  value={filters.stockStatus}
                  onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value, page: 1 })}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Stock Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
                <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-50 rounded-lg border border-purple-200">
                  <i className="fas fa-info-circle text-purple-600 text-xs sm:text-sm"></i>
                  <span className="text-purple-700 font-medium text-xs sm:text-sm">{pagination.total} products</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products - Card View (Mobile) */}
          <div className="md:hidden space-y-3">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md transition-shadow">
                {/* Product Header */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={product.images?.[0]?.url || '/placeholder-product.png'}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-1">{product.name}</h3>
                    <p className="text-xs text-slate-500 mb-1">SKU: {product.sku}</p>
                    <p className="text-xs text-slate-500">{product.category?.name || 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap ${getStockStatusColor(product.stock)}`}>
                    {getStockStatusLabel(product.stock)}
                  </span>
                </div>

                {/* Product Info Grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500 mb-0.5">Stock</p>
                    <p className="text-lg font-bold text-slate-800">{product.stock}</p>
                    <p className="text-[10px] text-slate-500">{product.unit}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500 mb-0.5">Price</p>
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-purple-600 mb-0.5">Value</p>
                    <p className="text-sm font-bold text-purple-600">{formatCurrency(product.price * product.stock)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openStockModal(product, 'update')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    <i className="fas fa-edit"></i>
                    <span>Update</span>
                  </button>
                  <button
                    onClick={() => openStockModal(product, 'add')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Add</span>
                  </button>
                  <button
                    onClick={() => openStockModal(product, 'reduce')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                  >
                    <i className="fas fa-minus"></i>
                    <span>Reduce</span>
                  </button>
                </div>
              </div>
            ))}

            {products.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                <i className="fas fa-box-open text-4xl text-slate-300 mb-3"></i>
                <p className="font-medium text-sm">No products found</p>
                <p className="text-xs">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Products - Table View (Desktop) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Value</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0]?.url || '/placeholder-product.png'}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 line-clamp-1 text-sm">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.category?.name || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-slate-600">{product.sku}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-lg font-bold text-slate-800">{product.stock}</span>
                        <span className="text-xs text-slate-500 ml-1">{product.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStockStatusColor(product.stock)}`}>
                          {getStockStatusLabel(product.stock)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-800 text-sm">{formatCurrency(product.price)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-purple-600 text-sm">
                          {formatCurrency(product.price * product.stock)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openStockModal(product, 'update')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Update Stock"
                          >
                            <i className="fas fa-edit text-sm"></i>
                          </button>
                          <button
                            onClick={() => openStockModal(product, 'add')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Add Stock"
                          >
                            <i className="fas fa-plus text-sm"></i>
                          </button>
                          <button
                            onClick={() => openStockModal(product, 'reduce')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reduce Stock"
                          >
                            <i className="fas fa-minus text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <i className="fas fa-box-open text-5xl text-slate-300 mb-3"></i>
                <p className="font-medium">No products found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 bg-white rounded-xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3">
              <p className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                Showing {(pagination.page - 1) * filters.limit + 1} to{' '}
                {Math.min(pagination.page * filters.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-2.5 sm:px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-left mr-0.5 sm:mr-1"></i> <span className="hidden sm:inline">Prev</span>
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page >= pagination.pages}
                  className="px-2.5 sm:px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Next</span> <i className="fas fa-chevron-right ml-0.5 sm:ml-1"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-3 sm:space-y-4 animate-fadeIn">
          {/* Alert Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-times-circle text-white text-base sm:text-xl"></i>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-red-700">{lowStockAlerts?.outOfStockCount || 0}</p>
                  <p className="text-xs sm:text-sm text-red-600">Out of Stock</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-exclamation-triangle text-white text-base sm:text-xl"></i>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-orange-700">{lowStockAlerts?.lowStockCount || 0}</p>
                  <p className="text-xs sm:text-sm text-orange-600">Low Stock</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-bell text-white text-base sm:text-xl"></i>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-purple-700">{lowStockAlerts?.totalAlerts || 0}</p>
                  <p className="text-xs sm:text-sm text-purple-600">Total Alerts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alert List */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 lg:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
              <i className="fas fa-bell text-purple-500 text-sm sm:text-base"></i>
              <span className="text-sm sm:text-base">Stock Alerts (Threshold: {lowStockAlerts?.threshold || 10} units)</span>
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {lowStockAlerts?.products?.map((product) => (
                <div
                  key={product._id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border ${
                    product.stock === 0
                      ? 'bg-red-50 border-red-200'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <img
                    src={product.images?.[0]?.url || '/placeholder-product.png'}
                    alt={product.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm sm:text-base">{product.name}</p>
                    <p className="text-xs sm:text-sm text-slate-500">SKU: {product.sku} • {product.category?.name || 'N/A'}</p>
                  </div>
                  <div className="text-center self-end sm:self-auto">
                    <p className={`text-xl sm:text-2xl font-bold ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {product.stock}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500">units left</p>
                  </div>
                  <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <button
                      onClick={() => openStockModal(product, 'add')}
                      className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-plus"></i>
                      Add Stock
                    </button>
                  </div>
                </div>
              ))}
              {(!lowStockAlerts?.products || lowStockAlerts.products.length === 0) && (
                <div className="text-center py-12 text-slate-500">
                  <i className="fas fa-check-circle text-5xl text-green-400 mb-3"></i>
                  <p className="font-medium">No stock alerts!</p>
                  <p className="text-sm">All products are well stocked</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Stock Modal */}
      {showStockModal && selectedProduct && (
        <Modal onClose={() => { setShowStockModal(false); resetForms(); }}>
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-edit text-blue-500"></i>
              Update Stock
            </h3>
            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
              <img
                src={selectedProduct.images?.[0]?.url || '/placeholder-product.png'}
                alt={selectedProduct.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-medium text-slate-800">{selectedProduct.name}</p>
                <p className="text-sm text-slate-500">Current Stock: {selectedProduct.stock} {selectedProduct.unit}</p>
              </div>
            </div>
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={stockForm.stock}
                  onChange={(e) => setStockForm({ ...stockForm, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
                <input
                  type="text"
                  value={stockForm.reason}
                  onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                  placeholder="e.g., Inventory adjustment, Damage, etc."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stockForm.notifyUser}
                  onChange={(e) => setStockForm({ ...stockForm, notifyUser: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-slate-600">Notify supplier about this change</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowStockModal(false); resetForms(); }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Add Stock Modal */}
      {showAddStockModal && selectedProduct && (
        <Modal onClose={() => { setShowAddStockModal(false); resetForms(); }}>
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-plus-circle text-green-500"></i>
              Add Stock (New Arrival)
            </h3>
            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
              <img
                src={selectedProduct.images?.[0]?.url || '/placeholder-product.png'}
                alt={selectedProduct.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-medium text-slate-800">{selectedProduct.name}</p>
                <p className="text-sm text-slate-500">Current Stock: {selectedProduct.stock} {selectedProduct.unit}</p>
              </div>
            </div>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity to Add *</label>
                <input
                  type="number"
                  min="1"
                  value={addStockForm.quantity}
                  onChange={(e) => setAddStockForm({ ...addStockForm, quantity: parseInt(e.target.value) || '' })}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={addStockForm.reason}
                  onChange={(e) => setAddStockForm({ ...addStockForm, reason: e.target.value })}
                  placeholder="e.g., New shipment, Restock, etc."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Reference</label>
                  <input
                    type="text"
                    value={addStockForm.supplierReference}
                    onChange={(e) => setAddStockForm({ ...addStockForm, supplierReference: e.target.value })}
                    placeholder="PO#, Invoice#"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Arrival Date</label>
                  <input
                    type="date"
                    value={addStockForm.arrivalDate}
                    onChange={(e) => setAddStockForm({ ...addStockForm, arrivalDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addStockForm.notifySupplier}
                  onChange={(e) => setAddStockForm({ ...addStockForm, notifySupplier: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-slate-600">Notify supplier about this arrival</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddStockModal(false); resetForms(); }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Reduce Stock Modal */}
      {showReduceStockModal && selectedProduct && (
        <Modal onClose={() => { setShowReduceStockModal(false); resetForms(); }}>
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-minus-circle text-red-500"></i>
              Reduce Stock
            </h3>
            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
              <img
                src={selectedProduct.images?.[0]?.url || '/placeholder-product.png'}
                alt={selectedProduct.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-medium text-slate-800">{selectedProduct.name}</p>
                <p className="text-sm text-slate-500">Current Stock: {selectedProduct.stock} {selectedProduct.unit}</p>
              </div>
            </div>
            <form onSubmit={handleReduceStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity to Reduce *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.stock}
                  value={reduceStockForm.quantity}
                  onChange={(e) => setReduceStockForm({ ...reduceStockForm, quantity: parseInt(e.target.value) || '' })}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                {reduceStockForm.quantity > selectedProduct.stock && (
                  <p className="text-sm text-red-500 mt-1">Cannot exceed current stock ({selectedProduct.stock})</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
                <select
                  value={reduceStockForm.reason}
                  onChange={(e) => setReduceStockForm({ ...reduceStockForm, reason: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select reason</option>
                  <option value="Order Fulfillment">Order Fulfillment</option>
                  <option value="Damaged Goods">Damaged Goods</option>
                  <option value="Expired Products">Expired Products</option>
                  <option value="Return to Supplier">Return to Supplier</option>
                  <option value="Inventory Correction">Inventory Correction</option>
                  <option value="Sample/Promotional">Sample/Promotional</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Order ID (Optional)</label>
                <input
                  type="text"
                  value={reduceStockForm.orderId}
                  onChange={(e) => setReduceStockForm({ ...reduceStockForm, orderId: e.target.value })}
                  placeholder="Related order ID if applicable"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowReduceStockModal(false); resetForms(); }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reduceStockForm.quantity > selectedProduct.stock}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-minus mr-2"></i>
                  Reduce Stock
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-lg sm:rounded-xl p-3 sm:p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-[10px] sm:text-xs font-medium truncate">{title}</p>
        <p className="text-base sm:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1 truncate">{value}</p>
      </div>
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
        <i className={`fas ${icon} text-sm sm:text-lg`}></i>
      </div>
    </div>
  </div>
);

// Modal Component
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleIn relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors z-10"
      >
        <i className="fas fa-times text-sm"></i>
      </button>
      {children}
    </div>
  </div>
);

export default AdminInventory;
