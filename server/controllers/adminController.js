const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Quote = require('../models/Quote');
const Shipment = require('../models/Shipment');
const Contact = require('../models/Contact');
const Supplier = require('../models/Supplier');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const { ErrorResponse } = require('../middleware/error');
const { cache, CACHE_KEYS, CACHE_TTL } = require('../utils/cache');
const { 
  sendAccountSuspendedEmail, 
  sendAccountReactivatedEmail, 
  sendAccountDeletedEmail,
  sendOrderStatusUpdateEmail,
  sendOrderCreatedEmail,
  sendOrderConfirmationEmail,
  sendQuoteReceivedEmail,
  sendQuoteResponseEmail,
  sendContactBuyerEmail,
  sendQuoteAcceptedByUserEmail,
  sendSupplierProductApprovedEmail,
  sendSupplierProductRejectedEmail
} = require('../config/email');
const { createOrderNotification, createQuoteNotification, createProductNotification, createSystemNotification } = require('../utils/notificationHelper');

// @desc    Get admin dashboard overview stats
// @route   GET /api/admin/dashboard/overview
// @access  Private/Admin
exports.getAdminDashboardOverview = asyncHandler(async (req, res, next) => {

  // Check cache first
  const cachedData = cache.get(CACHE_KEYS.ADMIN_DASHBOARD_OVERVIEW);
  if (cachedData) {
    
    return res.status(200).json({ success: true, data: cachedData, cached: true });
  }

  // Get current month and last month date ranges for growth calculation
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Get counts
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalQuotes,
    totalShipments,
    totalContacts,
    activeUsers,
    pendingOrders,
    completedOrders
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Quote.countDocuments(),
    Shipment.countDocuments(),
    Contact.countDocuments(),
    User.countDocuments({ isActive: true }),
    Order.countDocuments({ orderStatus: 'Pending' }),
    Order.countDocuments({ orderStatus: 'Delivered' })
  ]);

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const [
    newUsers,
    newOrders,
    newQuotes,
    newProducts
  ] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Quote.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Product.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
  ]);

  // Calculate revenue (sum of all delivered orders)
  const revenueData = await Order.aggregate([
    { $match: { orderStatus: 'Delivered' } },
    { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } }
  ]);
  const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

  // Calculate this month's revenue
  const thisMonthRevenueData = await Order.aggregate([
    { $match: { orderStatus: 'Delivered', createdAt: { $gte: thisMonthStart } } },
    { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } }
  ]);
  const thisMonthRevenue = thisMonthRevenueData.length > 0 ? thisMonthRevenueData[0].total : 0;

  // Calculate last month's revenue
  const lastMonthRevenueData = await Order.aggregate([
    { $match: { orderStatus: 'Delivered', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
    { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } }
  ]);
  const lastMonthRevenue = lastMonthRevenueData.length > 0 ? lastMonthRevenueData[0].total : 0;

  // Calculate growth percentages
  const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : (thisMonthRevenue > 0 ? 100 : 0);

  // Get user growth
  const thisMonthUsers = await User.countDocuments({ createdAt: { $gte: thisMonthStart } });
  const lastMonthUsers = await User.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } });
  const userGrowth = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1) : (thisMonthUsers > 0 ? 100 : 0);

  // Get order growth
  const thisMonthOrders = await Order.countDocuments({ createdAt: { $gte: thisMonthStart } });
  const lastMonthOrders = await Order.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } });
  const orderGrowth = lastMonthOrders > 0 ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1) : (thisMonthOrders > 0 ? 100 : 0);

  // Get product growth
  const thisMonthProducts = await Product.countDocuments({ createdAt: { $gte: thisMonthStart } });
  const lastMonthProducts = await Product.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } });
  const productGrowth = lastMonthProducts > 0 ? ((thisMonthProducts - lastMonthProducts) / lastMonthProducts * 100).toFixed(1) : (thisMonthProducts > 0 ? 100 : 0);

  // Get monthly revenue trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        orderStatus: { $in: ['Delivered', 'Shipped', 'Processing', 'Confirmed'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$pricing.totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Format monthly data with month names
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueTrend = [];
  
  // Create array for last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const monthData = monthlyRevenue.find(m => m._id.month === month && m._id.year === year);
    revenueTrend.push({
      month: monthNames[month - 1],
      year,
      revenue: monthData ? monthData.revenue : 0,
      orders: monthData ? monthData.orders : 0
    });
  }

  // Get top categories by order count - using orderItems
  const topCategories = await Order.aggregate([
    { $unwind: '$orderItems' },
    {
      $lookup: {
        from: 'products',
        localField: 'orderItems.product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'categories',
        localField: 'productDetails.category',
        foreignField: '_id',
        as: 'categoryDetails'
      }
    },
    { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$categoryDetails._id',
        name: { $first: '$categoryDetails.name' },
        count: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
      }
    },
    { $match: { _id: { $ne: null } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // If no order-based categories, get from products
  let categoryStats = topCategories;
  if (topCategories.length === 0) {
    const productCategories = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryDetails._id',
          name: { $first: '$categoryDetails.name' },
          count: { $sum: 1 }
        }
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    categoryStats = productCategories;
  }

  // Calculate percentages for categories
  const totalCategoryCount = categoryStats.reduce((sum, cat) => sum + cat.count, 0);
  const formattedCategories = categoryStats.map((cat, index) => ({
    name: cat.name || 'Uncategorized',
    count: cat.count,
    percentage: totalCategoryCount > 0 ? Math.round((cat.count / totalCategoryCount) * 100) : 0,
    revenue: cat.revenue || 0,
    color: ['blue', 'pink', 'slate', 'orange', 'emerald'][index] || 'slate'
  }));

  // Get real recent activity
  const recentActivityItems = [];

  // Get recent user registrations
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .select('name email role createdAt company country');

  recentUsers.forEach(user => {
    recentActivityItems.push({
      type: 'user',
      icon: 'user-check',
      color: 'emerald',
      title: user.role === 'supplier' ? 'New supplier registered' : 'New user registered',
      description: `${user.name}${user.company ? ` from ${user.company}` : ''}${user.country ? ` (${user.country})` : ''}`,
      time: user.createdAt
    });
  });

  // Get recent orders
  const recentOrdersData = await Order.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .populate('buyer', 'name company')
    .populate('orderItems.product', 'name');

  recentOrdersData.forEach(order => {
    const productName = order.orderItems?.[0]?.name || order.orderItems?.[0]?.product?.name || 'products';
    recentActivityItems.push({
      type: 'order',
      icon: 'shopping-cart',
      color: 'blue',
      title: 'Order placed',
      description: `${order.buyer?.company || order.buyer?.name || 'Customer'} ordered ${productName} - $${order.totalAmount?.toLocaleString() || 0}`,
      time: order.createdAt
    });
  });

  // Get recent products
  const recentProductsData = await Product.find()
    .sort({ createdAt: -1 })
    .limit(2)
    .populate('category', 'name')
    .populate('supplier', 'name');

  recentProductsData.forEach(product => {
    recentActivityItems.push({
      type: 'product',
      icon: 'box',
      color: 'purple',
      title: 'New product added',
      description: `${product.name} in ${product.category?.name || 'General'} category`,
      time: product.createdAt
    });
  });

  // Get recent quotes
  const recentQuotesData = await Quote.find()
    .sort({ createdAt: -1 })
    .limit(2)
    .populate('customer', 'name company');

  recentQuotesData.forEach(quote => {
    recentActivityItems.push({
      type: 'quote',
      icon: 'file-invoice',
      color: 'violet',
      title: 'Quote request received',
      description: `${quote.customer?.company || quote.customer?.name || 'Customer'} requested a quote`,
      time: quote.createdAt
    });
  });

  // Sort by time and limit
  recentActivityItems.sort((a, b) => new Date(b.time) - new Date(a.time));
  const activityFeed = recentActivityItems.slice(0, 5);

  // Get pending verifications (suppliers awaiting approval)
  const pendingVerifications = await User.countDocuments({ 
    role: 'supplier', 
    $or: [{ isActive: false }, { status: 'pending' }]
  });

  // Get commission earned (example: 5% of completed orders)
  const commissionRate = 0.05;
  const commissionEarned = Math.round(totalRevenue * commissionRate);

  // Build response data
  const responseData = {
    overview: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalQuotes,
      totalShipments,
      totalContacts,
      activeUsers,
      totalRevenue,
      pendingVerifications,
      commissionEarned,
      // Growth percentages
      revenueGrowth: parseFloat(revenueGrowth),
      userGrowth: parseFloat(userGrowth),
      orderGrowth: parseFloat(orderGrowth),
      productGrowth: parseFloat(productGrowth),
      // Month-over-month comparison
      thisMonthRevenue,
      lastMonthRevenue,
      revenueDiff: thisMonthRevenue - lastMonthRevenue
    },
    orderStats: {
      pending: pendingOrders,
      completed: completedOrders,
      total: totalOrders
    },
    recentActivity: {
      newUsers,
      newOrders,
      newQuotes,
      newProducts
    },
    revenueTrend,
    topCategories: formattedCategories,
    activityFeed
  };

  // Cache the response for 1 minute
  cache.set(CACHE_KEYS.ADMIN_DASHBOARD_OVERVIEW, responseData, CACHE_TTL.ADMIN_DASHBOARD_OVERVIEW);

  res.status(200).json({
    success: true,
    data: responseData
  });
});

// @desc    Get all users (with pagination)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const filters = {};
  if (req.query.role) filters.role = req.query.role;
  if (req.query.status) {
    if (req.query.status === 'verified') {
      filters.isActive = true;
    } else if (req.query.status === 'pending') {
      filters.status = 'pending';
    } else if (req.query.status === 'suspended') {
      filters.isActive = false;
    }
  }
  if (req.query.country) filters.country = req.query.country;
  if (req.query.search) {
    filters.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { company: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Get stats
  const [totalUsers, importers, exporters, pending] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'importer' }),
    User.countDocuments({ role: 'exporter' }),
    User.countDocuments({ $or: [{ status: 'pending' }, { isActive: false }] })
  ]);

  const [users, total] = await Promise.all([
    User.find(filters)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filters)
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      stats: {
        totalUsers,
        importers,
        exporters,
        pending
      },
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('favorites')
    .populate('recentlyViewed.product');

  if (!user) {
    return next(new ErrorResponse(`User not found with id: ${req.params.id}`, 404));
  }

  // Get user's orders, quotes, and shipments
  const [orders, quotes, shipments] = await Promise.all([
    Order.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(10),
    Quote.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(10),
    Shipment.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(10)
  ]);

  res.status(200).json({
    success: true,
    data: {
      user,
      orders,
      quotes,
      shipments
    }
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {

  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse(`User not found with id: ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

// @desc    Create admin user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createAdminUser = asyncHandler(async (req, res, next) => {

  const { name, email, password, phone, company, country, role, adminRole } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return next(new ErrorResponse('Please provide name, email, and password', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('User with this email already exists', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    company,
    country,
    role: role || 'admin',
    adminRole: adminRole || null,
    isActive: true,
    isVerified: true,
    isEmailVerified: true
  });

  res.status(201).json({
    success: true,
    message: 'Admin user created successfully',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      adminRole: user.adminRole,
      isActive: user.isActive
    }
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {

  // Prevent admin from deleting themselves
  if (req.user._id.toString() === req.params.id) {
    return next(new ErrorResponse('You cannot delete your own account', 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id: ${req.params.id}`, 404));
  }

  // Store user info for email before deleting
  const userEmail = user.email;
  const userName = user.name;

  // Delete user
  await User.findByIdAndDelete(req.params.id);

  // Send account deleted email
  await sendAccountDeletedEmail(userEmail, userName);

  res.status(200).json({
    success: true,
    message: `User ${userEmail} has been permanently deleted and logged out from all sessions`,
    data: {}
  });
});

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/toggle-active
// @access  Private/Admin
exports.toggleUserActive = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  const { reason } = req.body; // Optional reason for suspension

  if (!user) {
    return next(new ErrorResponse(`User not found with id: ${req.params.id}`, 404));
  }

  const wasActive = user.isActive;
  user.isActive = !user.isActive;
  await user.save();

  // Send appropriate email based on status change
  if (wasActive && !user.isActive) {
    // User was suspended
    await sendAccountSuspendedEmail(user.email, user.name, reason);
    
  } else if (!wasActive && user.isActive) {
    // User was reactivated
    await sendAccountReactivatedEmail(user.email, user.name);
    
  }

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
});

// @desc    Get all orders (with pagination, filtering, search)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  // Build filters
  const filters = {};
  
   // Debug log
  
  // Status filter
  if (req.query.status && req.query.status !== 'all') {
    // Capitalize first letter to match enum values
    const statusValue = req.query.status.charAt(0).toUpperCase() + req.query.status.slice(1).toLowerCase();
    filters.orderStatus = statusValue;
    
  }
  
  // Payment status filter
  if (req.query.paymentStatus && req.query.paymentStatus !== 'all') {
    filters.paymentStatus = req.query.paymentStatus;
    
  }
  
  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    filters.createdAt = {};
    if (req.query.startDate) {
      filters.createdAt.$gte = new Date(req.query.startDate);
      
    }
    if (req.query.endDate) {
      filters.createdAt.$lte = new Date(req.query.endDate);
      
    }
  }
  
  // Search by order ID, customer name, or email
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filters.$or = [
      { orderId: searchRegex },
      { 'shippingAddress.fullName': searchRegex },
      { 'shippingAddress.email': searchRegex }
    ];
  }
  
   // Debug log

  const [orders, total] = await Promise.all([
    Order.find(filters)
      .populate('buyer', 'firstName lastName email role')
      .populate('supplier', 'companyName email')
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

// @desc    Get order statistics
// @route   GET /api/admin/orders/stats
// @access  Private/Admin
exports.getOrderStats = asyncHandler(async (req, res, next) => {
  // Get current month start and end
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  // Get all order counts by status
  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    completedOrders,
    cancelledOrders,
    monthlyOrders
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: 'Pending' }),
    Order.countDocuments({ orderStatus: 'Processing' }),
    Order.countDocuments({ orderStatus: 'Shipped' }),
    Order.countDocuments({ orderStatus: { $in: ['Delivered'] } }),
    Order.countDocuments({ orderStatus: 'Cancelled' }),
    Order.find({ createdAt: { $gte: monthStart, $lte: monthEnd }, orderStatus: { $ne: 'Cancelled' } })
  ]);
  
  // Calculate monthly revenue
  const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.pricing?.totalPrice || 0), 0);
  
  // Calculate average order value
  const avgOrderValue = totalOrders > 0 
    ? await Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, avgPrice: { $avg: '$pricing.totalPrice' } } }
      ]).then(result => result[0]?.avgPrice || 0)
    : 0;
  
  // Get returns count (assuming cancelled after delivery or refunded status)
  const returns = await Order.countDocuments({ 
    orderStatus: { $in: ['Refunded'] }
  });
  
  // Calculate growth percentage for total orders (compare with last month)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const lastMonthCount = await Order.countDocuments({
    createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
  });
  
  const growthPercentage = lastMonthCount > 0 
    ? ((monthlyOrders.length - lastMonthCount) / lastMonthCount * 100).toFixed(1)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
      returns,
      monthlyRevenue,
      avgOrderValue,
      growthPercentage
    }
  });
});

// @desc    Get order by ID
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'firstName lastName email phone role')
    .populate('supplier', 'companyName email phone')
    .populate('orderItems.product', 'name images price sku')
    .populate('paymentInfo')
    .populate('shipmentInfo');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, paymentStatus, trackingNumber, estimatedDelivery, statusMessage } = req.body;
  
  const validStatuses = ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
  const validPaymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];
  
  // At least one of status or paymentStatus should be provided
  if (!status && !paymentStatus) {
    return next(new ErrorResponse('Please provide a status or payment status to update', 400));
  }
  
  if (status && !validStatuses.includes(status)) {
    return next(new ErrorResponse('Please provide a valid order status', 400));
  }
  
  if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
    return next(new ErrorResponse('Please provide a valid payment status', 400));
  }

  const order = await Order.findById(req.params.id).populate('buyer', 'name email');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  const previousStatus = order.orderStatus;
  const previousPaymentStatus = order.paymentStatus;
  
  // Update order status if provided
  if (status) {
    order.orderStatus = status;
    
    // Add timeline entry for order status
    order.timeline.push({
      status,
      description: statusMessage || `Order status updated to ${status} by admin`,
      timestamp: new Date()
    });
    
    // Update delivery status if delivered
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    // Update cancelled status
    if (status === 'Cancelled' && !order.cancelledAt) {
      order.cancelledAt = Date.now();
    }
  }
  
  // Update payment status if provided
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
    
    // Add timeline entry for payment status
    order.timeline.push({
      status: `Payment: ${paymentStatus}`,
      description: `Payment status updated to ${paymentStatus} by admin`,
      timestamp: new Date()
    });
    
    // Update isPaid if payment status is Paid
    if (paymentStatus === 'Paid') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }
  }

  await order.save();

  // Send email notification to customer if order status changed
  if (status) {
    try {
      await sendOrderStatusUpdateEmail({
        customerName: order.shippingAddress?.fullName || order.buyer?.name || 'Customer',
        orderId: order.orderId,
        newStatus: status,
        orderItems: order.orderItems,
        totalPrice: order.pricing?.totalPrice,
        trackingNumber: trackingNumber,
        estimatedDelivery: estimatedDelivery,
        statusMessage: statusMessage,
        shippingAddress: order.shippingAddress
      });
    } catch (emailError) {
      
    }
  }

  // Create in-app notification for the buyer
  try {
    if (order.buyer?._id) {
      await createOrderNotification(order.buyer._id.toString(), {
        orderId: order._id,
        orderNumber: order.orderId,
        status: status || order.orderStatus,
        totalAmount: order.pricing?.totalPrice
      });
    }
  } catch (notifError) {
    
  }

  res.status(200).json({
    success: true,
    message: paymentStatus 
      ? `Payment status updated to ${paymentStatus}` 
      : `Order status updated to ${status}`,
    data: order
  });
});

// @desc    Create new order (admin)
// @route   POST /api/admin/orders
// @access  Private/Admin
exports.createOrder = asyncHandler(async (req, res, next) => {
  const {
    buyer,
    supplier,
    orderItems,
    shippingAddress,
    billingAddress,
    pricing,
    paymentStatus,
    orderNotes,
    notes
  } = req.body;

  // Validate required fields (buyer can be null for admin-created orders)
  if (!shippingAddress || !pricing) {
    return next(new ErrorResponse('Please provide shipping address and pricing details', 400));
  }

  // Process orderItems to ensure they have required 'name' field
  const processedOrderItems = (orderItems || []).map(item => ({
    product: item.product || null,
    name: item.name || item.productName || 'Product',
    productName: item.productName || item.name || 'Product',
    productDescription: item.productDescription || '',
    quantity: item.quantity || 1,
    unitPrice: item.unitPrice || item.price || 0,
    price: item.price || (item.quantity * item.unitPrice) || 0,
    sku: item.sku || '',
    image: item.image || ''
  }));

  // Create order with default empty orderItems if not provided
  const order = await Order.create({
    buyer: buyer || req.user._id, // Use admin as buyer if not specified
    supplier,
    orderItems: processedOrderItems,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    pricing,
    paymentStatus: paymentStatus || 'Pending',
    orderStatus: 'Pending',
    orderNotes: orderNotes || notes || '',
    timeline: [{
      status: 'Pending',
      description: 'Order created by admin',
      timestamp: new Date()
    }]
  });

  const populatedOrder = await Order.findById(order._id)
    .populate('buyer', 'firstName lastName email')
    .populate('supplier', 'companyName')
    .populate('orderItems.product', 'name images');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: populatedOrder
  });
});

// @desc    Delete order
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully',
    data: {}
  });
});

// @desc    Get all products (with pagination)
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  
  const filters = {};
  
  // Category filter
  if (req.query.category) filters.category = req.query.category;
  
  // Supplier filter
  if (req.query.supplier) filters.supplier = req.query.supplier;
  
  // Status filter (isApproved)
  if (req.query.isApproved) {
    filters.isApproved = req.query.isApproved;
  }
  
  // Featured filter
  if (req.query.isFeatured !== undefined) {
    filters.isFeatured = req.query.isFeatured === 'true';
  }
  
  // Active/Inactive filter
  if (req.query.isActive !== undefined) {
    filters.isActive = req.query.isActive === 'true';
  }
  
  // Search filter
  if (req.query.search) {
    filters.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { sku: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  // Build sort object
  let sortOption = { createdAt: -1 }; // Default: Latest
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
      .populate('supplier', 'companyName email country')
      .populate('brand', 'name')
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

// @desc    Get quote statistics
// @route   GET /api/admin/quotes/stats
// @access  Private/Admin
exports.getQuoteStats = asyncHandler(async (req, res, next) => {
  const now = new Date();
  
  const [
    totalQuotes,
    pendingQuotes,
    inReviewQuotes,
    quotedQuotes,
    acceptedQuotes,
    rejectedQuotes,
    expiredQuotes,
    highPriorityQuotes
  ] = await Promise.all([
    Quote.countDocuments(),
    Quote.countDocuments({ status: 'pending' }),
    Quote.countDocuments({ status: 'in-review' }),
    Quote.countDocuments({ status: 'quoted' }),
    Quote.countDocuments({ status: 'accepted' }),
    Quote.countDocuments({ status: 'rejected' }),
    Quote.countDocuments({ status: 'expired' }),
    Quote.countDocuments({ priority: 'high', status: { $in: ['pending', 'in-review'] } })
  ]);
  
  // Calculate percentages
  const quotedPercentage = totalQuotes > 0 ? Math.round((quotedQuotes / totalQuotes) * 100) : 0;
  const expiredPercentage = totalQuotes > 0 ? Math.round((expiredQuotes / totalQuotes) * 100) : 0;
  
  res.status(200).json({
    success: true,
    data: {
      total: totalQuotes,
      pending: pendingQuotes,
      inReview: inReviewQuotes,
      quoted: quotedQuotes,
      accepted: acceptedQuotes,
      rejected: rejectedQuotes,
      expired: expiredQuotes,
      highPriority: highPriorityQuotes,
      quotedPercentage,
      expiredPercentage
    }
  });
});

// @desc    Get all quotes (with pagination)
// @route   GET /api/admin/quotes
// @access  Private/Admin
exports.getAllQuotes = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const filters = {};
  
  // Status filter
  if (req.query.status && req.query.status !== '') {
    filters.status = req.query.status;
  }
  
  // Priority filter
  if (req.query.priority && req.query.priority !== '') {
    filters.priority = req.query.priority;
  }
  
  // Category filter
  if (req.query.category && req.query.category !== '') {
    filters.category = { $regex: req.query.category, $options: 'i' };
  }
  
  // Search filter
  if (req.query.search && req.query.search !== '') {
    filters.$or = [
      { quoteId: { $regex: req.query.search, $options: 'i' } },
      { productName: { $regex: req.query.search, $options: 'i' } },
      { 'customerInfo.name': { $regex: req.query.search, $options: 'i' } },
      { 'customerInfo.company': { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  // Date filter
  if (req.query.dateRange) {
    const now = new Date();
    let dateFilter;
    
    switch (req.query.dateRange) {
      case 'today':
        dateFilter = new Date(now.setHours(0, 0, 0, 0));
        break;
      case '7days':
        dateFilter = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30days':
        dateFilter = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90days':
        dateFilter = new Date(now.setDate(now.getDate() - 90));
        break;
    }
    
    if (dateFilter) {
      filters.createdAt = { $gte: dateFilter };
    }
  }

  const [quotes, total] = await Promise.all([
    Quote.find(filters)
      .populate('customer', 'name email company phone')
      .populate('supplier', 'companyName')
      .populate('product', 'name')
      .populate('assignedTo', 'name email')
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

// @desc    Get single quote
// @route   GET /api/admin/quotes/:id
// @access  Private/Admin
exports.getQuoteById = asyncHandler(async (req, res, next) => {
  const quote = await Quote.findById(req.params.id)
    .populate('customer', 'name email company phone address')
    .populate('supplier', 'companyName email phone')
    .populate('product', 'name images price')
    .populate('assignedTo', 'name email');

  if (!quote) {
    return next(new ErrorResponse(`Quote not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: quote
  });
});

// @desc    Update quote status
// @route   PATCH /api/admin/quotes/:id/status
// @access  Private/Admin
exports.updateQuoteStatus = asyncHandler(async (req, res, next) => {
  const { status, finalPrice } = req.body;
  
  const quote = await Quote.findById(req.params.id);

  if (!quote) {
    return next(new ErrorResponse(`Quote not found with id of ${req.params.id}`, 404));
  }

  quote.status = status;
  
  // If accepting the quote, set the final price
  if (status === 'accepted' && finalPrice) {
    quote.finalPrice = finalPrice;
    quote.acceptedAt = new Date();
  }
  
  // If rejecting, set rejection timestamp
  if (status === 'rejected') {
    quote.rejectedAt = new Date();
  }
  
  await quote.save();

  res.status(200).json({
    success: true,
    message: `Quote status updated to ${status}`,
    data: quote
  });
});

// @desc    Send quote response
// @route   POST /api/admin/quotes/:id/respond
// @access  Private/Admin
exports.sendQuoteResponse = asyncHandler(async (req, res, next) => {
  const { quotedPrice, moq, leadTime, paymentTerms, shippingTerms, validUntil, notes } = req.body;
  
  const quote = await Quote.findById(req.params.id);

  if (!quote) {
    return next(new ErrorResponse(`Quote not found with id of ${req.params.id}`, 404));
  }

  quote.supplierResponse = {
    quotedPrice,
    moq,
    leadTime,
    paymentTerms,
    shippingTerms,
    validUntil,
    notes,
    respondedAt: new Date()
  };
  quote.status = 'quoted';
  await quote.save();

  // Send email notification to customer
  try {
    await sendQuoteResponseEmail({
      customerName: quote.customerInfo?.name || 'Customer',
      quoteId: quote.quoteId,
      productName: quote.productName,
      quantity: quote.quantity,
      unit: quote.unit,
      quotedPrice: quotedPrice,
      moq: moq,
      leadTime: leadTime,
      paymentTerms: paymentTerms,
      shippingTerms: shippingTerms,
      validUntil: validUntil,
      notes: notes,
      customerInfo: quote.customerInfo
    });
  } catch (emailError) {
    
  }

  // Create in-app notification for customer
  try {
    if (quote.customer) {
      await createQuoteNotification(quote.customer.toString(), {
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
    message: 'Quote response sent successfully',
    data: quote
  });
});

// @desc    Admin directly accepts quote (sets status to accepted)
// @route   POST /api/admin/quotes/:id/accept
// @access  Private/Admin
exports.adminAcceptQuote = asyncHandler(async (req, res, next) => {
  const { finalPrice, notes } = req.body;
  
  const quote = await Quote.findById(req.params.id)
    .populate('customer', 'name email');

  if (!quote) {
    return next(new ErrorResponse(`Quote not found with id of ${req.params.id}`, 404));
  }

  // Set final price (use provided or supplier's quoted price or target price)
  const acceptedPrice = finalPrice || quote.supplierResponse?.quotedPrice || quote.targetPrice || quote.productPrice;
  
  quote.status = 'accepted';
  quote.finalPrice = acceptedPrice;
  quote.acceptedAt = new Date();
  
  if (notes) {
    quote.internalNotes = (quote.internalNotes || '') + `\nAdmin accepted: ${notes}`;
  }
  
  await quote.save();

  // Create in-app notification for the buyer that their quote was accepted
  try {
    await createQuoteNotification(quote.customer._id.toString(), {
      quoteId: quote._id,
      quoteNumber: quote.quoteId,
      status: 'accepted',
      productName: quote.productName
    });
  } catch (notifError) {
    
  }

  // Send notification email to customer that quote is accepted and ready for order
  try {
    const { sendQuoteAcceptedEmail } = require('../config/email');
    await sendQuoteAcceptedEmail({
      supplierEmail: quote.customerInfo?.email,
      quoteId: quote.quoteId,
      productName: quote.productName,
      buyerName: quote.customerInfo?.name,
      quantity: quote.quantity,
      quotedPrice: acceptedPrice
    });
  } catch (emailError) {
    
  }

  res.status(200).json({
    success: true,
    message: 'Quote accepted successfully. You can now convert it to an order.',
    data: quote
  });
});

// @desc    Assign quote to admin/user
// @route   PATCH /api/admin/quotes/:id/assign
// @access  Private/Admin
exports.assignQuote = asyncHandler(async (req, res, next) => {
  const { assignedTo } = req.body;
  
  const quote = await Quote.findById(req.params.id);

  if (!quote) {
    return next(new ErrorResponse(`Quote not found with id of ${req.params.id}`, 404));
  }

  quote.assignedTo = assignedTo;
  if (quote.status === 'pending') {
    quote.status = 'in-review';
  }
  await quote.save();

  res.status(200).json({
    success: true,
    message: 'Quote assigned successfully',
    data: quote
  });
});

// @desc    Delete quote
// @route   DELETE /api/admin/quotes/:id
// @access  Private/Admin
exports.deleteQuote = asyncHandler(async (req, res, next) => {
  const quote = await Quote.findById(req.params.id);

  if (!quote) {
    return next(new ErrorResponse(`Quote not found with id of ${req.params.id}`, 404));
  }

  await quote.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Quote deleted successfully'
  });
});

// @desc    Create RFQ on behalf of customer (Admin)
// @route   POST /api/admin/quotes
// @access  Private/Admin
exports.createAdminQuote = asyncHandler(async (req, res, next) => {

  const {
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    customerCompany,
    productName,
    category,
    quantity,
    unit,
    description,
    specifications,
    targetPrice,
    budgetMin,
    budgetMax,
    currency,
    deliveryCity,
    deliveryState,
    deliveryCountry,
    expectedDeliveryDate,
    urgency,
    sendEmail
  } = req.body;

  // Validate required fields
  if (!productName || !category || !quantity || !description || !deliveryCountry) {
    return next(new ErrorResponse('Please provide all required fields: productName, category, quantity, description, deliveryCountry', 400));
  }

  // Either customerId or customer details must be provided
  if (!customerId && (!customerName || !customerEmail)) {
    return next(new ErrorResponse('Please provide either customerId or customer name and email', 400));
  }

  // Build quote data
  const quoteData = {
    productName,
    category,
    quantity: parseInt(quantity),
    unit: unit || 'pieces',
    description,
    specifications: specifications || '',
    isCustomProduct: true,
    deliveryLocation: {
      city: deliveryCity || '',
      state: deliveryState || '',
      country: deliveryCountry
    },
    urgency: urgency || 'Medium',
    status: 'pending',
    createdByAdmin: req.user._id
  };

  // Set customer info
  if (customerId) {
    // Find existing customer
    const customer = await User.findById(customerId);
    if (!customer) {
      return next(new ErrorResponse(`Customer not found with id ${customerId}`, 404));
    }
    quoteData.customer = customer._id;
    quoteData.customerInfo = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.company || ''
    };
  } else {
    // Use provided customer details (create as guest quote)
    quoteData.customerInfo = {
      name: customerName,
      email: customerEmail,
      phone: customerPhone || '',
      company: customerCompany || ''
    };
  }

  // Set budget if provided
  if (budgetMin || budgetMax) {
    quoteData.budget = {
      min: parseFloat(budgetMin) || 0,
      max: parseFloat(budgetMax) || 0,
      currency: currency || 'USD'
    };
  }

  // Set target price if provided
  if (targetPrice) {
    quoteData.targetPrice = parseFloat(targetPrice);
  }

  // Set expected delivery date if provided
  if (expectedDeliveryDate) {
    quoteData.expectedDeliveryDate = new Date(expectedDeliveryDate);
  }

  try {
    const quote = await Quote.create(quoteData);

    // Send email notification to customer if enabled
    if (sendEmail !== false) {
      try {
        const { sendAdminRFQCreatedEmail } = require('../config/email');
        await sendAdminRFQCreatedEmail({
          customerName: quoteData.customerInfo.name,
          customerEmail: quoteData.customerInfo.email,
          quoteId: quote.quoteId,
          productName,
          category,
          quantity: quoteData.quantity,
          unit: quoteData.unit,
          description,
          targetPrice: quoteData.targetPrice,
          deliveryLocation: quoteData.deliveryLocation,
          expectedDeliveryDate: quoteData.expectedDeliveryDate,
          urgency: quoteData.urgency
        });
        
      } catch (emailError) {
        console.error('Email sending failed:', emailError.message);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      data: quote
    });
  } catch (error) {
    console.error('Quote creation error:', error);
    return next(new ErrorResponse(error.message || 'Failed to create quote', 500));
  }
});

// @desc    Contact buyer via email
// @route   POST /api/admin/quotes/:id/contact-buyer
// @access  Private/Admin
exports.contactBuyer = asyncHandler(async (req, res, next) => {
  const { subject, message, responseDeadlineDays } = req.body;
  
  const quote = await Quote.findById(req.params.id)
    .populate('customer', 'name email');

  if (!quote) {
    return next(new ErrorResponse(`Quote not found with id of ${req.params.id}`, 404));
  }

  // Get buyer email - check customerInfo first, then populated customer
  const buyerEmail = quote.customerInfo?.email || quote.customer?.email;
  const buyerName = quote.customerInfo?.name || quote.customer?.name || 'Customer';

  if (!buyerEmail) {
    return next(new ErrorResponse('No email found for this buyer', 400));
  }

  if (!subject || !message) {
    return next(new ErrorResponse('Please provide subject and message', 400));
  }

  // Get admin name who is sending the email
  const adminName = req.user?.name || 'Admin';

  // Send email to buyer
  try {
    const emailResult = await sendContactBuyerEmail({
      buyerEmail,
      buyerName,
      quoteId: quote.quoteId,
      subject,
      message,
      adminName,
      responseDeadlineDays: responseDeadlineDays || 3
    });

    // Log contact history in quote
    if (!quote.contactHistory) {
      quote.contactHistory = [];
    }
    quote.contactHistory.push({
      type: 'email',
      subject,
      message,
      sentBy: req.user._id,
      sentAt: new Date()
    });
    await quote.save();

    // In development, return success even if email didn't send
    const successMessage = emailResult?.success === false
      ? `Email logged (sending failed in dev mode) for ${buyerEmail}`
      : `Email sent successfully to ${buyerEmail}`;

    res.status(200).json({
      success: true,
      message: successMessage,
      data: {
        sentTo: buyerEmail,
        subject,
        emailSent: emailResult?.success !== false
      }
    });
  } catch (emailError) {
    console.error('Contact buyer email failed:', emailError);
    // In development, still return success
    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({
        success: true,
        message: `Email logged (sending failed) for ${buyerEmail}`,
        data: {
          sentTo: buyerEmail,
          subject,
          emailSent: false
        }
      });
    } else {
      return next(new ErrorResponse('Failed to send email. Please try again.', 500));
    }
  }
});

// @desc    Convert quote to order
// @route   POST /api/admin/quotes/:id/convert-to-order
// @access  Private/Admin
exports.convertQuoteToOrder = asyncHandler(async (req, res, next) => {
  const quote = await Quote.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('supplier')
    .populate('product');

  if (!quote) {
    return next(new ErrorResponse(`Quote not found with id of ${req.params.id}`, 404));
  }

  if (quote.status === 'rejected' || quote.status === 'expired') {
    return next(new ErrorResponse(`Cannot convert ${quote.status} quote to order`, 400));
  }

  const {
    // Order Items
    productName,
    quantity,
    unitPrice, // Can be overridden, but defaults to finalPrice or quotedPrice
    sku,
    // Shipping Address
    shippingFullName,
    shippingCompany,
    shippingPhone,
    shippingEmail,
    shippingStreet,
    shippingCity,
    shippingState,
    shippingZipCode,
    shippingCountry,
    // Billing Address (optional, defaults to shipping)
    useSameAddress = true,
    billingFullName,
    billingCompany,
    billingPhone,
    billingEmail,
    billingStreet,
    billingCity,
    billingState,
    billingZipCode,
    billingCountry,
    // Pricing
    itemsPrice,
    taxPrice,
    shippingPrice,
    discount,
    // Payment Info
    paymentStatus,
    advancePayment,
    advancePaymentDate,
    paymentTerms,
    // Order Info
    orderNotes,
    expectedDeliveryDate
  } = req.body;

  // Determine the final price to use (priority: provided unitPrice > quote.finalPrice > supplierResponse.quotedPrice > productPrice)
  const finalUnitPrice = unitPrice || quote.finalPrice || quote.supplierResponse?.quotedPrice || quote.productPrice || 0;

  // Validate required fields (street and zipcode are optional - will use defaults)
  if (!quantity || !finalUnitPrice || !shippingFullName || !shippingPhone || !shippingCity || !shippingCountry) {
    return next(new ErrorResponse('Please provide required fields: quantity, price, name, phone, city, and country', 400));
  }

  // Calculate pricing using the final negotiated price
  const calculatedItemsPrice = itemsPrice || (quantity * finalUnitPrice);
  const calculatedTaxPrice = taxPrice || 0;
  const calculatedShippingPrice = shippingPrice || 0;
  const calculatedDiscount = discount || 0;
  const totalPrice = calculatedItemsPrice + calculatedTaxPrice + calculatedShippingPrice - calculatedDiscount;

  // Get order count for orderId
  const orderCount = await Order.countDocuments();
  const orderId = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(5, '0')}`;

  // Prepare shipping address (with defaults for optional fields)
  const shippingAddress = {
    fullName: shippingFullName,
    company: shippingCompany || '',
    phone: shippingPhone,
    email: shippingEmail || quote.customerInfo?.email || '',
    street: shippingStreet || 'To be confirmed',
    city: shippingCity,
    state: shippingState || '',
    zipCode: shippingZipCode || '00000',
    country: shippingCountry
  };

  // Prepare billing address
  const billingAddress = useSameAddress ? shippingAddress : {
    fullName: billingFullName || shippingFullName,
    company: billingCompany || shippingCompany || '',
    phone: billingPhone || shippingPhone,
    email: billingEmail || shippingEmail || quote.customerInfo?.email,
    street: billingStreet || shippingStreet,
    city: billingCity || shippingCity,
    state: billingState || shippingState || '',
    zipCode: billingZipCode || shippingZipCode,
    country: billingCountry || shippingCountry
  };

  // Get supplier ID - from quote.supplier or quote.product.supplier (optional)
  const supplierId = quote.supplier?._id || quote.product?.supplier || null;

  // Build order items - only include product reference if it exists
  const orderItem = {
    name: productName || quote.productName,
    quantity: parseInt(quantity),
    price: parseFloat(finalUnitPrice),
    sku: sku || '',
    image: quote.product?.images?.[0] || ''
  };
  
  // Only add product reference if it exists
  if (quote.product?._id) {
    orderItem.product = quote.product._id;
  }

  // Calculate advance payment details
  const advanceAmount = parseFloat(advancePayment) || 0;
  let advancePercentage = 0;
  if (advanceAmount > 0 && totalPrice > 0) {
    advancePercentage = Math.round((advanceAmount / totalPrice) * 100);
  }
  const remainingAmount = totalPrice - advanceAmount;

  // Determine order and payment status based on advance payment
  let initialOrderStatus = 'Pending';
  let initialPaymentStatus = paymentStatus || 'Pending';
  
  if (advanceAmount > 0) {
    initialOrderStatus = 'Awaiting Payment'; // Waiting for advance payment
    initialPaymentStatus = 'Pending';
  }

  // Create order data
  const orderData = {
    orderId,
    buyer: quote.customer._id,
    quote: quote._id, // Reference to original quote
    orderItems: [orderItem],
    shippingAddress,
    billingAddress,
    pricing: {
      itemsPrice: calculatedItemsPrice,
      taxPrice: calculatedTaxPrice,
      shippingPrice: calculatedShippingPrice,
      discount: calculatedDiscount,
      totalPrice
    },
    // Payment Terms and Advance Payment Info
    paymentTerms: paymentTerms || '',
    advancePayment: {
      amount: advanceAmount,
      percentage: advancePercentage,
      isPaid: false
    },
    remainingPayment: {
      amount: remainingAmount,
      isPaid: false
    },
    orderStatus: initialOrderStatus,
    paymentStatus: initialPaymentStatus,
    orderNotes: orderNotes || `Converted from Quote: ${quote.quoteId}. ${quote.description || ''}`,
    timeline: [
      { 
        status: 'Quote Created', 
        description: `Quote ${quote.quoteId} submitted`,
        timestamp: quote.createdAt 
      },
      { 
        status: 'Quote Accepted', 
        description: 'Quote converted to order',
        timestamp: new Date() 
      },
      { 
        status: initialOrderStatus, 
        description: advanceAmount > 0 
          ? `Order created - Awaiting ${advancePercentage}% advance payment ($${advanceAmount.toFixed(2)})`
          : 'Order created successfully',
        timestamp: new Date() 
      }
    ],
    isPaid: paymentStatus === 'Paid',
    paidAt: paymentStatus === 'Paid' ? new Date() : null
  };

  // Add supplier only if it exists
  if (supplierId) {
    orderData.supplier = supplierId;
  }

  // Create the order
  const order = await Order.create(orderData);

  // Update quote status
  quote.status = 'accepted';
  quote.finalPrice = finalUnitPrice; // Store the final agreed price
  quote.convertedToOrder = order._id;
  quote.convertedAt = new Date();
  quote.acceptedAt = new Date();
  await quote.save();

  // Populate order for response
  const populatedOrder = await Order.findById(order._id)
    .populate('buyer', 'name email')
    .populate('supplier', 'companyName');

  // Send professional order confirmation email with payment breakdown
  try {
    // Calculate payment details for email
    const totalAmount = order.pricing.totalPrice;
    const advancePaymentAmount = advanceAmount;
    const advancePaymentPercent = advanceAmount > 0 ? Math.round((advanceAmount / totalAmount) * 100) : 0;
    const remainingAmount = totalAmount - advanceAmount;

    await sendOrderConfirmationEmail({
      customerEmail: shippingAddress.email || quote.customer?.email,
      customerName: shippingAddress.fullName,
      orderId: order.orderId,
      quoteId: quote.quoteId,
      orderItems: order.orderItems,
      shippingAddress: order.shippingAddress,
      pricing: {
        ...order.pricing,
        advancePayment: advancePaymentAmount,
        advancePercent: advancePaymentPercent,
        remainingAmount: remainingAmount
      },
      paymentStatus: order.paymentStatus,
      paymentTerms: paymentTerms || `${advancePaymentPercent}% Advance Payment, balance before shipping`,
      expectedDeliveryDate: order.expectedDeliveryDate,
      isFromQuote: true
    });

  } catch (emailError) {
    
  }

  // Create in-app notification for the buyer about the new order
  try {
    await createOrderNotification(quote.customer._id.toString(), {
      orderId: order._id,
      orderNumber: order.orderId,
      status: 'Pending',
      totalAmount: totalPrice
    });

    // Also notify the buyer about quote conversion
    await createQuoteNotification(quote.customer._id.toString(), {
      quoteId: quote._id,
      quoteNumber: quote.quoteId,
      status: 'accepted',
      productName: quote.productName
    });
  } catch (notifError) {
    
  }

  res.status(201).json({
    success: true,
    message: `Quote ${quote.quoteId} converted to order ${order.orderId} successfully`,
    data: {
      order: populatedOrder,
      quote: quote
    }
  });
});

// @desc    Get all shipments (with pagination)
// @route   GET /api/admin/shipments
// @access  Private/Admin
exports.getAllShipments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const filters = {};
  if (req.query.status) filters.status = req.query.status;

  const [shipments, total] = await Promise.all([
    Shipment.find(filters)
      .populate('order')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Shipment.countDocuments(filters)
  ]);

  res.status(200).json({
    success: true,
    count: shipments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: shipments
  });
});

// @desc    Get all contact submissions
// @route   GET /api/admin/contacts
// @access  Private/Admin
exports.getAllContacts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const filters = {};
  if (req.query.status) filters.status = req.query.status;

  const [contacts, total] = await Promise.all([
    Contact.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Contact.countDocuments(filters)
  ]);

  res.status(200).json({
    success: true,
    count: contacts.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: contacts
  });
});

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getSystemStats = asyncHandler(async (req, res, next) => {
  // Get user role distribution
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  // Get order status distribution
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Get monthly revenue (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: twelveMonthsAgo },
        status: 'delivered'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      usersByRole,
      ordersByStatus,
      monthlyRevenue
    }
  });
});

// @desc    Get supplier by ID
// @route   GET /api/admin/suppliers/:id
// @access  Private/Admin
exports.getSupplierById = asyncHandler(async (req, res, next) => {
  const supplier = await Supplier.findById(req.params.id).populate('user', 'email firstName lastName');

  if (!supplier) {
    return next(new ErrorResponse('Supplier not found', 404));
  }

  res.status(200).json({
    success: true,
    data: supplier
  });
});

// @desc    Get all suppliers
// @route   GET /api/admin/suppliers
// @access  Private/Admin
exports.getAllSuppliers = asyncHandler(async (req, res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Build filters
  const filters = {};
  
  // Status filter
  if (req.query.status) {
    if (req.query.status === 'verified') {
      filters.verificationStatus = 'verified';
    } else if (req.query.status === 'pending') {
      filters.verificationStatus = 'pending';
    } else if (req.query.status === 'rejected') {
      filters.verificationStatus = 'rejected';
    }
  }
  
  // Country filter
  if (req.query.country) {
    filters.country = req.query.country;
  }
  
  // Search filter
  if (req.query.search) {
    filters.$or = [
      { companyName: { $regex: req.query.search, $options: 'i' } },
      { mainProducts: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Get stats
  const [totalSuppliers, verified, pending, rejected] = await Promise.all([
    Supplier.countDocuments(),
    Supplier.countDocuments({ verificationStatus: 'verified' }),
    Supplier.countDocuments({ verificationStatus: 'pending' }),
    Supplier.countDocuments({ verificationStatus: 'rejected' })
  ]);

  // Get suppliers with user data
  const [suppliers, total] = await Promise.all([
    Supplier.find(filters)
      .populate('user', 'name email phone isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Supplier.countDocuments(filters)
  ]);

  // Transform data for frontend
  const transformedSuppliers = suppliers.map(supplier => {
    const productsCount = supplier.totalOrders || 0;
    
    return {
      _id: supplier._id,
      companyName: supplier.companyName,
      businessType: supplier.businessType,
      contactPerson: supplier.user?.name || 'N/A',
      email: supplier.user?.email || 'N/A',
      phone: supplier.user?.phone || 'N/A',
      country: supplier.country,
      city: supplier.city,
      yearEstablished: supplier.yearsInBusiness ? new Date().getFullYear() - supplier.yearsInBusiness : 'N/A',
      productsCount: productsCount,
      rating: supplier.rating || 0,
      isVerified: supplier.verificationStatus === 'verified',
      status: supplier.verificationStatus,
      exportCapabilities: supplier.productCategories?.join(', ') || '',
      documents: {
        businessLicense: !!supplier.businessLicense?.url,
        taxCertificate: !!supplier.taxId,
        exportLicense: !!supplier.certificates?.length,
        bankDetails: !!supplier.user?.isActive
      }
    };
  });

  res.status(200).json({
    success: true,
    data: {
      suppliers: transformedSuppliers,
      stats: {
        totalSuppliers,
        verified,
        pending,
        rejected
      },
      count: transformedSuppliers.length,
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Approve supplier
// @route   PUT /api/admin/suppliers/:id/approve
// @access  Private/Admin
exports.approveSupplier = asyncHandler(async (req, res, next) => {

  const supplier = await Supplier.findById(req.params.id);
  
  if (!supplier) {
    
    return next(new ErrorResponse('Supplier not found', 404));
  }
  
  supplier.verificationStatus = 'verified';
  await supplier.save();
  
  // Update user status
  await User.findByIdAndUpdate(supplier.user, { isActive: true });

  res.status(200).json({
    success: true,
    message: 'Supplier approved successfully',
    data: supplier
  });
});

// @desc    Reject supplier
// @route   PUT /api/admin/suppliers/:id/reject
// @access  Private/Admin
exports.rejectSupplier = asyncHandler(async (req, res, next) => {

  const supplier = await Supplier.findById(req.params.id);
  
  if (!supplier) {
    
    return next(new ErrorResponse('Supplier not found', 404));
  }
  
  supplier.verificationStatus = 'rejected';
  await supplier.save();
  
  // Update user status
  await User.findByIdAndUpdate(supplier.user, { isActive: false });

  res.status(200).json({
    success: true,
    message: 'Supplier rejected successfully',
    data: supplier
  });
});

// @desc    Create supplier manually by admin
// @route   POST /api/admin/suppliers
// @access  Private/Admin
exports.createSupplier = asyncHandler(async (req, res, next) => {

  const {
    email,
    companyName,
    businessType,
    country,
    city,
    address,
    phone,
    website,
    description,
    mainProducts,
    productCategories
  } = req.body;

  // Validate required fields
  if (!email || !companyName || !businessType || !country || !city || !address) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  // Check if user with email exists
  let user = await User.findOne({ email });
  
  if (!user) {
    // Create user account for supplier
    user = await User.create({
      name: companyName,
      email,
      password: Math.random().toString(36).slice(-8) + 'Aa1!', // Generate random password
      phone,
      company: companyName,
      country,
      role: 'supplier',
      isActive: true,
      isVerified: false,
      isEmailVerified: false
    });
    
  }

  // Check if supplier already exists for this user
  const existingSupplier = await Supplier.findOne({ user: user._id });
  if (existingSupplier) {
    return next(new ErrorResponse('Supplier already exists for this user', 400));
  }

  // Create supplier
  const supplier = await Supplier.create({
    user: user._id,
    companyName,
    businessType,
    country,
    city,
    address,
    website,
    description,
    mainProducts,
    productCategories: productCategories ? productCategories.split(',').map(c => c.trim()) : [],
    verificationStatus: 'verified', // Auto-verify admin-created suppliers
    isActive: true
  });

  res.status(201).json({
    success: true,
    message: 'Supplier created successfully',
    data: supplier
  });
});

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getAllPayments = asyncHandler(async (req, res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const Payment = require('../models/Payment');
  
  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.method) filters.method = req.query.method;

  const [payments, total] = await Promise.all([
    Payment.find(filters)
      .populate('user', 'name email')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filters)
  ]);

  res.status(200).json({
    success: true,
    data: {
      payments,
      count: payments.length,
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single product details (Admin)
// @route   GET /api/admin/products/:id
// @access  Private/Admin
exports.getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name icon')
    .populate('supplier', 'companyName country rating email phone address');

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Update product (Admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Handle price - accept both 'price' directly or 'priceMin' for backwards compatibility
  const updateData = { ...req.body };
  if (req.body.priceMin !== undefined) {
    updateData.price = req.body.priceMin;
    delete updateData.priceMin;
    delete updateData.priceMax; // Remove if present
  }

  if (Object.prototype.hasOwnProperty.call(updateData, 'weight')) {
    if (updateData.weight === undefined || updateData.weight === null || String(updateData.weight).trim() === '') {
      updateData.weight = undefined;
    } else {
      const parsedWeight = Number(String(updateData.weight).trim());
      updateData.weight = Number.isFinite(parsedWeight)
        ? { value: parsedWeight, unit: 'kg' }
        : undefined;
    }
  }

  if (Object.prototype.hasOwnProperty.call(updateData, 'warranty')) {
    updateData.warranty = updateData.warranty && String(updateData.warranty).trim()
      ? String(updateData.warranty).trim()
      : undefined;
  }

  product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate('category', 'name').populate('supplier', 'companyName');

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product
  });
});

// @desc    Delete product (Admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Approve product
// @route   PUT /api/admin/products/:id/approve
// @access  Private/Admin
exports.approveProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  product.isApproved = 'approved';
  product.isActive = true;
  await product.save();

  // Send email notification to supplier if product has a supplier
  if (product.supplier) {
    try {
      const supplier = await Supplier.findById(product.supplier).populate('userId', 'email name');
      if (supplier && supplier.userId && supplier.userId.email) {
        await sendSupplierProductApprovedEmail(
          supplier.userId.email,
          supplier.companyName || supplier.userId.name,
          product
        );
      }
    } catch (emailError) {
      
      // Don't fail the request if email fails
    }
  }

  // Create in-app notification for supplier
  try {
    if (product.supplier) {
      const supplier = await Supplier.findById(product.supplier);
      if (supplier?.userId) {
        await createProductNotification(supplier.userId.toString(), {
          productId: product._id,
          productName: product.name,
          action: 'approved'
        });
      }
    }
  } catch (notifError) {
    
  }

  res.status(200).json({
    success: true,
    message: 'Product approved successfully',
    data: product
  });
});

// @desc    Reject product
// @route   PUT /api/admin/products/:id/reject
// @access  Private/Admin
exports.rejectProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');
  const { reason } = req.body;

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  product.isApproved = 'rejected';
  product.isActive = false;
  product.rejectionReason = reason || 'Product does not meet our quality standards. Please review and resubmit.';
  await product.save();

  // Send email notification to supplier if product has a supplier
  if (product.supplier) {
    try {
      const supplier = await Supplier.findById(product.supplier).populate('userId', 'email name');
      if (supplier && supplier.userId && supplier.userId.email) {
        await sendSupplierProductRejectedEmail(
          supplier.userId.email,
          supplier.companyName || supplier.userId.name,
          product,
          product.rejectionReason
        );
      }
    } catch (emailError) {
      
      // Don't fail the request if email fails
    }
  }

  // Create in-app notification for supplier
  try {
    if (product.supplier) {
      const supplier = await Supplier.findById(product.supplier);
      if (supplier?.userId) {
        await createProductNotification(supplier.userId.toString(), {
          productId: product._id,
          productName: product.name,
          action: 'rejected'
        });
      }
    }
  } catch (notifError) {
    
  }

  res.status(200).json({
    success: true,
    message: 'Product rejected successfully',
    data: product
  });
});

// @desc    Toggle product active status
// @route   PATCH /api/admin/products/:id/toggle-active
// @access  Private/Admin
exports.toggleProductActive = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  product.isActive = !product.isActive;
  await product.save();

  res.status(200).json({
    success: true,
    message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
    data: product
  });
});

// @desc    Toggle product featured status
// @route   PUT /api/admin/products/:id/toggle-featured
// @access  Private/Admin
exports.toggleProductFeatured = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  product.isFeatured = !product.isFeatured;
  await product.save();

  res.status(200).json({
    success: true,
    message: `Product ${product.isFeatured ? 'marked as featured' : 'removed from featured'}`,
    data: product
  });
});

// @desc    Get product statistics
// @route   GET /api/admin/products/stats
// @access  Private/Admin
exports.getProductStats = asyncHandler(async (req, res, next) => {
  const [
    total,
    active,
    inactive,
    pending,
    approved,
    rejected,
    featured
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: false }),
    Product.countDocuments({ isApproved: 'pending' }),
    Product.countDocuments({ isApproved: 'approved' }),
    Product.countDocuments({ isApproved: 'rejected' }),
    Product.countDocuments({ isFeatured: true })
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      active,
      inactive,
      pending,
      approved,
      rejected,
      featured
    }
  });
});

// @desc    Upload single product image
// @route   POST /api/admin/products/upload-image
// @access  Private/Admin
exports.uploadProductImage = asyncHandler(async (req, res, next) => {
  const cloudinary = require('../config/cloudinary');
  
  if (!req.files || !req.files.image) {
    return next(new ErrorResponse('Please upload an image', 400));
  }

  const file = req.files.image;

  // Validate image
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check file size (5MB max)
  if (file.size > 5000000) {
    return next(new ErrorResponse('Please upload an image less than 5MB', 400));
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: 'import-export/products',
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' },
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
});

// @desc    Create product (admin)
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createAdminProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    shortDescription,
    sku,
    category,
    categoryName,
    subCategory,
    supplier,
    brand,
    brandName,
    price,
    priceMin, // For backwards compatibility
    moq,
    unit,
    stock,
    images,
    specifications,
    features,
    tags,
    material,
    color,
    size,
    weight,
    dimensions,
    packagingType,
    shippingMethods,
    leadTime,
    warranty,
    certifications,
    isFeatured
  } = req.body;

  const parseOptionalNumber = (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    const normalized = String(value).trim();
    if (!normalized) {
      return undefined;
    }

    const numericToken = normalized.match(/-?\d+(\.\d+)?/);
    if (!numericToken) {
      return undefined;
    }

    const parsed = Number(numericToken[0]);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const normalizedWeight = parseOptionalNumber(weight);
  const normalizedLeadTime = parseOptionalNumber(leadTime);

  // Auto-create category if categoryName provided but no category ID
  let finalCategory = category;
  if (!finalCategory && categoryName) {
    const existingCategory = await Category.findOne({ name: categoryName });
    if (existingCategory) {
      finalCategory = existingCategory._id;
    } else {
      const newCategory = await Category.create({ name: categoryName, isActive: true });
      finalCategory = newCategory._id;
    }
  }

  // Auto-create brand if brandName provided but no brand ID
  let finalBrand = brand;
  if (!finalBrand && brandName) {
    const existingBrand = await Brand.findOne({ name: brandName });
    if (existingBrand) {
      finalBrand = existingBrand._id;
    } else {
      const newBrand = await Brand.create({ name: brandName, isActive: true });
      finalBrand = newBrand._id;
    }
  }

  // Create product
  const product = await Product.create({
    name,
    description,
    shortDescription,
    sku,
    category: finalCategory,
    subCategory,
    supplier,
    brand: finalBrand,
    price: price || priceMin || 0, // Single price (priceMin for backwards compatibility)
    currency: 'USD',
    moq,
    unit: unit || 'pieces',
    stock: stock || 0,
    images: images || [],
    specifications: specifications || [],
    features: features || [],
    tags: tags || [],
    material,
    color: color || [],
    size: size || [],
    weight: normalizedWeight !== undefined ? { value: normalizedWeight, unit: 'kg' } : undefined,
    dimensions,
    packaging: packagingType,
    leadTime: normalizedLeadTime !== undefined ? { min: normalizedLeadTime, max: normalizedLeadTime, unit: 'days' } : undefined,
    warranty: warranty && String(warranty).trim() ? String(warranty).trim() : undefined,
    certifications: certifications || [],
    isActive: true,
    isFeatured: isFeatured || false,
    isApproved: 'approved' // Admin products are auto-approved
  });

  // Populate category and supplier
  await product.populate('category', 'name');
  await product.populate('supplier', 'companyName country');

  res.status(201).json({
    success: true,
    data: product
  });
});
