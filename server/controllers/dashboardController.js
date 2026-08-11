const Order = require('../models/Order');
const Quote = require('../models/Quote');
const Shipment = require('../models/Shipment');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendEmail } = require('../config/email');
const { cartInquiryTemplate, cartInquiryCustomerTemplate } = require('../mails/templates/cartInquiryEmail');
const { createQuoteNotification, notifyAllAdmins } = require('../utils/notificationHelper');

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private
exports.getDashboardOverview = async (req, res) => {
  try {
    
    const userId = req.user.id;

    // Get user's order IDs for shipment query
    const userOrderIds = await Order.find({ buyer: userId }).select('_id').lean();
    
    // Get all stats in parallel
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalQuotes,
      activeShipments,
      recentOrders,
      totalSpentResult
    ] = await Promise.all([
      Order.countDocuments({ buyer: userId }),
      Order.countDocuments({ buyer: userId, orderStatus: { $in: ['Pending', 'Awaiting Payment', 'Processing'] } }),
      Order.countDocuments({ buyer: userId, orderStatus: { $in: ['Delivered', 'Completed'] } }),
      Quote.countDocuments({ customer: userId }),
      Shipment.countDocuments({ order: { $in: userOrderIds }, status: 'In Transit' }),
      Order.find({ buyer: userId })
        .sort('-createdAt')
        .limit(5)
        .populate('orderItems.product', 'name price')
        .lean(),
      Order.aggregate([
        { $match: { buyer: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$pricing.itemsPrice' } } }
      ])
    ]);

    // Get total spent from aggregation
    const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders,
          pendingOrders,
          completedOrders,
          totalQuotes,
          activeShipments,
          totalSpent
        },
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          orderNumber: order.orderId || order.orderNumber,
          product: order.orderItems?.[0]?.name || order.orderItems?.[0]?.product?.name || 'Order',
          status: order.orderStatus,
          amount: order.pricing?.itemsPrice || 0,
          date: order.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('❌ Dashboard Overview Error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard overview',
      error: error.message
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's order IDs for shipment queries
    const userOrderIds = await Order.find({ buyer: userId }).select('_id').lean();
    
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalQuotes,
      pendingQuotes,
      acceptedQuotes,
      activeShipments,
      deliveredShipments,
      totalSpentAgg
    ] = await Promise.all([
      Order.countDocuments({ buyer: userId }),
      Order.countDocuments({ buyer: userId, orderStatus: { $in: ['Pending', 'Awaiting Payment', 'Processing'] } }),
      Order.countDocuments({ buyer: userId, orderStatus: { $in: ['Delivered', 'Completed'] } }),
      Order.countDocuments({ buyer: userId, orderStatus: 'Cancelled' }),
      Quote.countDocuments({ customer: userId }),
      Quote.countDocuments({ customer: userId, status: 'pending' }),
      Quote.countDocuments({ customer: userId, status: 'accepted' }),
      Shipment.countDocuments({ order: { $in: userOrderIds }, status: 'In Transit' }),
      Shipment.countDocuments({ order: { $in: userOrderIds }, status: 'Delivered' }),
      Order.aggregate([
        { $match: { buyer: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$pricing.itemsPrice' } } }
      ])
    ]);

    const stats = {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalQuotes,
      pendingQuotes,
      acceptedQuotes,
      activeShipments,
      deliveredShipments,
      totalSpent: totalSpentAgg[0]?.total || 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
exports.getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Get user's order IDs for shipment query
    const userOrderIds = await Order.find({ buyer: userId }).select('_id').lean();
    
    // Get recent orders, quotes, and shipments
    const [recentOrders, recentQuotes, recentShipments] = await Promise.all([
      Order.find({ buyer: userId })
        .sort('-createdAt')
        .limit(limit)
        .populate('orderItems.product', 'name')
        .lean(),
      Quote.find({ customer: userId })
        .sort('-createdAt')
        .limit(limit)
        .lean(),
      Shipment.find({ order: { $in: userOrderIds } })
        .sort('-updatedAt')
        .limit(limit)
        .lean()
    ]);

    // Combine and sort activities
    const activities = [
      ...recentOrders.map(order => ({
        type: 'order',
        id: order._id,
        description: `Order placed for ${order.product?.name}`,
        status: order.status,
        date: order.createdAt
      })),
      ...recentQuotes.map(quote => ({
        type: 'quote',
        id: quote._id,
        description: `Quote request submitted`,
        status: quote.status,
        date: quote.createdAt
      })),
      ...recentShipments.map(shipment => ({
        type: 'shipment',
        id: shipment._id,
        description: `Shipment ${shipment.trackingNumber}`,
        status: shipment.status,
        date: shipment.updatedAt
      }))
    ].sort((a, b) => b.date - a.date).slice(0, limit);

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/dashboard/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/dashboard/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, address, company } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (company) user.company = company;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/dashboard/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { buyer: userId };
    if (status) query.orderStatus = status;

    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('orderItems.product', 'name price images')
      .lean();

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get user order stats
// @route   GET /api/dashboard/orders/stats
// @access  Private
exports.getUserOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = {
      total: await Order.countDocuments({ buyer: userId }),
      pending: await Order.countDocuments({ buyer: userId, orderStatus: { $in: ['Pending', 'Awaiting Payment'] } }),
      processing: await Order.countDocuments({ buyer: userId, orderStatus: 'Processing' }),
      shipped: await Order.countDocuments({ buyer: userId, orderStatus: 'Shipped' }),
      delivered: await Order.countDocuments({ buyer: userId, orderStatus: 'Delivered' }),
      cancelled: await Order.countDocuments({ buyer: userId, orderStatus: 'Cancelled' })
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order stats',
      error: error.message
    });
  }
};

// @desc    Get user quotes
// @route   GET /api/dashboard/quotes
// @access  Private
exports.getUserQuotes = async (req, res) => {
  try {
    
    const userId = req.user.id;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { customer: userId };
    if (status) query.status = status;

    const quotes = await Quote.find(query)
      .populate('supplier', 'companyName email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Quote.countDocuments(query);

    res.status(200).json({
      success: true,
      data: quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error fetching quotes',
      error: error.message
    });
  }
};

// @desc    Get user quote stats
// @route   GET /api/dashboard/quotes/stats
// @access  Private
exports.getUserQuoteStats = async (req, res) => {
  try {
    
    const userId = req.user.id;

    const stats = {
      total: await Quote.countDocuments({ customer: userId }),
      pending: await Quote.countDocuments({ customer: userId, status: 'pending' }),
      accepted: await Quote.countDocuments({ customer: userId, status: 'accepted' }),
      rejected: await Quote.countDocuments({ customer: userId, status: 'rejected' })
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error fetching quote stats',
      error: error.message
    });
  }
};

// @desc    Get user shipments
// @route   GET /api/dashboard/shipments
// @access  Private
exports.getUserShipments = async (req, res) => {
  try {
    
    const userId = req.user.id;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Find user's orders first
    const userOrders = await Order.find({ buyer: userId }).select('_id').lean();
    const orderIds = userOrders.map(order => order._id);

    const shipments = await Shipment.find({ order: { $in: orderIds } })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('order', 'orderNumber')
      .lean();

    const total = await Shipment.countDocuments({ order: { $in: orderIds } });

    res.status(200).json({
      success: true,
      data: shipments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error fetching shipments',
      error: error.message
    });
  }
};

// @desc    Get user shipment stats
// @route   GET /api/dashboard/shipments/stats
// @access  Private
exports.getUserShipmentStats = async (req, res) => {
  try {
    
    const userId = req.user.id;

    const userOrders = await Order.find({ buyer: userId }).select('_id');
    const orderIds = userOrders.map(order => order._id);

    const stats = {
      total: await Shipment.countDocuments({ order: { $in: orderIds } }),
      pending: await Shipment.countDocuments({ order: { $in: orderIds }, status: 'Pending Pickup' }),
      in_transit: await Shipment.countDocuments({ order: { $in: orderIds }, status: 'In Transit' }),
      delivered: await Shipment.countDocuments({ order: { $in: orderIds }, status: 'Delivered' })
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error fetching shipment stats',
      error: error.message
    });
  }
};

// @desc    Get user notifications
// @route   GET /api/dashboard/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    // This will be implemented when Notification model is ready
    res.status(200).json({
      success: true,
      data: [],
      message: 'Notifications feature coming soon'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// @desc    Add product to favorites
// @route   POST /api/dashboard/favorites/:productId
// @access  Private
exports.addToFavorites = async (req, res) => {
  try {
    
    const userId = req.user.id;
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {

      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get user and check if already in favorites
    const user = await User.findById(userId);
    if (user.favorites.includes(productId)) {

      return res.status(400).json({
        success: false,
        message: 'Product already in favorites'
      });
    }

    // Add to favorites
    user.favorites.push(productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product added to favorites'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error adding to favorites',
      error: error.message
    });
  }
};

// @desc    Remove product from favorites
// @route   DELETE /api/dashboard/favorites/:productId
// @access  Private
exports.removeFromFavorites = async (req, res) => {
  try {
    
    const userId = req.user.id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    user.favorites = user.favorites.filter(id => id.toString() !== productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from favorites'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error removing from favorites',
      error: error.message
    });
  }
};

// @desc    Get user favorites
// @route   GET /api/dashboard/favorites
// @access  Private
exports.getUserFavorites = async (req, res) => {
  try {
    
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: 'favorites',
      populate: [
        { path: 'category', select: 'name icon' },
        { path: 'supplier', select: 'companyName country rating' }
      ]
    });

    res.status(200).json({
      success: true,
      count: user.favorites.length,
      data: user.favorites
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error fetching favorites',
      error: error.message
    });
  }
};

// ==================== CART OPERATIONS ====================

// @desc    Get user cart
// @route   GET /api/dashboard/cart
// @access  Private
exports.getUserCart = async (req, res) => {
  try {
    
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: 'cart.product',
      populate: [
        { path: 'category', select: 'name icon' },
        { path: 'supplier', select: 'companyName country rating' }
      ]
    });

    // Filter out any cart items where product was deleted
    const validCart = user.cart.filter(item => item.product);
    
    // Calculate totals
    let totalItems = 0;
    let totalAmount = 0;
    
    const cartItems = validCart.map(item => {
      const price = item.product.price || 0;
      totalItems += item.quantity;
      totalAmount += price * item.quantity;
      
      return {
        product: item.product,
        quantity: item.quantity,
        addedAt: item.addedAt,
        price: price,
        subtotal: price * item.quantity
      };
    });

    res.status(200).json({
      success: true,
      count: cartItems.length,
      totalItems,
      totalAmount,
      data: cartItems
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};

// @desc    Add product to cart
// @route   POST /api/dashboard/cart/:productId
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    
    const userId = req.user.id;
    const { productId } = req.params;
    let { quantity = 1 } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {

      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Enforce MOQ (Minimum Order Quantity)
    const moq = product.moq || 1;
    if (quantity < moq) {
      quantity = moq;
      
    }

    const user = await User.findById(userId);
    
    // Check if product already in cart
    const existingItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if already exists
      user.cart[existingItemIndex].quantity += quantity;
      
    } else {
      // Add new item to cart
      user.cart.push({
        product: productId,
        quantity: quantity,
        addedAt: new Date()
      });
      
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cartCount: user.cart.length
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error adding to cart',
      error: error.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/dashboard/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    
    const userId = req.user.id;
    const { productId } = req.params;
    let { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Check product exists and get MOQ
    const product = await Product.findById(productId);
    if (product) {
      const moq = product.moq || 1;
      if (quantity < moq) {
        
        return res.status(400).json({
          success: false,
          message: `Minimum order quantity is ${moq}`
        });
      }
    }

    const user = await User.findById(userId);
    
    const itemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {

      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error updating cart',
      error: error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/dashboard/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    
    const userId = req.user.id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error removing from cart',
      error: error.message
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/dashboard/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    
    const userId = req.user.id;

    const user = await User.findById(userId);
    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};

// @desc    Add product to recently viewed
// @route   POST /api/dashboard/recently-viewed/:productId
// @access  Private
exports.addToRecentlyViewed = async (req, res) => {
  try {
    
    const userId = req.user.id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    
    // Remove if already exists
    user.recentlyViewed = user.recentlyViewed.filter(
      item => item.product.toString() !== productId
    );
    
    // Add to beginning
    user.recentlyViewed.unshift({
      product: productId,
      viewedAt: new Date()
    });
    
    // Keep only last 20 items
    user.recentlyViewed = user.recentlyViewed.slice(0, 20);
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Added to recently viewed'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error adding to recently viewed',
      error: error.message
    });
  }
};

// @desc    Get recently viewed products
// @route   GET /api/dashboard/recently-viewed
// @access  Private
exports.getRecentlyViewed = async (req, res) => {
  try {
    
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: 'recentlyViewed.product',
      populate: [
        { path: 'category', select: 'name icon' },
        { path: 'supplier', select: 'companyName country rating' }
      ]
    });

    const recentlyViewed = user.recentlyViewed
      .filter(item => item.product) // Filter out any null products
      .map(item => ({
        ...item.product.toObject(),
        viewedAt: item.viewedAt
      }));

    res.status(200).json({
      success: true,
      count: recentlyViewed.length,
      data: recentlyViewed
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error fetching recently viewed',
      error: error.message
    });
  }
};

// @desc    Get user spending trend chart data
// @route   GET /api/dashboard/charts/spending-trend
// @access  Private
exports.getSpendingTrendChart = async (req, res) => {
  try {
    
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 6;
    
    // Get ALL user orders for chart (not limited by date)
    const orders = await Order.find({ buyer: userId }).sort('createdAt');
    
    // Group by month for better visualization
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};
    
    // Create entries for last N months
    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = {
        date: monthNames[date.getMonth()],
        amount: 0,
        orders: 0
      };
    }

    // Populate with order data
    orders.forEach(order => {
      const monthKey = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].amount += order.pricing?.itemsPrice || 0;
        monthlyData[monthKey].orders += 1;
      }
    });

    const chartData = Object.values(monthlyData);

    // Calculate summary stats
    const totalSpending = chartData.reduce((sum, d) => sum + d.amount, 0);
    const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);

    res.status(200).json({
      success: true,
      data: {
        chartData,
        summary: {
          totalSpending,
          totalOrders
        }
      }
    });
  } catch (error) {
    console.error('❌ Spending Trend Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching spending trend',
      error: error.message
    });
  }
};

// @desc    Get orders by status chart data
// @route   GET /api/dashboard/charts/orders-by-status
// @access  Private
exports.getOrdersByStatusChart = async (req, res) => {
  try {
    
    const userId = req.user.id;

    const statusCounts = await Order.aggregate([
      { $match: { buyer: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    const statusColors = {
      'Pending': '#f97316',
      'Awaiting Payment': '#eab308',
      'Processing': '#3b82f6', 
      'Shipped': '#8b5cf6',
      'Delivered': '#10b981',
      'Completed': '#22c55e',
      'Cancelled': '#ef4444'
    };

    const chartData = statusCounts.map(item => ({
      name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown',
      value: item.count,
      color: statusColors[item._id] || '#64748b'
    }));

    const total = chartData.reduce((sum, d) => sum + d.value, 0);

    res.status(200).json({
      success: true,
      data: {
        chartData,
        total
      }
    });
  } catch (error) {
    console.error('❌ Orders by Status Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders by status',
      error: error.message
    });
  }
};

// @desc    Get spending by category chart data
// @route   GET /api/dashboard/charts/spending-by-category
// @access  Private
exports.getSpendingByCategoryChart = async (req, res) => {
  try {
    
    const userId = req.user.id;

    const orders = await Order.find({ buyer: userId })
      .populate({
        path: 'orderItems.product',
        select: 'category',
        populate: { path: 'category', select: 'name' }
      });

    const categorySpending = {};
    
    orders.forEach(order => {
      const categoryName = order.orderItems?.[0]?.product?.category?.name || 'Uncategorized';
      if (!categorySpending[categoryName]) {
        categorySpending[categoryName] = 0;
      }
      categorySpending[categoryName] += order.pricing?.itemsPrice || 0;
    });

    const COLORS = ['#3b82f6', '#ec4899', '#64748b', '#f97316', '#10b981', '#8b5cf6'];
    const chartData = Object.entries(categorySpending)
      .map(([name, value], index) => ({
        name,
        value: Math.round(value),
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('❌ Spending by Category Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching spending by category',
      error: error.message
    });
  }
};

// @desc    Get monthly orders comparison
// @route   GET /api/dashboard/charts/monthly-orders
// @access  Private
exports.getMonthlyOrdersChart = async (req, res) => {
  try {
    
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 6;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      buyer: userId,
      createdAt: { $gte: startDate }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};

    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = {
        name: monthNames[date.getMonth()],
        orders: 0,
        spending: 0
      };
    }

    orders.forEach(order => {
      const monthKey = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].orders += 1;
        monthlyData[monthKey].spending += order.pricing?.itemsPrice || 0;
      }
    });

    const chartData = Object.values(monthlyData);

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('❌ Monthly Orders Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly orders',
      error: error.message
    });
  }
};

// @desc    Get order trends chart (orders per month with amounts)
// @route   GET /api/dashboard/charts/order-trends
// @access  Private
exports.getOrderTrendsChart = async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 6;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      buyer: userId,
      createdAt: { $gte: startDate }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};

    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = {
        name: monthNames[date.getMonth()],
        orders: 0,
        amount: 0,
        delivered: 0,
        cancelled: 0
      };
    }

    orders.forEach(order => {
      const monthKey = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].orders += 1;
        monthlyData[monthKey].amount += order.pricing?.itemsPrice || 0;
        if (order.orderStatus === 'Delivered') monthlyData[monthKey].delivered += 1;
        if (order.orderStatus === 'Cancelled') monthlyData[monthKey].cancelled += 1;
      }
    });

    res.status(200).json({
      success: true,
      data: Object.values(monthlyData)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order trends',
      error: error.message
    });
  }
};

// @desc    Get payment status chart
// @route   GET /api/dashboard/charts/payment-status
// @access  Private
exports.getPaymentStatusChart = async (req, res) => {
  try {
    const userId = req.user.id;

    const [paid, pending, partial, failed] = await Promise.all([
      Order.countDocuments({ buyer: userId, paymentStatus: 'Paid' }),
      Order.countDocuments({ buyer: userId, paymentStatus: 'Pending' }),
      Order.countDocuments({ buyer: userId, paymentStatus: 'Partial' }),
      Order.countDocuments({ buyer: userId, paymentStatus: 'Failed' })
    ]);

    const chartData = [
      { name: 'Paid', value: paid, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Partial', value: partial, color: '#3b82f6' },
      { name: 'Failed', value: failed, color: '#ef4444' }
    ].filter(d => d.value > 0);

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status chart',
      error: error.message
    });
  }
};

// @desc    Get advanced order stats
// @route   GET /api/dashboard/orders/advanced-stats
// @access  Private
exports.getAdvancedOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all orders for calculations
    const allOrders = await Order.find({ buyer: userId });

    // Basic counts
    const [total, pending, processing, shipped, delivered, cancelled] = await Promise.all([
      Order.countDocuments({ buyer: userId }),
      Order.countDocuments({ buyer: userId, orderStatus: { $in: ['Pending', 'Awaiting Payment'] } }),
      Order.countDocuments({ buyer: userId, orderStatus: 'Processing' }),
      Order.countDocuments({ buyer: userId, orderStatus: 'Shipped' }),
      Order.countDocuments({ buyer: userId, orderStatus: 'Delivered' }),
      Order.countDocuments({ buyer: userId, orderStatus: 'Cancelled' })
    ]);

    // Calculate revenue and average
    let totalRevenue = 0;
    allOrders.forEach(order => {
      totalRevenue += order.pricing?.itemsPrice || 0;
    });
    const avgOrderValue = total > 0 ? totalRevenue / total : 0;

    // Get this month's data for comparison
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const [thisMonthOrders, lastMonthOrders] = await Promise.all([
      Order.countDocuments({ buyer: userId, createdAt: { $gte: thisMonthStart } }),
      Order.countDocuments({ buyer: userId, createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } })
    ]);

    const growthPercentage = lastMonthOrders > 0 
      ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        processing,
        shipped,
        delivered,
        cancelled,
        totalRevenue,
        avgOrderValue,
        thisMonthOrders,
        lastMonthOrders,
        growthPercentage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching advanced stats',
      error: error.message
    });
  }
};

// @desc    Generate order invoice PDF
// @route   GET /api/dashboard/orders/:orderId/invoice
// @access  Private
exports.generateOrderInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('buyer', 'name email phone')
      .populate('orderItems.product', 'name sku images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership
    if (order.buyer._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this invoice'
      });
    }

    // Helper function for proper currency formatting (full)
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0);
    };

    // Helper function for short currency formatting (K/M/B)
    const formatShortCurrency = (amount) => {
      const num = parseFloat(amount) || 0;
      if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
      if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
      if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
      return `$${num.toFixed(2)}`;
    };

    // Generate PDF using PDFKit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order.orderId}.pdf`);
    doc.pipe(res);

    // ===== HEADER SECTION =====
    doc.fillColor('#0d9488').fontSize(26).font('Helvetica-Bold').text('NEXARION', 50, 45);
    doc.fillColor('#666').fontSize(10).font('Helvetica').text('Import & Export Solutions', 50, 75);
    
    // Invoice Title (right side, simple)
    doc.fillColor('#333').fontSize(22).font('Helvetica-Bold').text('INVOICE', 400, 45, { align: 'right' });
    doc.fillColor('#0d9488').fontSize(11).font('Helvetica').text(`#${order.orderId}`, 400, 72, { align: 'right' });
    doc.fillColor('#666').fontSize(10).text(new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), 400, 87, { align: 'right' });

    // Divider
    doc.moveTo(50, 110).lineTo(545, 110).lineWidth(1).stroke('#0d9488');

    // ===== BILLING & ORDER INFO =====
    const infoY = 125;
    
    // Bill To
    doc.fillColor('#0d9488').fontSize(10).font('Helvetica-Bold').text('BILL TO', 50, infoY);
    doc.fillColor('#333').fontSize(11).font('Helvetica-Bold').text(order.shippingAddress?.fullName || order.buyer?.name || 'N/A', 50, infoY + 14);
    doc.fontSize(9).font('Helvetica').fillColor('#555');
    if (order.shippingAddress?.company) {
      doc.text(order.shippingAddress.company, 50, infoY + 26);
    }
    doc.text(order.shippingAddress?.street || '', 50, infoY + 38);
    doc.text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zipCode || ''}`, 50, infoY + 50);
    doc.text(order.shippingAddress?.country || '', 50, infoY + 62);
    if (order.shippingAddress?.phone) {
      doc.text(`Phone: ${order.shippingAddress.phone}`, 50, infoY + 76);
    }

    // Order Details (right side)
    doc.fillColor('#0d9488').fontSize(10).font('Helvetica-Bold').text('ORDER INFO', 350, infoY);
    doc.fontSize(9).font('Helvetica');
    doc.fillColor('#666').text('Order ID:', 350, infoY + 14);
    doc.fillColor('#333').text(order.orderId, 420, infoY + 14);
    doc.fillColor('#666').text('Date:', 350, infoY + 26);
    doc.fillColor('#333').text(new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 420, infoY + 26);
    doc.fillColor('#666').text('Status:', 350, infoY + 38);
    doc.fillColor('#333').text(order.orderStatus, 420, infoY + 38);
    doc.fillColor('#666').text('Payment:', 350, infoY + 50);
    doc.fillColor(order.paymentStatus === 'Paid' ? '#16a34a' : '#d97706').font('Helvetica-Bold').text(order.paymentStatus, 420, infoY + 50);
    doc.font('Helvetica');

    // ===== ITEMS TABLE =====
    const tableTop = 220;
    
    // Table Header
    doc.fillColor('#0d9488').rect(50, tableTop, 495, 20).fill();
    doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold');
    doc.text('PRODUCT', 55, tableTop + 6);
    doc.text('QTY', 320, tableTop + 6);
    doc.text('UNIT PRICE', 370, tableTop + 6);
    doc.text('TOTAL', 480, tableTop + 6);

    // Table Rows
    let yPos = tableTop + 26;
    order.orderItems?.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? '#f9fafb' : '#fff';
      doc.fillColor(bgColor).rect(50, yPos - 4, 495, 20).fill();
      
      doc.fillColor('#333').fontSize(9).font('Helvetica');
      const itemName = item.name || item.product?.name || 'Product';
      doc.text(itemName.substring(0, 40), 55, yPos);
      doc.text(item.quantity?.toString() || '1', 325, yPos);
      
      const unitPrice = item.unitPrice || (item.price / item.quantity) || 0;
      doc.text(formatShortCurrency(unitPrice), 370, yPos);
      doc.text(formatShortCurrency(item.price || 0), 480, yPos);
      
      yPos += 20;
    });

    // Bottom line
    doc.moveTo(50, yPos + 3).lineTo(545, yPos + 3).lineWidth(0.5).stroke('#ddd');

    // Calculate totals properly (in case stored totalPrice is corrupted)
    const itemsTotal = parseFloat(order.pricing?.itemsPrice) || 0;
    const shippingTotal = parseFloat(order.pricing?.shippingPrice) || 0;
    const taxTotal = parseFloat(order.pricing?.taxPrice) || 0;
    const calculatedTotal = itemsTotal + shippingTotal + taxTotal;

    // ===== TOTALS =====
    yPos += 15;
    doc.fontSize(9).font('Helvetica');
    doc.fillColor('#666').text('Subtotal:', 400, yPos);
    doc.fillColor('#333').text(formatShortCurrency(itemsTotal), 480, yPos);
    yPos += 14;

    doc.fillColor('#666').text('Shipping:', 400, yPos);
    doc.fillColor('#333').text(formatShortCurrency(shippingTotal), 480, yPos);
    yPos += 14;

    doc.fillColor('#666').text('Tax:', 400, yPos);
    doc.fillColor('#333').text(formatShortCurrency(taxTotal), 480, yPos);
    yPos += 18;

    // Total line
    doc.moveTo(390, yPos).lineTo(545, yPos).lineWidth(1).stroke('#0d9488');
    yPos += 6;

    doc.fontSize(11).font('Helvetica-Bold');
    doc.fillColor('#333').text('TOTAL:', 400, yPos);
    doc.fillColor('#0d9488').text(formatShortCurrency(calculatedTotal), 480, yPos);

    // ===== TERMS & CONDITIONS =====
    yPos += 40;
    doc.fillColor('#0d9488').fontSize(9).font('Helvetica-Bold').text('TERMS & CONDITIONS', 50, yPos);
    yPos += 12;
    doc.fillColor('#666').fontSize(8).font('Helvetica');
    doc.text('1. Payment is due within 30 days from the invoice date unless otherwise agreed.', 50, yPos, { width: 495 });
    yPos += 11;
    doc.text('2. Goods remain the property of Nexarion until full payment is received.', 50, yPos, { width: 495 });
    yPos += 11;
    doc.text('3. Returns are accepted within 14 days of delivery with original packaging. Restocking fees may apply.', 50, yPos, { width: 495 });
    yPos += 11;
    doc.text('4. For damaged or defective items, please contact us within 48 hours of delivery with photos.', 50, yPos, { width: 495 });
    yPos += 11;
    doc.text('5. Shipping times are estimates and may vary due to customs or carrier delays.', 50, yPos, { width: 495 });
    yPos += 11;
    doc.text('6. All disputes shall be resolved under the laws of the jurisdiction of Nexarion headquarters.', 50, yPos, { width: 495 });

    // ===== CONTACT & SUPPORT =====
    yPos += 20;
    doc.fillColor('#0d9488').fontSize(9).font('Helvetica-Bold').text('NEED HELP?', 50, yPos);
    yPos += 12;
    doc.fillColor('#666').fontSize(8).font('Helvetica');
    doc.text('Email: support@nexarion.com  |  Phone: +1 (800) 555-0199  |  Web: www.nexarion.com', 50, yPos);

    // ===== FOOTER =====
    doc.moveTo(50, 740).lineTo(545, 740).lineWidth(0.5).stroke('#ddd');
    doc.fontSize(9).fillColor('#666').font('Helvetica').text('Thank you for your business!', 50, 752, { align: 'center' });
    doc.fillColor('#0d9488').text('NEXARION - Your Trusted Import & Export Partner', 50, 764, { align: 'center' });
    doc.fillColor('#888').fontSize(7).text('This invoice is computer-generated and valid without signature.', 50, 778, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Invoice Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating invoice',
      error: error.message
    });
  }
};

// @desc    Raise inquiry for cart items
// @route   POST /api/dashboard/cart/inquiry
// @access  Private
exports.raiseCartInquiry = async (req, res) => {
  try {
    
    const userId = req.user.id;
    const { name, email, phone, country, message } = req.body;

    // Get user with cart populated
    const user = await User.findById(userId).populate({
      path: 'cart.product',
      populate: { path: 'category', select: 'name' }
    });

    if (!user.cart || user.cart.length === 0) {
      
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    // Prepare cart items for inquiry
    const items = user.cart.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.product?.price || 0,
      subtotal: (item.product?.price || 0) * item.quantity
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Generate inquiry ID
    const inquiryId = `INQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create quote from cart items
    const quoteItems = items.map(item => ({
      productId: item.product?._id,
      name: item.product?.name || 'Product',
      sku: item.product?.sku || '',
      image: item.product?.images?.[0] || '',
      price: item.price,
      quantity: item.quantity
    }));

    // Create a quote request for the cart
    const quote = await Quote.create({
      buyer: userId,
      product: items[0].product?._id, // Primary product
      productName: items.length > 1 ? `Cart Inquiry (${items.length} products)` : items[0].product?.name,
      category: items[0].product?.category?.name || 'General',
      quantity: totalItems,
      unit: 'pieces',
      description: message || `Cart inquiry for ${items.length} product(s)`,
      targetPrice: totalAmount,
      status: 'pending',
      urgency: 'Medium',
      isCustomProduct: false,
      customerInfo: {
        name: name,
        email: email,
        phone: phone || ''
      },
      deliveryLocation: {
        country: country
      },
      selectedProduct: {
        productId: items[0].product?._id,
        name: items[0].product?.name,
        price: items[0].product?.price,
        image: items[0].product?.images?.[0] || ''
      },
      cartItems: quoteItems,
      inquiryId: inquiryId
    });

    // Prepare email data
    const inquiryData = {
      customerName: name,
      customerEmail: email,
      customerPhone: phone || '',
      country: country,
      inquiryId: inquiryId,
      items: items,
      totalAmount: totalAmount,
      totalItems: totalItems,
      message: message || '',
      createdAt: new Date()
    };

    // Send email to admin
    try {
      await sendEmail({
        email: process.env.ADMIN_EMAIL || process.env.MAIL_USER,
        subject: `New Cart Inquiry - ${inquiryId}`,
        html: cartInquiryTemplate(inquiryData)
      });
      
    } catch (emailError) {
      
    }

    // Send confirmation email to customer
    try {
      await sendEmail({
        email: email,
        subject: `Inquiry Received - ${inquiryId}`,
        html: cartInquiryCustomerTemplate(inquiryData)
      });
      
    } catch (emailError) {
      
    }

    // Create in-app notifications
    try {
      // Notify the user about their inquiry
      await createQuoteNotification(userId, {
        quoteId: quote._id,
        quoteNumber: inquiryId,
        status: 'submitted',
        productName: items.length > 1 ? `Cart Inquiry (${items.length} products)` : items[0].product?.name
      });
      // Notify all admins
      await notifyAllAdmins({
        type: 'quote',
        title: 'New Cart Inquiry',
        message: `New cart inquiry from ${name} for ${items.length} product(s) worth $${totalAmount.toFixed(2)}.`,
        icon: 'shopping-cart',
        color: 'purple',
        link: '/admin/quotes',
        priority: 'high',
        metadata: { quoteId: quote._id, inquiryId, customerName: name, totalItems, totalAmount }
      });
      
    } catch (notifError) {
      
    }

    // Clear cart after successful inquiry
    user.cart = [];
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! We will get back to you soon.',
      data: {
        inquiryId: inquiryId,
        quoteId: quote._id,
        totalItems: totalItems,
        totalAmount: totalAmount
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error submitting inquiry',
      error: error.message
    });
  }
};