



const nodemailer = require('nodemailer');
const { verificationEmailTemplate } = require('../mails/templates/verificationEmail');
const { passwordResetEmailTemplate } = require('../mails/templates/passwordResetEmail');
const { welcomeEmailTemplate } = require('../mails/templates/welcomeEmail');
const { accountSuspendedEmailTemplate } = require('../mails/templates/accountSuspendedEmail');
const { accountReactivatedEmailTemplate } = require('../mails/templates/accountReactivatedEmail');
const { accountDeletedEmailTemplate } = require('../mails/templates/accountDeletedEmail');
const { orderStatusUpdateTemplate } = require('../mails/templates/orderStatusUpdateEmail');
const { orderCreatedTemplate } = require('../mails/templates/orderCreatedEmail');
const { quoteReceivedTemplate } = require('../mails/templates/quoteReceivedEmail');
const { quoteResponseTemplate } = require('../mails/templates/quoteResponseEmail');
const { contactBuyerEmailTemplate } = require('../mails/templates/contactBuyerEmail');
const { 
  shipmentStatusUpdateTemplate, 
  shipmentCreatedTemplate, 
  shipmentDeliveredTemplate,
  shipmentDelayedTemplate,
  shipmentOutForDeliveryTemplate,
  shipmentInTransitTemplate,
  shipmentCustomsClearanceTemplate,
  shipmentFailedDeliveryTemplate
} = require('../mails/templates/shipmentStatusUpdateEmail');
const { supplierProductSubmittedEmailTemplate } = require('../mails/templates/supplierProductSubmittedEmail');
const { supplierProductApprovedEmailTemplate } = require('../mails/templates/supplierProductApprovedEmail');
const { supplierProductRejectedEmailTemplate } = require('../mails/templates/supplierProductRejectedEmail');
const { supplierNewOrderEmailTemplate } = require('../mails/templates/supplierNewOrderEmail');
const { supplierProfileUpdatedEmailTemplate } = require('../mails/templates/supplierProfileUpdatedEmail');
const { checkoutConfirmationTemplate } = require('../mails/templates/checkoutConfirmationEmail');
const { adminOTPEmailTemplate } = require('../mails/templates/adminOTPEmail');

// Resolve mail config from multiple env naming conventions used in this project.
const getMailConfig = () => {
  const host = (process.env.MAIL_HOST || process.env.SMTP_HOST || 'smtppro.zoho.in').trim();
  const port = Number(process.env.MAIL_PORT || process.env.SMTP_PORT || 587);
  const user = (process.env.MAIL_USER || process.env.SMTP_EMAIL || process.env.EMAIL_USER || '').trim();
  const pass = (process.env.MAIL_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || '').trim();

  return { host, port, user, pass };
};

// Optional dedicated SMTP config for admin/security emails.
const getAdminMailConfig = () => {
  const base = getMailConfig();
  const host = (process.env.ADMIN_MAIL_HOST || process.env.ADMIN_SMTP_HOST || base.host || '').trim();
  const port = Number(process.env.ADMIN_MAIL_PORT || process.env.ADMIN_SMTP_PORT || base.port || 587);
  const user = (process.env.ADMIN_MAIL_USER || process.env.ADMIN_SMTP_EMAIL || '').trim();
  const pass = (process.env.ADMIN_MAIL_PASS || process.env.ADMIN_SMTP_PASSWORD || '').trim();

  // Use dedicated admin SMTP only when both username and password are provided.
  if (user && pass) {
    return { host, port, user, pass };
  }

  return base;
};

const ADMIN_FROM_EMAIL = (process.env.ADMIN_FROM_EMAIL || 'administration@nexarionimpex.com').trim();

// ============================================
// FROM ADDRESS MAPPING
// ============================================
const FROM = {
  info:           `"Nexarion Global Exports" <info@nexarionimpex.com>`,
  orders:         `"Nexarion Orders" <orders@nexarionimpex.com>`,
  contact:        `"Nexarion Global Exports" <contact@nexarionimpex.com>`,
  support:        `"Nexarion Support" <support@nexarionimpex.com>`,
  payments:       `"Nexarion Payments" <payments@nexarionimpex.com>`,
  sales:          `"Nexarion Sales" <sales@nexarionimpex.com>`,
  admin:          `"Nexarion Administration" <${ADMIN_FROM_EMAIL}>`
};

// Create nodemailer transporter
const createTransporter = (config = getMailConfig()) => {
  const { host, port, user, pass } = config;

  if (!user || !pass) {
    throw new Error(
      'SMTP credentials missing. Set MAIL_USER/MAIL_PASS (or SMTP_EMAIL/SMTP_PASSWORD).'
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Generic send email function with attachment support
exports.sendEmail = async ({ email, subject, html, text, attachments }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: FROM.info,
      to: email,
      subject: subject,
      html: html,
      text: text
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    await transporter.sendMail(mailOptions);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw error;
  }
};

// Send verification code email
exports.sendVerificationEmail = async (email, name, code) => {
  if (process.env.NODE_ENV === 'development') {}

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: FROM.info,
      to: email,
      subject: 'Email Verification Code - Nexarion',
      html: verificationEmailTemplate(name, code)
    };

    await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    if (process.env.NODE_ENV !== 'development') {
      throw error;
    }
  }
};

// Send Admin OTP email for secure login
exports.sendAdminOTPEmail = async (email, name, code) => {
  try {
    const transporter = createTransporter(getAdminMailConfig());

    const mailOptions = {
      from: FROM.admin,
      to: email,
      subject: '🔐 Admin Login OTP - Nexarion Global Exports',
      html: adminOTPEmailTemplate(name, code)
    };

    await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error('❌ Admin OTP email error:', error.message);
    if (process.env.NODE_ENV !== 'development') {
      throw error;
    }
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, name, resetLink) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.info,
    to: email,
    subject: 'Password Reset Request - Nexarion',
    html: passwordResetEmailTemplate(name, resetLink)
  };

  await transporter.sendMail(mailOptions);
};

// Send welcome email after successful verification
exports.sendWelcomeEmail = async (email, name, role) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.info,
    to: email,
    subject: 'Welcome to Nexarion Global Exports! 🎉',
    html: welcomeEmailTemplate(name, role)
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {}
};

// Send account suspended email
exports.sendAccountSuspendedEmail = async (email, name, reason = null) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.admin,
    to: email,
    subject: '⚠️ Your Nexarion Account Has Been Suspended',
    html: accountSuspendedEmailTemplate(name, reason)
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {}
};

// Send account reactivated email
exports.sendAccountReactivatedEmail = async (email, name) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.admin,
    to: email,
    subject: '🎉 Your Nexarion Account Has Been Reactivated!',
    html: accountReactivatedEmailTemplate(name)
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {}
};

// Send account deleted email
exports.sendAccountDeletedEmail = async (email, name) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.admin,
    to: email,
    subject: 'Goodbye from Nexarion - Account Deleted',
    html: accountDeletedEmailTemplate(name)
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {}
};

// Send order status update email
exports.sendOrderStatusUpdateEmail = async (orderData) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.orders,
    to: orderData.shippingAddress?.email,
    subject: `Order ${orderData.newStatus} - ${orderData.orderId}`,
    html: orderStatusUpdateTemplate(orderData)
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {}
};

// Send order created email
exports.sendOrderCreatedEmail = async (orderData) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.orders,
    to: orderData.shippingAddress?.email,
    subject: `Order Confirmed - ${orderData.orderId} 🎉`,
    html: orderCreatedTemplate(orderData)
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {}
};

// Send quote received email
exports.sendQuoteReceivedEmail = async (quoteData) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.sales,
    to: quoteData.customerInfo?.email,
    subject: `Quote Request Received - ${quoteData.quoteId}`,
    html: quoteReceivedTemplate(quoteData)
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {}
};

// Send admin created RFQ email to customer
exports.sendAdminRFQCreatedEmail = async (quoteData) => {
  const { adminRFQCreatedTemplate } = require('../mails/templates/adminRFQCreatedEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.sales,
    to: quoteData.customerEmail,
    subject: `Quote Request Created - ${quoteData.quoteId}`,
    html: adminRFQCreatedTemplate(quoteData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send quote response email
exports.sendQuoteResponseEmail = async (quoteData) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.sales,
    to: quoteData.customerInfo?.email,
    subject: `Your Quote is Ready! - ${quoteData.quoteId}`,
    html: quoteResponseTemplate(quoteData)
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {}
};

// Send quote accepted email to supplier
exports.sendQuoteAcceptedEmail = async (quoteData) => {
  const quoteAcceptedEmail = require('../mails/templates/quoteAcceptedEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.sales,
    to: quoteData.supplierEmail,
    subject: `🎉 Great News! Your Quote #${quoteData.quoteId} Has Been Accepted!`,
    html: quoteAcceptedEmail(quoteData)
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {}
};

// Send quote rejected email to supplier
exports.sendQuoteRejectedEmail = async (quoteData) => {
  const quoteRejectedEmail = require('../mails/templates/quoteRejectedEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.sales,
    to: quoteData.supplierEmail,
    subject: `Quote Update - #${quoteData.quoteId}`,
    html: quoteRejectedEmail(quoteData)
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {}
};

// Send quote rejection confirmation email to BUYER
exports.sendQuoteRejectionBuyerEmail = async (rejectionData) => {
  const quoteRejectionBuyerEmail = require('../mails/templates/quoteRejectionBuyerEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.sales,
    to: rejectionData.buyerEmail,
    subject: `Quote Rejection Confirmed - #${rejectionData.quoteId}`,
    html: quoteRejectionBuyerEmail(rejectionData)
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {}
};

// Send quote rejection notification email to ADMIN
exports.sendQuoteRejectionAdminEmail = async (rejectionData) => {
  const quoteRejectionAdminEmail = require('../mails/templates/quoteRejectionAdminEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.sales,
    to: rejectionData.adminEmail,
    subject: `⚠️ Quote Rejected by Buyer - #${rejectionData.quoteId} - Action Required`,
    html: quoteRejectionAdminEmail(rejectionData)
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {}
};

// Send contact buyer email (from admin to buyer)
exports.sendContactBuyerEmail = async (contactData) => {
  if (process.env.NODE_ENV === 'development') {}

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: FROM.contact,
      to: contactData.buyerEmail,
      subject: `${contactData.subject} - Quote ${contactData.quoteId}`,
      html: contactBuyerEmailTemplate(
        contactData.buyerName,
        contactData.subject,
        contactData.message,
        contactData.quoteId,
        contactData.adminName || 'Admin',
        contactData.responseDeadlineDays || 3
      )
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('❌ Contact buyer email failed:', error.message);
    if (process.env.NODE_ENV !== 'development') {
      throw error;
    }
    return { success: false, error: error.message };
  }
};

// Send shipment status update email
exports.sendShipmentStatusUpdateEmail = async (shipmentData) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.orders,
    to: shipmentData.customerEmail,
    subject: `🚚 Shipment Update: ${shipmentData.status} - ${shipmentData.trackingNumber}`,
    html: shipmentStatusUpdateTemplate(shipmentData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Send shipment created email
exports.sendShipmentCreatedEmail = async (shipmentData) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.orders,
    to: shipmentData.customerEmail,
    subject: `🎉 Your Order Has Been Shipped! - ${shipmentData.trackingNumber}`,
    html: shipmentCreatedTemplate(shipmentData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Send shipment delivered email
exports.sendShipmentDeliveredEmail = async (shipmentData) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.orders,
    to: shipmentData.customerEmail,
    subject: `🎉 Package Delivered! - Order #${shipmentData.orderId}`,
    html: shipmentDeliveredTemplate(shipmentData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Send shipment delayed email
exports.sendShipmentDelayedEmail = async (shipmentData) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.orders,
    to: shipmentData.customerEmail,
    subject: `⚠️ Shipment Delay Notice - ${shipmentData.trackingNumber}`,
    html: shipmentDelayedTemplate(shipmentData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Send out for delivery email
exports.sendShipmentOutForDeliveryEmail = async (shipmentData) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.orders,
    to: shipmentData.customerEmail,
    subject: `🏃 Out for Delivery Today! - ${shipmentData.trackingNumber}`,
    html: shipmentOutForDeliveryTemplate(shipmentData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Send in transit email
exports.sendShipmentInTransitEmail = async (shipmentData) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.orders,
    to: shipmentData.customerEmail,
    subject: `🚚 Your Package is In Transit - ${shipmentData.trackingNumber}`,
    html: shipmentInTransitTemplate(shipmentData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Send customs clearance email
exports.sendShipmentCustomsClearanceEmail = async (shipmentData) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.orders,
    to: shipmentData.customerEmail,
    subject: `🛃 Your Package is at Customs - ${shipmentData.trackingNumber}`,
    html: shipmentCustomsClearanceTemplate(shipmentData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Send failed delivery email
exports.sendShipmentFailedDeliveryEmail = async (shipmentData) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.orders,
    to: shipmentData.customerEmail,
    subject: `❌ Delivery Attempt Failed - ${shipmentData.trackingNumber}`,
    html: shipmentFailedDeliveryTemplate(shipmentData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Send order confirmation email with payment breakdown
exports.sendOrderConfirmationEmail = async (orderData) => {
  const { orderConfirmationTemplate } = require('../mails/templates/orderConfirmationEmail');
  
  const customerEmail = orderData.customerEmail || orderData.shippingAddress?.email;
  
  if (!customerEmail) {
    return { success: false, error: 'No email address' };
  }
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.orders,
    to: customerEmail,
    subject: `✅ Order Confirmed! - ${orderData.orderId}`,
    html: orderConfirmationTemplate(orderData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Send quote accepted by user notification to admin
exports.sendQuoteAcceptedByUserEmail = async (data) => {
  const { quoteAcceptedByUserTemplate } = require('../mails/templates/quoteAcceptedByUserEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.sales,
    to: data.adminEmail || process.env.ADMIN_EMAIL,
    subject: `🎉 Quote Accepted! #${data.quoteId} - Ready to Convert`,
    html: quoteAcceptedByUserTemplate(data)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// ============================================
// PAYMENT EMAIL FUNCTIONS
// ============================================

// Send payment received email
exports.sendPaymentReceivedEmail = async (paymentData) => {
  const { paymentReceivedTemplate } = require('../mails/templates/paymentReceivedEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.payments,
    to: paymentData.customerEmail,
    subject: `✅ Payment Received - ${paymentData.transactionId}`,
    html: paymentReceivedTemplate(paymentData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    // Don't throw - payment emails are non-critical
  }
};

// Send refund processed email
exports.sendRefundProcessedEmail = async (refundData) => {
  const { refundProcessedTemplate } = require('../mails/templates/refundProcessedEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.payments,
    to: refundData.customerEmail,
    subject: `💸 Refund Processed - ${refundData.refundTransactionId || refundData.transactionId}`,
    html: refundProcessedTemplate(refundData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    // Don't throw - refund emails are non-critical
  }
};

// Send payment failed email
exports.sendPaymentFailedEmail = async (paymentData) => {
  const { paymentFailedTemplate } = require('../mails/templates/paymentFailedEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.payments,
    to: paymentData.customerEmail,
    subject: `⚠️ Payment Failed - Action Required`,
    html: paymentFailedTemplate(paymentData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    // Don't throw - payment failed emails are non-critical
  }
};

// ===========================================
// SUPPORT TICKET EMAIL FUNCTIONS
// ===========================================

// Send ticket created email (to customer and admin)
exports.sendTicketCreatedEmail = async (ticketData) => {
  const { ticketCreatedTemplate } = require('../mails/templates/ticketCreatedEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  try {
    // Send confirmation to customer
    const customerMailOptions = {
      from: FROM.support,
      to: ticketData.customerEmail,
      subject: `✉️ Ticket Received - ${ticketData.ticketId}`,
      html: ticketCreatedTemplate({ ...ticketData, isAdminNotification: false })
    };
    await transporter.sendMail(customerMailOptions);

    // Send notification to admin
    const adminMailOptions = {
      from: FROM.support,
      to: process.env.ADMIN_EMAIL,
      subject: `🎫 New Support Ticket - ${ticketData.ticketId} [${ticketData.priority.toUpperCase()}]`,
      html: ticketCreatedTemplate({ ...ticketData, isAdminNotification: true })
    };
    await transporter.sendMail(adminMailOptions);

    return { success: true };
  } catch (error) {}
};

// Send ticket reply email
exports.sendTicketReplyEmail = async (replyData) => {
  const { ticketReplyTemplate } = require('../mails/templates/ticketReplyEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.support,
    to: replyData.recipientEmail,
    subject: replyData.isAdminNotification 
      ? `💬 Customer Reply - ${replyData.ticketId}`
      : `📩 New Reply on Your Ticket - ${replyData.ticketId}`,
    html: ticketReplyTemplate(replyData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {}
};

// Send ticket assigned email
exports.sendTicketAssignedEmail = async (assignData) => {
  const { ticketAssignedTemplate } = require('../mails/templates/ticketAssignedEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.support,
    to: assignData.assignedToEmail,
    subject: `📋 Ticket Assigned to You - ${assignData.ticketId}`,
    html: ticketAssignedTemplate(assignData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {}
};

// Send ticket resolved email
exports.sendTicketResolvedEmail = async (resolveData) => {
  const { ticketResolvedTemplate } = require('../mails/templates/ticketResolvedEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.support,
    to: resolveData.customerEmail,
    subject: `✅ Ticket Resolved - ${resolveData.ticketId}`,
    html: ticketResolvedTemplate(resolveData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {}
};

// ============================================
// MANUAL PAYMENT EMAIL FUNCTION
// ============================================

// Send manual payment added email
exports.sendManualPaymentAddedEmail = async (paymentData) => {
  const { manualPaymentAddedTemplate } = require('../mails/templates/manualPaymentAddedEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.payments,
    to: paymentData.customerEmail,
    subject: `📋 Payment Recorded - ${paymentData.transactionId}`,
    html: manualPaymentAddedTemplate(paymentData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {}
};

// ============================================
// INVENTORY EMAIL FUNCTIONS
// ============================================

// Send inventory alert email (low stock / out of stock)
exports.sendInventoryAlertEmail = async (alertData) => {
  const { inventoryAlertTemplate } = require('../mails/templates/inventoryAlertEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;

  const mailOptions = {
    from: FROM.admin,
    to: adminEmail,
    subject: alertData.alertType === 'out_of_stock' 
      ? `🚨 Out of Stock: ${alertData.productName}` 
      : `⚠️ Low Stock Alert: ${alertData.productName}`,
    html: inventoryAlertTemplate(alertData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send stock update email to supplier
exports.sendStockUpdateEmail = async (updateData) => {
  const { stockUpdateTemplate } = require('../mails/templates/stockUpdateEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.admin,
    to: updateData.supplierEmail,
    subject: `📦 Stock Update: ${updateData.productName} (${updateData.changeType === 'increase' ? '+' : updateData.changeType === 'decrease' ? '-' : ''}${Math.abs(updateData.newStock - updateData.previousStock)} units)`,
    html: stockUpdateTemplate(updateData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send contact message notification to admin
exports.sendContactMessageAdminNotification = async (contactData) => {
  const { contactMessageAdminNotificationTemplate } = require('../mails/templates/contactMessageEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;

  const mailOptions = {
    from: FROM.contact,
    to: adminEmail,
    replyTo: contactData.email,
    subject: `📬 New Contact Message: ${contactData.subject}`,
    html: contactMessageAdminNotificationTemplate(contactData)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send contact message confirmation to customer
exports.sendContactMessageConfirmation = async (contactData) => {
  const { contactMessageConfirmationTemplate } = require('../mails/templates/contactMessageEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.contact,
    to: contactData.email,
    subject: `We've received your message - Nexarion`,
    html: contactMessageConfirmationTemplate(contactData)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send contact response email to customer (when admin replies)
exports.sendContactResponseEmail = async (responseData) => {
  const { contactMessageResponseTemplate } = require('../mails/templates/contactMessageEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.contact,
    to: responseData.customerEmail,
    subject: `Re: ${responseData.originalSubject} - Nexarion`,
    html: contactMessageResponseTemplate(responseData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send meeting booking confirmation to customer
exports.sendMeetingBookingConfirmation = async (meetingData) => {
  const { meetingBookingConfirmationTemplate } = require('../mails/templates/meetingBookingEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.contact,
    to: meetingData.email,
    subject: `Meeting Confirmed - ${meetingData.meetingType || 'Demo'} with Nexarion`,
    html: meetingBookingConfirmationTemplate(meetingData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send meeting booking notification to admin
exports.sendMeetingBookingAdminNotification = async (meetingData) => {
  const { meetingBookingAdminNotificationTemplate } = require('../mails/templates/meetingBookingEmail');
  
  const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.admin,
    to: adminEmail,
    subject: `🗓️ New Meeting Request: ${meetingData.meetingType || 'Demo'} - ${meetingData.name}`,
    html: meetingBookingAdminNotificationTemplate(meetingData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send email when supplier submits a product for review
exports.sendSupplierProductSubmittedEmail = async (email, supplierName, product) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.admin,
    to: email,
    subject: 'Product Submitted for Review - Nexarion',
    html: supplierProductSubmittedEmailTemplate(supplierName, product)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send email when admin approves a supplier's product
exports.sendSupplierProductApprovedEmail = async (email, supplierName, product) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.admin,
    to: email,
    subject: 'Product Approved! 🎉 - Nexarion',
    html: supplierProductApprovedEmailTemplate(supplierName, product)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send email when admin rejects a supplier's product
exports.sendSupplierProductRejectedEmail = async (email, supplierName, product, rejectionReason) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.admin,
    to: email,
    subject: 'Product Review Update - Nexarion',
    html: supplierProductRejectedEmailTemplate(supplierName, product, rejectionReason)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send email to supplier when they receive a new order
exports.sendSupplierNewOrderEmail = async (email, supplierName, order, products) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.orders,
    to: email,
    subject: 'New Order Received! 🛒 - Nexarion',
    html: supplierNewOrderEmailTemplate(supplierName, order, products)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send email when supplier updates their business profile
exports.sendSupplierProfileUpdatedEmail = async (email, supplierName, supplier, isFirstUpdate = false) => {
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();
  const subject = isFirstUpdate 
    ? 'Welcome! Your Business Profile is Set Up 🏢 - Nexarion'
    : 'Business Profile Updated - Nexarion';

  const mailOptions = {
    from: FROM.admin,
    to: email,
    subject,
    html: supplierProfileUpdatedEmailTemplate(supplierName, supplier, isFirstUpdate)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send checkout confirmation email (order placed successfully)
exports.sendCheckoutConfirmationEmail = async (orderData) => {
  const { customerEmail, customerName, orderId } = orderData;

  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.orders,
    to: customerEmail,
    subject: `Order Confirmed! #${orderId} ✅ - Nexarion`,
    html: checkoutConfirmationTemplate(orderData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send query confirmation to customer
exports.sendQueryConfirmation = async (queryData) => {
  const { queryConfirmationTemplate } = require('../mails/templates/queryEmail');
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.contact,
    to: queryData.email,
    subject: `Query Received - ${queryData.subject} | Nexarion`,
    html: queryConfirmationTemplate(queryData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send query notification to admin
exports.sendQueryAdminNotification = async (queryData) => {
  const { queryAdminNotificationTemplate } = require('../mails/templates/queryEmail');
  
  const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
  
  if (process.env.NODE_ENV === 'development') {}

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM.admin,
    to: adminEmail,
    subject: `🔔 New Query: ${queryData.subject} - ${queryData.name}`,
    html: queryAdminNotificationTemplate(queryData)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};