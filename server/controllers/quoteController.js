const asyncHandler = require('express-async-handler');
const Quote = require('../models/Quote');
const Product = require('../models/Product');
const { ErrorResponse } = require('../middleware/error');
const { createQuoteNotification, notifyAllAdmins } = require('../utils/notificationHelper');

// @desc    Get all quotes
// @route   GET /api/quotes
// @access  Private
exports.getQuotes = asyncHandler(async (req, res, next) => {
  let query = Quote.find(req.queryFilter || {})
    .populate('buyer', 'name email company')
    .populate('product', 'name images sku')
    .populate('supplier', 'companyName email');

  // If buyer, show only their quotes
  if (req.user.role === 'buyer') {
    query = query.find({ buyer: req.user.id });
  }

  // If supplier, show quotes for their products
  if (req.user.role === 'supplier') {
    query = query.find({ supplier: req.user.id });
  }

  // Apply sorting
  if (req.sortBy) {
    query = query.sort(req.sortBy);
  }

  // Apply pagination
  query = query.skip(req.startIndex).limit(req.limit);

  const quotes = await query;

  res.status(200).json({
    success: true,
    count: quotes.length,
    pagination: req.pagination,
    data: quotes
  });
});

// @desc    Get single quote
// @route   GET /api/quotes/:id
// @access  Private
exports.getQuote = asyncHandler(async (req, res, next) => {
  const quote = await Quote.findById(req.params.id)
    .populate('buyer', 'name email phone company')
    .populate('product', 'name images sku price moq')
    .populate('supplier', 'companyName email phone');

  if (!quote) {
    return next(new ErrorResponse(`Quote not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  if (quote.buyer.toString() !== req.user.id && 
      quote.supplier.toString() !== req.user.id && 
      req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view this quote', 401));
  }

  res.status(200).json({
    success: true,
    data: quote
  });
});

// @desc    Create quote request
// @route   POST /api/quotes
// @access  Private/Buyer
exports.createQuote = asyncHandler(async (req, res, next) => {

  req.body.customer = req.user.id;

  // Handle product type - catalog selection vs custom product
  const isCustomProduct = req.body.isCustomProduct !== false; // Default to true if not specified
  req.body.isCustomProduct = isCustomProduct;

  // If product ID is provided (catalog product selected), get product details
  if (req.body.product && !isCustomProduct) {
    
    const product = await Product.findById(req.body.product).populate('supplier').populate('category');
    if (!product) {
      
      return next(new ErrorResponse(`Product not found with id of ${req.body.product}`, 404));
    }

    // Store selected product details
    req.body.selectedProduct = {
      productId: product._id,
      name: product.name,
      sku: product.sku || '',
      image: product.images?.[0] || '',
      price: product.price,
      category: product.category?.name || ''
    };
    
    // Only set supplier if product has one assigned
    if (product.supplier && product.supplier._id) {
      req.body.supplier = product.supplier._id;
    }
    // Store the product's original price at time of quote creation
    req.body.productPrice = product.price || 0;
    
    // Auto-fill product name and category if not provided
    if (!req.body.productName) {
      req.body.productName = product.name;
    }
    if (!req.body.category) {
      req.body.category = product.category?.name || 'General';
    }
  } else if (req.body.product) {
    // Product ID provided but marked as custom - still link the product
    
    const product = await Product.findById(req.body.product).populate('supplier');
    if (product) {
      req.body.productPrice = product.price || 0;
      if (product.supplier && product.supplier._id) {
        req.body.supplier = product.supplier._id;
      }
    }
  }

  // Add customer info from user
  req.body.customerInfo = {
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone || '',
    company: req.user.company || ''
  };

  try {
    const quote = await Quote.create(req.body);

    // Create notification for the user
    try {
      await createQuoteNotification(req.user.id, {
        quoteId: quote._id,
        quoteNumber: quote.quoteId,
        status: 'submitted',
        productName: req.body.productName
      });
      // Notify admins
      await notifyAllAdmins({
        type: 'quote',
        title: 'New Quote Request',
        message: `New quote request from ${req.user.name} for ${req.body.productName || 'products'}.`,
        icon: 'file-text',
        color: 'purple',
        link: '/admin/quotes',
        priority: 'high',
        metadata: { quoteId: quote._id, customerName: req.user.name }
      });
    } catch (notifError) {
      
    }

    res.status(201).json({
      success: true,
      data: quote
    });
  } catch (error) {

    throw error;
  }
});

// @desc    Update quote (supplier response)
// @route   PUT /api/quotes/:id
// @access  Private/Supplier/Admin
exports.updateQuote = asyncHandler(async (req, res, next) => {
  let quote = await Quote.findById(req.params.id);

  if (!quote) {
    return next(new ErrorResponse(`Quote not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  if (quote.supplier.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this quote', 401));
  }

  quote = await Quote.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: quote
  });
});

// @desc    Respond to quote request
// @route   PUT /api/quotes/:id/respond
// @access  Private/Supplier
exports.respondToQuote = asyncHandler(async (req, res, next) => {
  const quote = await Quote.findById(req.params.id);

  if (!quote) {
    return next(new ErrorResponse(`Quote not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  if (quote.supplier.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to respond to this quote', 401));
  }

  quote.status = 'responded';
  quote.response = {
    message: req.body.message,
    price: req.body.price,
    minQuantity: req.body.minQuantity,
    leadTime: req.body.leadTime,
    validUntil: req.body.validUntil,
    terms: req.body.terms
  };
  quote.respondedAt = Date.now();

  await quote.save();

  // Notify buyer about quote response
  try {
    if (quote.buyer || quote.customer) {
      await createQuoteNotification((quote.buyer || quote.customer).toString(), {
        quoteId: quote._id,
        quoteNumber: quote.quoteId,
        status: 'received',
        productName: quote.productName
      });
    }
  } catch (notifError) {
    
  }

  res.status(200).json({
    success: true,
    data: quote
  });
});

// @desc    Accept quote
// @route   PUT /api/quotes/:id/accept
// @access  Private/Buyer
exports.acceptQuote = asyncHandler(async (req, res, next) => {
  const { sendQuoteAcceptedEmail } = require('../config/email');
  
  const quote = await Quote.findById(req.params.id)
    .populate('customer', 'firstName lastName email phone company')
    .populate('supplier', 'companyName email phone');

  if (!quote) {
    return next(new ErrorResponse(`Quote not found with id of ${req.params.id}`, 404));
  }

  // Check authorization - customer who created the quote
  if (quote.customer._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to accept this quote', 401));
  }

  if (quote.status !== 'quoted' && quote.status !== 'negotiating') {
    return next(new ErrorResponse('Quote cannot be accepted in its current state', 400));
  }

  quote.status = 'accepted';
  quote.acceptedAt = new Date();
  await quote.save();

  // Create in-app notification for the buyer confirming their quote acceptance
  try {
    await createQuoteNotification(req.user.id, {
      quoteId: quote._id,
      quoteNumber: quote.quoteId,
      status: 'accepted',
      productName: quote.productName
    });
  } catch (notifError) {
    
  }

  // Notify admins about quote acceptance
  try {
    await notifyAllAdmins({
      type: 'quote',
      title: 'Quote Accepted',
      message: `Quote #${quote.quoteId} for ${quote.productName} has been accepted by ${quote.customer?.firstName || 'customer'}.`,
      icon: 'check-circle',
      color: 'green',
      link: '/admin/quotes',
      priority: 'high',
      metadata: { quoteId: quote._id }
    });
  } catch (notifError) {
    
  }

  // Send email notification to supplier/admin
  try {
    const deliveryLocation = quote.deliveryLocation ? 
      `${quote.deliveryLocation.city || ''}, ${quote.deliveryLocation.state || ''}, ${quote.deliveryLocation.country || ''}`.replace(/^, |, $/g, '') : 
      'Not specified';

    await sendQuoteAcceptedEmail({
      supplierName: quote.supplier?.companyName || 'Nexarion Team',
      supplierEmail: quote.supplier?.email || process.env.ADMIN_EMAIL || process.env.MAIL_USER,
      quoteId: quote.quoteId,
      productName: quote.productName,
      quantity: quote.quantity,
      unit: quote.unit,
      quotedPrice: quote.supplierResponse?.quotedPrice || quote.targetPrice,
      buyerName: `${quote.customer.firstName} ${quote.customer.lastName}`,
      buyerCompany: quote.customer.company || quote.customerInfo?.company,
      buyerEmail: quote.customer.email || quote.customerInfo?.email,
      buyerPhone: quote.customer.phone || quote.customerInfo?.phone,
      deliveryLocation: deliveryLocation,
      acceptedAt: quote.acceptedAt
    });
  } catch (emailError) {
    
  }

  res.status(200).json({
    success: true,
    message: 'Quote accepted successfully',
    data: quote
  });
});

// @desc    Reject quote
// @route   PUT /api/quotes/:id/reject
// @access  Private/Buyer
exports.rejectQuote = asyncHandler(async (req, res, next) => {
  const { sendQuoteRejectedEmail, sendQuoteRejectionBuyerEmail, sendQuoteRejectionAdminEmail } = require('../config/email');
  const { reason, rejectionCategory } = req.body;
  
  const quote = await Quote.findById(req.params.id)
    .populate('customer', 'firstName lastName email phone company')
    .populate('supplier', 'companyName email');

  if (!quote) {
    return next(new ErrorResponse(`Quote not found with id of ${req.params.id}`, 404));
  }

  // Check authorization - customer who created the quote
  if (quote.customer._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to reject this quote', 401));
  }

  // Save current quote response to revisions before rejecting (for tracking)
  if (quote.supplierResponse && quote.supplierResponse.quotedPrice) {
    const revisionNumber = (quote.quoteRevisions?.length || 0) + 1;
    quote.quoteRevisions.push({
      revision: revisionNumber,
      quotedPrice: quote.supplierResponse.quotedPrice,
      moq: quote.supplierResponse.moq,
      leadTime: quote.supplierResponse.leadTime,
      validUntil: quote.supplierResponse.validUntil,
      notes: quote.supplierResponse.notes,
      respondedAt: quote.supplierResponse.respondedAt,
      rejectedAt: new Date(),
      rejectionCategory: rejectionCategory || 'other',
      rejectionReason: reason || ''
    });
  }

  quote.status = 'rejected';
  quote.rejectedAt = new Date();
  quote.rejectionReason = reason || '';
  quote.rejectionCategory = rejectionCategory || 'other';
  await quote.save();

  const buyerName = `${quote.customer.firstName} ${quote.customer.lastName}`;
  const buyerEmail = quote.customer.email || quote.customerInfo?.email;
  const buyerPhone = quote.customer.phone || quote.customerInfo?.phone;
  const buyerCompany = quote.customer.company || quote.customerInfo?.companyName;
  const adminEmail = quote.supplier?.email || process.env.ADMIN_EMAIL || process.env.MAIL_USER;
  const revisionNumber = quote.quoteRevisions?.length || 1;

  // Send email notification to supplier/admin (existing functionality)
  try {
    await sendQuoteRejectedEmail({
      supplierName: quote.supplier?.companyName || 'Nexarion Team',
      supplierEmail: adminEmail,
      quoteId: quote.quoteId,
      productName: quote.productName,
      quantity: quote.quantity,
      unit: quote.unit,
      quotedPrice: quote.supplierResponse?.quotedPrice || quote.targetPrice,
      buyerName: buyerName,
      rejectionReason: reason,
      rejectedAt: quote.rejectedAt
    });
  } catch (emailError) {
    
  }

  // Send rejection confirmation email to BUYER
  try {
    await sendQuoteRejectionBuyerEmail({
      buyerName: buyerName,
      buyerEmail: buyerEmail,
      quoteId: quote.quoteId,
      productName: quote.productName,
      category: quote.category,
      quantity: quote.quantity,
      unit: quote.unit,
      quotedPrice: quote.supplierResponse?.quotedPrice,
      rejectionCategory: rejectionCategory || 'other',
      rejectionReason: reason || '',
      rejectedAt: quote.rejectedAt,
      revisionNumber: revisionNumber
    });
  } catch (emailError) {
    
  }

  // Send rejection notification email to ADMIN
  try {
    await sendQuoteRejectionAdminEmail({
      adminEmail: adminEmail,
      quoteId: quote.quoteId,
      productName: quote.productName,
      category: quote.category,
      quantity: quote.quantity,
      unit: quote.unit,
      quotedPrice: quote.supplierResponse?.quotedPrice,
      buyerName: buyerName,
      buyerEmail: buyerEmail,
      buyerPhone: buyerPhone,
      buyerCompany: buyerCompany,
      rejectionCategory: rejectionCategory || 'other',
      rejectionReason: reason || '',
      rejectedAt: quote.rejectedAt,
      revisionNumber: revisionNumber
    });
  } catch (emailError) {
    
  }

  res.status(200).json({
    success: true,
    message: 'Quote rejected successfully. Notifications sent to both you and the admin.',
    data: quote
  });
});

// @desc    Get my quote requests
// @route   GET /api/quotes/my/requests
// @access  Private
exports.getMyQuotes = asyncHandler(async (req, res, next) => {
  const quotes = await Quote.find({ buyer: req.user.id })
    .populate('product', 'name images')
    .populate('supplier', 'companyName')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: quotes.length,
    data: quotes
  });
});

// @desc    Get quote statistics
// @route   GET /api/quotes/stats
// @access  Private/Admin
exports.getQuoteStats = asyncHandler(async (req, res, next) => {
  const totalQuotes = await Quote.countDocuments();
  const pendingQuotes = await Quote.countDocuments({ status: 'pending' });
  const respondedQuotes = await Quote.countDocuments({ status: 'responded' });
  const acceptedQuotes = await Quote.countDocuments({ status: 'accepted' });
  const rejectedQuotes = await Quote.countDocuments({ status: 'rejected' });

  res.status(200).json({
    success: true,
    data: {
      total: totalQuotes,
      pending: pendingQuotes,
      responded: respondedQuotes,
      accepted: acceptedQuotes,
      rejected: rejectedQuotes
    }
  });
});

// @desc    Upload quote attachment
// @route   POST /api/quotes/upload-attachment
// @access  Private
exports.uploadQuoteAttachment = asyncHandler(async (req, res, next) => {
  const cloudinary = require('../config/cloudinary');
  
  if (!req.files || !req.files.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // Validate file type (images and documents)
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return next(new ErrorResponse('Please upload an image, PDF, Word, or Excel file', 400));
  }

  // Check file size (10MB max)
  if (file.size > 10000000) {
    return next(new ErrorResponse('Please upload a file less than 10MB', 400));
  }

  // Determine resource type based on mimetype
  const isImage = file.mimetype.startsWith('image');
  const resourceType = isImage ? 'image' : 'raw';

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: 'import-export/quote-attachments',
    resource_type: resourceType
  });

  res.status(200).json({
    success: true,
    data: {
      fileName: file.name,
      public_id: result.public_id,
      url: result.secure_url
    }
  });
});
