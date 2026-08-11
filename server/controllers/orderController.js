const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error');
const { sendCheckoutConfirmationEmail } = require('../config/email');
const { createOrderNotification, notifyAllAdmins } = require('../utils/notificationHelper');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res, next) => {
  let query = Order.find(req.queryFilter || {})
    .populate('buyer', 'name email')
    .populate('items.product', 'name images');

  // If user is buyer, show only their orders
  if (req.user.role === 'buyer') {
    query = query.find({ buyer: req.user.id });
  }

  // Apply sorting
  if (req.sortBy) {
    query = query.sort(req.sortBy);
  }

  // Apply pagination
  query = query.skip(req.startIndex).limit(req.limit);

  const orders = await query;

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination: req.pagination,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'name email phone')
    .populate('items.product', 'name images sku')
    .populate('items.supplier', 'companyName email');

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is order owner or admin
  if (order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view this order', 401));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Create order
// @route   POST /api/orders
// @access  Private/Buyer
exports.createOrder = asyncHandler(async (req, res, next) => {
  req.body.buyer = req.user.id;

  // Get user information
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Process order items - validate products if product IDs provided
  const orderItems = [];
  
  if (req.body.orderItems && req.body.orderItems.length > 0) {
    for (let item of req.body.orderItems) {
      // If product ID is provided, validate and get product details
      if (item.product) {
        const product = await Product.findById(item.product);
        if (product) {
          // Check MOQ if product has it
          if (product.moq && item.quantity < product.moq) {
            return next(new ErrorResponse(`Minimum order quantity for ${product.name} is ${product.moq}`, 400));
          }
          
          orderItems.push({
            product: item.product,
            name: item.name || product.name,
            productName: item.productName || product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice || product.price,
            price: item.price || (item.quantity * (item.unitPrice || product.price)),
            sku: item.sku || product.sku,
            image: item.image || product.images?.[0]?.url
          });
        } else {
          // Product not found but we still allow the order (for manual/custom items)
          orderItems.push({
            name: item.name || 'Unknown Product',
            productName: item.productName || item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            price: item.price,
            sku: item.sku,
            image: item.image
          });
        }
      } else {
        // No product ID - custom item
        orderItems.push({
          name: item.name || 'Custom Item',
          productName: item.productName || item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          price: item.price,
          sku: item.sku,
          image: item.image
        });
      }
    }
  }

  // Calculate pricing
  const itemsPrice = orderItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const pricing = {
    itemsPrice: req.body.pricing?.itemsPrice || itemsPrice,
    taxPrice: req.body.pricing?.taxPrice || 0,
    shippingPrice: req.body.pricing?.shippingPrice || 0,
    discount: req.body.pricing?.discount || 0,
    totalPrice: req.body.pricing?.totalPrice || (itemsPrice + (req.body.pricing?.taxPrice || 0) + (req.body.pricing?.shippingPrice || 0) - (req.body.pricing?.discount || 0))
  };

  // Create the order
  const orderData = {
    buyer: req.user.id,
    orderItems,
    shippingAddress: req.body.shippingAddress,
    billingAddress: req.body.billingAddress || req.body.shippingAddress,
    pricing,
    paymentTerms: req.body.paymentTerms || '',
    orderNotes: req.body.orderNotes || '',
    orderStatus: req.body.orderStatus || 'Pending',
    paymentStatus: req.body.paymentStatus || 'Pending',
    timeline: [{
      status: 'Order Created',
      description: 'Order has been placed successfully',
      timestamp: new Date()
    }]
  };

  const order = await Order.create(orderData);

  // Populate order for response
  const populatedOrder = await Order.findById(order._id)
    .populate('buyer', 'name email phone')
    .populate('orderItems.product', 'name images sku');

  // Send checkout confirmation email
  try {
    await sendCheckoutConfirmationEmail({
      customerName: user.name,
      customerEmail: user.email,
      orderId: order.orderId,
      orderItems: orderItems,
      shippingAddress: req.body.shippingAddress,
      billingAddress: req.body.billingAddress || req.body.shippingAddress,
      pricing,
      paymentMethod: req.body.paymentMethod || 'Credit Card',
      paymentStatus: orderData.paymentStatus,
      orderNotes: orderData.orderNotes,
      orderDate: order.createdAt
    });
  } catch (emailError) {
    
    // Don't fail the order if email fails
  }

  // Create in-app notification for the buyer
  try {
    await createOrderNotification(req.user.id, {
      orderId: order._id,
      orderNumber: order.orderId,
      status: 'Pending',
      totalAmount: pricing.totalPrice
    });
    // Notify all admins about the new order
    await notifyAllAdmins({
      type: 'order',
      title: 'New Order Received',
      message: `New order #${order.orderId} from ${user.name} worth $${pricing.totalPrice?.toFixed(2) || '0.00'}.`,
      icon: 'shopping-cart',
      color: 'green',
      link: '/admin/orders',
      priority: 'high',
      metadata: { orderId: order._id, orderNumber: order.orderId, customerName: user.name, totalAmount: pricing.totalPrice }
    });
  } catch (notifError) {
    
  }

  res.status(201).json({
    success: true,
    data: populatedOrder
  });
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  order.status = req.body.status;
  
  if (req.body.status === 'delivered') {
    order.deliveredAt = Date.now();
  }

  await order.save();

  // Create notification for order status update
  try {
    if (order.buyer) {
      await createOrderNotification(order.buyer.toString(), {
        orderId: order._id,
        orderNumber: order.orderId,
        status: req.body.status,
        totalAmount: order.pricing?.totalPrice
      });
    }
  } catch (notifError) {
    
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  const { reason } = req.body;

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  if (order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to cancel this order', 401));
  }

  // Can only cancel if order is pending or confirmed
  const cancellableStatuses = ['Pending', 'Confirmed', 'Awaiting Payment', 'Processing'];
  if (!cancellableStatuses.includes(order.orderStatus)) {
    return next(new ErrorResponse(`Cannot cancel order at this stage. Current status: ${order.orderStatus}`, 400));
  }

  order.orderStatus = 'Cancelled';
  order.cancellationReason = reason || 'No reason provided';
  order.cancelledAt = new Date();
  
  // Add to timeline
  order.timeline.push({
    status: 'Cancelled',
    description: `Order cancelled. Reason: ${order.cancellationReason}`,
    timestamp: new Date()
  });
  
  await order.save();

  // Notify about cancellation
  try {
    await createOrderNotification(order.buyer.toString(), {
      orderId: order._id,
      orderNumber: order.orderId,
      status: 'Cancelled',
      totalAmount: order.pricing?.totalPrice
    });
    await notifyAllAdmins({
      type: 'order',
      title: 'Order Cancelled',
      message: `Order #${order.orderId} has been cancelled.`,
      icon: 'x-circle',
      color: 'red',
      link: '/admin/orders',
      priority: 'high',
      metadata: { orderId: order._id, orderNumber: order.orderId }
    });
  } catch (notifError) {
    
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Get my orders
// @route   GET /api/orders/my/orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ buyer: req.user.id })
    .populate({
      path: 'orderItems.product',
      select: 'name images sku price'
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getOrderStats = asyncHandler(async (req, res, next) => {
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
  const shippedOrders = await Order.countDocuments({ status: 'shipped' });
  const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
  const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

  // Calculate total revenue
  const revenueData = await Order.aggregate([
    { $match: { status: { $in: ['delivered', 'shipped'] } } },
    { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' } } }
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  res.status(200).json({
    success: true,
    data: {
      total: totalOrders,
      pending: pendingOrders,
      confirmed: confirmedOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
      totalRevenue
    }
  });
});

// @desc    Get orders pending payment (paymentStatus: 'Pending' or 'Partial')
// @route   GET /api/orders/pending-payment
// @access  Private/Admin
exports.getOrdersPendingPayment = asyncHandler(async (req, res, next) => {
  // Find orders that have pending or partial payment status
  const orders = await Order.find({
    paymentStatus: { $in: ['Pending', 'Partial'] },
    orderStatus: { $nin: ['Cancelled', 'Refunded'] } // Exclude cancelled/refunded orders
  })
    .populate('buyer', 'name email phone companyName profileImage')
    .populate({
      path: 'orderItems.product',
      select: 'name images sku price'
    })
    .select('orderId orderItems buyer shippingAddress pricing orderStatus paymentStatus paymentTerms advancePayment remainingPayment createdAt')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get orders pending shipment (Pending/Awaiting Payment/Processing/Confirmed status without shipmentInfo)
// @route   GET /api/orders/pending-shipment
// @access  Private/Admin
exports.getOrdersPendingShipment = asyncHandler(async (req, res, next) => {
  const Shipment = require('../models/Shipment');

  // Find orders that already have shipments created (regardless of shipmentInfo field)
  const ordersWithShipments = await Shipment.distinct('order');

  // Find orders that are NOT delivered/cancelled/shipped and don't already have a shipment
  const orders = await Order.find({
    orderStatus: { $in: ['Pending', 'Awaiting Payment', 'Processing', 'Confirmed'] },
    _id: { $nin: ordersWithShipments },
    $or: [
      { shipmentInfo: null },
      { shipmentInfo: { $exists: false } }
    ]
  })
    .populate('buyer', 'name email phone profileImage')
    .populate({
      path: 'orderItems.product',
      select: 'name images sku price'
    })
    .select('orderId orderItems buyer shippingAddress pricing orderStatus paymentStatus createdAt')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});
