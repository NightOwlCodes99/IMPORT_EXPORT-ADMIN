/**
 * Order Created Email Template
 * Sent when a new order is created (either from checkout or from quote conversion)
 */

exports.orderCreatedTemplate = (orderData) => {
  const { 
    customerName, 
    orderId, 
    orderItems, 
    shippingAddress, 
    pricing,
    paymentStatus,
    isFromQuote,
    quoteId
  } = orderData;

  const itemsHtml = orderItems?.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; margin-right: 12px;">` : ''}
          <div>
            <p style="margin: 0; color: #1f2937; font-weight: 500;">${item.name}</p>
            ${item.sku ? `<p style="margin: 2px 0 0 0; color: #9ca3af; font-size: 12px;">SKU: ${item.sku}</p>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #4b5563;">$${item.price?.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937; font-weight: 500;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - ${orderId}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Order Confirmed!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Thank you for your order</p>
        </div>

        <!-- Content -->
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">Hello <strong>${customerName}</strong>,</p>
          
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 25px 0;">
            ${isFromQuote 
              ? `Your quote request <strong>${quoteId}</strong> has been converted to an order. Here are your order details:` 
              : 'We have received your order and it is now being processed. Here are your order details:'}
          </p>

          <!-- Order ID Card -->
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #86efac; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px;">
            <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
            <p style="color: #059669; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 2px;">${orderId}</p>
          </div>

          <!-- Order Items -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600;">Product</th>
                  <th style="padding: 12px; text-align: center; color: #6b7280; font-weight: 600;">Qty</th>
                  <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600;">Price</th>
                  <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Pricing Summary -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="color: #6b7280; padding: 5px 0;">Subtotal:</td>
                <td style="color: #1f2937; text-align: right;">$${pricing?.itemsPrice?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding: 5px 0;">Tax:</td>
                <td style="color: #1f2937; text-align: right;">$${pricing?.taxPrice?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding: 5px 0;">Shipping:</td>
                <td style="color: #1f2937; text-align: right;">$${pricing?.shippingPrice?.toFixed(2) || '0.00'}</td>
              </tr>
              ${pricing?.discount > 0 ? `
              <tr>
                <td style="color: #059669; padding: 5px 0;">Discount:</td>
                <td style="color: #059669; text-align: right;">-$${pricing?.discount?.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="color: #1f2937; padding: 12px 0 5px 0; font-weight: 700; font-size: 16px;">Total:</td>
                <td style="color: #059669; text-align: right; font-weight: 700; font-size: 20px;">$${pricing?.totalPrice?.toFixed(2) || '0.00'}</td>
              </tr>
            </table>
          </div>

          <!-- Shipping Address -->
          ${shippingAddress ? `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">Shipping Address</h3>
            <div style="background: #f9fafb; border-radius: 8px; padding: 15px;">
              <p style="margin: 0; color: #1f2937; font-weight: 500;">${shippingAddress.fullName}</p>
              ${shippingAddress.company ? `<p style="margin: 2px 0; color: #6b7280; font-size: 14px;">${shippingAddress.company}</p>` : ''}
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
                ${shippingAddress.street}<br>
                ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
                ${shippingAddress.country}
              </p>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">📞 ${shippingAddress.phone}</p>
            </div>
          </div>
          ` : ''}

          <!-- Payment Status -->
          <div style="background: ${paymentStatus === 'Paid' ? '#f0fdf4' : '#fef3c7'}; border-radius: 8px; padding: 15px; margin-bottom: 25px; text-align: center;">
            <p style="margin: 0; color: ${paymentStatus === 'Paid' ? '#059669' : '#d97706'}; font-weight: 600;">
              ${paymentStatus === 'Paid' ? '✅ Payment Received' : '⏳ Payment Pending'}
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://nexarionimpex.com/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Track Your Order
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin: 25px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Need help? Contact our support team at <a href="mailto:support@nexarionimpex.com" style="color: #10b981;">support@nexarionimpex.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Nexarion. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Global Import & Export Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
