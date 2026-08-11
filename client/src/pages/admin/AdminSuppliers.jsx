import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { apiConnector } from '../../services/apiconnector';
import { adminEndpoints } from '../../services/apis';
import axios from 'axios';

const { GET_ALL_SUPPLIERS_API, GET_SUPPLIER_DETAILS_API, APPROVE_SUPPLIER_API, REJECT_SUPPLIER_API, CREATE_SUPPLIER_API } = adminEndpoints;

const AdminSuppliers = () => {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    verified: 0,
    pending: 0,
    rejected: 0
  });
  const [activeTab, setActiveTab] = useState('pending');
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    status: 'pending'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addSupplierModalOpen, setAddSupplierModalOpen] = useState(false);
  const [viewSupplierModalOpen, setViewSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [newSupplierData, setNewSupplierData] = useState({
    email: '',
    companyName: '',
    businessType: 'Manufacturer',
    country: '',
    city: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    mainProducts: '',
    productCategories: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, [filters, currentPage]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.country && { country: filters.country }),
        ...(filters.status && { status: filters.status })
      });

      const response = await apiConnector(
        'GET',
        `${GET_ALL_SUPPLIERS_API}?${queryParams}`,
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (response.data.success) {
        setSuppliers(response.data.data.suppliers || []);
        setStats(response.data.data.stats || {
          totalSuppliers: 0,
          verified: 0,
          pending: 0,
          rejected: 0
        });
        setTotalPages(response.data.data.pages || 1);
      }
    } catch (error) {toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to page 1 when changing tabs
    let statusFilter = '';
    if (tab === 'pending') statusFilter = 'pending';
    else if (tab === 'verified') statusFilter = 'verified';
    else if (tab === 'rejected') statusFilter = 'rejected';
    setFilters({ ...filters, status: statusFilter });
  };

  const handleApprove = async (supplierId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiConnector(
        'PUT',
        APPROVE_SUPPLIER_API(supplierId),
        null,
        { Authorization: `Bearer ${token}` }
      );
      
      if (response.data.success) {
        toast.success('Supplier approved successfully!');
        fetchSuppliers();
      }
    } catch (error) {toast.error(error.response?.data?.message || 'Failed to approve supplier');
    }
  };

  const handleReject = async (supplierId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiConnector(
        'PUT',
        REJECT_SUPPLIER_API(supplierId),
        null,
        { Authorization: `Bearer ${token}` }
      );
      
      if (response.data.success) {
        toast.success('Supplier rejected');
        fetchSuppliers();
      }
    } catch (error) {toast.error(error.response?.data?.message || 'Failed to reject supplier');
    }
  };

  const handleViewDetails = async (supplierId) => {
    try {
      const response = await axios.get(
        GET_SUPPLIER_DETAILS_API(supplierId),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setSelectedSupplier(response.data.data);
      setViewSupplierModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch supplier details');
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await apiConnector(
        'POST',
        CREATE_SUPPLIER_API,
        newSupplierData,
        { Authorization: `Bearer ${token}` }
      );

      if (response.data.success) {
        toast.success('Supplier created successfully');
        setAddSupplierModalOpen(false);
        setNewSupplierData({
          email: '',
          companyName: '',
          businessType: 'Manufacturer',
          country: '',
          city: '',
          address: '',
          phone: '',
          website: '',
          description: '',
          mainProducts: '',
          productCategories: ''
        });
        fetchSuppliers();
      }
    } catch (error) {toast.error(error?.response?.data?.message || 'Failed to create supplier');
    }
  };

  if (loading && suppliers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-circle-notch fa-spin text-4xl text-purple-500"></i>
          <p className="text-slate-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <i className="fas fa-building text-white text-lg sm:text-xl"></i>
              </div>
              <span>Suppliers Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">Verify and manage all suppliers on the platform</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button className="flex-1 sm:flex-none bg-white border-2 border-slate-200 text-slate-700 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:border-purple-500 hover:text-purple-600 transition-all flex items-center justify-center gap-2">
              <i className="fas fa-download"></i>
              <span className="hidden xs:inline">Export CSV</span>
              <span className="xs:hidden">Export</span>
            </button>
            <button 
              onClick={() => setAddSupplierModalOpen(true)}
              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i>
              <span className="hidden xs:inline">Add Supplier</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
        {/* Total Suppliers */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-slate-200 hover:border-purple-500 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-building text-purple-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">
              <i className="fas fa-arrow-up text-[8px] sm:text-xs"></i> 12.5%
            </span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-0.5 sm:mb-1">Total Suppliers</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.totalSuppliers?.toLocaleString() || 0}</p>
        </div>

        {/* Verified */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-slate-200 hover:border-green-500 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">94%</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-0.5 sm:mb-1">Verified</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.verified?.toLocaleString() || 0}</p>
        </div>

        {/* Pending Verification */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-slate-200 hover:border-amber-500 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-clock text-amber-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-red-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">Urgent</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-0.5 sm:mb-1">Pending</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.pending?.toLocaleString() || 0}</p>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-slate-200 hover:border-red-500 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-times-circle text-red-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 bg-slate-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">4%</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-0.5 sm:mb-1">Rejected</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.rejected?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 mb-4 sm:mb-6 overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleTabChange('pending')}
            className={`flex-1 min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-sm border-b-4 transition-all whitespace-nowrap ${
              activeTab === 'pending'
                ? 'border-purple-500 text-purple-600 bg-purple-50'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-clock mr-1 sm:mr-2"></i>
            <span className="hidden sm:inline">Pending Verification</span>
            <span className="sm:hidden">Pending</span>
            <span className="ml-1">({stats.pending || 0})</span>
          </button>
          <button
            onClick={() => handleTabChange('verified')}
            className={`flex-1 min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-sm border-b-4 transition-all whitespace-nowrap ${
              activeTab === 'verified'
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-check-circle mr-1 sm:mr-2"></i>
            <span className="hidden sm:inline">Verified Suppliers</span>
            <span className="sm:hidden">Verified</span>
            <span className="ml-1">({stats.verified || 0})</span>
          </button>
          <button
            onClick={() => handleTabChange('top')}
            className={`flex-1 min-w-[80px] px-3 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-sm border-b-4 transition-all whitespace-nowrap hidden sm:block ${
              activeTab === 'top'
                ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-star mr-1 sm:mr-2"></i>
            Top Suppliers
          </button>
          <button
            onClick={() => handleTabChange('rejected')}
            className={`flex-1 min-w-[100px] px-3 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-sm border-b-4 transition-all whitespace-nowrap ${
              activeTab === 'rejected'
                ? 'border-red-500 text-red-600 bg-red-50'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-times-circle mr-1 sm:mr-2"></i>
            Rejected ({stats.rejected || 0})
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <input
              type="search"
              placeholder="Search by company name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>
          <select
            value={filters.country}
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            className="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-purple-500 focus:outline-none"
          >
            <option value="">All Countries</option>
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="China">China</option>
            <option value="UAE">UAE</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-purple-500 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() => setFilters({ search: '', country: '', status: '' })}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-700 font-bold text-xs sm:text-sm transition-all shadow-lg"
          >
            <i className="fas fa-redo mr-2"></i>Reset
          </button>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {suppliers.length > 0 ? (
          suppliers.map((supplier, index) => (
            <div key={supplier._id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
              {/* Card Header */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 sm:p-4 lg:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white bg-opacity-20 rounded-xl lg:rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl lg:text-2xl border-2 border-white border-opacity-30 flex-shrink-0">
                      {supplier.companyName?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base lg:text-xl font-black text-white truncate">{supplier.companyName || 'N/A'}</h3>
                      <p className="text-purple-100 text-xs sm:text-sm truncate">{supplier.businessType || 'Supplier'}</p>
                    </div>
                  </div>
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex-shrink-0 ${
                    supplier.isVerified 
                      ? 'bg-emerald-400 text-white' 
                      : supplier.status === 'rejected'
                      ? 'bg-red-400 text-white'
                      : 'bg-amber-400 text-white'
                  }`}>
                    {supplier.isVerified ? 'Verified' : supplier.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 sm:p-4 lg:p-6">
                {/* Contact Information */}
                <div className="mb-3 sm:mb-4 lg:mb-6">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <i className="fas fa-address-card text-purple-600"></i>
                    Contact Information
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <i className="fas fa-user text-slate-400 w-4"></i>
                      <span className="text-slate-600 truncate">{supplier.contactPerson || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <i className="fas fa-envelope text-slate-400 w-4"></i>
                      <span className="text-slate-600 truncate">{supplier.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <i className="fas fa-phone text-slate-400 w-4"></i>
                      <span className="text-slate-600">{supplier.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <i className="fas fa-map-marker-alt text-slate-400 w-4"></i>
                      <span className="text-slate-600">{supplier.country || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="mb-3 sm:mb-4 lg:mb-6">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <i className="fas fa-briefcase text-indigo-600"></i>
                    Business Details
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <i className="fas fa-building text-slate-400 w-4"></i>
                      <span className="text-slate-600">{supplier.businessType || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <i className="fas fa-calendar text-slate-400 w-4"></i>
                      <span className="text-slate-600">Est. {supplier.yearEstablished || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <i className="fas fa-box text-slate-400 w-4"></i>
                      <span className="text-slate-600">{supplier.productsCount || 0} Products</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <i className="fas fa-star text-slate-400 w-4"></i>
                      <span className="text-slate-600">Rating: {supplier.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Export Capabilities */}
                {supplier.exportCapabilities && (
                  <div className="mb-3 sm:mb-4 lg:mb-6">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-2 sm:mb-3 flex items-center gap-2">
                      <i className="fas fa-globe text-emerald-600"></i>
                      Export Capabilities
                    </h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {supplier.exportCapabilities.split(',').map((cap, idx) => (
                        <span key={idx} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] sm:text-xs font-bold">
                          {cap.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents Status */}
                <div className="mb-3 sm:mb-4 lg:mb-6 pb-3 sm:pb-4 lg:pb-6 border-b border-slate-200">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <i className="fas fa-file-alt text-blue-600"></i>
                    Documents
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                      <i className={`fas fa-check-circle ${supplier.documents?.businessLicense ? 'text-emerald-500' : 'text-slate-300'}`}></i>
                      <span className="text-slate-600">Business License</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                      <i className={`fas fa-check-circle ${supplier.documents?.taxCertificate ? 'text-emerald-500' : 'text-slate-300'}`}></i>
                      <span className="text-slate-600">Tax Certificate</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                      <i className={`fas fa-check-circle ${supplier.documents?.exportLicense ? 'text-emerald-500' : 'text-slate-300'}`}></i>
                      <span className="text-slate-600">Export License</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                      <i className={`fas fa-check-circle ${supplier.documents?.bankDetails ? 'text-emerald-500' : 'text-slate-300'}`}></i>
                      <span className="text-slate-600">Bank Details</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1.5 sm:gap-2">
                  <button 
                    onClick={() => handleViewDetails(supplier._id)}
                    className="flex-1 px-2 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 font-bold text-[10px] sm:text-sm transition-all shadow-lg"
                  >
                    <i className="fas fa-eye mr-1 sm:mr-2"></i><span className="hidden xs:inline">View </span>Details
                  </button>
                  {!supplier.isVerified && supplier.status !== 'rejected' && (
                    <>
                      <button
                        onClick={() => handleApprove(supplier._id)}
                        className="px-2 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-emerald-700 font-bold text-xs sm:text-sm transition-all shadow-lg"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        onClick={() => handleReject(supplier._id)}
                        className="px-2 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 font-bold text-xs sm:text-sm transition-all shadow-lg"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-6 sm:p-8 lg:p-12">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-building text-2xl sm:text-3xl lg:text-4xl text-white"></i>
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 text-center">No Suppliers Found</h3>
                <p className="text-xs sm:text-sm text-slate-600 text-center max-w-md">
                  {activeTab === 'pending' 
                    ? 'No suppliers pending verification at the moment.' 
                    : activeTab === 'verified'
                    ? 'No verified suppliers yet.'
                    : activeTab === 'rejected'
                    ? 'No rejected suppliers.'
                    : 'No top suppliers available.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {suppliers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-200 p-3 sm:p-4 lg:p-6">
          <div className="text-xs sm:text-sm text-slate-600">
            Showing <span className="font-bold">{suppliers.length}</span> suppliers
          </div>
          <div className="flex gap-1 sm:gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs sm:text-sm transition-all"
            >
              <i className="fas fa-chevron-left mr-1 sm:mr-2"></i><span className="hidden sm:inline">Previous</span>
            </button>
            <div className="flex gap-1">
              {[...Array(Math.min(totalPages, 5))].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                    currentPage === idx + 1
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs sm:text-sm transition-all"
            >
              <span className="hidden sm:inline">Next</span><i className="fas fa-chevron-right ml-1 sm:ml-2"></i>
            </button>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {addSupplierModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setAddSupplierModalOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Add New Supplier</h3>
                <button onClick={() => setAddSupplierModalOpen(false)} className="text-white/80 hover:text-white">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <p className="text-sm text-white/80 mt-2">Manually add supplier details found by your team</p>
            </div>
            
            <form onSubmit={handleCreateSupplier} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newSupplierData.email}
                    onChange={(e) => setNewSupplierData({ ...newSupplierData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="supplier@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSupplierData.companyName}
                    onChange={(e) => setNewSupplierData({ ...newSupplierData, companyName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="ABC Manufacturing"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newSupplierData.businessType}
                    onChange={(e) => setNewSupplierData({ ...newSupplierData, businessType: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    required
                  >
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Trading Company">Trading Company</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                  <input
                    type="text"
                    value={newSupplierData.phone}
                    onChange={(e) => setNewSupplierData({ ...newSupplierData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSupplierData.country}
                    onChange={(e) => setNewSupplierData({ ...newSupplierData, country: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="United States"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSupplierData.city}
                    onChange={(e) => setNewSupplierData({ ...newSupplierData, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="New York"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSupplierData.address}
                  onChange={(e) => setNewSupplierData({ ...newSupplierData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="123 Business Street"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Website</label>
                <input
                  type="url"
                  value={newSupplierData.website}
                  onChange={(e) => setNewSupplierData({ ...newSupplierData, website: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="https://company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Main Products</label>
                <textarea
                  value={newSupplierData.mainProducts}
                  onChange={(e) => setNewSupplierData({ ...newSupplierData, mainProducts: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="Electronics, Machinery, Raw Materials..."
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Product Categories</label>
                <input
                  type="text"
                  value={newSupplierData.productCategories}
                  onChange={(e) => setNewSupplierData({ ...newSupplierData, productCategories: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="Electronics, Industrial, Technology (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  value={newSupplierData.description}
                  onChange={(e) => setNewSupplierData({ ...newSupplierData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="Brief description about the supplier..."
                  rows="3"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create Supplier
                </button>
                <button
                  type="button"
                  onClick={() => setAddSupplierModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Supplier Details Modal */}
      {viewSupplierModalOpen && selectedSupplier && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewSupplierModalOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-white font-black text-3xl border-2 border-white border-opacity-30">
                    {selectedSupplier.companyName?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedSupplier.companyName}</h3>
                    <p className="text-sm text-white/80">{selectedSupplier.businessType}</p>
                  </div>
                </div>
                <button onClick={() => setViewSupplierModalOpen(false)} className="text-white/80 hover:text-white">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Contact Information Section */}
              <div className="bg-purple-50 p-6 rounded-2xl">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-address-card text-purple-600"></i>
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-600">Contact Person</label>
                    <p className="text-slate-900">{selectedSupplier.contactPerson || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600">Email</label>
                    <p className="text-slate-900">{selectedSupplier.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600">Phone</label>
                    <p className="text-slate-900">{selectedSupplier.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600">Website</label>
                    <p className="text-slate-900">{selectedSupplier.website || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Business Details Section */}
              <div className="bg-indigo-50 p-6 rounded-2xl">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-briefcase text-indigo-600"></i>
                  Business Details
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-600">Business Type</label>
                    <p className="text-slate-900">{selectedSupplier.businessType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600">Year Established</label>
                    <p className="text-slate-900">{selectedSupplier.yearEstablished || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600">Products Count</label>
                    <p className="text-slate-900">{selectedSupplier.productsCount || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600">Rating</label>
                    <p className="text-slate-900 flex items-center gap-1">
                      <i className="fas fa-star text-amber-400"></i>
                      {selectedSupplier.rating || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600">Verification Status</label>
                    <p className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                      selectedSupplier.verificationStatus === 'verified' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : selectedSupplier.verificationStatus === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedSupplier.verificationStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="bg-emerald-50 p-6 rounded-2xl">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-map-marker-alt text-emerald-600"></i>
                  Location Details
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-600">Country</label>
                    <p className="text-slate-900">{selectedSupplier.country}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600">City</label>
                    <p className="text-slate-900">{selectedSupplier.city}</p>
                  </div>
                  <div className="col-span-3">
                    <label className="text-sm font-bold text-slate-600">Address</label>
                    <p className="text-slate-900">{selectedSupplier.address}</p>
                  </div>
                </div>
              </div>

              {/* Products & Description */}
              {(selectedSupplier.mainProducts || selectedSupplier.description) && (
                <div className="bg-blue-50 p-6 rounded-2xl">
                  <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-box text-blue-600"></i>
                    Products & Description
                  </h4>
                  {selectedSupplier.mainProducts && (
                    <div className="mb-4">
                      <label className="text-sm font-bold text-slate-600">Main Products</label>
                      <p className="text-slate-900">{selectedSupplier.mainProducts}</p>
                    </div>
                  )}
                  {selectedSupplier.description && (
                    <div>
                      <label className="text-sm font-bold text-slate-600">Description</label>
                      <p className="text-slate-900">{selectedSupplier.description}</p>
                    </div>
                  )}
                  {selectedSupplier.productCategories && selectedSupplier.productCategories.length > 0 && (
                    <div className="mt-4">
                      <label className="text-sm font-bold text-slate-600">Product Categories</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedSupplier.productCategories.map((category, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-bold">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Documents Status */}
              <div className="bg-slate-50 p-6 rounded-2xl">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-file-alt text-slate-600"></i>
                  Documents Status
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <i className={`fas fa-${selectedSupplier.documents?.businessLicense ? 'check-circle text-emerald-500' : 'circle text-slate-300'} text-xl`}></i>
                    <span className="text-slate-700 font-bold">Business License</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <i className={`fas fa-${selectedSupplier.documents?.taxCertificate ? 'check-circle text-emerald-500' : 'circle text-slate-300'} text-xl`}></i>
                    <span className="text-slate-700 font-bold">Tax Certificate</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <i className={`fas fa-${selectedSupplier.documents?.exportLicense ? 'check-circle text-emerald-500' : 'circle text-slate-300'} text-xl`}></i>
                    <span className="text-slate-700 font-bold">Export License</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <i className={`fas fa-${selectedSupplier.documents?.bankDetails ? 'check-circle text-emerald-500' : 'circle text-slate-300'} text-xl`}></i>
                    <span className="text-slate-700 font-bold">Bank Details</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setViewSupplierModalOpen(false)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuppliers;
