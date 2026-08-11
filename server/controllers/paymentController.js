const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error');
const stripe = require('../config/stripe');
const { 
  sendPaymentReceivedEmail, 
  sendRefundProcessedEmail, 
  sendPaymentFailedEmail,
  sendManualPaymentAddedEmail 
} = require('../config/email');
const { createPaymentNotification, notifyAllAdmins } = require('../utils/notificationHelper');

// Commission rate (15%)
const COMMISSION_RATE = 0.15;

// @desc    Get all payments with advanced filtering
// @route   GET /api/payments
// @access  Private/Admin
exports.getPayments = asyncHandler(async (req, res, next) => {
  const { 
    status, 
    paymentMethod, 
    search, 
    startDate, 
    endDate,
    dateRange,
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = req.query;

  let query = {};

  // If user is buyer, show only their payments
  if (req.user.role === 'buyer') {
    query.user = req.user.id;
  }

  // Status filter
  if (status && status !== 'all') {
    query.status = status;
  }

  // Payment method filter
  if (paymentMethod && paymentMethod !== 'all') {
    query.paymentMethod = paymentMethod;
  }

  // Date range filter
  if (dateRange) {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        query.createdAt = { 
          $gte: new Date(now.setHours(0, 0, 0, 0)) 
        };
        break;
      case 'last7days':
        query.createdAt = { 
          $gte: new Date(now.setDate(now.getDate() - 7)) 
        };
        break;
      case 'last30days':
        query.createdAt = { 
          $gte: new Date(now.setDate(now.getDate() - 30)) 
        };
        break;
      case 'thisMonth':
        query.createdAt = { 
          $gte: new Date(now.getFullYear(), now.getMonth(), 1) 
        };
        break;
      case 'thisYear':
        query.createdAt = { 
          $gte: new Date(now.getFullYear(), 0, 1) 
        };
        break;
    }
  } else if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Search filter
  if (search) {
    query.$or = [
      { transactionId: { $regex: search, $options: 'i' } },
      { 'paymentDetails.cardholderName': { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Payment.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const payments = await Payment.find(query)
    .populate('order', 'orderId orderNumber pricing')
    .populate('user', 'name email companyName')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Add commission info to each payment
  const paymentsWithCommission = payments.map(payment => {
    const paymentObj = payment.toObject();
    paymentObj.commission = payment.amount * COMMISSION_RATE;
    return paymentObj;
  });

  res.status(200).json({
    success: true,
    count: payments.length,
    total,
    pages,
    currentPage: parseInt(page),
    data: paymentsWithCommission
  });
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('order')
    .populate('user', 'name email companyName phone');

  if (!payment) {
    return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view this payment', 401));
  }

  const paymentObj = payment.toObject();
  paymentObj.commission = payment.amount * COMMISSION_RATE;

  res.status(200).json({
    success: true,
    data: paymentObj
  });
});

// @desc    Create payment
// @route   POST /api/payments
// @access  Private
exports.createPayment = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  // Verify order exists
  if (req.body.order) {
    const order = await Order.findById(req.body.order);
    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.body.order}`, 404));
    }

    // Check if user owns the order (unless admin)
    if (req.user.role !== 'admin' && order.buyer.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to make payment for this order', 401));
    }
  }

  // Add initial timeline entry
  req.body.timeline = [{
    status: 'Payment Initiated',
    message: 'Payment process started',
    timestamp: new Date()
  }];

  const payment = await Payment.create(req.body);

  // Update order payment status if order exists
  if (req.body.order) {
    const order = await Order.findById(req.body.order);
    if (order) {
      order.paymentStatus = 'Processing';
      await order.save();
    }
  }

  res.status(201).json({
    success: true,
    data: payment
  });
});

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
// @access  Private/Admin
exports.updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('user', 'name email')
    .populate('order', 'orderId pricing');

  if (!payment) {
    return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
  }

  const oldStatus = payment.status;
  payment.status = req.body.status;
  
  // Add timeline entry
  payment.timeline.push({
    status: req.body.status,
    message: `Status changed from ${oldStatus} to ${req.body.status}`,
    timestamp: new Date()
  });

  if (req.body.status === 'Completed') {
    payment.paidAt = new Date();
    
    // Update order payment status
    if (payment.order) {
      const order = await Order.findById(payment.order);
      if (order) {
        order.paymentStatus = 'Paid';
        await order.save();
      }
    }

    // Send payment received email
    if (payment.user?.email) {
      try {
        await sendPaymentReceivedEmail({
          customerName: payment.user.name,
          customerEmail: payment.user.email,
          transactionId: payment.transactionId,
          orderId: payment.order?.orderId,
          amount: payment.amount,
          currency: payment.currency || 'USD',
          paymentMethod: payment.paymentMethod,
          paymentType: payment.paymentType,
          paymentDate: payment.paidAt,
          orderTotal: payment.order?.pricing?.totalPrice,
          remainingBalance: 0
        });
      } catch (emailError) {
        
      }
    }
  }

  if (req.body.status === 'Failed') {
    if (req.body.failureReason) {
      payment.failureReason = req.body.failureReason;
    }

    // Send payment failed email
    if (payment.user?.email) {
      try {
        await sendPaymentFailedEmail({
          customerName: payment.user.name,
          customerEmail: payment.user.email,
          transactionId: payment.transactionId,
          orderId: payment.order?.orderId,
          amount: payment.amount,
          currency: payment.currency || 'USD',
          paymentMethod: payment.paymentMethod,
          failureReason: payment.failureReason || req.body.failureReason,
          attemptDate: new Date()
        });
      } catch (emailError) {
        
      }
    }
  }

  await payment.save();

  // Create in-app notifications for payment status changes
  try {
    if (payment.user?._id) {
      await createPaymentNotification(payment.user._id.toString(), {
        paymentId: payment._id,
        orderId: payment.order?.orderId,
        amount: payment.amount,
        status: req.body.status.toLowerCase(),
        method: payment.paymentMethod
      });
    }
    if (req.body.status === 'Completed') {
      await notifyAllAdmins({
        type: 'payment',
        title: 'Payment Received',
        message: `Payment of $${payment.amount?.toFixed(2)} received from ${payment.user?.name || 'customer'}.`,
        icon: 'credit-card',
        color: 'green',
        link: '/admin/payments',
        priority: 'high',
        metadata: { paymentId: payment._id, amount: payment.amount }
      });
    }
  } catch (notifError) {
    
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Process refund
// @route   PUT /api/payments/:id/refund
// @access  Private/Admin
exports.processRefund = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('user', 'name email')
    .populate('order', 'orderId');

  if (!payment) {
    return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
  }

  if (payment.status !== 'Completed') {
    return next(new ErrorResponse('Can only refund completed payments', 400));
  }

  const refundAmount = req.body.amount || payment.amount;
  const refundReason = req.body.reason || 'Customer request';
  const refundTransactionId = `REF-${Date.now()}`;

  payment.status = 'Refunded';
  payment.refundInfo = {
    amount: refundAmount,
    reason: refundReason,
    refundedAt: new Date(),
    refundTransactionId: refundTransactionId
  };

  payment.timeline.push({
    status: 'Refunded',
    message: `Refund of $${payment.refundInfo.amount} processed. Reason: ${payment.refundInfo.reason}`,
    timestamp: new Date()
  });

  await payment.save();

  // Update order status if exists
  if (payment.order) {
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'Refunded';
      await order.save();
    }
  }

  // Send refund processed email
  if (payment.user?.email) {
    try {
      await sendRefundProcessedEmail({
        customerName: payment.user.name,
        customerEmail: payment.user.email,
        transactionId: payment.transactionId,
        refundTransactionId: refundTransactionId,
        orderId: payment.order?.orderId,
        originalAmount: payment.amount,
        refundAmount: refundAmount,
        currency: payment.currency || 'USD',
        refundReason: refundReason,
        refundDate: new Date(),
        paymentMethod: payment.paymentMethod
      });
    } catch (emailError) {
      
    }
  }

  // Create in-app notification for refund
  try {
    if (payment.user?._id) {
      await createPaymentNotification(payment.user._id.toString(), {
        paymentId: payment._id,
        orderId: payment.order?.orderId,
        amount: refundAmount,
        status: 'refunded',
        method: payment.paymentMethod
      });
    }
  } catch (notifError) {
    
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Process payout to supplier
// @route   POST /api/payments/:id/payout
// @access  Private/Admin
exports.processPayout = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
  }

  if (payment.status !== 'Pending') {
    return next(new ErrorResponse('Can only process payouts for pending payments', 400));
  }

  payment.status = 'Completed';
  payment.paidAt = new Date();

  payment.timeline.push({
    status: 'Payout Processed',
    message: 'Payout to supplier has been processed',
    timestamp: new Date()
  });

  await payment.save();

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Get my payments
// @route   GET /api/payments/my/payments
// @access  Private
exports.getMyPayments = asyncHandler(async (req, res, next) => {
  const payments = await Payment.find({ user: req.user.id })
    .populate('order', 'orderId orderNumber')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private/Admin
exports.getPaymentStats = asyncHandler(async (req, res, next) => {
  const totalPayments = await Payment.countDocuments();
  const completedPayments = await Payment.countDocuments({ status: 'Completed' });
  const pendingPayments = await Payment.countDocuments({ status: 'Pending' });
  const processingPayments = await Payment.countDocuments({ status: 'Processing' });
  const failedPayments = await Payment.countDocuments({ status: 'Failed' });
  const refundedPayments = await Payment.countDocuments({ status: 'Refunded' });

  // Calculate total revenue
  const revenueData = await Payment.aggregate([
    { $match: { status: 'Completed' } },
    { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
  const totalCommission = totalRevenue * COMMISSION_RATE;

  // Pending payouts (pending payments amount)
  const pendingPayoutsData = await Payment.aggregate([
    { $match: { status: 'Pending' } },
    { $group: { _id: null, pendingAmount: { $sum: '$amount' } } }
  ]);
  const pendingPayouts = pendingPayoutsData.length > 0 ? pendingPayoutsData[0].pendingAmount : 0;

  // Get payment method breakdown with amounts
  const paymentMethods = await Payment.aggregate([
    { $match: { status: 'Completed' } },
    { 
      $group: { 
        _id: '$paymentMethod', 
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      } 
    },
    { $sort: { totalAmount: -1 } }
  ]);

  // Calculate percentages for payment methods
  const paymentMethodsWithPercentage = paymentMethods.map(method => ({
    method: method._id,
    count: method.count,
    totalAmount: method.totalAmount,
    percentage: totalRevenue > 0 
      ? Math.round((method.totalAmount / totalRevenue) * 100) 
      : 0
  }));

  // Get this month's stats
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonthData = await Payment.aggregate([
    { $match: { status: 'Completed', createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, revenue: { $sum: '$amount' } } }
  ]);
  const thisMonthRevenue = thisMonthData.length > 0 ? thisMonthData[0].revenue : 0;
  const thisMonthCommission = thisMonthRevenue * COMMISSION_RATE;

  // Get last month's stats for comparison
  const startOfLastMonth = new Date(startOfMonth);
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

  const lastMonthData = await Payment.aggregate([
    { $match: { status: 'Completed', createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } } },
    { $group: { _id: null, revenue: { $sum: '$amount' } } }
  ]);
  const lastMonthRevenue = lastMonthData.length > 0 ? lastMonthData[0].revenue : 0;

  const revenueGrowth = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0;

  // Calculate completion rate
  const completionRate = totalPayments > 0
    ? Math.round((completedPayments / totalPayments) * 100)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      total: totalPayments,
      completed: completedPayments,
      pending: pendingPayments,
      processing: processingPayments,
      failed: failedPayments,
      refunded: refundedPayments,
      totalRevenue,
      totalCommission,
      pendingPayouts,
      pendingCommission: pendingPayouts * COMMISSION_RATE,
      thisMonthRevenue,
      thisMonthCommission,
      revenueGrowth,
      completionRate,
      paymentMethods: paymentMethodsWithPercentage
    }
  });
});

// @desc    Get commission breakdown
// @route   GET /api/payments/commission-breakdown
// @access  Private/Admin
exports.getCommissionBreakdown = asyncHandler(async (req, res, next) => {
  // Total commission earned (from completed payments)
  const completedData = await Payment.aggregate([
    { $match: { status: 'Completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalCommissionEarned = (completedData.length > 0 ? completedData[0].total : 0) * COMMISSION_RATE;

  // Pending commission (from pending/processing payments)
  const pendingData = await Payment.aggregate([
    { $match: { status: { $in: ['Pending', 'Processing'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const pendingCommission = (pendingData.length > 0 ? pendingData[0].total : 0) * COMMISSION_RATE;

  // Paid out this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const paidOutData = await Payment.aggregate([
    { $match: { status: 'Completed', paidAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const paidOutThisMonth = (paidOutData.length > 0 ? paidOutData[0].total : 0) * (1 - COMMISSION_RATE);

  // Get last month's commission for comparison
  const startOfLastMonth = new Date(startOfMonth);
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

  const lastMonthData = await Payment.aggregate([
    { $match: { status: 'Completed', createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const lastMonthCommission = (lastMonthData.length > 0 ? lastMonthData[0].total : 0) * COMMISSION_RATE;

  const thisMonthData = await Payment.aggregate([
    { $match: { status: 'Completed', createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const thisMonthCommission = (thisMonthData.length > 0 ? thisMonthData[0].total : 0) * COMMISSION_RATE;

  const commissionGrowth = lastMonthCommission > 0
    ? Math.round(((thisMonthCommission - lastMonthCommission) / lastMonthCommission) * 100)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      totalCommissionEarned,
      pendingCommission,
      paidOutThisMonth,
      averageCommissionRate: COMMISSION_RATE * 100,
      commissionGrowth,
      thisMonthCommission,
      lastMonthCommission
    }
  });
});

// @desc    Get payment methods distribution
// @route   GET /api/payments/methods-distribution
// @access  Private/Admin
exports.getPaymentMethodsDistribution = asyncHandler(async (req, res, next) => {
  const distribution = await Payment.aggregate([
    { $match: { status: 'Completed' } },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  // Calculate total for percentages
  const totalAmount = distribution.reduce((sum, item) => sum + item.totalAmount, 0);

  const formattedDistribution = distribution.map(item => ({
    method: item._id,
    count: item.count,
    totalAmount: item.totalAmount,
    percentage: totalAmount > 0 
      ? Math.round((item.totalAmount / totalAmount) * 100) 
      : 0
  }));

  res.status(200).json({
    success: true,
    data: formattedDistribution
  });
});

// @desc    Export payments report
// @route   GET /api/payments/export
// @access  Private/Admin
exports.exportPaymentsReport = asyncHandler(async (req, res, next) => {
  const { status, paymentMethod, startDate, endDate } = req.query;

  let query = {};
  if (status && status !== 'all') query.status = status;
  if (paymentMethod && paymentMethod !== 'all') query.paymentMethod = paymentMethod;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const payments = await Payment.find(query)
    .populate('order', 'orderId')
    .populate('user', 'name')
    .sort('-createdAt')
    .lean();

  // Generate CSV content
  const headers = 'Transaction ID,Date,User,Order ID,Amount,Commission,Payment Method,Status\n';
  const rows = payments.map(p => 
    `"${p.transactionId}","${new Date(p.createdAt).toLocaleDateString()}","${p.user?.name || 'N/A'}","${p.order?.orderId || 'N/A'}","$${p.amount?.toFixed(2) || '0.00'}","$${(p.amount * COMMISSION_RATE).toFixed(2)}","${p.paymentMethod}","${p.status}"`
  ).join('\n');

  const csvContent = headers + rows;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=payments-report-${new Date().toISOString().split('T')[0]}.csv`);
  res.status(200).send(csvContent);
});

// ============================================
// STRIPE PAYMENT FUNCTIONS
// ============================================

// @desc    Create Stripe payment intent for order
// @route   POST /api/payments/stripe/create-intent
// @access  Private
exports.createStripePaymentIntent = asyncHandler(async (req, res, next) => {
  const { orderId, paymentType } = req.body; // paymentType: 'advance' or 'remaining' or 'full'

  const order = await Order.findById(orderId).populate('buyer', 'name email');
  
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Check if user owns this order (unless admin)
  if (req.user.role !== 'admin' && order.buyer._id.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to pay for this order', 401));
  }

  // Determine payment amount based on type
  let amount;
  let description;
  
  if (paymentType === 'advance') {
    if (order.advancePayment?.isPaid) {
      return next(new ErrorResponse('Advance payment already completed', 400));
    }
    amount = order.advancePayment?.amount || 0;
    description = `Advance Payment (${order.advancePayment?.percentage || 0}%) for Order ${order.orderId}`;
  } else if (paymentType === 'remaining') {
    if (!order.advancePayment?.isPaid) {
      return next(new ErrorResponse('Please pay advance payment first', 400));
    }
    if (order.remainingPayment?.isPaid) {
      return next(new ErrorResponse('Remaining payment already completed', 400));
    }
    amount = order.remainingPayment?.amount || 0;
    description = `Remaining Payment for Order ${order.orderId}`;
  } else {
    // Full payment
    if (order.paymentStatus === 'Paid') {
      return next(new ErrorResponse('Order already paid', 400));
    }
    amount = order.pricing.totalPrice;
    description = `Full Payment for Order ${order.orderId}`;
  }

  if (amount <= 0) {
    return next(new ErrorResponse('Invalid payment amount', 400));
  }

  // Convert to cents for Stripe (Stripe uses smallest currency unit)
  const amountInCents = Math.round(amount * 100);

  try {
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd', // You can make this dynamic based on order currency
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderId,
        paymentType,
        userId: req.user.id,
        userEmail: order.buyer?.email || req.user.email
      },
      description,
      receipt_email: order.buyer?.email || req.user.email,
      // Enable automatic payment methods
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record in database
    const payment = await Payment.create({
      transactionId,
      order: order._id,
      user: req.user.id,
      amount,
      currency: 'USD',
      paymentMethod: 'Credit Card',
      paymentGateway: 'Stripe',
      gatewayTransactionId: paymentIntent.id,
      status: 'Processing',
      paymentType: paymentType === 'advance' ? 'Advance' : paymentType === 'remaining' ? 'Remaining' : 'Full',
      partialPaymentInfo: {
        totalOrderAmount: order.pricing.totalPrice,
        advancePercentage: order.advancePayment?.percentage || 0,
        advanceAmount: order.advancePayment?.amount || 0,
        remainingAmount: order.remainingPayment?.amount || 0,
      },
      timeline: [{
        status: 'Processing',
        message: 'Stripe payment intent created',
        timestamp: new Date()
      }]
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentId: payment._id,
      amount,
      description
    });

  } catch (error) {
    console.error('Stripe error:', error);
    return next(new ErrorResponse(`Stripe error: ${error.message}`, 500));
  }
});

// @desc    Create Stripe Checkout Session (hosted payment page)
// @route   POST /api/payments/stripe/create-checkout-session
// @access  Private
exports.createStripeCheckoutSession = asyncHandler(async (req, res, next) => {
  const { items, shippingAddress, billingAddress, pricing, orderNotes } = req.body;

  if (!items || items.length === 0) {
    return next(new ErrorResponse('No items provided', 400));
  }

  try {
    // Create line items for Stripe Checkout
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          metadata: {
            productId: item.product,
            sku: item.sku || ''
          }
        },
        unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if present
    if (pricing.shippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: Math.round(pricing.shippingPrice * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as a line item if present
    if (pricing.taxPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
          },
          unit_amount: Math.round(pricing.taxPrice * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?cancelled=true`,
      customer_email: shippingAddress.email,
      metadata: {
        userId: req.user.id,
        shippingAddress: JSON.stringify(shippingAddress),
        billingAddress: JSON.stringify(billingAddress),
        pricing: JSON.stringify(pricing),
        orderNotes: orderNotes || '',
        items: JSON.stringify(items.map(i => ({ product: i.product, quantity: i.quantity, price: i.price })))
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'IN'],
      },
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe Checkout error:', error);
    return next(new ErrorResponse(`Stripe error: ${error.message}`, 500));
  }
});

// @desc    Handle Stripe Checkout Session completion
// @route   GET /api/payments/stripe/checkout-session/:sessionId
// @access  Private
exports.getStripeCheckoutSession = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items']
    });

    if (session.payment_status !== 'paid') {
      return next(new ErrorResponse('Payment not completed', 400));
    }

    // Check if order already created for this session
    const existingPayment = await Payment.findOne({ gatewayTransactionId: session.payment_intent.id });
    if (existingPayment) {
      const order = await Order.findById(existingPayment.order);
      return res.status(200).json({
        success: true,
        message: 'Order already exists',
        order,
        payment: existingPayment
      });
    }

    // Parse metadata
    const shippingAddress = JSON.parse(session.metadata.shippingAddress);
    const billingAddress = JSON.parse(session.metadata.billingAddress);
    const pricing = JSON.parse(session.metadata.pricing);
    const items = JSON.parse(session.metadata.items);

    // Create order
    const order = await Order.create({
      buyer: session.metadata.userId,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress,
      billingAddress,
      pricing: {
        itemsPrice: pricing.itemsPrice,
        taxPrice: pricing.taxPrice,
        shippingPrice: pricing.shippingPrice,
        discount: pricing.discount || 0,
        totalPrice: pricing.totalPrice
      },
      orderNotes: session.metadata.orderNotes,
      orderStatus: 'Processing',
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card'
    });

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record
    const payment = await Payment.create({
      transactionId,
      order: order._id,
      user: session.metadata.userId,
      amount: session.amount_total / 100,
      currency: session.currency.toUpperCase(),
      paymentMethod: 'Credit Card',
      paymentGateway: 'Stripe',
      gatewayTransactionId: session.payment_intent.id,
      status: 'Completed',
      paymentType: 'Full',
      paidAt: new Date(),
      timeline: [{
        status: 'Completed',
        message: 'Payment completed via Stripe Checkout',
        timestamp: new Date()
      }]
    });

    // Update order with payment reference
    order.payment = payment._id;
    await order.save();

    res.status(200).json({
      success: true,
      order,
      payment
    });

  } catch (error) {
    console.error('Stripe session retrieval error:', error);
    return next(new ErrorResponse(`Stripe error: ${error.message}`, 500));
  }
});

// @desc    Confirm Stripe payment (webhook or manual confirmation)
// @route   POST /api/payments/stripe/confirm
// @access  Private
exports.confirmStripePayment = asyncHandler(async (req, res, next) => {
  const { paymentIntentId, paymentId } = req.body;

  const payment = await Payment.findById(paymentId);
  
  if (!payment) {
    return next(new ErrorResponse('Payment not found', 404));
  }

  try {
    // Verify with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update payment record
      payment.status = 'Completed';
      payment.paidAt = new Date();
      payment.gatewayResponse = paymentIntent;
      payment.timeline.push({
        status: 'Completed',
        message: 'Payment confirmed by Stripe',
        timestamp: new Date()
      });
      await payment.save();

      // Populate user for email
      await payment.populate('user', 'name email');

      // Update order payment status
      const order = await Order.findById(payment.order);
      let remainingBalance = 0;
      
      if (order) {
        if (payment.paymentType === 'Advance') {
          order.advancePayment.isPaid = true;
          order.advancePayment.paidAt = new Date();
          order.advancePayment.paymentId = payment._id;
          order.paymentStatus = 'Partial';
          order.orderStatus = 'Processing';
          remainingBalance = order.remainingPayment?.amount || 0;
          order.timeline.push({
            status: 'Advance Paid',
            description: `Advance payment of $${payment.amount.toFixed(2)} received via Stripe`,
            timestamp: new Date()
          });
        } else if (payment.paymentType === 'Remaining') {
          order.remainingPayment.isPaid = true;
          order.remainingPayment.paidAt = new Date();
          order.remainingPayment.paymentId = payment._id;
          order.paymentStatus = 'Paid';
          order.isPaid = true;
          order.paidAt = new Date();
          order.timeline.push({
            status: 'Fully Paid',
            description: `Remaining payment of $${payment.amount.toFixed(2)} received via Stripe`,
            timestamp: new Date()
          });
        } else {
          // Full payment
          order.paymentStatus = 'Paid';
          order.isPaid = true;
          order.paidAt = new Date();
          order.orderStatus = 'Processing';
          order.timeline.push({
            status: 'Paid',
            description: `Full payment of $${payment.amount.toFixed(2)} received via Stripe`,
            timestamp: new Date()
          });
        }
        await order.save();

        // Send payment received email
        if (payment.user?.email) {
          try {
            await sendPaymentReceivedEmail({
              customerName: payment.user.name,
              customerEmail: payment.user.email,
              transactionId: payment.transactionId,
              orderId: order.orderId,
              amount: payment.amount,
              currency: payment.currency || 'USD',
              paymentMethod: payment.paymentMethod,
              paymentType: payment.paymentType,
              paymentDate: payment.paidAt,
              orderTotal: order.pricing?.totalPrice,
              remainingBalance: remainingBalance
            });
          } catch (emailError) {
            
          }
        }
      }

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: payment
      });
    } else {
      return next(new ErrorResponse(`Payment not successful. Status: ${paymentIntent.status}`, 400));
    }

  } catch (error) {
    console.error('Stripe confirmation error:', error);
    return next(new ErrorResponse(`Stripe error: ${error.message}`, 500));
  }
});

// @desc    Stripe webhook handler
// @route   POST /api/payments/stripe/webhook
// @access  Public (Stripe webhook)
exports.stripeWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;

      // Find and update payment
      const payment = await Payment.findOne({ gatewayTransactionId: paymentIntent.id });
      if (payment && payment.status !== 'Completed') {
        payment.status = 'Completed';
        payment.paidAt = new Date();
        payment.gatewayResponse = paymentIntent;
        payment.timeline.push({
          status: 'Completed',
          message: 'Payment confirmed via Stripe webhook',
          timestamp: new Date()
        });
        await payment.save();

        // Update order
        const order = await Order.findById(payment.order);
        if (order) {
          if (payment.paymentType === 'Advance') {
            order.advancePayment.isPaid = true;
            order.advancePayment.paidAt = new Date();
            order.advancePayment.paymentId = payment._id;
            order.paymentStatus = 'Partial';
            order.orderStatus = 'Processing';
          } else if (payment.paymentType === 'Remaining') {
            order.remainingPayment.isPaid = true;
            order.remainingPayment.paidAt = new Date();
            order.remainingPayment.paymentId = payment._id;
            order.paymentStatus = 'Paid';
            order.isPaid = true;
            order.paidAt = new Date();
          } else {
            order.paymentStatus = 'Paid';
            order.isPaid = true;
            order.paidAt = new Date();
            order.orderStatus = 'Processing';
          }
          await order.save();
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;

      const failedRecord = await Payment.findOne({ gatewayTransactionId: failedPayment.id });
      if (failedRecord) {
        failedRecord.status = 'Failed';
        failedRecord.failureReason = failedPayment.last_payment_error?.message || 'Payment failed';
        failedRecord.timeline.push({
          status: 'Failed',
          message: failedPayment.last_payment_error?.message || 'Payment failed',
          timestamp: new Date()
        });
        await failedRecord.save();
      }
      break;

    default:
      
  }

  res.json({ received: true });
});

// ============================================
// MANUAL BANK TRANSFER FUNCTIONS
// ============================================

// @desc    Get bank details for manual transfer
// @route   GET /api/payments/bank-details
// @access  Private
exports.getBankDetails = asyncHandler(async (req, res, next) => {
  // These should ideally come from Settings model
  const bankDetails = {
    bankName: process.env.BANK_NAME || 'Nexarion Global Bank',
    accountName: process.env.BANK_ACCOUNT_NAME || 'Nexarion Global Exports Pvt Ltd',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || 'XXXX-XXXX-XXXX-1234',
    routingNumber: process.env.BANK_ROUTING_NUMBER || '021000021',
    swiftCode: process.env.BANK_SWIFT_CODE || 'NEXAUS33',
    iban: process.env.BANK_IBAN || '',
    bankAddress: process.env.BANK_ADDRESS || '123 Financial District, New York, NY 10004, USA',
    notes: 'Please include your Order ID in the transfer reference/memo for faster processing.'
  };

  res.status(200).json({
    success: true,
    data: bankDetails
  });
});

// @desc    Submit bank transfer proof
// @route   POST /api/payments/bank-transfer/submit
// @access  Private
exports.submitBankTransferProof = asyncHandler(async (req, res, next) => {
  const { orderId, paymentType, transferReference, transferDate, amount, bankName, proofUrl, notes } = req.body;

  const order = await Order.findById(orderId).populate('buyer', 'name email');
  
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Check authorization
  if (req.user.role !== 'admin' && order.buyer._id.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized', 401));
  }

  // Create payment record for bank transfer (pending admin verification)
  const payment = await Payment.create({
    order: order._id,
    user: req.user.id,
    amount: parseFloat(amount),
    currency: 'USD',
    paymentMethod: 'Bank Transfer',
    paymentGateway: 'Manual',
    gatewayTransactionId: transferReference || `BT-${Date.now()}`,
    status: 'Pending', // Pending admin verification
    paymentType: paymentType === 'advance' ? 'Advance' : paymentType === 'remaining' ? 'Remaining' : 'Full',
    partialPaymentInfo: {
      totalOrderAmount: order.pricing.totalPrice,
      advancePercentage: order.advancePayment?.percentage || 0,
      advanceAmount: order.advancePayment?.amount || 0,
      remainingAmount: order.remainingPayment?.amount || 0,
    },
    paymentDetails: {
      bankName: bankName || 'Not specified',
      transferReference,
      transferDate: transferDate ? new Date(transferDate) : new Date(),
      proofUrl
    },
    paymentTerms: notes || '',
    timeline: [{
      status: 'Pending',
      message: 'Bank transfer proof submitted - awaiting admin verification',
      timestamp: new Date()
    }]
  });

  // Update order status
  order.timeline.push({
    status: 'Payment Submitted',
    description: `Bank transfer proof submitted for ${paymentType} payment - awaiting verification`,
    timestamp: new Date()
  });
  await order.save();

  res.status(201).json({
    success: true,
    message: 'Bank transfer proof submitted successfully. Our team will verify and update your order within 24-48 hours.',
    data: payment
  });
});

// @desc    Admin: Verify/Confirm bank transfer payment
// @route   PUT /api/payments/bank-transfer/:id/verify
// @access  Private/Admin
exports.verifyBankTransfer = asyncHandler(async (req, res, next) => {
  const { verified, notes, actualAmount } = req.body;

  const payment = await Payment.findById(req.params.id);
  
  if (!payment) {
    return next(new ErrorResponse('Payment not found', 404));
  }

  if (payment.paymentGateway !== 'Manual') {
    return next(new ErrorResponse('This is not a manual bank transfer payment', 400));
  }

  if (verified) {
    // Verify and complete the payment
    payment.status = 'Completed';
    payment.paidAt = new Date();
    if (actualAmount) {
      payment.amount = parseFloat(actualAmount);
    }
    payment.timeline.push({
      status: 'Completed',
      message: `Bank transfer verified by admin${notes ? ': ' + notes : ''}`,
      timestamp: new Date()
    });
    await payment.save();

    // Update order
    const order = await Order.findById(payment.order);
    if (order) {
      if (payment.paymentType === 'Advance') {
        order.advancePayment.isPaid = true;
        order.advancePayment.paidAt = new Date();
        order.advancePayment.paymentId = payment._id;
        order.paymentStatus = 'Partial';
        order.orderStatus = 'Processing';
        order.timeline.push({
          status: 'Advance Verified',
          description: `Advance payment of $${payment.amount.toFixed(2)} verified via bank transfer`,
          timestamp: new Date()
        });
      } else if (payment.paymentType === 'Remaining') {
        order.remainingPayment.isPaid = true;
        order.remainingPayment.paidAt = new Date();
        order.remainingPayment.paymentId = payment._id;
        order.paymentStatus = 'Paid';
        order.isPaid = true;
        order.paidAt = new Date();
        order.timeline.push({
          status: 'Fully Paid',
          description: `Remaining payment of $${payment.amount.toFixed(2)} verified via bank transfer`,
          timestamp: new Date()
        });
      } else {
        order.paymentStatus = 'Paid';
        order.isPaid = true;
        order.paidAt = new Date();
        order.orderStatus = 'Processing';
        order.timeline.push({
          status: 'Paid',
          description: `Full payment of $${payment.amount.toFixed(2)} verified via bank transfer`,
          timestamp: new Date()
        });
      }
      await order.save();

      // TODO: Send email notification to customer
    }

    res.status(200).json({
      success: true,
      message: 'Bank transfer verified successfully',
      data: payment
    });
  } else {
    // Reject the payment
    payment.status = 'Failed';
    payment.failureReason = notes || 'Bank transfer verification failed';
    payment.timeline.push({
      status: 'Failed',
      message: `Bank transfer rejected: ${notes || 'Verification failed'}`,
      timestamp: new Date()
    });
    await payment.save();

    // Update order timeline
    const order = await Order.findById(payment.order);
    if (order) {
      order.timeline.push({
        status: 'Payment Rejected',
        description: `Bank transfer rejected: ${notes || 'Verification failed'}`,
        timestamp: new Date()
      });
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: 'Bank transfer rejected',
      data: payment
    });
  }
});

// @desc    Get order payment details (for user payment page)
// @route   GET /api/payments/order/:orderId/details
// @access  Private
exports.getOrderPaymentDetails = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId)
    .populate('buyer', 'name email')
    .populate('advancePayment.paymentId')
    .populate('remainingPayment.paymentId');
  
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Check authorization
  if (req.user.role !== 'admin' && order.buyer._id.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized', 401));
  }

  // Get all payments for this order
  const payments = await Payment.find({ order: order._id }).sort('-createdAt');

  res.status(200).json({
    success: true,
    data: {
      order: {
        _id: order._id,
        orderId: order.orderId,
        pricing: order.pricing,
        paymentTerms: order.paymentTerms,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        advancePayment: order.advancePayment,
        remainingPayment: order.remainingPayment,
        buyer: order.buyer
      },
      payments,
      bankDetails: {
        bankName: process.env.BANK_NAME || 'Nexarion Global Bank',
        accountName: process.env.BANK_ACCOUNT_NAME || 'Nexarion Global Exports Pvt Ltd',
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || 'XXXX-XXXX-XXXX-1234',
        swiftCode: process.env.BANK_SWIFT_CODE || 'NEXAUS33',
      }
    }
  });
});

// @desc    Create manual payment (Admin only)
// @route   POST /api/payments/admin/manual
// @access  Private/Admin
exports.createManualPayment = asyncHandler(async (req, res, next) => {
  const {
    orderId,
    userId,
    amount,
    currency,
    paymentMethod,
    paymentType,
    notes,
    paymentDate
  } = req.body;

  // Validate required fields
  if (!orderId || !userId || !amount || !paymentMethod) {
    return next(new ErrorResponse('Please provide orderId, userId, amount, and paymentMethod', 400));
  }

  // Check if order exists
  const order = await Order.findById(orderId).populate('buyer', 'name email');
  if (!order) {
    return next(new ErrorResponse(`Order not found with id ${orderId}`, 404));
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorResponse(`User not found with id ${userId}`, 404));
  }

  // Create payment record
  const transactionId = `TXN-MANUAL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const payment = await Payment.create({
    transactionId,
    order: orderId,
    user: userId,
    amount: parseFloat(amount),
    currency: currency || 'USD',
    paymentMethod,
    paymentGateway: 'Manual',
    gatewayTransactionId: `MANUAL-${Date.now()}`,
    status: 'Completed',
    paymentType: paymentType || 'Full',
    paidAt: paymentDate ? new Date(paymentDate) : new Date(),
    paymentTerms: notes || 'Manual payment recorded by admin',
    timeline: [
      {
        status: 'Completed',
        message: `Manual payment recorded by ${req.user.name || 'Admin'}`,
        timestamp: new Date()
      }
    ],
    billingAddress: {
      fullName: user.name,
      email: user.email,
      phone: user.phone || '',
      street: order.billingAddress?.street || '',
      city: order.billingAddress?.city || '',
      state: order.billingAddress?.state || '',
      zipCode: order.billingAddress?.zipCode || '',
      country: order.billingAddress?.country || ''
    }
  });

  // Update order payment status
  if (paymentType === 'Advance' && order.advancePayment) {
    order.advancePayment.isPaid = true;
    order.advancePayment.paidAt = payment.paidAt;
    order.paymentStatus = 'Partial';
  } else if (paymentType === 'Remaining' && order.remainingPayment) {
    order.remainingPayment.isPaid = true;
    order.remainingPayment.paidAt = payment.paidAt;
    order.paymentStatus = 'Paid';
  } else {
    order.paymentStatus = 'Paid';
  }
  await order.save();

  // Send email notification to user
  try {
    await sendManualPaymentAddedEmail({
      customerName: user.name,
      customerEmail: user.email,
      transactionId: payment.transactionId,
      orderId: order.orderId,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentType: payment.paymentType,
      paymentDate: payment.paidAt,
      notes: notes,
      addedBy: req.user.name || 'Admin'
    });
  } catch (emailError) {
    
  }

  // Populate and return the payment
  const populatedPayment = await Payment.findById(payment._id)
    .populate('order', 'orderId pricing')
    .populate('user', 'name email');

  res.status(201).json({
    success: true,
    message: 'Manual payment recorded successfully',
    data: populatedPayment
  });
});
