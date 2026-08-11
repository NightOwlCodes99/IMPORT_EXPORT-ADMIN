import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  getAllQuotes,
  getQuoteStats,
  updateQuoteStatus,
  sendQuoteResponse,
  deleteQuote,
  convertQuoteToOrder,
  contactBuyer,
  adminAcceptQuote,
  createAdminQuote
} from '../../services/operations/quoteAPI';
import { getAllCategories } from '../../services/operations/categoryAPI';
import { getAllProducts } from '../../services/operations/productAPI';

const AdminQuotes = () => {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inReview: 0,
    quoted: 0,
    rejected: 0,
    expired: 0,
    quotedPercentage: 0,
    expiredPercentage: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: '',
    dateRange: '30days',
    page: 1,
    limit: 10
  });
  const [activeTab, setActiveTab] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [showCreateRFQModal, setShowCreateRFQModal] = useState(false);
  const [createRFQLoading, setCreateRFQLoading] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [createRFQData, setCreateRFQData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCompany: '',
    productName: '',
    category: '',
    quantity: '',
    unit: 'pieces',
    description: '',
    specifications: '',
    targetPrice: '',
    budgetMin: '',
    budgetMax: '',
    currency: 'USD',
    deliveryCity: '',
    deliveryState: '',
    deliveryCountry: '',
    expectedDeliveryDate: '',
    urgency: 'Medium',
    sendEmail: true
  });
  const [contactData, setContactData] = useState({
    subject: '',
    message: '',
    responseDeadlineDays: 3
  });
  const [contactLoading, setContactLoading] = useState(false);
  
  // Accept quote modal state
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [quoteToAccept, setQuoteToAccept] = useState(null);
  const [acceptingQuote, setAcceptingQuote] = useState(false);
  const [responseData, setResponseData] = useState({
    quotedPrice: '',
    moq: '',
    leadTimeValue: '',
    leadTimeUnit: 'days',
    paymentTerms: '',
    shippingTerms: '',
    validUntil: '',
    notes: ''
  });
  const [convertData, setConvertData] = useState({
    productName: '',
    quantity: '',
    unitPrice: '',
    sku: '',
    shippingFullName: '',
    shippingCompany: '',
    shippingPhone: '',
    shippingEmail: '',
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingZipCode: '',
    shippingCountry: '',
    itemsPrice: '',
    taxPrice: '',
    shippingPrice: '',
    discount: '',
    paymentStatus: 'Pending',
    advancePayment: '',
    paymentTerms: '',
    orderNotes: '',
    expectedDeliveryDate: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [filters, activeTab]);

  // Fetch products and categories when Create RFQ modal opens
  useEffect(() => {
    if (showCreateRFQModal) {
      fetchProductsAndCategories();
    }
  }, [showCreateRFQModal]);

  const fetchProductsAndCategories = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getAllProducts({ limit: 500, isActive: true }),
        getAllCategories()
      ]);
      
      if (productsRes.success) {
        setProductsList(productsRes.data || []);
      }
      if (categoriesRes.success) {
        setCategoriesList(categoriesRes.data || []);
      }
    } catch (error) {}
  };

  // Handle product selection - auto-fill product name and category
  const handleProductSelect = (productId) => {
    setSelectedProductId(productId);
    
    if (productId === 'custom') {
      // Custom product - clear fields
      setCreateRFQData(prev => ({
        ...prev,
        productName: '',
        category: ''
      }));
    } else if (productId) {
      const product = productsList.find(p => p._id === productId);
      if (product) {
        setCreateRFQData(prev => ({
          ...prev,
          productName: product.name,
          category: product.category?.name || product.category || ''
        }));
      }
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getQuoteStats(token);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {}
  };

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      
      // Apply tab filter
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      
      const response = await getAllQuotes(token, params);
      if (response.success) {
        setQuotes(response.data || []);
        setPagination({
          page: response.page || 1,
          pages: response.pages || 1,
          total: response.total || 0
        });
      }
    } catch (error) {} finally {
      setLoading(false);
    }
  };

  // Handle Create RFQ submission
  const handleCreateRFQ = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!createRFQData.customerName || !createRFQData.customerEmail) {
      toast.error('Please provide customer name and email');
      return;
    }
    if (!createRFQData.productName || !createRFQData.category) {
      toast.error('Please provide product name and category');
      return;
    }
    if (!createRFQData.quantity || createRFQData.quantity <= 0) {
      toast.error('Please provide a valid quantity');
      return;
    }
    if (!createRFQData.description) {
      toast.error('Please provide product description');
      return;
    }
    if (!createRFQData.deliveryCountry) {
      toast.error('Please provide delivery country');
      return;
    }

    try {
      setCreateRFQLoading(true);
      await createAdminQuote(createRFQData, token);
      
      // Reset form and close modal
      setCreateRFQData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerCompany: '',
        productName: '',
        category: '',
        quantity: '',
        unit: 'pieces',
        description: '',
        specifications: '',
        targetPrice: '',
        budgetMin: '',
        budgetMax: '',
        currency: 'USD',
        deliveryCity: '',
        deliveryState: '',
        deliveryCountry: '',
        expectedDeliveryDate: '',
        urgency: 'Medium',
        sendEmail: true
      });
      setSelectedProductId('');
      setShowCreateRFQModal(false);
      
      // Refresh data
      fetchQuotes();
      fetchStats();
    } catch (error) {} finally {
      setCreateRFQLoading(false);
    }
  };

  const handleStatusUpdate = async (quoteId, newStatus) => {
    try {
      await updateQuoteStatus(quoteId, newStatus, token);
      fetchQuotes();
      fetchStats();
    } catch (error) {}
  };

  // Open quote response modal (for sending initial quote or revised quote)
  const handleSendQuote = (quote) => {
    setSelectedQuote(quote);
    // Pre-fill with previous values if this is a re-quote (rejected quote)
    if (quote.supplierResponse) {
      setResponseData({
        quotedPrice: quote.supplierResponse.quotedPrice?.toString() || '',
        moq: quote.supplierResponse.moq?.toString() || '',
        leadTimeValue: quote.supplierResponse.leadTime?.value?.toString() || '',
        leadTimeUnit: quote.supplierResponse.leadTime?.unit || 'days',
        paymentTerms: quote.supplierResponse.paymentTerms || '',
        shippingTerms: quote.supplierResponse.shippingTerms || '',
        validUntil: '',
        notes: quote.status === 'rejected' 
          ? `[REVISED QUOTE] Previous quote was rejected due to: ${quote.rejectionCategory || 'Not specified'}. \n\nNew offer: ` 
          : (quote.supplierResponse.notes || '')
      });
    } else {
      setResponseData({
        quotedPrice: '',
        moq: '',
        leadTimeValue: '',
        leadTimeUnit: 'days',
        paymentTerms: '',
        shippingTerms: '',
        validUntil: '',
        notes: ''
      });
    }
    setShowResponseModal(true);
  };

  const handleSendResponse = async () => {
    if (!selectedQuote) return;
    
    try {
      const data = {
        quotedPrice: parseFloat(responseData.quotedPrice),
        moq: parseInt(responseData.moq),
        leadTime: {
          value: parseInt(responseData.leadTimeValue),
          unit: responseData.leadTimeUnit
        },
        paymentTerms: responseData.paymentTerms,
        shippingTerms: responseData.shippingTerms,
        validUntil: responseData.validUntil,
        notes: responseData.notes
      };
      
      await sendQuoteResponse(selectedQuote._id, data, token);
      setShowResponseModal(false);
      setSelectedQuote(null);
      setResponseData({
        quotedPrice: '',
        moq: '',
        leadTimeValue: '',
        leadTimeUnit: 'days',
        paymentTerms: '',
        shippingTerms: '',
        validUntil: '',
        notes: ''
      });
      fetchQuotes();
      fetchStats();
    } catch (error) {}
  };

  const handleDelete = async (quoteId) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;
    
    try {
      await deleteQuote(quoteId, token);
      fetchQuotes();
      fetchStats();
    } catch (error) {}
  };

  const handleOpenConvertModal = (quote) => {
    setSelectedQuote(quote);
    // Pre-fill data from quote - Priority: finalPrice > quotedPrice > targetPrice > productPrice
    const priceToUse = quote.finalPrice || quote.supplierResponse?.quotedPrice || quote.targetPrice || quote.productPrice || '';
    setConvertData({
      productName: quote.productName || '',
      quantity: quote.quantity || '',
      unitPrice: priceToUse,
      sku: '',
      shippingFullName: quote.customerInfo?.name || '',
      shippingCompany: quote.customerInfo?.company || '',
      shippingPhone: quote.customerInfo?.phone || '',
      shippingEmail: quote.customerInfo?.email || '',
      shippingStreet: '',
      shippingCity: quote.deliveryLocation?.city || '',
      shippingState: quote.deliveryLocation?.state || '',
      shippingZipCode: '',
      shippingCountry: quote.deliveryLocation?.country || '',
      itemsPrice: '',
      taxPrice: '0',
      shippingPrice: '0',
      discount: '0',
      paymentStatus: 'Pending',
      advancePayment: '',
      paymentTerms: quote.supplierResponse?.paymentTerms || '',
      orderNotes: `Quote: ${quote.quoteId}\n${quote.description || ''}`,
      expectedDeliveryDate: quote.expectedDeliveryDate ? new Date(quote.expectedDeliveryDate).toISOString().split('T')[0] : ''
    });
    setShowConvertModal(true);
  };

  // Admin accepts quote directly on behalf of user - opens modal
  const handleAdminAccept = (quote) => {
    const finalPrice = quote.supplierResponse?.quotedPrice || quote.targetPrice || quote.productPrice;
    if (!finalPrice) {
      toast.error('No price available to accept. Please send a quote first.');
      return;
    }
    setQuoteToAccept(quote);
    setShowAcceptModal(true);
  };

  // Confirm accept quote
  const handleConfirmAccept = async () => {
    if (!quoteToAccept) return;
    
    setAcceptingQuote(true);
    try {
      const finalPrice = quoteToAccept.supplierResponse?.quotedPrice || quoteToAccept.targetPrice || quoteToAccept.productPrice;
      await adminAcceptQuote(quoteToAccept._id, { finalPrice, notes: 'Accepted by admin' }, token);
      fetchQuotes();
      fetchStats();
      setShowAcceptModal(false);
      setQuoteToAccept(null);
      toast.success('Quote accepted successfully');
    } catch (error) {} finally {
      setAcceptingQuote(false);
    }
  };

  const handleCloseAcceptModal = () => {
    setShowAcceptModal(false);
    setQuoteToAccept(null);
  };

  const handleConvertToOrder = async () => {
    if (!selectedQuote) return;
    
    // Validate minimum required fields
    if (!convertData.quantity || !convertData.unitPrice || !convertData.shippingFullName || 
        !convertData.shippingPhone || !convertData.shippingCity || !convertData.shippingCountry) {
      toast.error('Please fill in all required fields: Quantity, Price, Name, Phone, City, Country');
      return;
    }

    // Set default values for optional fields if empty
    const orderData = {
      ...convertData,
      shippingStreet: convertData.shippingStreet || 'To be confirmed',
      shippingZipCode: convertData.shippingZipCode || '00000',
      shippingEmail: convertData.shippingEmail || selectedQuote.customerInfo?.email || ''
    };

    try {
      await convertQuoteToOrder(selectedQuote._id, orderData, token);
      setShowConvertModal(false);
      setSelectedQuote(null);
      setConvertData({
        productName: '',
        quantity: '',
        unitPrice: '',
        sku: '',
        shippingFullName: '',
        shippingCompany: '',
        shippingPhone: '',
        shippingEmail: '',
        shippingStreet: '',
        shippingCity: '',
        shippingState: '',
        shippingZipCode: '',
        shippingCountry: '',
        itemsPrice: '',
        taxPrice: '',
        shippingPrice: '',
        discount: '',
        paymentStatus: 'Pending',
        advancePayment: '',
        paymentTerms: '',
        orderNotes: '',
        expectedDeliveryDate: ''
      });
      fetchQuotes();
      fetchStats();
      toast.success('Quote converted to order successfully!');
    } catch (error) {}
  };

  const calculateTotal = () => {
    const qty = parseFloat(convertData.quantity) || 0;
    const price = parseFloat(convertData.unitPrice) || 0;
    const tax = parseFloat(convertData.taxPrice) || 0;
    const shipping = parseFloat(convertData.shippingPrice) || 0;
    const discount = parseFloat(convertData.discount) || 0;
    const itemsPrice = qty * price;
    return (itemsPrice + tax + shipping - discount).toFixed(2);
  };

  // Auto-calculate advance payment based on payment terms
  const calculateAdvancePayment = (paymentTerm, total) => {
    const totalAmount = parseFloat(total) || 0;
    
    // Extract percentage from payment term string
    const percentMatch = paymentTerm.match(/(\d+)%\s*(advance|upfront|down)/i);
    if (percentMatch) {
      const percentage = parseInt(percentMatch[1]);
      return ((totalAmount * percentage) / 100).toFixed(2);
    }
    
    // Common payment terms mapping
    const termMappings = {
      '100% Advance': 100,
      'Full Advance': 100,
      '70% Advance, 30% on Delivery': 70,
      '70-30': 70,
      '50% Advance, 50% on Delivery': 50,
      '50-50': 50,
      '40% Advance, 60% on Delivery': 40,
      '30% Advance, 70% on Delivery': 30,
      '30-70': 30,
      '25% Advance, 75% on Delivery': 25,
      '20% Advance, 80% on Delivery': 20,
      'LC (Letter of Credit)': 0,
      'Net 30': 0,
      'Net 60': 0,
      'COD': 0,
      'Cash on Delivery': 0,
    };

    for (const [term, percentage] of Object.entries(termMappings)) {
      if (paymentTerm.toLowerCase().includes(term.toLowerCase())) {
        return ((totalAmount * percentage) / 100).toFixed(2);
      }
    }
    
    return '';
  };

  // Handle payment terms change - auto-calculate advance
  const handlePaymentTermsChange = (selectedTerm) => {
    const total = calculateTotal();
    const advanceAmount = calculateAdvancePayment(selectedTerm, total);
    setConvertData(prev => ({
      ...prev,
      paymentTerms: selectedTerm,
      advancePayment: advanceAmount
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      search: '',
      dateRange: '30days',
      page: 1,
      limit: 10
    });
    setActiveTab('all');
  };

  // View Full Details handler
  const handleViewDetails = (quote) => {
    setSelectedQuote(quote);
    setShowDetailsModal(true);
  };

  // Contact Buyer handler - open modal
  const handleOpenContactModal = (quote) => {
    setSelectedQuote(quote);
    setContactData({
      subject: `Regarding Your Quote Request - ${quote.quoteId}`,
      message: `Dear ${quote.customerInfo?.name || 'Customer'},\n\nWe are reaching out regarding your quote request (${quote.quoteId}) for ${quote.productName}.\n\nPlease let us know if you have any questions or need additional information.\n\nBest regards,\nNexarion Global Exports Team`,
      responseDeadlineDays: 3
    });
    setShowContactModal(true);
  };

  // Send contact email
  const handleSendContactEmail = async () => {
    if (!selectedQuote) return;
    
    if (!contactData.subject.trim() || !contactData.message.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }

    try {
      setContactLoading(true);
      await contactBuyer(selectedQuote._id, contactData, token);
      setShowContactModal(false);
      setContactData({ subject: '', message: '', responseDeadlineDays: 3 });
      setSelectedQuote(null);
    } catch (error) {} finally {
      setContactLoading(false);
    }
  };

  // Handle phone call
  const handleCallBuyer = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error('No phone number available');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-blue-500 text-white',
      'in-review': 'bg-amber-500 text-white',
      'quoted': 'bg-green-500 text-white',
      'negotiating': 'bg-purple-500 text-white',
      'accepted': 'bg-emerald-600 text-white',
      'rejected': 'bg-red-500 text-white',
      'expired': 'bg-slate-500 text-white'
    };
    return colors[status] || 'bg-slate-500 text-white';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'New Request',
      'in-review': 'In Progress',
      'quoted': 'Quoted',
      'negotiating': 'Negotiating',
      'accepted': 'Accepted',
      'rejected': 'Rejected',
      'expired': 'Expired'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-500 text-white',
      'medium': 'bg-amber-500 text-white',
      'low': 'bg-green-500 text-white'
    };
    return colors[priority] || 'bg-slate-500 text-white';
  };

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return { text: 'Expired', color: 'text-red-600' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 7) return { text: `${days} days`, color: 'text-green-600' };
    if (days > 3) return { text: `${days} days ${hours}h`, color: 'text-amber-600' };
    return { text: `${days}d ${hours}h`, color: 'text-red-600' };
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading && quotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-circle-notch fa-spin text-4xl text-violet-500"></i>
          <p className="text-slate-600">Loading quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 -mx-3 sm:-mx-4 lg:-mx-6 -mt-3 sm:-mt-4 lg:-mt-6 px-3 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 mb-3 sm:mb-4 lg:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mb-2 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-file-invoice text-white text-sm sm:text-lg lg:text-xl"></i>
              </div>
              Quote Requests (RFQ)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">Manage and monitor all buyer quotation requests</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button className="flex-1 sm:flex-none bg-white border-2 border-slate-200 text-slate-700 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:border-violet-500 hover:text-violet-600 transition-all flex items-center justify-center gap-2">
              <i className="fas fa-download"></i>
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button 
              onClick={() => setShowCreateRFQModal(true)}
              className="flex-1 sm:flex-none bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i>
              <span className="hidden sm:inline">Create RFQ</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {/* Total RFQs */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-sm sm:shadow-md hover:shadow-lg border-2 border-slate-200 hover:border-violet-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-violet-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-file-invoice text-violet-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">
              <i className="fas fa-arrow-up text-[8px] sm:text-xs mr-0.5 sm:mr-1"></i>18.2%
            </span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-0.5 sm:mb-1">Total RFQs</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.total.toLocaleString()}</p>
        </div>

        {/* New Requests */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-sm sm:shadow-md hover:shadow-lg border-2 border-slate-200 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-inbox text-blue-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">New</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-0.5 sm:mb-1">New Requests</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.pending.toLocaleString()}</p>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-sm sm:shadow-md hover:shadow-lg border-2 border-slate-200 hover:border-amber-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-spinner text-amber-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-amber-600 bg-amber-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">Active</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-0.5 sm:mb-1">In Progress</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.inReview.toLocaleString()}</p>
        </div>

        {/* Quoted */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-sm sm:shadow-md hover:shadow-lg border-2 border-slate-200 hover:border-green-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">{stats.quotedPercentage}%</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-0.5 sm:mb-1">Quoted</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.quoted.toLocaleString()}</p>
        </div>

        {/* Rejected - NEW CARD */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-sm sm:shadow-md hover:shadow-lg border-2 border-slate-200 hover:border-rose-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-rose-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-times-circle text-rose-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-rose-600 bg-rose-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">
              <i className="fas fa-redo text-[8px] sm:text-xs mr-0.5 sm:mr-1"></i>Re-quote
            </span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-0.5 sm:mb-1">Rejected</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.rejected?.toLocaleString() || 0}</p>
        </div>

        {/* Expired */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-sm sm:shadow-md hover:shadow-lg border-2 border-slate-200 hover:border-red-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <i className="fas fa-hourglass-end text-red-600 text-sm sm:text-lg lg:text-xl"></i>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 bg-slate-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">{stats.expiredPercentage}%</span>
          </div>
          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-600 mb-0.5 sm:mb-1">Expired</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{stats.expired.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm sm:shadow-md hover:shadow-lg border-2 border-slate-200">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 lg:gap-4">
          {/* Search */}
          <div className="w-full sm:flex-1 sm:min-w-[200px] lg:min-w-[300px]">
            <div className="relative">
              <i className="fas fa-search absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs sm:text-sm"></i>
              <input
                type="text"
                placeholder="Search by RFQ ID, buyer, product..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-violet-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:border-violet-500 focus:outline-none transition-all"
            >
              <option value="">All Status</option>
              <option value="pending">New Request</option>
              <option value="in-review">In Progress</option>
              <option value="quoted">Quoted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:border-violet-500 focus:outline-none transition-all"
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Date Filter */}
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value, page: 1 })}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:border-violet-500 focus:outline-none transition-all"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="today">Today</option>
            </select>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-redo text-[10px] sm:text-xs"></i> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md hover:shadow-lg border-2 border-slate-200">
        <div className="flex overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 min-w-[100px] sm:min-w-[120px] px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 font-bold text-[10px] sm:text-xs lg:text-sm border-b-4 whitespace-nowrap transition-all flex items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'all'
                ? 'border-violet-500 text-violet-600 bg-violet-50'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-list text-[10px] sm:text-xs"></i>
            <span className="hidden sm:inline">All Quotes</span>
            <span className="sm:hidden">All</span>
            <span className="text-[10px] sm:text-xs">({stats.total})</span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 min-w-[100px] sm:min-w-[120px] px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 font-bold text-[10px] sm:text-xs lg:text-sm border-b-4 whitespace-nowrap transition-all flex items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-inbox text-[10px] sm:text-xs"></i>
            <span className="hidden sm:inline">New</span>
            <span className="text-[10px] sm:text-xs">({stats.pending})</span>
          </button>
          <button
            onClick={() => setActiveTab('in-review')}
            className={`flex-1 min-w-[100px] sm:min-w-[120px] px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 font-bold text-[10px] sm:text-xs lg:text-sm border-b-4 whitespace-nowrap transition-all flex items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'in-review'
                ? 'border-amber-500 text-amber-600 bg-amber-50'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-spinner text-[10px] sm:text-xs"></i>
            <span className="hidden lg:inline">In Progress</span>
            <span className="lg:hidden">Active</span>
            <span className="text-[10px] sm:text-xs">({stats.inReview})</span>
          </button>
          <button
            onClick={() => setActiveTab('quoted')}
            className={`flex-1 min-w-[100px] sm:min-w-[120px] px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 font-bold text-[10px] sm:text-xs lg:text-sm border-b-4 whitespace-nowrap transition-all flex items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'quoted'
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-check-circle text-[10px] sm:text-xs"></i>
            <span className="hidden sm:inline">Quoted</span>
            <span className="text-[10px] sm:text-xs">({stats.quoted})</span>
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`flex-1 min-w-[100px] sm:min-w-[120px] px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 font-bold text-[10px] sm:text-xs lg:text-sm border-b-4 whitespace-nowrap transition-all flex items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'expired'
                ? 'border-red-500 text-red-600 bg-red-50'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-hourglass-end text-[10px] sm:text-xs"></i>
            <span className="hidden sm:inline">Expired</span>
            <span className="text-[10px] sm:text-xs">({stats.expired})</span>
          </button>
        </div>
      </div>

      {/* Quote Cards */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        {quotes.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md hover:shadow-lg border-2 border-slate-200 p-6 sm:p-8 lg:p-12 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <i className="fas fa-file-invoice text-slate-400 text-xl sm:text-2xl lg:text-3xl"></i>
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-700 mb-1 sm:mb-2">No quote requests found</h3>
            <p className="text-xs sm:text-sm text-slate-500">Quote requests will appear here when customers submit them.</p>
          </div>
        ) : (
          quotes.map((quote) => {
            const timeRemaining = getTimeRemaining(quote.expiresAt);
            
            return (
              <div
                key={quote._id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md hover:shadow-lg border-2 border-slate-200 hover:border-violet-500 transition-all duration-300 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
                        <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900">#{quote.quoteId}</h3>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold ${getStatusColor(quote.status)}`}>
                          <i className="fas fa-circle text-[8px] sm:text-xs mr-0.5 sm:mr-1"></i>
                          {getStatusLabel(quote.status)}
                        </span>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold ${getPriorityColor(quote.priority)}`}>
                          <i className="fas fa-exclamation-circle mr-0.5 sm:mr-1"></i>
                          <span className="hidden sm:inline">{quote.priority?.charAt(0).toUpperCase() + quote.priority?.slice(1)} Priority</span>
                          <span className="sm:hidden">{quote.priority?.charAt(0).toUpperCase()}</span>
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600">
                        <span className="hidden sm:inline">Submitted: {formatDateTime(quote.createdAt)} • Expires: {formatDate(quote.expiresAt)}</span>
                        <span className="sm:hidden">{formatDate(quote.createdAt)} • {formatDate(quote.expiresAt)}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {quote.status === 'pending' || quote.status === 'in-review' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedQuote(quote);
                              setShowResponseModal(true);
                            }}
                            className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold transition-all flex items-center gap-1 sm:gap-2"
                          >
                            <i className="fas fa-paper-plane"></i>
                            <span className="hidden sm:inline">Send Quote</span>
                            <span className="sm:hidden">Quote</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(quote._id, 'in-review')}
                            className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold transition-all flex items-center gap-1 sm:gap-2"
                          >
                            <i className="fas fa-user-plus"></i>
                            <span className="hidden sm:inline">Assign</span>
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 lg:p-6">
                  {/* Buyer & Product Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 lg:mb-6">
                    {/* Buyer Information */}
                    <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-blue-200">
                      <h4 className="text-[10px] sm:text-xs lg:text-sm font-black text-blue-900 mb-2 sm:mb-3 lg:mb-4 uppercase flex items-center gap-1 sm:gap-2">
                        <i className="fas fa-user text-[10px] sm:text-xs"></i> Buyer Information
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs sm:text-sm">{getInitials(quote.customerInfo?.name || quote.customer?.name)}</span>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm lg:text-base font-black text-slate-900">{quote.customerInfo?.name || quote.customer?.name || 'N/A'}</p>
                            <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600">{quote.customerInfo?.company || 'Individual'}</p>
                            {quote.deliveryLocation?.country && (
                              <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                                <i className="fas fa-map-marker-alt text-blue-600 text-[10px] sm:text-xs"></i>
                                <span className="text-[10px] sm:text-xs font-semibold text-slate-700">{quote.deliveryLocation.country}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs lg:text-sm">
                          <i className="fas fa-envelope text-blue-600"></i>
                          <span className="text-slate-700 truncate">{quote.customerInfo?.email || quote.customer?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs lg:text-sm">
                          <i className="fas fa-phone text-blue-600"></i>
                          <span className="text-slate-700">{quote.customerInfo?.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Product Requirements */}
                    <div className="bg-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-purple-200">
                      <h4 className="text-[10px] sm:text-xs lg:text-sm font-black text-purple-900 mb-2 sm:mb-3 lg:mb-4 uppercase flex items-center gap-1 sm:gap-2">
                        <i className="fas fa-box text-[10px] sm:text-xs"></i> Product Requirements
                        {/* Catalog/Custom Badge */}
                        {quote.isCustomProduct === false ? (
                          <span className="ml-auto px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[8px] sm:text-[10px] font-semibold flex items-center gap-1">
                            <i className="fas fa-check-circle"></i> Catalog
                          </span>
                        ) : (
                          <span className="ml-auto px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[8px] sm:text-[10px] font-semibold flex items-center gap-1">
                            <i className="fas fa-edit"></i> Custom
                          </span>
                        )}
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        {/* Selected Product Info (if from catalog) */}
                        {quote.selectedProduct?.productId && (
                          <div className="bg-white rounded-lg p-2 sm:p-3 border border-teal-200 flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {quote.selectedProduct?.image ? (
                                <img
                                  src={quote.selectedProduct.image}
                                  alt={quote.selectedProduct.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <i className="fas fa-box text-gray-400"></i>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-teal-800 truncate">{quote.selectedProduct.name}</p>
                              <p className="text-[10px] text-gray-500">
                                {quote.selectedProduct.sku && `SKU: ${quote.selectedProduct.sku}`}
                                {quote.selectedProduct.price && ` • Listed: $${quote.selectedProduct.price}`}
                              </p>
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] sm:text-xs text-slate-600">Product / Category</p>
                          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-900">{quote.productName || quote.product?.name || 'N/A'} - {quote.category || 'General'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-slate-600">Quantity Required</p>
                          <p className="text-sm sm:text-base lg:text-lg font-black text-purple-600">{quote.quantity?.toLocaleString() || 'N/A'} {quote.unit || 'units'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-slate-600">Target Price</p>
                          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-900">
                            {quote.targetPrice ? `$${quote.targetPrice.toLocaleString()}` : 'Flexible'}
                            {quote.budget?.min && quote.budget?.max && (
                              <span className="text-slate-500 ml-1 hidden sm:inline">
                                (Budget: ${quote.budget.min} - ${quote.budget.max})
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-slate-600">Expected Delivery</p>
                          <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-900">{quote.expectedDeliveryDate ? formatDate(quote.expectedDeliveryDate) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {quote.description && (
                    <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 mb-3 sm:mb-4 lg:mb-6 border border-slate-200">
                      <h4 className="text-[10px] sm:text-xs lg:text-sm font-black text-slate-900 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                        <i className="fas fa-clipboard-list text-[10px] sm:text-xs"></i> <span className="hidden sm:inline">Detailed Requirements & Specifications</span><span className="sm:hidden">Requirements</span>
                      </h4>
                      <p className="text-[10px] sm:text-xs lg:text-sm text-slate-700 leading-relaxed whitespace-pre-line">{quote.description}</p>
                      {quote.specifications && (
                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-200">
                          <p className="text-[10px] sm:text-xs font-bold text-slate-600 mb-1 sm:mb-2">Specifications:</p>
                          <p className="text-[10px] sm:text-xs lg:text-sm text-slate-700">{quote.specifications}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Details */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border-2 border-slate-200">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <i className="fas fa-flag text-violet-600 text-[10px] sm:text-xs"></i>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-600">Urgency</p>
                      </div>
                      <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-900">{quote.urgency || 'Medium'}</p>
                    </div>

                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border-2 border-slate-200">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <i className="fas fa-shipping-fast text-cyan-600 text-[10px] sm:text-xs"></i>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-600"><span className="hidden sm:inline">Delivery Location</span><span className="sm:hidden">Location</span></p>
                      </div>
                      <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-900 truncate">
                        {quote.deliveryLocation?.city ? `${quote.deliveryLocation.city}, ` : ''}
                        {quote.deliveryLocation?.country || 'Not specified'}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border-2 border-slate-200">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <i className="fas fa-paperclip text-amber-600 text-[10px] sm:text-xs"></i>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-600">Attachments</p>
                      </div>
                      {quote.attachments?.length > 0 ? (
                        <button
                          onClick={() => handleViewDetails(quote)}
                          className="text-[10px] sm:text-xs lg:text-sm font-bold text-indigo-600 hover:text-indigo-700 underline"
                        >
                          {quote.attachments.length} files
                        </button>
                      ) : (
                        <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-900">0 files</p>
                      )}
                    </div>

                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border-2 border-slate-200">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <i className="fas fa-clock text-red-600 text-[10px] sm:text-xs"></i>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-600"><span className="hidden sm:inline">Time Remaining</span><span className="sm:hidden">Time Left</span></p>
                      </div>
                      <p className={`text-[10px] sm:text-xs lg:text-sm font-bold ${timeRemaining?.color || 'text-slate-900'}`}>
                        {timeRemaining?.text || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 sm:pt-4 border-t border-slate-200 gap-2 sm:gap-4">
                    <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-4">
                      <button 
                        onClick={() => handleViewDetails(quote)}
                        className="text-[10px] sm:text-xs lg:text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 sm:gap-2"
                      >
                        <i className="fas fa-eye"></i> <span className="hidden sm:inline">View Full Details</span><span className="sm:hidden">View</span>
                      </button>
                      <button 
                        onClick={() => handleOpenContactModal(quote)}
                        className="text-[10px] sm:text-xs lg:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 sm:gap-2"
                      >
                        <i className="fas fa-comment"></i> <span className="hidden sm:inline">Contact Buyer</span><span className="sm:hidden">Contact</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => handleDelete(quote._id)}
                        className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-600 rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold transition-all flex items-center gap-1 sm:gap-2"
                      >
                        <i className="fas fa-archive"></i> Archive
                      </button>
                      {(quote.status === 'pending' || quote.status === 'in-review') && (
                        <button
                          onClick={() => {
                            setSelectedQuote(quote);
                            setShowResponseModal(true);
                          }}
                          className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold transition-all flex items-center gap-1 sm:gap-2 shadow-md"
                        >
                          <i className="fas fa-paper-plane"></i> <span className="hidden sm:inline">Send Quote</span><span className="sm:hidden">Quote</span>
                        </button>
                      )}
                      {/* Re-quote button for rejected quotes */}
                      {quote.status === 'rejected' && (
                        <button
                          onClick={() => handleSendQuote(quote)}
                          className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold transition-all flex items-center gap-1 sm:gap-2 shadow-md"
                        >
                          <i className="fas fa-redo"></i> <span className="hidden sm:inline">Send Revised Quote</span><span className="sm:hidden">Re-quote</span>
                        </button>
                      )}
                      {/* Waiting for user confirmation when quoted */}
                      {quote.status === 'quoted' && !quote.convertedToOrder && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 sm:px-3 py-1.5 sm:py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                            <i className="fas fa-clock"></i> <span className="hidden sm:inline">Waiting for user confirmation</span><span className="sm:hidden">Waiting...</span>
                          </span>
                          <button
                            onClick={() => handleAdminAccept(quote)}
                            className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold transition-all flex items-center gap-1 sm:gap-2 shadow-md"
                            title="Accept quote on behalf of customer"
                          >
                            <i className="fas fa-check-double"></i> <span className="hidden lg:inline">Accept Directly</span><span className="lg:hidden">Accept</span>
                          </button>
                        </div>
                      )}
                      {/* Accept button for negotiating status */}
                      {quote.status === 'negotiating' && !quote.convertedToOrder && (
                        <button
                          onClick={() => handleAdminAccept(quote)}
                          className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold transition-all flex items-center gap-1 sm:gap-2 shadow-md"
                        >
                          <i className="fas fa-check-double"></i> <span className="hidden sm:inline">Accept Quote</span><span className="sm:hidden">Accept</span>
                        </button>
                      )}
                      {/* Convert to Order - only when user accepts */}
                      {quote.status === 'accepted' && !quote.convertedToOrder && (
                        <button
                          onClick={() => handleOpenConvertModal(quote)}
                          className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold transition-all flex items-center gap-1 sm:gap-2 shadow-lg animate-pulse"
                        >
                          <i className="fas fa-shopping-cart"></i> <span className="hidden sm:inline">Convert to Order</span><span className="sm:hidden">Order</span>
                        </button>
                      )}
                      {quote.convertedToOrder && (
                        <span className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-emerald-100 text-emerald-700 rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold flex items-center gap-1 sm:gap-2">
                          <i className="fas fa-check-circle"></i> <span className="hidden sm:inline">Order Created</span><span className="sm:hidden">Done</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
            disabled={filters.page === 1}
            className="w-full sm:w-auto px-2 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold disabled:opacity-50 hover:border-violet-500 transition-all flex items-center justify-center gap-1 sm:gap-2"
          >
            <i className="fas fa-chevron-left"></i> <span className="hidden sm:inline">Previous</span><span className="sm:hidden">Prev</span>
          </button>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center bg-violet-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold">
              {pagination.page}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-600">
              of {pagination.pages}
            </span>
          </div>
          <button
            onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
            disabled={filters.page === pagination.pages}
            className="w-full sm:w-auto px-2 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold disabled:opacity-50 hover:border-violet-500 transition-all flex items-center justify-center gap-1 sm:gap-2"
          >
            <span className="hidden sm:inline">Next</span><span className="sm:hidden">Next</span> <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Send Quote Response Modal */}
      {showResponseModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide animate-fadeIn" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white flex items-center gap-2">
                    <i className="fas fa-paper-plane"></i>
                    <span className="hidden sm:inline">Send Quote Response</span>
                    <span className="sm:hidden">Quote Response</span>
                  </h2>
                  <p className="text-violet-100 text-xs sm:text-sm mt-1">
                    Quote #{selectedQuote.quoteId} • {selectedQuote.customerInfo?.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setSelectedQuote(null);
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl flex items-center justify-center transition-all"
                >
                  <i className="fas fa-times text-white text-sm sm:text-base"></i>
                </button>
              </div>
            </div>
            
            {/* Quote Summary Card */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-box text-violet-600 text-sm sm:text-base"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">{selectedQuote.productName}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-slate-600">
                      <span><i className="fas fa-cubes mr-1 text-violet-500"></i>{selectedQuote.quantity} units</span>
                      {selectedQuote.targetPrice && (
                        <span><i className="fas fa-tag mr-1 text-green-500"></i>Target: ${selectedQuote.targetPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
              {/* Pricing Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <h3 className="text-sm sm:text-base font-bold text-green-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-dollar-sign"></i> Pricing Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-green-700 mb-1 sm:mb-2">
                      Quoted Price per Unit ($) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">$</span>
                      <input
                        type="number"
                        value={responseData.quotedPrice}
                        onChange={(e) => setResponseData({ ...responseData, quotedPrice: e.target.value })}
                        className="w-full pl-8 pr-4 py-2 sm:py-2.5 lg:py-3 border-2 border-green-200 rounded-xl text-xs sm:text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none bg-white"
                        placeholder="45.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-green-700 mb-1 sm:mb-2">
                      Minimum Order Quantity *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"><i className="fas fa-cubes text-xs"></i></span>
                      <input
                        type="number"
                        value={responseData.moq}
                        onChange={(e) => setResponseData({ ...responseData, moq: e.target.value })}
                        className="w-full pl-8 pr-4 py-2 sm:py-2.5 lg:py-3 border-2 border-green-200 rounded-xl text-xs sm:text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none bg-white"
                        placeholder="1000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Time & Validity Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm sm:text-base font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-clock"></i> Timeline
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-blue-700 mb-1 sm:mb-2">
                      Lead Time *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={responseData.leadTimeValue}
                        onChange={(e) => setResponseData({ ...responseData, leadTimeValue: e.target.value })}
                        className="w-24 sm:w-32 px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border-2 border-blue-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-white"
                        placeholder="30"
                      />
                      <select
                        value={responseData.leadTimeUnit}
                        onChange={(e) => setResponseData({ ...responseData, leadTimeUnit: e.target.value })}
                        className="flex-1 min-w-[80px] px-2 sm:px-4 py-2 sm:py-2.5 lg:py-3 border-2 border-blue-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-white"
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-blue-700 mb-1 sm:mb-2">
                      Quote Valid Until *
                    </label>
                    <input
                      type="date"
                      value={responseData.validUntil}
                      onChange={(e) => setResponseData({ ...responseData, validUntil: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border-2 border-blue-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Section */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                <h3 className="text-sm sm:text-base font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-file-contract"></i> Terms & Conditions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-amber-700 mb-1 sm:mb-2">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      value={responseData.paymentTerms}
                      onChange={(e) => setResponseData({ ...responseData, paymentTerms: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border-2 border-amber-200 rounded-xl text-xs sm:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white"
                      placeholder="e.g., 30% Advance, 70% L/C"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-amber-700 mb-1 sm:mb-2">
                      Shipping Terms
                    </label>
                    <input
                      type="text"
                      value={responseData.shippingTerms}
                      onChange={(e) => setResponseData({ ...responseData, shippingTerms: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border-2 border-amber-200 rounded-xl text-xs sm:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white"
                      placeholder="e.g., FOB China"
                    />
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-sticky-note"></i> Additional Notes
                </h3>
                <textarea
                  value={responseData.notes}
                  onChange={(e) => setResponseData({ ...responseData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:outline-none resize-none bg-white"
                  placeholder="Any additional information for the buyer..."
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 rounded-b-xl sm:rounded-b-2xl">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedQuote(null);
                }}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all"
              >
                <i className="fas fa-times mr-2"></i>Cancel
              </button>
              <button
                onClick={handleSendResponse}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <i className="fas fa-paper-plane"></i>
                <span className="hidden sm:inline">Send Quote Response</span>
                <span className="sm:hidden">Send Quote</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Order Modal */}
      {showConvertModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Convert Quote to Order</h3>
                  <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                    Quote #{selectedQuote.quoteNumber} • {selectedQuote.buyer?.firstName} {selectedQuote.buyer?.lastName}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowConvertModal(false);
                    setSelectedQuote(null);
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl flex items-center justify-center transition-all"
                >
                  <i className="fas fa-times text-white text-sm sm:text-base"></i>
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-h-[calc(95vh-180px)] overflow-y-auto">
              {/* Product Information */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-box text-emerald-500"></i> Product Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={convertData.productName}
                      onChange={(e) => setConvertData({ ...convertData, productName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="Product name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={convertData.quantity}
                      onChange={(e) => setConvertData({ ...convertData, quantity: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="Qty"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Unit Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={convertData.unitPrice}
                      onChange={(e) => setConvertData({ ...convertData, unitPrice: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      SKU (Optional)
                    </label>
                    <input
                      type="text"
                      value={convertData.sku}
                      onChange={(e) => setConvertData({ ...convertData, sku: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="SKU"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Subtotal
                    </label>
                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-100 rounded-xl text-xs sm:text-sm font-bold text-slate-700">
                      ${((parseFloat(convertData.quantity) || 0) * (parseFloat(convertData.unitPrice) || 0)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-shipping-fast text-blue-500"></i> Shipping Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={convertData.shippingFullName}
                      onChange={(e) => setConvertData({ ...convertData, shippingFullName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="Recipient name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={convertData.shippingCompany}
                      onChange={(e) => setConvertData({ ...convertData, shippingCompany: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="Company name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={convertData.shippingPhone}
                      onChange={(e) => setConvertData({ ...convertData, shippingPhone: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={convertData.shippingEmail}
                      onChange={(e) => setConvertData({ ...convertData, shippingEmail: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="Email address"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={convertData.shippingStreet}
                    onChange={(e) => setConvertData({ ...convertData, shippingStreet: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={convertData.shippingCity}
                      onChange={(e) => setConvertData({ ...convertData, shippingCity: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={convertData.shippingState}
                      onChange={(e) => setConvertData({ ...convertData, shippingState: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={convertData.shippingZipCode}
                      onChange={(e) => setConvertData({ ...convertData, shippingZipCode: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="ZIP"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={convertData.shippingCountry}
                      onChange={(e) => setConvertData({ ...convertData, shippingCountry: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-calculator text-violet-500"></i> Pricing Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Shipping Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={convertData.shippingPrice}
                      onChange={(e) => setConvertData({ ...convertData, shippingPrice: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Tax ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={convertData.taxPrice}
                      onChange={(e) => setConvertData({ ...convertData, taxPrice: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Discount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={convertData.discount}
                      onChange={(e) => setConvertData({ ...convertData, discount: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Total Amount
                    </label>
                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-100 rounded-xl text-xs sm:text-sm font-bold text-emerald-700">
                      ${calculateTotal()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-credit-card text-orange-500"></i> Payment Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Payment Status
                    </label>
                    <select
                      value={convertData.paymentStatus}
                      onChange={(e) => setConvertData({ ...convertData, paymentStatus: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Payment Terms <span className="text-emerald-500 text-xs">(auto-calculates advance)</span>
                    </label>
                    <select
                      value={convertData.paymentTerms}
                      onChange={(e) => handlePaymentTermsChange(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Select Payment Terms</option>
                      <option value="100% Advance">100% Advance (Full Payment Upfront)</option>
                      <option value="70% Advance, 30% on Delivery">70% Advance, 30% on Delivery</option>
                      <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
                      <option value="40% Advance, 60% on Delivery">40% Advance, 60% on Delivery</option>
                      <option value="30% Advance, 70% on Delivery">30% Advance, 70% on Delivery</option>
                      <option value="25% Advance, 75% on Delivery">25% Advance, 75% on Delivery</option>
                      <option value="20% Advance, 80% on Delivery">20% Advance, 80% on Delivery</option>
                      <option value="LC (Letter of Credit)">LC (Letter of Credit)</option>
                      <option value="Net 30">Net 30 (Pay within 30 days)</option>
                      <option value="Net 60">Net 60 (Pay within 60 days)</option>
                      <option value="COD">Cash on Delivery</option>
                      <option value="Custom">Custom Terms</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Advance Payment ($) <span className="text-orange-500 text-xs">*Required for User</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={convertData.advancePayment}
                      onChange={(e) => setConvertData({ ...convertData, advancePayment: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-orange-200 rounded-xl text-xs sm:text-sm focus:border-orange-500 focus:outline-none bg-orange-50"
                      placeholder="Auto-calculated from terms"
                    />
                    <p className="text-xs text-slate-500 mt-1">User must pay this amount to confirm order</p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-info-circle text-cyan-500"></i> Additional Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                      Expected Delivery Date
                    </label>
                    <input
                      type="date"
                      value={convertData.expectedDeliveryDate}
                      onChange={(e) => setConvertData({ ...convertData, expectedDeliveryDate: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                    Order Notes
                  </label>
                  <textarea
                    value={convertData.orderNotes}
                    onChange={(e) => setConvertData({ ...convertData, orderNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-none resize-none"
                    placeholder="Any special instructions or notes for this order..."
                  />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs sm:text-sm text-slate-600">
                <span className="font-bold text-emerald-600">Total: ${calculateTotal()}</span>
                {convertData.advancePayment > 0 && (
                  <span className="ml-2 text-orange-600">
                    (Advance: ${parseFloat(convertData.advancePayment).toFixed(2)})
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setShowConvertModal(false);
                    setSelectedQuote(null);
                  }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvertToOrder}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-check-circle"></i>
                  <span>Create Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Full Details Modal */}
      {showDetailsModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Quote Details</h3>
                  <p className="text-violet-200 text-xs sm:text-sm mt-1">{selectedQuote.quoteId}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedQuote(null);
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                >
                  <i className="fas fa-times text-sm sm:text-base"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-180px)] space-y-4 sm:space-y-6">
              {/* Status and Priority */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                  selectedQuote.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  selectedQuote.status === 'in-review' ? 'bg-blue-100 text-blue-700' :
                  selectedQuote.status === 'quoted' ? 'bg-violet-100 text-violet-700' :
                  selectedQuote.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                  selectedQuote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  <i className={`fas ${
                    selectedQuote.status === 'pending' ? 'fa-clock' :
                    selectedQuote.status === 'in-review' ? 'fa-search' :
                    selectedQuote.status === 'quoted' ? 'fa-tag' :
                    selectedQuote.status === 'accepted' ? 'fa-check' :
                    selectedQuote.status === 'rejected' ? 'fa-times' :
                    'fa-circle'
                  } mr-1`}></i>
                  {selectedQuote.status?.charAt(0).toUpperCase() + selectedQuote.status?.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                  selectedQuote.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  selectedQuote.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  selectedQuote.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  <i className="fas fa-flag mr-1"></i>
                  {selectedQuote.priority?.charAt(0).toUpperCase() + selectedQuote.priority?.slice(1)} Priority
                </span>
                {selectedQuote.convertedToOrder && (
                  <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-700">
                    <i className="fas fa-shopping-cart mr-1"></i>
                    Converted to Order
                  </span>
                )}
              </div>

              {/* Customer Information */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-user-circle text-blue-500"></i> Customer Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Name</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.customerInfo?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Email</p>
                    <p className="text-sm font-semibold text-slate-800 break-all">{selectedQuote.customerInfo?.email || 'N/A'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Phone</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.customerInfo?.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Company</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.customerInfo?.company || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
                <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-box text-violet-500"></i> Product Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Product Name</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.productName || 'N/A'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Category</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.category || 'N/A'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Quantity</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.quantity} {selectedQuote.unit}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Budget Range</p>
                    <p className="text-sm font-semibold text-emerald-600">
                      {selectedQuote.budget?.min && selectedQuote.budget?.max 
                        ? `${selectedQuote.budget.currency || '$'}${selectedQuote.budget.min} - ${selectedQuote.budget.currency || '$'}${selectedQuote.budget.max}`
                        : 'Not specified'}
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Target Price</p>
                    <p className="text-sm font-semibold text-emerald-600">
                      {selectedQuote.targetPrice ? `$${selectedQuote.targetPrice}` : 'Not specified'}
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Specifications</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.specifications || 'None'}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-shipping-fast text-emerald-500"></i> Delivery Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Country</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.deliveryLocation?.country || 'N/A'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">City</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.deliveryLocation?.city || 'N/A'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">State/Province</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.deliveryLocation?.state || 'N/A'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Expected Delivery</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedQuote.expectedDeliveryDate ? formatDate(selectedQuote.expectedDeliveryDate) : 'Not specified'}
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Shipping Terms</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.shippingTerms || 'Not specified'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Incoterms</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.incoterms || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <i className="fas fa-info-circle text-amber-500"></i> Additional Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Payment Terms</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.paymentTerms || 'Not specified'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Certifications Required</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedQuote.certifications?.length > 0 ? selectedQuote.certifications.join(', ') : 'None'}
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Sample Required</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedQuote.sampleRequired ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Created At</p>
                    <p className="text-sm font-semibold text-slate-800">{formatDate(selectedQuote.createdAt)}</p>
                  </div>
                </div>
                {selectedQuote.description && (
                  <div className="bg-white/60 rounded-lg p-3 mt-3">
                    <p className="text-xs text-slate-500 mb-1">Description / Requirements</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedQuote.description}</p>
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              {selectedQuote.attachments && selectedQuote.attachments.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                  <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-paperclip text-indigo-500"></i> Attachments ({selectedQuote.attachments.length} files)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedQuote.attachments.map((attachment, index) => {
                      const isImage = attachment.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                      const isPDF = attachment.url?.match(/\.pdf$/i);
                      const isDoc = attachment.url?.match(/\.(doc|docx)$/i);
                      const isExcel = attachment.url?.match(/\.(xls|xlsx)$/i);
                      
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setPreviewAttachment(attachment);
                            setShowAttachmentPreview(true);
                          }}
                          className="bg-white/80 rounded-lg p-3 border border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all group text-left w-full"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isImage ? 'bg-green-100' :
                              isPDF ? 'bg-red-100' :
                              isDoc ? 'bg-blue-100' :
                              isExcel ? 'bg-emerald-100' :
                              'bg-gray-100'
                            }`}>
                              <i className={`fas ${
                                isImage ? 'fa-image text-green-600' :
                                isPDF ? 'fa-file-pdf text-red-600' :
                                isDoc ? 'fa-file-word text-blue-600' :
                                isExcel ? 'fa-file-excel text-emerald-600' :
                                'fa-file text-gray-600'
                              } text-lg`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                {attachment.fileName || `File ${index + 1}`}
                              </p>
                              <p className="text-xs text-slate-500">Click to preview</p>
                            </div>
                            <i className="fas fa-eye text-slate-400 group-hover:text-indigo-500 transition-colors"></i>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Supplier Response (if exists) */}
              {selectedQuote.supplierResponse && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-reply text-green-500"></i> Quote Response
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Quoted Price</p>
                      <p className="text-sm font-bold text-emerald-600">${selectedQuote.supplierResponse.quotedPrice}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">MOQ</p>
                      <p className="text-sm font-semibold text-slate-800">{selectedQuote.supplierResponse.moq || 'N/A'}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Lead Time</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedQuote.supplierResponse.leadTime?.value 
                          ? `${selectedQuote.supplierResponse.leadTime.value} ${selectedQuote.supplierResponse.leadTime.unit || 'days'}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Payment Terms</p>
                      <p className="text-sm font-semibold text-slate-800">{selectedQuote.supplierResponse.paymentTerms || 'N/A'}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Valid Until</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedQuote.supplierResponse.validUntil ? formatDate(selectedQuote.supplierResponse.validUntil) : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Responded At</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedQuote.supplierResponse.respondedAt ? formatDate(selectedQuote.supplierResponse.respondedAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {selectedQuote.supplierResponse.notes && (
                    <div className="bg-white/60 rounded-lg p-3 mt-3">
                      <p className="text-xs text-slate-500 mb-1">Notes</p>
                      <p className="text-sm text-slate-700">{selectedQuote.supplierResponse.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Rejection Details (if rejected) */}
              {selectedQuote.status === 'rejected' && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border-2 border-red-200">
                  <h4 className="text-sm sm:text-base font-bold text-red-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-times-circle text-red-500"></i> Rejection Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white/80 rounded-lg p-3 border border-red-100">
                      <p className="text-xs text-slate-500 mb-1">Rejection Category</p>
                      <p className="text-sm font-bold text-red-700">
                        {selectedQuote.rejectionCategory === 'price_too_high' ? 'Price Too High' :
                         selectedQuote.rejectionCategory === 'delivery_time_long' ? 'Delivery Time Too Long' :
                         selectedQuote.rejectionCategory === 'found_better_offer' ? 'Found Better Offer' :
                         selectedQuote.rejectionCategory === 'quality_concerns' ? 'Quality Concerns' :
                         selectedQuote.rejectionCategory === 'terms_not_acceptable' ? 'Terms Not Acceptable' :
                         selectedQuote.rejectionCategory === 'budget_changed' ? 'Budget Changed' :
                         selectedQuote.rejectionCategory === 'project_cancelled' ? 'Project Cancelled' :
                         selectedQuote.rejectionCategory === 'other' ? 'Other Reason' :
                         selectedQuote.rejectionCategory || 'Not specified'}
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-3 border border-red-100">
                      <p className="text-xs text-slate-500 mb-1">Rejected At</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedQuote.rejectedAt ? formatDate(selectedQuote.rejectedAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {selectedQuote.rejectionReason && (
                    <div className="bg-white/80 rounded-lg p-3 mt-3 border border-red-100">
                      <p className="text-xs text-slate-500 mb-1">Buyer's Feedback</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap italic">"{selectedQuote.rejectionReason}"</p>
                    </div>
                  )}
                  
                  {/* Revision History (if exists) */}
                  {selectedQuote.quoteRevisions && selectedQuote.quoteRevisions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-red-200">
                      <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
                        <i className="fas fa-history"></i> Quote Revision History ({selectedQuote.quoteRevisions.length})
                      </p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedQuote.quoteRevisions.map((revision, index) => (
                          <div key={index} className="bg-white/60 rounded-lg p-2 text-xs border border-red-100">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-700">Revision #{revision.revision}</span>
                              <span className="text-slate-500">${revision.quotedPrice}</span>
                            </div>
                            {revision.rejectionReason && (
                              <p className="text-slate-500 mt-1 truncate">Reason: {revision.rejectionReason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Suggestion */}
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                      <i className="fas fa-lightbulb text-amber-500"></i> Suggested Action
                    </p>
                    <p className="text-xs text-amber-700">
                      {selectedQuote.rejectionCategory === 'price_too_high' 
                        ? 'Consider offering a lower price or volume discount to win this deal.'
                        : selectedQuote.rejectionCategory === 'delivery_time_long'
                        ? 'Check if faster shipping options are available for this order.'
                        : selectedQuote.rejectionCategory === 'found_better_offer'
                        ? 'Act quickly with a competitive revised offer to regain the buyer\'s interest.'
                        : selectedQuote.rejectionCategory === 'quality_concerns'
                        ? 'Provide quality certifications, samples, or customer testimonials.'
                        : selectedQuote.rejectionCategory === 'terms_not_acceptable'
                        ? 'Review and offer more flexible payment or contract terms.'
                        : 'Contact the buyer to understand their specific needs and provide a revised quote.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleOpenContactModal(selectedQuote)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
                >
                  <i className="fas fa-envelope"></i> Contact Buyer
                </button>
                <button
                  onClick={() => handleCallBuyer(selectedQuote.customerInfo?.phone)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
                >
                  <i className="fas fa-phone"></i> Call Buyer
                </button>
                {/* Send Revised Quote button for rejected quotes */}
                {selectedQuote.status === 'rejected' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleSendQuote(selectedQuote);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <i className="fas fa-redo"></i> Send Revised Quote
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedQuote(null);
                }}
                className="w-full sm:w-auto px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Buyer Modal */}
      {showContactModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">Contact Buyer</h3>
                  <p className="text-blue-200 text-xs sm:text-sm mt-1">{selectedQuote.customerInfo?.name || 'Customer'}</p>
                </div>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setSelectedQuote(null);
                    setContactData({ subject: '', message: '', responseDeadlineDays: 3 });
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                >
                  <i className="fas fa-times text-sm sm:text-base"></i>
                </button>
              </div>
            </div>

            {/* Contact Options */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3">
                <a
                  href={`tel:${selectedQuote.customerInfo?.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all"
                  onClick={(e) => {
                    if (!selectedQuote.customerInfo?.phone) {
                      e.preventDefault();
                      toast.error('No phone number available');
                    }
                  }}
                >
                  <i className="fas fa-phone"></i>
                  <span>Call: {selectedQuote.customerInfo?.phone || 'N/A'}</span>
                </a>
              </div>
              <div className="text-center text-slate-500 text-xs sm:text-sm mt-3 font-medium">
                — OR Send Email —
              </div>
            </div>

            {/* Email Form */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(95vh-350px)]">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                  <i className="fas fa-envelope text-blue-500 mr-1"></i> Email To
                </label>
                <input
                  type="text"
                  value={selectedQuote.customerInfo?.email || 'No email available'}
                  disabled
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-100 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                  <i className="fas fa-heading text-blue-500 mr-1"></i> Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactData.subject}
                  onChange={(e) => setContactData({ ...contactData, subject: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                  <i className="fas fa-comment-alt text-blue-500 mr-1"></i> Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={contactData.message}
                  onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                  rows={6}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Enter your message to the buyer..."
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                  <i className="fas fa-clock text-amber-500 mr-1"></i> Response Deadline (Days)
                </label>
                <select
                  value={contactData.responseDeadlineDays}
                  onChange={(e) => setContactData({ ...contactData, responseDeadlineDays: parseInt(e.target.value) })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value={1}>1 Day</option>
                  <option value={2}>2 Days</option>
                  <option value={3}>3 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days</option>
                </select>
              </div>

              {/* Warning Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-2">
                  <i className="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-amber-700">Deadline Notice Included</p>
                    <p className="text-xs text-amber-600 mt-1">
                      The email will include a warning that if no response is received within {contactData.responseDeadlineDays} day(s), 
                      the quote/order may be cancelled.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedQuote(null);
                  setContactData({ subject: '', message: '', responseDeadlineDays: 3 });
                }}
                disabled={contactLoading}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendContactEmail}
                disabled={contactLoading || !selectedQuote.customerInfo?.email}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {contactLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {showAttachmentPreview && previewAttachment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <i className="fas fa-file text-lg"></i>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold truncate">{previewAttachment.fileName || 'Attachment'}</h3>
                  <p className="text-indigo-200 text-xs">File Preview</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewAttachment.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                  title="Download"
                >
                  <i className="fas fa-download text-sm"></i>
                </a>
                <a
                  href={previewAttachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                  title="Open in new tab"
                >
                  <i className="fas fa-external-link-alt text-sm"></i>
                </a>
                <button
                  onClick={() => {
                    setShowAttachmentPreview(false);
                    setPreviewAttachment(null);
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 bg-slate-100 flex items-center justify-center" style={{ height: 'calc(95vh - 120px)' }}>
              {previewAttachment.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                // Image Preview
                <img
                  src={previewAttachment.url}
                  alt={previewAttachment.fileName || 'Attachment'}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              ) : previewAttachment.url?.match(/\.pdf$/i) ? (
                // PDF Preview
                <iframe
                  src={previewAttachment.url}
                  title={previewAttachment.fileName || 'PDF Preview'}
                  className="w-full h-full rounded-lg shadow-lg bg-white"
                />
              ) : (
                // Other files - show download prompt
                <div className="text-center bg-white rounded-2xl p-8 sm:p-12 shadow-lg max-w-md">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <i className={`fas ${
                      previewAttachment.url?.match(/\.(doc|docx)$/i) ? 'fa-file-word text-blue-600' :
                      previewAttachment.url?.match(/\.(xls|xlsx)$/i) ? 'fa-file-excel text-emerald-600' :
                      'fa-file text-gray-600'
                    } text-3xl sm:text-4xl`}></i>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
                    {previewAttachment.fileName || 'File'}
                  </h4>
                  <p className="text-slate-500 text-sm mb-6">
                    This file type cannot be previewed directly. Please download to view.
                  </p>
                  <a
                    href={previewAttachment.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
                  >
                    <i className="fas fa-download"></i>
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create RFQ Modal */}
      {showCreateRFQModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <i className="fas fa-file-invoice text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Create New RFQ</h3>
                  <p className="text-violet-200 text-xs">Create quote request on behalf of customer</p>
                </div>
              </div>
              <button
                onClick={() => { setShowCreateRFQModal(false); setSelectedProductId(''); }}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateRFQ} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-user text-violet-500"></i>
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Name *</label>
                      <input
                        type="text"
                        value={createRFQData.customerName}
                        onChange={(e) => setCreateRFQData({...createRFQData, customerName: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                        placeholder="Enter customer name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Email *</label>
                      <input
                        type="email"
                        value={createRFQData.customerEmail}
                        onChange={(e) => setCreateRFQData({...createRFQData, customerEmail: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                        placeholder="customer@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={createRFQData.customerPhone}
                        onChange={(e) => setCreateRFQData({...createRFQData, customerPhone: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Company</label>
                      <input
                        type="text"
                        value={createRFQData.customerCompany}
                        onChange={(e) => setCreateRFQData({...createRFQData, customerCompany: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                        placeholder="Company name"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-box text-violet-500"></i>
                    Product Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Product Selection */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Select Product *</label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => handleProductSelect(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                      >
                        <option value="">-- Select existing product --</option>
                        <option value="custom">✏️ Enter custom product</option>
                        {productsList.map(product => (
                          <option key={product._id} value={product._id}>
                            {product.name} {product.sku ? `(${product.sku})` : ''} - {product.category?.name || product.category || 'No category'}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Product Name - Editable or auto-filled */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name *</label>
                      <input
                        type="text"
                        value={createRFQData.productName}
                        onChange={(e) => setCreateRFQData({...createRFQData, productName: e.target.value})}
                        className={`w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all ${selectedProductId && selectedProductId !== 'custom' ? 'bg-slate-50' : ''}`}
                        placeholder="Enter product name"
                        readOnly={selectedProductId && selectedProductId !== 'custom'}
                        required
                      />
                    </div>
                    
                    {/* Category - Dropdown with existing categories */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
                      <select
                        value={createRFQData.category}
                        onChange={(e) => setCreateRFQData({...createRFQData, category: e.target.value})}
                        className={`w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all ${selectedProductId && selectedProductId !== 'custom' ? 'bg-slate-50' : ''}`}
                        disabled={selectedProductId && selectedProductId !== 'custom'}
                        required
                      >
                        <option value="">Select category</option>
                        {categoriesList.map(cat => (
                          <option key={cat._id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                        {/* Fallback options if no categories loaded */}
                        {categoriesList.length === 0 && (
                          <>
                            <option value="Electronics">Electronics</option>
                            <option value="Machinery">Machinery</option>
                            <option value="Textiles">Textiles</option>
                            <option value="Chemicals">Chemicals</option>
                            <option value="Food & Beverages">Food & Beverages</option>
                            <option value="Agriculture">Agriculture</option>
                            <option value="Automotive">Automotive</option>
                            <option value="Construction">Construction</option>
                            <option value="Raw Materials">Raw Materials</option>
                            <option value="Other">Other</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity *</label>
                      <input
                        type="number"
                        value={createRFQData.quantity}
                        onChange={(e) => setCreateRFQData({...createRFQData, quantity: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                        placeholder="Enter quantity"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Unit</label>
                      <select
                        value={createRFQData.unit}
                        onChange={(e) => setCreateRFQData({...createRFQData, unit: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                      >
                        <option value="pieces">Pieces</option>
                        <option value="kg">Kilograms (kg)</option>
                        <option value="tons">Tons</option>
                        <option value="liters">Liters</option>
                        <option value="meters">Meters</option>
                        <option value="units">Units</option>
                        <option value="boxes">Boxes</option>
                        <option value="pallets">Pallets</option>
                        <option value="containers">Containers</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
                      <textarea
                        value={createRFQData.description}
                        onChange={(e) => setCreateRFQData({...createRFQData, description: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all resize-none"
                        rows="3"
                        placeholder="Describe the product requirements..."
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Specifications</label>
                      <textarea
                        value={createRFQData.specifications}
                        onChange={(e) => setCreateRFQData({...createRFQData, specifications: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all resize-none"
                        rows="2"
                        placeholder="Technical specifications, dimensions, materials, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Budget */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-dollar-sign text-violet-500"></i>
                    Pricing & Budget
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Target Price (per unit)</label>
                      <input
                        type="number"
                        value={createRFQData.targetPrice}
                        onChange={(e) => setCreateRFQData({...createRFQData, targetPrice: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Budget Min</label>
                      <input
                        type="number"
                        value={createRFQData.budgetMin}
                        onChange={(e) => setCreateRFQData({...createRFQData, budgetMin: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                        placeholder="Min budget"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Budget Max</label>
                      <input
                        type="number"
                        value={createRFQData.budgetMax}
                        onChange={(e) => setCreateRFQData({...createRFQData, budgetMax: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                        placeholder="Max budget"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-truck text-violet-500"></i>
                    Delivery Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                      <input
                        type="text"
                        value={createRFQData.deliveryCity}
                        onChange={(e) => setCreateRFQData({...createRFQData, deliveryCity: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                        placeholder="Delivery city"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">State/Province</label>
                      <input
                        type="text"
                        value={createRFQData.deliveryState}
                        onChange={(e) => setCreateRFQData({...createRFQData, deliveryState: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                        placeholder="State or province"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Country *</label>
                      <input
                        type="text"
                        value={createRFQData.deliveryCountry}
                        onChange={(e) => setCreateRFQData({...createRFQData, deliveryCountry: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                        placeholder="Delivery country"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Expected Delivery Date</label>
                      <input
                        type="date"
                        value={createRFQData.expectedDeliveryDate}
                        onChange={(e) => setCreateRFQData({...createRFQData, expectedDeliveryDate: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
                      <select
                        value={createRFQData.urgency}
                        onChange={(e) => setCreateRFQData({...createRFQData, urgency: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none transition-all"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer mt-5">
                        <input
                          type="checkbox"
                          checked={createRFQData.sendEmail}
                          onChange={(e) => setCreateRFQData({...createRFQData, sendEmail: e.target.checked})}
                          className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                        />
                        <span className="text-sm text-slate-700">Send email notification</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setShowCreateRFQModal(false); setSelectedProductId(''); }}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRFQLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {createRFQLoading ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin"></i>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus"></i>
                      Create RFQ
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Accept Quote Confirmation Modal */}
      {showAcceptModal && quoteToAccept && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scaleIn">
            {/* Header */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check-double text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Accept Quote</h3>
              <p className="text-gray-600">
                Are you sure you want to accept this quote on behalf of the customer?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This will mark the quote as "Accepted" and you can then convert it to an order.
              </p>
              {quoteToAccept.supplierResponse?.quotedPrice && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
                  <p className="text-sm text-emerald-700 font-semibold">
                    Final Price: ${quoteToAccept.supplierResponse.quotedPrice.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={handleCloseAcceptModal}
                disabled={acceptingQuote}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                disabled={acceptingQuote}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {acceptingQuote ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    Accepting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-double"></i>
                    Yes, Accept Quote
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuotes;
