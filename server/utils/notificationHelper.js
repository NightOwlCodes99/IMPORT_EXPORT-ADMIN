const Notification = require('../models/Notification');

/**
 * Notification Helper - Creates in-app notifications for various events
 * Used across controllers to create consistent notifications
 */

// =============================================
// ORDER NOTIFICATIONS
// =============================================

const createOrderNotification = async (userId, { orderId, orderNumber, status, totalAmount }) => {
  const statusConfig = {
    'Pending': { title: 'Order Placed', message: `Your order #${orderNumber || orderId} has been placed successfully.`, icon: 'shopping-cart', color: 'blue', priority: 'medium' },
    'Processing': { title: 'Order Processing', message: `Your order #${orderNumber || orderId} is now being processed.`, icon: 'cog', color: 'blue', priority: 'medium' },
    'Confirmed': { title: 'Order Confirmed', message: `Your order #${orderNumber || orderId} has been confirmed.`, icon: 'check-circle', color: 'green', priority: 'medium' },
    'Shipped': { title: 'Order Shipped', message: `Your order #${orderNumber || orderId} has been shipped!`, icon: 'truck', color: 'purple', priority: 'high' },
    'Delivered': { title: 'Order Delivered', message: `Your order #${orderNumber || orderId} has been delivered.`, icon: 'package', color: 'green', priority: 'medium' },
    'Cancelled': { title: 'Order Cancelled', message: `Your order #${orderNumber || orderId} has been cancelled.`, icon: 'x-circle', color: 'red', priority: 'high' },
    'Refunded': { title: 'Order Refunded', message: `Your order #${orderNumber || orderId} has been refunded.`, icon: 'dollar-sign', color: 'orange', priority: 'high' },
  };

  const config = statusConfig[status] || statusConfig['Pending'];

  try {
    return await Notification.create({
      user: userId,
      type: 'order',
      title: config.title,
      message: config.message,
      icon: config.icon,
      color: config.color,
      link: `/dashboard/orders`,
      priority: config.priority,
      metadata: { orderId, orderNumber, status, totalAmount }
    });
  } catch (error) {
    console.error('Failed to create order notification:', error.message);
  }
};

// Admin notification for new orders
const createAdminOrderNotification = async (adminUserId, { orderId, orderNumber, customerName, totalAmount }) => {
  try {
    return await Notification.create({
      user: adminUserId,
      type: 'order',
      title: 'New Order Received',
      message: `New order #${orderNumber || orderId} from ${customerName} worth $${totalAmount?.toFixed(2) || '0.00'}.`,
      icon: 'shopping-cart',
      color: 'green',
      link: `/admin/orders`,
      priority: 'high',
      metadata: { orderId, orderNumber, customerName, totalAmount }
    });
  } catch (error) {
    console.error('Failed to create admin order notification:', error.message);
  }
};

// =============================================
// PAYMENT NOTIFICATIONS
// =============================================

const createPaymentNotification = async (userId, { paymentId, orderId, amount, status, method }) => {
  const statusConfig = {
    'completed': { title: 'Payment Received', message: `Payment of $${amount?.toFixed(2) || '0.00'} received successfully.`, icon: 'credit-card', color: 'green', priority: 'high' },
    'pending': { title: 'Payment Pending', message: `Your payment of $${amount?.toFixed(2) || '0.00'} is being processed.`, icon: 'clock', color: 'yellow', priority: 'medium' },
    'failed': { title: 'Payment Failed', message: `Payment of $${amount?.toFixed(2) || '0.00'} has failed. Please try again.`, icon: 'alert-circle', color: 'red', priority: 'high' },
    'refunded': { title: 'Refund Processed', message: `A refund of $${amount?.toFixed(2) || '0.00'} has been processed.`, icon: 'dollar-sign', color: 'orange', priority: 'high' },
  };

  const config = statusConfig[status] || statusConfig['pending'];

  try {
    return await Notification.create({
      user: userId,
      type: 'payment',
      title: config.title,
      message: config.message,
      icon: config.icon,
      color: config.color,
      link: `/dashboard/orders`,
      priority: config.priority,
      metadata: { paymentId, orderId, amount, status, method }
    });
  } catch (error) {
    console.error('Failed to create payment notification:', error.message);
  }
};

const createAdminPaymentNotification = async (adminUserId, { paymentId, orderId, amount, customerName, method }) => {
  try {
    return await Notification.create({
      user: adminUserId,
      type: 'payment',
      title: 'Payment Received',
      message: `Payment of $${amount?.toFixed(2) || '0.00'} received from ${customerName} via ${method || 'unknown'}.`,
      icon: 'credit-card',
      color: 'green',
      link: `/admin/payments`,
      priority: 'high',
      metadata: { paymentId, orderId, amount, customerName, method }
    });
  } catch (error) {
    console.error('Failed to create admin payment notification:', error.message);
  }
};

// =============================================
// SHIPMENT NOTIFICATIONS
// =============================================

const createShipmentNotification = async (userId, { shipmentId, orderId, trackingNumber, status, carrier }) => {
  const statusConfig = {
    'Processing': { title: 'Shipment Created', message: `Shipment for your order is being prepared. Tracking: ${trackingNumber || 'N/A'}`, icon: 'package', color: 'blue', priority: 'medium' },
    'Shipped': { title: 'Order Shipped', message: `Your order has been shipped! Tracking: ${trackingNumber || 'N/A'}`, icon: 'truck', color: 'purple', priority: 'high' },
    'In Transit': { title: 'Shipment In Transit', message: `Your shipment is on its way. Tracking: ${trackingNumber || 'N/A'}`, icon: 'truck', color: 'blue', priority: 'medium' },
    'Out for Delivery': { title: 'Out for Delivery', message: `Your package is out for delivery today!`, icon: 'map-pin', color: 'green', priority: 'high' },
    'Delivered': { title: 'Package Delivered', message: `Your package has been delivered successfully.`, icon: 'check-circle', color: 'green', priority: 'high' },
    'Delayed': { title: 'Shipment Delayed', message: `Your shipment has been delayed. We apologize for the inconvenience.`, icon: 'alert-triangle', color: 'orange', priority: 'high' },
    'Failed': { title: 'Delivery Failed', message: `Delivery attempt failed. Please contact support.`, icon: 'x-circle', color: 'red', priority: 'high' },
    'Customs': { title: 'In Customs', message: `Your shipment is being processed through customs.`, icon: 'shield', color: 'yellow', priority: 'medium' },
  };

  const config = statusConfig[status] || statusConfig['Processing'];

  try {
    return await Notification.create({
      user: userId,
      type: 'shipment',
      title: config.title,
      message: config.message,
      icon: config.icon,
      color: config.color,
      link: `/dashboard/shipments`,
      priority: config.priority,
      metadata: { shipmentId, orderId, trackingNumber, status, carrier }
    });
  } catch (error) {
    console.error('Failed to create shipment notification:', error.message);
  }
};

// =============================================
// QUOTE NOTIFICATIONS
// =============================================

const createQuoteNotification = async (userId, { quoteId, quoteNumber, status, productName }) => {
  const statusConfig = {
    'submitted': { title: 'Quote Request Submitted', message: `Your quote request ${quoteNumber ? '#' + quoteNumber : ''} for ${productName || 'products'} has been submitted.`, icon: 'file-text', color: 'blue', priority: 'medium' },
    'received': { title: 'Quote Response Received', message: `You have received a response for your quote request ${quoteNumber ? '#' + quoteNumber : ''}.`, icon: 'file-text', color: 'green', priority: 'high' },
    'accepted': { title: 'Quote Accepted', message: `Your quote ${quoteNumber ? '#' + quoteNumber : ''} has been accepted!`, icon: 'check-circle', color: 'green', priority: 'high' },
    'rejected': { title: 'Quote Rejected', message: `Your quote ${quoteNumber ? '#' + quoteNumber : ''} has been rejected.`, icon: 'x-circle', color: 'red', priority: 'medium' },
    'expired': { title: 'Quote Expired', message: `Your quote ${quoteNumber ? '#' + quoteNumber : ''} has expired.`, icon: 'clock', color: 'orange', priority: 'low' },
  };

  const config = statusConfig[status] || statusConfig['submitted'];

  try {
    return await Notification.create({
      user: userId,
      type: 'quote',
      title: config.title,
      message: config.message,
      icon: config.icon,
      color: config.color,
      link: `/dashboard/quotes`,
      priority: config.priority,
      metadata: { quoteId, quoteNumber, status, productName }
    });
  } catch (error) {
    console.error('Failed to create quote notification:', error.message);
  }
};

const createAdminQuoteNotification = async (adminUserId, { quoteId, quoteNumber, customerName, productName }) => {
  try {
    return await Notification.create({
      user: adminUserId,
      type: 'quote',
      title: 'New Quote Request',
      message: `New quote request ${quoteNumber ? '#' + quoteNumber : ''} from ${customerName} for ${productName || 'products'}.`,
      icon: 'file-text',
      color: 'purple',
      link: `/admin/quotes`,
      priority: 'high',
      metadata: { quoteId, quoteNumber, customerName, productName }
    });
  } catch (error) {
    console.error('Failed to create admin quote notification:', error.message);
  }
};

// =============================================
// REVIEW NOTIFICATIONS
// =============================================

const createReviewNotification = async (userId, { reviewId, productName, rating }) => {
  try {
    return await Notification.create({
      user: userId,
      type: 'review',
      title: 'Review Published',
      message: `Your ${rating}-star review for "${productName}" has been published.`,
      icon: 'star',
      color: 'yellow',
      link: `/dashboard/orders`,
      priority: 'low',
      metadata: { reviewId, productName, rating }
    });
  } catch (error) {
    console.error('Failed to create review notification:', error.message);
  }
};

// =============================================
// PRODUCT NOTIFICATIONS
// =============================================

const createProductNotification = async (userId, { productId, productName, action }) => {
  const actionConfig = {
    'approved': { title: 'Product Approved', message: `Your product "${productName}" has been approved and is now live.`, color: 'green', priority: 'high' },
    'rejected': { title: 'Product Rejected', message: `Your product "${productName}" has been rejected. Please review and resubmit.`, color: 'red', priority: 'high' },
    'low_stock': { title: 'Low Stock Alert', message: `"${productName}" is running low on stock.`, color: 'orange', priority: 'high' },
    'out_of_stock': { title: 'Out of Stock', message: `"${productName}" is now out of stock.`, color: 'red', priority: 'high' },
  };

  const config = actionConfig[action] || { title: 'Product Update', message: `Update on your product "${productName}".`, color: 'blue', priority: 'medium' };

  try {
    return await Notification.create({
      user: userId,
      type: 'product',
      title: config.title,
      message: config.message,
      icon: 'package',
      color: config.color,
      link: action === 'approved' || action === 'rejected' ? `/dashboard/my-products` : `/admin/products`,
      priority: config.priority,
      metadata: { productId, productName, action }
    });
  } catch (error) {
    console.error('Failed to create product notification:', error.message);
  }
};

// =============================================
// MESSAGE / SUPPORT TICKET NOTIFICATIONS
// =============================================

const createMessageNotification = async (userId, { ticketId, subject, from }) => {
  try {
    return await Notification.create({
      user: userId,
      type: 'message',
      title: 'New Message',
      message: `You have a new message regarding "${subject}" from ${from || 'Support Team'}.`,
      icon: 'message-circle',
      color: 'blue',
      link: `/dashboard/messages`,
      priority: 'medium',
      metadata: { ticketId, subject, from }
    });
  } catch (error) {
    console.error('Failed to create message notification:', error.message);
  }
};

const createAdminMessageNotification = async (adminUserId, { ticketId, subject, customerName }) => {
  try {
    return await Notification.create({
      user: adminUserId,
      type: 'message',
      title: 'New Support Ticket',
      message: `New support ticket "${subject}" from ${customerName}.`,
      icon: 'message-circle',
      color: 'blue',
      link: `/admin/support-tickets`,
      priority: 'medium',
      metadata: { ticketId, subject, customerName }
    });
  } catch (error) {
    console.error('Failed to create admin message notification:', error.message);
  }
};

// =============================================
// SYSTEM NOTIFICATIONS
// =============================================

const createSystemNotification = async (userId, { title, message, link, priority = 'medium' }) => {
  try {
    return await Notification.create({
      user: userId,
      type: 'system',
      title,
      message,
      icon: 'info',
      color: 'blue',
      link: link || '/dashboard',
      priority,
      metadata: {}
    });
  } catch (error) {
    console.error('Failed to create system notification:', error.message);
  }
};

// =============================================
// SUPPLIER NOTIFICATIONS
// =============================================

const createSupplierNotification = async (userId, { action, productName, orderId }) => {
  const actionConfig = {
    'new_order': { title: 'New Supplier Order', message: `You have a new order #${orderId} to fulfill.`, icon: 'shopping-bag', color: 'green', priority: 'high', link: '/dashboard/orders' },
    'product_approved': { title: 'Product Approved', message: `Your product "${productName}" has been approved.`, icon: 'check-circle', color: 'green', priority: 'high', link: '/dashboard/my-products' },
    'product_rejected': { title: 'Product Rejected', message: `Your product "${productName}" has been rejected.`, icon: 'x-circle', color: 'red', priority: 'high', link: '/dashboard/my-products' },
    'profile_updated': { title: 'Profile Updated', message: 'Your supplier profile has been updated successfully.', icon: 'user', color: 'blue', priority: 'low', link: '/dashboard/business-profile' },
  };

  const config = actionConfig[action] || { title: 'Supplier Update', message: 'You have a new supplier update.', icon: 'info', color: 'blue', priority: 'medium', link: '/dashboard' };

  try {
    return await Notification.create({
      user: userId,
      type: 'system',
      title: config.title,
      message: config.message,
      icon: config.icon,
      color: config.color,
      link: config.link,
      priority: config.priority,
      metadata: { action, productName, orderId }
    });
  } catch (error) {
    console.error('Failed to create supplier notification:', error.message);
  }
};

// =============================================
// CONTACT NOTIFICATIONS
// =============================================

const createAdminContactNotification = async ({ contactId, name, email, subject, type }) => {
  const typeLabels = {
    'general': 'Contact Message',
    'quote': 'Quote Inquiry',
    'support': 'Support Request',
    'partnership': 'Partnership Inquiry',
    'complaint': 'Complaint',
    'meeting': 'Meeting Request',
    'query': 'Query',
  };

  const label = typeLabels[type] || 'Contact Message';

  try {
    await notifyAllAdmins({
      type: 'message',
      title: `New ${label}`,
      message: `${name} (${email}) sent a new ${label.toLowerCase()}: "${subject || 'No subject'}".`,
      icon: 'mail',
      color: 'blue',
      link: `/admin/contacts`,
      priority: 'high',
      metadata: { contactId, name, email, subject, type }
    });
  } catch (error) {
    console.error('Failed to create admin contact notification:', error.message);
  }
};

// =============================================
// BULK NOTIFY ADMINS
// =============================================

const notifyAllAdmins = async (notificationData) => {
  const User = require('../models/User');
  try {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    const promises = admins.map(admin => 
      Notification.create({ ...notificationData, user: admin._id })
    );
    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Failed to notify admins:', error.message);
  }
};

module.exports = {
  createOrderNotification,
  createAdminOrderNotification,
  createPaymentNotification,
  createAdminPaymentNotification,
  createShipmentNotification,
  createQuoteNotification,
  createAdminQuoteNotification,
  createReviewNotification,
  createProductNotification,
  createMessageNotification,
  createAdminMessageNotification,
  createSystemNotification,
  createSupplierNotification,
  createAdminContactNotification,
  notifyAllAdmins,
};
