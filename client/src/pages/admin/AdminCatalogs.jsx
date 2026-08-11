import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  getAllCatalogsAdmin,
  createCatalog,
  updateCatalog,
  deleteCatalog,
  uploadCatalogPdf,
  uploadCatalogCover,
  toggleCatalogActive,
  toggleCatalogFeatured,
  getCatalogStats
} from '../../services/operations/catalogAPI';
import { getAllCategories } from '../../services/operations/categoryAPI';

const AdminCatalogs = () => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [catalogs, setCatalogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, catalogId: null });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    version: '1.0',
    isActive: true,
    isFeatured: false
  });
  
  // Track file selection state (used for UI feedback)
  // eslint-disable-next-line no-unused-vars
  const [pdfFile, setPdfFile] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [coverFile, setCoverFile] = useState(null);
  const [pdfUploaded, setPdfUploaded] = useState(null);
  const [coverUploaded, setCoverUploaded] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const pdfInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCatalogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {}
  };

  const fetchStats = async () => {
    try {
      const response = await getCatalogStats(token);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {}
  };

  const fetchCatalogs = async () => {
    try {
      setLoading(true);
      const response = await getAllCatalogsAdmin(token, filters);

      if (response.success) {
        setCatalogs(response.data || []);
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

  const handlePdfChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (file.size > 50000000) { // 50MB limit
        toast.error('PDF file size should be less than 50MB');
        return;
      }
      setPdfFile(file);
      
      // Upload immediately
      setUploading(true);
      try {
        const response = await uploadCatalogPdf(token, file);
        if (response.success) {
          setPdfUploaded(response.data);
        }
      } catch (error) {setPdfFile(null);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5000000) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setCoverFile(file);
      
      // Upload immediately
      setUploading(true);
      try {
        const response = await uploadCatalogCover(token, file);
        if (response.success) {
          setCoverUploaded(response.data);
        }
      } catch (error) {setCoverFile(null);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingCatalog && !pdfUploaded) {
      toast.error('Please upload a PDF file');
      return; 
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        version: formData.version,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured
      };

      if (pdfUploaded) {
        payload.pdfFile = pdfUploaded;
      }

      if (coverUploaded) {
        payload.coverImage = coverUploaded;
      }

      if (editingCatalog) {
        await updateCatalog(token, editingCatalog._id, payload);
      } else {
        await createCatalog(token, payload);
      }
      
      setShowModal(false);
      resetForm();
      fetchCatalogs();
      fetchStats();
    } catch (error) {}
  };

  const handleEdit = (catalog) => {
    setEditingCatalog(catalog);
    setFormData({
      title: catalog.title,
      description: catalog.description || '',
      category: catalog.category?._id || '',
      tags: catalog.tags?.join(', ') || '',
      version: catalog.version || '1.0',
      isActive: catalog.isActive,
      isFeatured: catalog.isFeatured
    });
    setPdfUploaded(catalog.pdfFile);
    setCoverUploaded(catalog.coverImage);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteCatalog(token, deleteModal.catalogId);
      setDeleteModal({ show: false, catalogId: null });
      fetchCatalogs();
      fetchStats();
    } catch (error) {}
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleCatalogActive(token, id);
      fetchCatalogs();
    } catch (error) {}
  };

  const handleToggleFeatured = async (id) => {
    try {
      await toggleCatalogFeatured(token, id);
      fetchCatalogs();
    } catch (error) {}
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: '',
      version: '1.0',
      isActive: true,
      isFeatured: false
    });
    setPdfFile(null);
    setCoverFile(null);
    setPdfUploaded(null);
    setCoverUploaded(null);
    setEditingCatalog(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fas fa-book text-white text-base sm:text-xl"></i>
              </div>
              <span className="leading-tight">Catalog Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2 ml-12 sm:ml-15">Upload and manage product catalogs for customers to download</p>
          </div>
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 text-sm sm:text-base"
          >
            <i className="fas fa-plus"></i>
            <span>Add Catalog</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-book text-blue-600 text-xs sm:text-sm"></i>
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 truncate">{stats.totalCatalogs || 0}</p>
                <p className="text-[10px] sm:text-xs text-slate-500">Total Catalogs</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-check-circle text-emerald-600 text-xs sm:text-sm"></i>
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 truncate">{stats.activeCatalogs || 0}</p>
                <p className="text-[10px] sm:text-xs text-slate-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-star text-amber-600 text-xs sm:text-sm"></i>
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 truncate">{stats.featuredCatalogs || 0}</p>
                <p className="text-[10px] sm:text-xs text-slate-500">Featured</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-download text-purple-600 text-xs sm:text-sm"></i>
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 truncate">{stats.totalDownloads || 0}</p>
                <p className="text-[10px] sm:text-xs text-slate-500">Downloads</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-eye text-cyan-600 text-xs sm:text-sm"></i>
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 truncate">{stats.totalViews || 0}</p>
                <p className="text-[10px] sm:text-xs text-slate-500">Views</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm border border-slate-200 mb-4 sm:mb-6">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex-1">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs sm:text-sm"></i>
              <input
                type="text"
                placeholder="Search catalogs..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none text-xs sm:text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none text-xs sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none text-xs sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => setFilters({ search: '', category: '', status: '', page: 1, limit: 10 })}
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-xs sm:text-sm hover:bg-slate-50 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Catalogs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-emerald-600"></i>
            <p className="mt-4 text-slate-600">Loading catalogs...</p>
          </div>
        ) : catalogs.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-book-open text-6xl text-slate-300 mb-4"></i>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Catalogs Found</h3>
            <p className="text-slate-500 mb-4">Start by adding your first catalog</p>
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              <i className="fas fa-plus mr-2"></i> Add Catalog
            </button>
          </div>
        ) : (
          <>
            {/* Card View - Mobile */}
            <div className="md:hidden space-y-3">
              {catalogs.map((catalog) => (
                <div key={catalog._id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                  <div className="flex gap-3 mb-3">
                    {/* Cover Image */}
                    <div className="w-20 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      {catalog.coverImage?.url ? (
                        <img src={catalog.coverImage.url} alt={catalog.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-file-pdf text-slate-400 text-2xl"></i>
                        </div>
                      )}
                    </div>
                    {/* Title & Category */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">{catalog.title}</h3>
                      <p className="text-xs text-slate-500 mb-2 line-clamp-2">{catalog.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="inline-block bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {catalog.category?.name || 'Uncategorized'}
                        </span>
                        <span className="text-[10px] text-slate-400">v{catalog.version}</span>
                      </div>
                    </div>
                  </div>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-slate-200">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Downloads</p>
                      <p className="text-sm font-bold text-slate-900">{catalog.downloads || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Views</p>
                      <p className="text-sm font-bold text-slate-900">{catalog.views || 0}</p>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={() => handleToggleFeatured(catalog._id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                          catalog.isFeatured
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <i className={`fas fa-star text-xs ${catalog.isFeatured ? '' : 'text-slate-300'}`}></i>
                      </button>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleToggleActive(catalog._id)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold ${
                        catalog.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {catalog.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <a
                      href={catalog.pdfFile?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                      title="View PDF"
                    >
                      <i className="fas fa-eye text-xs"></i>
                    </a>
                    <button
                      onClick={() => handleEdit(catalog)}
                      className="bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-200 transition-colors"
                      title="Edit"
                    >
                      <i className="fas fa-edit text-xs"></i>
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: true, catalogId: catalog._id })}
                      className="bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <i className="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Table View - Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Catalog</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Downloads</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {catalogs.map((catalog) => (
                    <tr key={catalog._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                            {catalog.coverImage?.url ? (
                              <img src={catalog.coverImage.url} alt={catalog.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <i className="fas fa-file-pdf text-slate-400 text-2xl"></i>
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{catalog.title}</h3>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{catalog.description}</p>
                            <p className="text-xs text-slate-400 mt-1">v{catalog.version}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded">
                          {catalog.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-slate-900 font-semibold">{catalog.downloads || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-slate-900 font-semibold">{catalog.views || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(catalog._id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            catalog.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {catalog.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(catalog._id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            catalog.isFeatured
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <i className={`fas fa-star ${catalog.isFeatured ? '' : 'text-slate-300'}`}></i>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={catalog.pdfFile?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                            title="View PDF"
                          >
                            <i className="fas fa-eye text-sm"></i>
                          </a>
                          <button
                            onClick={() => handleEdit(catalog)}
                            className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-200 transition-colors"
                            title="Edit"
                          >
                            <i className="fas fa-edit text-sm"></i>
                          </button>
                          <button
                            onClick={() => setDeleteModal({ show: true, catalogId: catalog._id })}
                            className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                            title="Delete"
                          >
                            <i className="fas fa-trash text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-600">
              Showing <span className="font-semibold">{catalogs.length}</span> of{' '}
              <span className="font-semibold">{pagination.total}</span> catalogs
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                disabled={filters.page === 1}
                className="px-2 sm:px-3 py-1.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Previous</span>
                <i className="fas fa-chevron-left sm:hidden"></i>
              </button>
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={i}
                    onClick={() => setFilters({ ...filters, page: pageNum })}
                    className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold ${
                      filters.page === pageNum
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
                disabled={filters.page === pagination.pages}
                className="px-2 sm:px-3 py-1.5 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <i className="fas fa-chevron-right sm:hidden"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 sm:p-6 sticky top-0 z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-book text-white text-sm sm:text-base"></i>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-xl font-bold text-white truncate">
                      {editingCatalog ? 'Edit Catalog' : 'Add New Catalog'}
                    </h3>
                    <p className="text-emerald-100 text-xs sm:text-sm truncate">
                      {editingCatalog ? 'Update catalog details' : 'Upload a new product catalog'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0"
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
              {/* Title */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Catalog Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter catalog title"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:border-emerald-500 focus:outline-none text-sm"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter catalog description"
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:border-emerald-500 focus:outline-none resize-none text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:border-emerald-500 focus:outline-none text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  PDF File <span className="text-red-500">*</span>
                </label>
                <div 
                  onClick={() => pdfInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-colors ${
                    pdfUploaded 
                      ? 'border-emerald-300 bg-emerald-50' 
                      : 'border-slate-300 hover:border-emerald-500'
                  }`}
                >
                  {uploading ? (
                    <div>
                      <i className="fas fa-spinner fa-spin text-2xl sm:text-3xl text-emerald-500 mb-2"></i>
                      <p className="text-xs sm:text-sm text-slate-600">Uploading...</p>
                    </div>
                  ) : pdfUploaded ? (
                    <div>
                      <i className="fas fa-check-circle text-2xl sm:text-3xl text-emerald-500 mb-2"></i>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-700 truncate">{pdfUploaded.fileName || 'PDF Uploaded'}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Click to replace</p>
                    </div>
                  ) : (
                    <div>
                      <i className="fas fa-file-pdf text-2xl sm:text-3xl text-slate-400 mb-2"></i>
                      <p className="text-xs sm:text-sm text-slate-600">Click to upload PDF</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Max file size: 50MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                />
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Cover Image</label>
                <div 
                  onClick={() => coverInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-colors ${
                    coverUploaded 
                      ? 'border-teal-300 bg-teal-50' 
                      : 'border-slate-300 hover:border-teal-500'
                  }`}
                >
                  {coverUploaded ? (
                    <div>
                      <img src={coverUploaded.url} alt="Cover" className="w-20 h-24 sm:w-24 sm:h-32 object-cover mx-auto rounded-lg mb-2" />
                      <p className="text-[10px] sm:text-xs text-slate-500">Click to replace</p>
                    </div>
                  ) : (
                    <div>
                      <i className="fas fa-image text-2xl sm:text-3xl text-slate-400 mb-2"></i>
                      <p className="text-xs sm:text-sm text-slate-600">Click to upload cover image</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Recommended: 800x1000px</p>
                    </div>
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>

              {/* Tags and Version */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="tag1, tag2, tag3"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:border-emerald-500 focus:outline-none text-sm"
                  />
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Separate with commas</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:border-emerald-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4 sm:gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Featured</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-slate-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {editingCatalog ? 'Update Catalog' : 'Create Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl sm:text-2xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 text-center mb-2">Delete Catalog?</h3>
              <p className="text-xs sm:text-sm text-slate-600 text-center mb-4 sm:mb-6">
                This action cannot be undone. The catalog and all its associated files will be permanently deleted.
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, catalogId: null })}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-slate-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all text-sm"
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

export default AdminCatalogs;
