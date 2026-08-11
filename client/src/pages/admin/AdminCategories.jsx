import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  toggleCategoryFeatured,
  toggleCategoryHot,
  toggleCategoryTrending,
  toggleCategoryNew,
  toggleCategoryTopSelling,
  syncProductCounts,
  getCategoryStats
} from '../../services/operations/categoryAPI';

const AdminCategories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, categoryId: null });
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
    isFeatured: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'fas fa-box',
    gradient: { from: 'blue-500', to: 'blue-700' },
    isActive: true,
    isFeatured: false,
    isHot: false,
    isTrending: false,
    isNew: false,
    isTopSelling: false,
    order: 0
  });

  const token = localStorage.getItem('token');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getAdminCategories(token, filters);

      if (response.success) {
        setCategories(response.data || []);
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
      const response = await getCategoryStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {}
  };

  // Fetch categories and stats on mount and when filters change
  useEffect(() => {
    fetchCategories();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('description', formData.description);
      formPayload.append('icon', formData.icon);
      formPayload.append('gradient', JSON.stringify(formData.gradient));
      formPayload.append('isActive', formData.isActive);
      formPayload.append('isFeatured', formData.isFeatured);
      formPayload.append('isHot', formData.isHot);
      formPayload.append('isTrending', formData.isTrending);
      formPayload.append('isNew', formData.isNew);
      formPayload.append('isTopSelling', formData.isTopSelling);
      formPayload.append('order', formData.order);

      if (imageFile) {
        formPayload.append('image', imageFile);
      }

      if (editingCategory) {
        await updateCategory(editingCategory._id, formPayload, token);
      } else {
        await createCategory(formPayload, token);
      }
      
      setShowModal(false);
      resetForm();
      fetchCategories();
      fetchStats();
    } catch (error) {}
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'fas fa-box',
      gradient: category.gradient || { from: 'blue-500', to: 'blue-700' },
      isActive: category.isActive,
      isFeatured: category.isFeatured || false,
      isHot: category.isHot || false,
      isTrending: category.isTrending || false,
      isNew: category.isNew || false,
      isTopSelling: category.isTopSelling || false,
      order: category.order || 0
    });
    setImagePreview(category.image?.url || null);
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    try {
      await deleteCategory(categoryId, token);
      setDeleteModal({ show: false, categoryId: null });
      fetchCategories();
      fetchStats();
    } catch (error) {}
  };

  const handleToggleActive = async (categoryId) => {
    try {
      await toggleCategoryActive(categoryId, token);
      fetchCategories();
      fetchStats();
    } catch (error) {}
  };

  const handleToggleFeatured = async (categoryId) => {
    try {
      await toggleCategoryFeatured(categoryId, token);
      fetchCategories();
      fetchStats();
    } catch (error) {}
  };

  const handleToggleHot = async (categoryId) => {
    try {
      await toggleCategoryHot(categoryId, token);
      fetchCategories();
      fetchStats();
    } catch (error) {}
  };

  const handleToggleTrending = async (categoryId) => {
    try {
      await toggleCategoryTrending(categoryId, token);
      fetchCategories();
      fetchStats();
    } catch (error) {}
  };

  const handleToggleNew = async (categoryId) => {
    try {
      await toggleCategoryNew(categoryId, token);
      fetchCategories();
      fetchStats();
    } catch (error) {}
  };

  const handleToggleTopSelling = async (categoryId) => {
    try {
      await toggleCategoryTopSelling(categoryId, token);
      fetchCategories();
      fetchStats();
    } catch (error) {}
  };

  const handleSyncCounts = async () => {
    try {
      await syncProductCounts(token);
      fetchCategories();
      fetchStats();
    } catch (error) {}
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'fas fa-box',
      gradient: { from: 'blue-500', to: 'blue-700' },
      isActive: true,
      isFeatured: false,
      isHot: false,
      isTrending: false,
      isNew: false,
      isTopSelling: false,
      order: 0
    });
    setEditingCategory(null);
    setImagePreview(null);
    setImageFile(null);
  };

  const iconOptions = [
    { value: 'fas fa-box', label: 'Box' },
    { value: 'fas fa-tshirt', label: 'T-Shirt' },
    { value: 'fas fa-laptop', label: 'Laptop' },
    { value: 'fas fa-mobile-alt', label: 'Mobile' },
    { value: 'fas fa-home', label: 'Home' },
    { value: 'fas fa-couch', label: 'Couch' },
    { value: 'fas fa-utensils', label: 'Utensils' },
    { value: 'fas fa-car', label: 'Car' },
    { value: 'fas fa-book', label: 'Book' },
    { value: 'fas fa-heartbeat', label: 'Health' },
    { value: 'fas fa-dumbbell', label: 'Fitness' },
    { value: 'fas fa-gamepad', label: 'Gaming' },
    { value: 'fas fa-music', label: 'Music' },
    { value: 'fas fa-paint-brush', label: 'Art' },
    { value: 'fas fa-tools', label: 'Tools' },
    { value: 'fas fa-leaf', label: 'Nature' },
    { value: 'fas fa-baby', label: 'Baby' },
    { value: 'fas fa-cog', label: 'Machinery' },
    { value: 'fas fa-flask', label: 'Chemicals' },
    { value: 'fas fa-seedling', label: 'Agriculture' },
    { value: 'fas fa-cut', label: 'Textiles' },
    { value: 'fas fa-gem', label: 'Jewelry' },
    { value: 'fas fa-camera', label: 'Camera' },
    { value: 'fas fa-clock', label: 'Watches' },
    { value: 'fas fa-building', label: 'Construction' },
    { value: 'fas fa-pills', label: 'Healthcare' },
    { value: 'fas fa-running', label: 'Sports' },
    { value: 'fas fa-wine-bottle', label: 'Beverages' },
    { value: 'fas fa-boxes', label: 'Packaging' },
  ];

  const gradientOptions = [
    { from: 'blue-500', to: 'blue-700', label: 'Blue' },
    { from: 'pink-500', to: 'rose-700', label: 'Pink' },
    { from: 'amber-500', to: 'orange-700', label: 'Amber' },
    { from: 'slate-600', to: 'slate-800', label: 'Slate' },
    { from: 'purple-500', to: 'purple-700', label: 'Purple' },
    { from: 'green-500', to: 'green-700', label: 'Green' },
    { from: 'cyan-500', to: 'cyan-700', label: 'Cyan' },
    { from: 'red-500', to: 'red-700', label: 'Red' },
    { from: 'fuchsia-500', to: 'fuchsia-700', label: 'Fuchsia' },
    { from: 'indigo-500', to: 'indigo-700', label: 'Indigo' },
    { from: 'yellow-500', to: 'yellow-700', label: 'Yellow' },
    { from: 'teal-500', to: 'teal-700', label: 'Teal' },
    { from: 'emerald-500', to: 'emerald-700', label: 'Emerald' },
    { from: 'violet-500', to: 'violet-700', label: 'Violet' },
    { from: 'orange-500', to: 'orange-700', label: 'Orange' },
    { from: 'sky-500', to: 'sky-700', label: 'Sky' },
  ];

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-circle-notch fa-spin text-4xl text-orange-500"></i>
          <p className="text-slate-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                <i className="fas fa-layer-group text-sm sm:text-lg lg:text-2xl"></i>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Categories</h2>
            </div>
            <p className="text-white/90 text-xs sm:text-sm lg:text-base ml-10 sm:ml-13 lg:ml-15">Manage product categories with images and badges</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSyncCounts}
              className="bg-white/20 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
            >
              <i className="fas fa-sync-alt"></i>
              <span className="hidden sm:inline">Sync Counts</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-white text-indigo-600 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm hover:bg-indigo-50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
            >
              <i className="fas fa-plus text-xs sm:text-sm"></i>
              <span>Add Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 animate-fadeIn">
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-indigo-600">{stats.total}</div>
            <div className="text-[10px] sm:text-xs text-slate-600">Total</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-[10px] sm:text-xs text-slate-600">Active</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.featured}</div>
            <div className="text-[10px] sm:text-xs text-slate-600">Featured</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.hot}</div>
            <div className="text-[10px] sm:text-xs text-slate-600">Hot</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.trending}</div>
            <div className="text-[10px] sm:text-xs text-slate-600">Trending</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.new}</div>
            <div className="text-[10px] sm:text-xs text-slate-600">New</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-amber-600">{stats.topSelling}</div>
            <div className="text-[10px] sm:text-xs text-slate-600">Top Selling</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
            <div className="text-[10px] sm:text-xs text-slate-600">Products</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-slate-200 shadow-sm animate-fadeIn">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-indigo-500 text-xs sm:text-sm"></i>
            <input
              type="text"
              placeholder="Search categories..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <select
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value, page: 1 })}
            className="px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex-1 sm:flex-none sm:min-w-[120px]"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select
            value={filters.isFeatured}
            onChange={(e) => setFilters({ ...filters, isFeatured: e.target.value, page: 1 })}
            className="px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex-1 sm:flex-none sm:min-w-[120px]"
          >
            <option value="">All Featured</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </select>

          <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <i className="fas fa-info-circle text-indigo-600 text-xs sm:text-sm"></i>
            <span className="text-indigo-700 font-medium text-xs sm:text-sm">{pagination.total} categories</span>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
        {categories.map((category) => (
          <div key={category._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
            {/* Category Image/Gradient Header */}
            <div className={`h-32 relative overflow-hidden ${!category.image?.url ? `bg-gradient-to-br from-${category.gradient?.from || 'blue-500'} to-${category.gradient?.to || 'blue-700'}` : ''}`}>
              {category.image?.url ? (
                <img 
                  src={category.image.url} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Badge */}
              {category.badge?.text && (
                <div className={`absolute top-2 right-2 ${category.badge.color} px-2 py-1 rounded-lg shadow-lg`}>
                  <span className="text-white text-[10px] font-bold">{category.badge.text}</span>
                </div>
              )}
              
              {/* Icon */}
              <div className="absolute bottom-3 left-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <i className={`${category.icon} text-white text-lg`}></i>
              </div>
              
              {/* Status Indicators */}
              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                {category.isFeatured && (
                  <span className="bg-yellow-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">⭐ Featured</span>
                )}
                {category.isHot && (
                  <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">🔥 Hot</span>
                )}
                {category.isTrending && (
                  <span className="bg-purple-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">📈 Trending</span>
                )}
                {category.isNew && (
                  <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">✨ New</span>
                )}
                {category.isTopSelling && (
                  <span className="bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">⭐ Top</span>
                )}
              </div>
            </div>
            
            {/* Card Content */}
            <div className="p-4">
              <h3 className="font-bold text-slate-900 text-sm mb-1">{category.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{category.description || 'No description'}</p>
              
              {/* Stats Row */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
                  <i className="fas fa-box text-blue-500 text-[10px]"></i>
                  <span className="text-blue-700 text-xs font-semibold">{category.productCount || 0}</span>
                </div>
                <button
                  onClick={() => handleToggleActive(category._id)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    category.isActive
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </button>
                <span className="text-[10px] text-slate-400">Order: {category.order || 0}</span>
              </div>
              
              {/* Toggle Buttons */}
              <div className="grid grid-cols-3 gap-1 mb-3">
                <button
                  onClick={() => handleToggleFeatured(category._id)}
                  className={`px-2 py-1.5 rounded text-[10px] font-semibold transition-all ${
                    category.isFeatured
                      ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300'
                      : 'bg-slate-100 text-slate-500 hover:bg-yellow-50'
                  }`}
                  title="Toggle Featured"
                >
                  ⭐ Featured
                </button>
                <button
                  onClick={() => handleToggleHot(category._id)}
                  className={`px-2 py-1.5 rounded text-[10px] font-semibold transition-all ${
                    category.isHot
                      ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                      : 'bg-slate-100 text-slate-500 hover:bg-red-50'
                  }`}
                  title="Toggle Hot"
                >
                  🔥 Hot
                </button>
                <button
                  onClick={() => handleToggleTrending(category._id)}
                  className={`px-2 py-1.5 rounded text-[10px] font-semibold transition-all ${
                    category.isTrending
                      ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                      : 'bg-slate-100 text-slate-500 hover:bg-purple-50'
                  }`}
                  title="Toggle Trending"
                >
                  📈 Trending
                </button>
                <button
                  onClick={() => handleToggleNew(category._id)}
                  className={`px-2 py-1.5 rounded text-[10px] font-semibold transition-all ${
                    category.isNew
                      ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                      : 'bg-slate-100 text-slate-500 hover:bg-emerald-50'
                  }`}
                  title="Toggle New"
                >
                  ✨ New
                </button>
                <button
                  onClick={() => handleToggleTopSelling(category._id)}
                  className={`px-2 py-1.5 rounded text-[10px] font-semibold transition-all ${
                    category.isTopSelling
                      ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                      : 'bg-slate-100 text-slate-500 hover:bg-amber-50'
                  }`}
                  title="Toggle Top Selling"
                >
                  ⭐ Top
                </button>
                <button
                  onClick={() => handleToggleActive(category._id)}
                  className={`px-2 py-1.5 rounded text-[10px] font-semibold transition-all ${
                    category.isActive
                      ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
                      : 'bg-red-100 text-red-700 ring-1 ring-red-300'
                  }`}
                  title="Toggle Active"
                >
                  {category.isActive ? '✓ Active' : '✗ Inactive'}
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 px-3 py-2 bg-indigo-500 text-white rounded-lg text-xs font-semibold hover:bg-indigo-600 transition-all"
                >
                  <i className="fas fa-edit mr-1"></i> Edit
                </button>
                <button
                  onClick={() => setDeleteModal({ show: true, categoryId: category._id })}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-all"
                >
                  <i className="fas fa-trash mr-1"></i> Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center">
            <i className="fas fa-tags text-5xl text-slate-300 mb-4"></i>
            <p className="text-slate-600 font-semibold">No categories found</p>
            <p className="text-slate-400 text-sm mt-1">Create your first category to get started</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="px-3 sm:px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <span className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === pagination.pages}
              className="px-3 sm:px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Category Image
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-indigo-400 transition-all cursor-pointer group"
                >
                  {imagePreview ? (
                    <div className="relative h-40">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">Click to change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-2"></i>
                      <p className="text-sm text-slate-600">Click to upload image</p>
                      <p className="text-xs text-slate-400">Max 5MB, JPG/PNG</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Name & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Electronics"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brief category description..."
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Icon
                </label>
                <div className="grid grid-cols-10 gap-1">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: icon.value })}
                      className={`p-2 rounded-lg transition-all ${
                        formData.icon === icon.value
                          ? 'bg-indigo-500 text-white ring-2 ring-indigo-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title={icon.label}
                    >
                      <i className={icon.value}></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradient Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Background Gradient (fallback if no image)
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {gradientOptions.map((gradient, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, gradient: { from: gradient.from, to: gradient.to } })}
                      className={`h-8 rounded-lg bg-gradient-to-br from-${gradient.from} to-${gradient.to} transition-all ${
                        formData.gradient.from === gradient.from && formData.gradient.to === gradient.to
                          ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                      title={gradient.label}
                    />
                  ))}
                </div>
              </div>

              {/* Status Toggles */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Category Status & Badges
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                    />
                    <span className="text-xs font-medium text-slate-700">✓ Active</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
                    />
                    <span className="text-xs font-medium text-slate-700">⭐ Featured</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.isHot}
                      onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                      className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                    />
                    <span className="text-xs font-medium text-slate-700">🔥 Hot</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.isTrending}
                      onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                      className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                    />
                    <span className="text-xs font-medium text-slate-700">📈 Trending</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                      className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-medium text-slate-700">✨ New</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.isTopSelling}
                      onChange={(e) => setFormData({ ...formData, isTopSelling: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                    />
                    <span className="text-xs font-medium text-slate-700">⭐ Top Selling</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Category</h3>
              <p className="text-slate-600 text-sm mb-6">
                Are you sure you want to delete this category? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, categoryId: null })}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.categoryId)}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-all"
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

export default AdminCategories;
