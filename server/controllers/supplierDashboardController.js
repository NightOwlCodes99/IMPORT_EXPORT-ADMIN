const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Quote = require('../models/Quote');
const Supplier = require('../models/Supplier');
const { ErrorResponse } = require('../middleware/error');
const cloudinary = require('../config/cloudinary');

// Helper function to get or create supplier profile
const getOrCreateSupplier = async (user) => {
  let supplier = await Supplier.findOne({ user: user._id });
  
  if (!supplier) {
    
    supplier = await Supplier.create({
      user: user._id,
      companyName: user.company || user.name + "'s Business",
      businessType: 'Trading Company',
      country: user.country || 'Not specified',
      city: user.city || 'Not specified',
      address: user.address || 'Please update your business address',
      verificationStatus: 'pending'
    });
    
  }
  
  return supplier;
};

// @desc    Get supplier dashboard overview
// @route   GET /api/supplier/dashboard
// @access  Private/Supplier
exports.getSupplierDashboard = asyncHandler(async (req, res, next) => {

  // Get or create supplier profile
  const supplier = await getOrCreateSupplier(req.user);

  // Get product counts
  const [
    totalProducts,
    approvedProducts,
    pendingProducts,
    rejectedProducts,
    featuredProducts,
  ] = await Promise.all([
    Product.countDocuments({ supplier: supplier._id }),
    Product.countDocuments({ supplier: supplier._id, isApproved: 'approved' }),
    Product.countDocuments({ supplier: supplier._id, isApproved: 'pending' }),
    Product.countDocuments({ supplier: supplier._id, isApproved: 'rejected' }),
    Product.countDocuments({ supplier: supplier._id, isFeatured: true }),
  ]);

  // Get order stats (orders containing supplier's products)
  const orders = await Order.find({
    'orderItems.supplier': supplier._id
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
  const completedOrders = orders.filter(o => o.orderStatus === 'Delivered').length;

  // Calculate total revenue
  let totalRevenue = 0;
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      if (item.supplier?.toString() === supplier._id.toString()) {
        totalRevenue += (item.price || 0) * (item.quantity || 1);
      }
    });
  });

  // Get recent products
  const recentProducts = await Product.find({ supplier: supplier._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name images price isApproved createdAt views');

  // Get recent orders
  const recentOrders = await Order.find({
    'orderItems.supplier': supplier._id
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('buyer', 'name email')
    .select('orderNumber orderStatus pricing createdAt');

  // Get quotes for supplier
  const quotes = await Quote.find({ supplier: supplier._id });
  const pendingQuotes = quotes.filter(q => q.status === 'pending').length;

  // Get monthly stats (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyProducts = await Product.aggregate([
    {
      $match: {
        supplier: supplier._id,
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalProducts,
        approvedProducts,
        pendingProducts,
        rejectedProducts,
        featuredProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        pendingQuotes,
        verificationStatus: supplier.verificationStatus,
      },
      recentProducts,
      recentOrders,
      monthlyStats: monthlyProducts,
      supplier: {
        companyName: supplier.companyName,
        verificationStatus: supplier.verificationStatus,
        rating: supplier.rating,
        totalReviews: supplier.totalReviews,
      }
    }
  });
});

// @desc    Get supplier profile
// @route   GET /api/supplier/profile
// @access  Private/Supplier
exports.getSupplierProfile = asyncHandler(async (req, res, next) => {
  const supplier = await getOrCreateSupplier(req.user);
  await supplier.populate('user', 'name email phone');

  res.status(200).json({
    success: true,
    data: supplier
  });
});

// @desc    Update supplier profile
// @route   PUT /api/supplier/profile
// @access  Private/Supplier
exports.updateSupplierProfile = asyncHandler(async (req, res, next) => {
  const supplier = await getOrCreateSupplier(req.user);

  // Fields that can be updated
  const allowedFields = [
    'companyName', 'businessType', 'description', 'mainProducts',
    'productCategories', 'website', 'socialMedia', 'country', 'city',
    'address', 'yearsInBusiness', 'numberOfEmployees', 'annualRevenue'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      supplier[field] = req.body[field];
    }
  });

  await supplier.save();

  // Send profile update notification email
  try {
    const { sendSupplierProfileUpdatedEmail } = require('../config/email');
    await sendSupplierProfileUpdatedEmail(
      req.user.email,
      req.user.name,
      supplier,
      isFirstUpdate
    );
  } catch (emailError) {
    
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: supplier
  });
});

// @desc    Get supplier's products
// @route   GET /api/supplier/products
// @access  Private/Supplier
exports.getSupplierProducts = asyncHandler(async (req, res, next) => {

  // Get or create supplier profile
  const supplier = await getOrCreateSupplier(req.user);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Build filters
  const filters = { supplier: supplier._id };
  
  if (req.query.isApproved) {
    filters.isApproved = req.query.isApproved;
  }
  
  if (req.query.category) {
    filters.category = req.query.category;
  }
  
  if (req.query.search) {
    filters.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { sku: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Build sort
  let sortOption = { createdAt: -1 };
  if (req.query.sort) {
    const sortField = req.query.sort;
    if (sortField.startsWith('-')) {
      sortOption = { [sortField.substring(1)]: -1 };
    } else {
      sortOption = { [sortField]: 1 };
    }
  }

  const [products, total] = await Promise.all([
    Product.find(filters)
      .populate('category', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filters)
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: products
  });
});

// @desc    Get supplier product stats
// @route   GET /api/supplier/products/stats
// @access  Private/Supplier
exports.getSupplierProductStats = asyncHandler(async (req, res, next) => {
  const supplier = await getOrCreateSupplier(req.user);

  const [total, approved, pending, rejected, featured, active] = await Promise.all([
    Product.countDocuments({ supplier: supplier._id }),
    Product.countDocuments({ supplier: supplier._id, isApproved: 'approved' }),
    Product.countDocuments({ supplier: supplier._id, isApproved: 'pending' }),
    Product.countDocuments({ supplier: supplier._id, isApproved: 'rejected' }),
    Product.countDocuments({ supplier: supplier._id, isFeatured: true }),
    Product.countDocuments({ supplier: supplier._id, isActive: true }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      approved,
      pending,
      rejected,
      featured,
      active,
    }
  });
});

// @desc    Get supplier's single product
// @route   GET /api/supplier/products/:id
// @access  Private/Supplier
exports.getSupplierProductById = asyncHandler(async (req, res, next) => {
  const supplier = await getOrCreateSupplier(req.user);

  const product = await Product.findOne({
    _id: req.params.id,
    supplier: supplier._id
  }).populate('category', 'name');

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create supplier product
// @route   POST /api/supplier/products
// @access  Private/Supplier
exports.createSupplierProduct = asyncHandler(async (req, res, next) => {

  const supplier = await getOrCreateSupplier(req.user);

  // Check if supplier is verified (allow pending for now, admin will approve products)
  // if (supplier.verificationStatus !== 'verified') {
  //   return next(new ErrorResponse('Your supplier account must be verified to add products', 403));
  // }

  // Add supplier reference to product
  req.body.supplier = supplier._id;
  
  // Set initial approval status to pending
  req.body.isApproved = 'pending';
  req.body.isActive = false; // Will be activated when approved

  // Handle price - if it's an object with min/max, use min as the base price
  if (req.body.price && typeof req.body.price === 'object') {
    const priceObj = req.body.price;
    req.body.price = Number(priceObj.min) || Number(priceObj.max) || 0;
    req.body.currency = priceObj.currency || 'USD';
  }

  // Generate unique SKU - always prefix with supplier identifier
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  if (req.body.sku) {
    // If user provided SKU, prefix it to make it unique
    req.body.sku = `SUP-${req.body.sku}-${timestamp}`;
  } else {
    req.body.sku = `SUP-${timestamp}-${random}`;
  }

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Product submitted for admin approval',
    data: product
  });
});

// @desc    Update supplier product
// @route   PUT /api/supplier/products/:id
// @access  Private/Supplier
exports.updateSupplierProduct = asyncHandler(async (req, res, next) => {
  const supplier = await getOrCreateSupplier(req.user);

  let product = await Product.findOne({
    _id: req.params.id,
    supplier: supplier._id
  });

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Prevent updating certain fields
  delete req.body.supplier;
  delete req.body.isApproved; // Only admin can change approval status
  delete req.body.isFeatured; // Only admin can feature products

  // Handle price - if it's an object with min/max, use min as the base price
  if (req.body.price && typeof req.body.price === 'object') {
    const priceObj = req.body.price;
    req.body.price = Number(priceObj.min) || Number(priceObj.max) || 0;
    req.body.currency = priceObj.currency || 'USD';
  }

  // If product was approved and is being significantly changed, set back to pending
  const significantFields = ['name', 'description', 'price', 'images', 'category'];
  const isSignificantChange = significantFields.some(field => 
    req.body[field] !== undefined && JSON.stringify(req.body[field]) !== JSON.stringify(product[field])
  );

  if (product.isApproved === 'approved' && isSignificantChange) {
    req.body.isApproved = 'pending';
    req.body.isActive = false;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: isSignificantChange && product.isApproved === 'pending' 
      ? 'Product updated and submitted for re-approval' 
      : 'Product updated successfully',
    data: product
  });
});

// @desc    Delete supplier product
// @route   DELETE /api/supplier/products/:id
// @access  Private/Supplier
exports.deleteSupplierProduct = asyncHandler(async (req, res, next) => {
  const supplier = await getOrCreateSupplier(req.user);

  const product = await Product.findOne({
    _id: req.params.id,
    supplier: supplier._id
  });

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Delete images from cloudinary
  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      if (image.public_id) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (err) {
          console.error('Failed to delete image from cloudinary:', err);
        }
      }
    }
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Upload product image
// @route   POST /api/supplier/products/upload-image
// @access  Private/Supplier
exports.uploadSupplierProductImage = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.image) {
    return next(new ErrorResponse('Please upload an image', 400));
  }

  const file = req.files.image;

  // Check file type
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return next(new ErrorResponse('Image must be less than 5MB', 400));
  }

  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'products',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url
      }
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return next(new ErrorResponse('Failed to upload image', 500));
  }
});

// @desc    Get supplier's orders
// @route   GET /api/supplier/orders
// @access  Private/Supplier
exports.getSupplierOrders = asyncHandler(async (req, res, next) => {
  const supplier = await getOrCreateSupplier(req.user);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filters = {
    'orderItems.supplier': supplier._id
  };

  if (req.query.status) {
    filters.orderStatus = req.query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filters)
      .populate('buyer', 'name email phone')
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filters)
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: orders
  });
});

// @desc    Get supplier's single order
// @route   GET /api/supplier/orders/:id
// @access  Private/Supplier
exports.getSupplierOrderById = asyncHandler(async (req, res, next) => {
  const supplier = await getOrCreateSupplier(req.user);

  const order = await Order.findOne({
    _id: req.params.id,
    'orderItems.supplier': supplier._id
  })
    .populate('buyer', 'name email phone address')
    .populate('orderItems.product', 'name images price');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update supplier order status
// @route   PUT /api/supplier/orders/:id/status
// @access  Private/Supplier
exports.updateSupplierOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  
  const supplier = await getOrCreateSupplier(req.user);

  // Suppliers can only update to certain statuses
  const allowedStatuses = ['Processing', 'Shipped'];
  if (!allowedStatuses.includes(status)) {
    return next(new ErrorResponse(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`, 400));
  }

  const order = await Order.findOne({
    _id: req.params.id,
    'orderItems.supplier': supplier._id
  });

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  order.orderStatus = status;
  order.timeline.push({
    status,
    description: `Order ${status.toLowerCase()} by supplier`,
    timestamp: new Date()
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order
  });
});

// @desc    Get supplier's quotes
// @route   GET /api/supplier/quotes
// @access  Private/Supplier
exports.getSupplierQuotes = asyncHandler(async (req, res, next) => {
  const supplier = await getOrCreateSupplier(req.user);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filters = { supplier: supplier._id };
  
  if (req.query.status) {
    filters.status = req.query.status;
  }

  const [quotes, total] = await Promise.all([
    Quote.find(filters)
      .populate('user', 'name email phone')
      .populate('product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Quote.countDocuments(filters)
  ]);

  res.status(200).json({
    success: true,
    count: quotes.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: quotes
  });
});

// @desc    Respond to quote
// @route   POST /api/supplier/quotes/:id/respond
// @access  Private/Supplier
exports.respondToSupplierQuote = asyncHandler(async (req, res, next) => {
  const { response, price, validity } = req.body;
  
  const supplier = await getOrCreateSupplier(req.user);

  const quote = await Quote.findOne({
    _id: req.params.id,
    supplier: supplier._id
  });

  if (!quote) {
    return next(new ErrorResponse('Quote not found', 404));
  }

  quote.supplierResponse = {
    message: response,
    price,
    validity,
    respondedAt: new Date()
  };
  quote.status = 'quoted';

  await quote.save();

  res.status(200).json({
    success: true,
    message: 'Quote response sent successfully',
    data: quote
  });
});
