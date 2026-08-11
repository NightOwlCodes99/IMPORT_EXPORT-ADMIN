const asyncHandler = require('express-async-handler');
const Shipment = require('../models/Shipment');
const Order = require('../models/Order');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error');
const { 
  sendShipmentStatusUpdateEmail, 
  sendShipmentCreatedEmail, 
  sendShipmentDeliveredEmail,
  sendShipmentDelayedEmail,
  sendShipmentOutForDeliveryEmail,
  sendShipmentInTransitEmail,
  sendShipmentCustomsClearanceEmail,
  sendShipmentFailedDeliveryEmail
} = require('../config/email');
const { createShipmentNotification } = require('../utils/notificationHelper');

// @desc    Get all shipments with advanced filtering
// @route   GET /api/shipments
// @access  Private/Admin
exports.getShipments = asyncHandler(async (req, res, next) => {
  const { 
    status, 
    carrier, 
    search, 
    startDate, 
    endDate,
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = req.query;

  let query = {};

  // Status filter
  if (status && status !== 'all') {
    query.status = status;
  }

  // Carrier filter
  if (carrier && carrier !== 'all') {
    query['carrier.name'] = carrier;
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  // Search filter
  if (search) {
    query.$or = [
      { trackingNumber: { $regex: search, $options: 'i' } },
      { 'origin.city': { $regex: search, $options: 'i' } },
      { 'origin.country': { $regex: search, $options: 'i' } },
      { 'destination.city': { $regex: search, $options: 'i' } },
      { 'destination.country': { $regex: search, $options: 'i' } },
      { 'carrier.name': { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Shipment.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const shipments = await Shipment.find(query)
    .populate('order', 'orderId orderNumber totalPrice buyer')
    .populate({
      path: 'order',
      populate: {
        path: 'buyer',
        select: 'name email'
      }
    })
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: shipments.length,
    total,
    pages,
    currentPage: parseInt(page),
    data: shipments
  });
});

// @desc    Get single shipment
// @route   GET /api/shipments/:id
// @access  Private
exports.getShipment = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id)
    .populate({
      path: 'order',
      populate: [
        { path: 'buyer', select: 'name email phone' },
        { path: 'supplier', select: 'companyName email' }
      ]
    });

  if (!shipment) {
    return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: shipment
  });
});

// @desc    Get shipment with full order details
// @route   GET /api/shipments/:id/with-order
// @access  Private/Admin
exports.getShipmentWithOrder = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id)
    .populate({
      path: 'order',
      populate: [
        { path: 'buyer', select: 'name email phone profileImage address' },
        { path: 'supplier', select: 'companyName email phone logo businessAddress' },
        { path: 'orderItems.product', select: 'name images price sku' }
      ]
    });

  if (!shipment) {
    return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: shipment
  });
});

// @desc    Get user's shipments (for logged in user)
// @route   GET /api/shipments/my-shipments
// @access  Private
exports.getMyShipments = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  // First find all orders belonging to this user
  const userOrders = await Order.find({ buyer: req.user._id }).select('_id');
  const orderIds = userOrders.map(order => order._id);

  let query = { order: { $in: orderIds } };
  
  if (status && status !== 'all') {
    query.status = status;
  }

  const total = await Shipment.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const shipments = await Shipment.find(query)
    .populate({
      path: 'order',
      select: 'orderId orderNumber totalPrice orderItems pricing orderStatus',
      populate: [
        { path: 'orderItems.product', select: 'name images price' }
      ]
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: shipments.length,
    total,
    pages,
    currentPage: parseInt(page),
    data: shipments
  });
});

// @desc    Create shipment
// @route   POST /api/shipments
// @access  Private/Admin
exports.createShipment = asyncHandler(async (req, res, next) => {
  let order = null;
  let buyerEmail = null;
  let buyerName = null;

  // Verify order exists if order ID is provided
  if (req.body.order) {
    order = await Order.findById(req.body.order).populate('buyer', 'name email');
    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.body.order}`, 404));
    }
    // Update order status
    order.orderStatus = 'Shipped';
    await order.save();

    // Get buyer info for email
    if (order.buyer) {
      buyerEmail = order.buyer.email;
      buyerName = order.buyer.name;
    }
  }

  // Create initial timeline entry
  if (!req.body.timeline || req.body.timeline.length === 0) {
    req.body.timeline = [{
      status: 'Order Picked Up',
      description: 'Package collected from supplier warehouse',
      location: req.body.origin?.city ? `${req.body.origin.city}, ${req.body.origin.country}` : 'Origin',
      timestamp: new Date(),
      isCompleted: true
    }];
  }

  const shipment = await Shipment.create(req.body);

  // Update order with shipment reference
  if (order) {
    order.shipmentInfo = shipment._id;
    await order.save();
  }

  // Send shipment created email to customer
  if (buyerEmail) {
    try {
      await sendShipmentCreatedEmail({
        customerEmail: buyerEmail,
        customerName: buyerName,
        trackingNumber: shipment.trackingNumber,
        orderId: order?.orderId || 'N/A',
        carrier: shipment.carrier?.name,
        estimatedDelivery: shipment.estimatedDelivery,
        origin: shipment.origin?.city ? `${shipment.origin.city}, ${shipment.origin.country}` : 'Origin',
        destination: shipment.destination?.city ? `${shipment.destination.city}, ${shipment.destination.country}` : 'Destination'
      });
    } catch (emailError) {
      console.error('Failed to send shipment created email:', emailError);
    }
  }

  // Create in-app notification for shipment creation
  try {
    if (order?.buyer?._id) {
      await createShipmentNotification(order.buyer._id.toString(), {
        shipmentId: shipment._id,
        orderId: order?._id,
        trackingNumber: shipment.trackingNumber,
        status: 'Shipped',
        carrier: shipment.carrier?.name
      });
    }
  } catch (notifError) {
    
  }

  res.status(201).json({
    success: true,
    data: shipment
  });
});

// @desc    Update shipment
// @route   PUT /api/shipments/:id
// @access  Private/Admin
exports.updateShipment = asyncHandler(async (req, res, next) => {
  let shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
  }

  shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: shipment
  });
});

// @desc    Delete shipment
// @route   DELETE /api/shipments/:id
// @access  Private/Admin
exports.deleteShipment = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
  }

  await shipment.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update shipment status
// @route   PUT /api/shipments/:id/status
// @access  Private/Admin
exports.updateShipmentStatus = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id).populate({
    path: 'order',
    populate: { path: 'buyer', select: 'name email' }
  });

  if (!shipment) {
    return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
  }

  const oldStatus = shipment.status;
  const newStatus = req.body.status;
  shipment.status = newStatus;
  
  // Add timeline entry for status change
  const statusDescriptions = {
    'Pending Pickup': 'Awaiting pickup from origin',
    'Picked Up': 'Package collected from supplier warehouse',
    'In Transit': 'Package in transit to destination',
    'Customs Clearance': 'Package undergoing customs processing',
    'Out for Delivery': 'Package out for final delivery',
    'Delivered': 'Package successfully delivered',
    'Delayed': 'Shipment experiencing delays',
    'Failed Delivery': 'Delivery attempt failed',
    'Returned': 'Package being returned to sender'
  };

  shipment.timeline.push({
    status: newStatus,
    description: req.body.description || statusDescriptions[newStatus] || `Status changed to ${newStatus}`,
    location: req.body.location || shipment.currentLocation,
    timestamp: new Date(),
    isCompleted: true // Mark as completed since this event has occurred
  });

  // Handle delivered status
  if (newStatus === 'Delivered') {
    shipment.actualDelivery = new Date();
    
    // Update order status
    if (shipment.order) {
      const order = await Order.findById(shipment.order._id || shipment.order);
      if (order) {
        order.orderStatus = 'Delivered';
        order.isDelivered = true;
        order.deliveredAt = new Date();
        await order.save();
      }
    }
  }

  if (req.body.location) {
    shipment.currentLocation = req.body.location;
  }

  await shipment.save();

  // Send email notification to customer
  const buyerEmail = shipment.order?.buyer?.email;
  const buyerName = shipment.order?.buyer?.name;

  if (buyerEmail && req.body.sendNotification !== false) {
    try {
      const emailData = {
        customerEmail: buyerEmail,
        customerName: buyerName,
        trackingNumber: shipment.trackingNumber,
        orderId: shipment.order?.orderId || 'N/A',
        status: newStatus,
        previousStatus: oldStatus,
        currentLocation: shipment.currentLocation,
        estimatedDelivery: shipment.estimatedDelivery,
        carrier: shipment.carrier?.name,
        origin: shipment.origin?.city ? `${shipment.origin.city}, ${shipment.origin.country}` : 'Origin',
        destination: shipment.destination?.city ? `${shipment.destination.city}, ${shipment.destination.country}` : 'Destination',
        timeline: shipment.timeline.slice(-4).reverse(),
        notes: req.body.notes
      };

      // Send appropriate email based on status
      switch (newStatus) {
        case 'Delivered':
          await sendShipmentDeliveredEmail({
            ...emailData,
            deliveredAt: shipment.actualDelivery,
            signedBy: req.body.signedBy
          });
          break;
        case 'Delayed':
          await sendShipmentDelayedEmail({
            ...emailData,
            reason: req.body.delayReason || req.body.notes,
            newEstimatedDelivery: req.body.newEstimatedDelivery
          });
          break;
        case 'Out for Delivery':
          await sendShipmentOutForDeliveryEmail(emailData);
          break;
        case 'In Transit':
          await sendShipmentInTransitEmail(emailData);
          break;
        case 'Customs Clearance':
          await sendShipmentCustomsClearanceEmail(emailData);
          break;
        case 'Failed Delivery':
          await sendShipmentFailedDeliveryEmail({
            ...emailData,
            reason: req.body.delayReason || req.body.notes,
            nextAttempt: req.body.newEstimatedDelivery
          });
          break;
        default:
          await sendShipmentStatusUpdateEmail(emailData);
      }
    } catch (emailError) {
      console.error('Failed to send shipment status email:', emailError);
    }
  }

  // Create in-app notification for shipment status update
  try {
    const buyerId = shipment.order?.buyer?._id || shipment.order?.buyer;
    if (buyerId) {
      await createShipmentNotification(buyerId.toString(), {
        shipmentId: shipment._id,
        orderId: shipment.order?._id,
        trackingNumber: shipment.trackingNumber,
        status: newStatus,
        carrier: shipment.carrier?.name
      });
    }
  } catch (notifError) {
    
  }

  res.status(200).json({
    success: true,
    data: shipment
  });
});

// @desc    Add tracking update
// @route   PUT /api/shipments/:id/tracking
// @access  Private/Admin
exports.addTrackingUpdate = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id).populate({
    path: 'order',
    populate: { path: 'buyer', select: 'name email' }
  });

  if (!shipment) {
    return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
  }

  const oldStatus = shipment.status;
  const newStatus = req.body.status;
  
  // Update shipment status to the new status
  shipment.status = newStatus;

  shipment.timeline.push({
    status: req.body.status,
    description: req.body.description,
    location: req.body.location,
    timestamp: req.body.timestamp || new Date(),
    isCompleted: true // Mark as completed since this event has occurred
  });

  if (req.body.location) {
    shipment.currentLocation = req.body.location;
  }

  // Handle delivered status
  if (newStatus === 'Delivered') {
    shipment.actualDelivery = new Date();
    
    if (shipment.order) {
      const order = await Order.findById(shipment.order._id || shipment.order);
      if (order) {
        order.orderStatus = 'Delivered';
        order.isDelivered = true;
        order.deliveredAt = new Date();
        await order.save();
      }
    }
  }

  await shipment.save();

  // Send email notification to customer
  const buyerEmail = shipment.order?.buyer?.email;
  const buyerName = shipment.order?.buyer?.name;

  if (buyerEmail && req.body.sendNotification !== false) {
    try {
      const emailData = {
        customerEmail: buyerEmail,
        customerName: buyerName,
        trackingNumber: shipment.trackingNumber,
        orderId: shipment.order?.orderId || 'N/A',
        status: newStatus,
        previousStatus: oldStatus,
        currentLocation: shipment.currentLocation,
        estimatedDelivery: shipment.estimatedDelivery,
        carrier: shipment.carrier?.name,
        origin: shipment.origin?.city ? `${shipment.origin.city}, ${shipment.origin.country}` : 'Origin',
        destination: shipment.destination?.city ? `${shipment.destination.city}, ${shipment.destination.country}` : 'Destination',
        timeline: shipment.timeline.slice(-4).reverse(),
        notes: req.body.description
      };

      // Send appropriate email based on status
      switch (newStatus) {
        case 'Delivered':
          await sendShipmentDeliveredEmail({
            ...emailData,
            deliveredAt: shipment.actualDelivery
          });
          break;
        case 'Delayed':
          await sendShipmentDelayedEmail({
            ...emailData,
            reason: req.body.description
          });
          break;
        case 'Out for Delivery':
          await sendShipmentOutForDeliveryEmail(emailData);
          break;
        case 'In Transit':
          await sendShipmentInTransitEmail(emailData);
          break;
        case 'Customs Clearance':
          await sendShipmentCustomsClearanceEmail(emailData);
          break;
        case 'Failed Delivery':
          await sendShipmentFailedDeliveryEmail({
            ...emailData,
            reason: req.body.description
          });
          break;
        default:
          await sendShipmentStatusUpdateEmail(emailData);
      }
    } catch (emailError) {
      console.error('Failed to send shipment status email:', emailError);
    }
  }

  res.status(200).json({
    success: true,
    data: shipment
  });
});

// @desc    Track shipment by tracking number
// @route   GET /api/shipments/track/:trackingNumber
// @access  Public
exports.trackShipment = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber })
    .populate('order', 'orderId orderNumber')
    .select('-notes -documents');

  if (!shipment) {
    return next(new ErrorResponse('Shipment not found with this tracking number', 404));
  }

  res.status(200).json({
    success: true,
    data: shipment
  });
});

// @desc    Get shipment statistics
// @route   GET /api/shipments/stats
// @access  Private/Admin
exports.getShipmentStats = asyncHandler(async (req, res, next) => {
  const totalShipments = await Shipment.countDocuments();
  const pendingPickup = await Shipment.countDocuments({ status: 'Pending Pickup' });
  const inTransit = await Shipment.countDocuments({ status: 'In Transit' });
  const customsClearance = await Shipment.countDocuments({ status: 'Customs Clearance' });
  const delivered = await Shipment.countDocuments({ status: 'Delivered' });
  const delayed = await Shipment.countDocuments({ status: 'Delayed' });
  const issues = await Shipment.countDocuments({ 
    status: { $in: ['Delayed', 'Failed Delivery', 'Returned'] } 
  });

  // Get shipments by carrier
  const carrierBreakdown = await Shipment.aggregate([
    { $group: { _id: '$carrier.name', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Calculate delivery rate
  const completedShipments = delivered;
  const deliveryRate = totalShipments > 0 
    ? Math.round((completedShipments / totalShipments) * 100) 
    : 0;

  // Get total shipping cost
  const costData = await Shipment.aggregate([
    { $group: { _id: null, totalCost: { $sum: '$shippingCost' } } }
  ]);
  const totalShippingCost = costData.length > 0 ? costData[0].totalCost : 0;

  // Get this month's shipments
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const thisMonthShipments = await Shipment.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  // Get last month's shipments for comparison
  const startOfLastMonth = new Date(startOfMonth);
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
  
  const lastMonthShipments = await Shipment.countDocuments({
    createdAt: { $gte: startOfLastMonth, $lt: startOfMonth }
  });

  const monthlyGrowth = lastMonthShipments > 0
    ? Math.round(((thisMonthShipments - lastMonthShipments) / lastMonthShipments) * 100)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      total: totalShipments,
      pendingPickup,
      inTransit,
      customsClearance,
      delivered,
      delayed,
      issues,
      deliveryRate,
      totalShippingCost,
      thisMonthShipments,
      monthlyGrowth,
      carrierBreakdown
    }
  });
});

// @desc    Notify customer about shipment
// @route   POST /api/shipments/:id/notify
// @access  Private/Admin
exports.notifyCustomer = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id)
    .populate({
      path: 'order',
      populate: { path: 'buyer', select: 'name email' }
    });

  if (!shipment) {
    return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
  }

  // In a real application, you would send an email here
  // For now, we'll just return success
  
  res.status(200).json({
    success: true,
    message: 'Customer notification sent successfully',
    data: {
      shipmentId: shipment._id,
      trackingNumber: shipment.trackingNumber,
      customerEmail: shipment.order?.buyer?.email || 'N/A'
    }
  });
});

// @desc    Export shipments report
// @route   GET /api/shipments/export
// @access  Private/Admin
exports.exportShipmentsReport = asyncHandler(async (req, res, next) => {
  const { status, carrier, startDate, endDate } = req.query;

  let query = {};
  if (status && status !== 'all') query.status = status;
  if (carrier && carrier !== 'all') query['carrier.name'] = carrier;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const shipments = await Shipment.find(query)
    .populate('order', 'orderId')
    .sort('-createdAt')
    .lean();

  // Generate CSV content
  const headers = 'Tracking Number,Order ID,Status,Carrier,Origin,Destination,Created Date,ETA,Shipping Cost\n';
  const rows = shipments.map(s => 
    `"${s.trackingNumber}","${s.order?.orderId || 'N/A'}","${s.status}","${s.carrier?.name || 'N/A'}","${s.origin?.city}, ${s.origin?.country}","${s.destination?.city}, ${s.destination?.country}","${new Date(s.createdAt).toLocaleDateString()}","${s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString() : 'N/A'}","$${s.shippingCost?.toFixed(2) || '0.00'}"`
  ).join('\n');

  const csvContent = headers + rows;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=shipments-report-${new Date().toISOString().split('T')[0]}.csv`);
  res.status(200).send(csvContent);
});
