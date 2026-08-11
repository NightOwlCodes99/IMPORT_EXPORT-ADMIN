/**
 * Quote Accepted by User Email Template
 * Sent to Admin when user accepts a quote - Admin can now convert to order
 */

exports.quoteAcceptedByUserTemplate = (data) => {
  const {
    adminName,
    quoteId,
    customerName,
    customerEmail,
    customerPhone,
    productName,
    quantity,
    unit,
    quotedPrice,
    targetPrice,
    deliveryLocation,
    acceptedAt
  } = data;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote Accepted - ${quoteId}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0fdf4; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
          <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">🎉</span>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">Quote Accepted!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 15px;">Customer has approved your quotation</p>
        </div>

        <!-- Main Content -->
        <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          
          <p style="color: #374151; font-size: 16px; margin: 0 0 25px 0;">Hello <strong>${adminName || 'Admin'}</strong>,</p>
          
          <p style="color: #6b7280; font-size: 15px; margin: 0 0 25px 0;">
            Great news! <strong style="color: #16a34a;">${customerName}</strong> has accepted your quote. You can now proceed to convert this quote into an order.
          </p>

          <!-- Quote ID Badge -->
          <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border: 2px solid #4ade80; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
            <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Quote ID</p>
            <p style="color: #16a34a; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 2px;">${quoteId}</p>
            <p style="color: #4ade80; margin: 10px 0 0 0; font-size: 13px;">Accepted on ${formatDate(acceptedAt)}</p>
          </div>

          <!-- Customer Info -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              👤 Customer Information
            </h3>
            <div style="background: #f9fafb; border-radius: 10px; padding: 18px;">
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="color: #6b7280; padding: 6px 0; width: 40%;">Name:</td>
                  <td style="color: #1f2937; font-weight: 600;">${customerName}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Email:</td>
                  <td style="color: #1f2937;"><a href="mailto:${customerEmail}" style="color: #16a34a; text-decoration: none;">${customerEmail}</a></td>
                </tr>
                ${customerPhone ? `
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Phone:</td>
                  <td style="color: #1f2937;">${customerPhone}</td>
                </tr>
                ` : ''}
                ${deliveryLocation ? `
                <tr>
                  <td style="color: #6b7280; padding: 6px 0;">Delivery To:</td>
                  <td style="color: #1f2937;">${deliveryLocation.city ? `${deliveryLocation.city}, ` : ''}${deliveryLocation.country}</td>
                </tr>
                ` : ''}
              </table>
            </div>
          </div>

          <!-- Quote Summary -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              📋 Quote Summary
            </h3>
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #86efac; border-radius: 10px; padding: 18px;">
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="color: #6b7280; padding: 8px 0; width: 40%;">Product:</td>
                  <td style="color: #1f2937; font-weight: 600;">${productName}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 8px 0;">Quantity:</td>
                  <td style="color: #1f2937; font-weight: 600;">${quantity} ${unit || 'pcs'}</td>
                </tr>
                ${targetPrice ? `
                <tr>
                  <td style="color: #6b7280; padding: 8px 0;">Customer's Target Price:</td>
                  <td style="color: #6b7280;">${formatCurrency(targetPrice)}/unit</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="color: #6b7280; padding: 8px 0;">Your Quoted Price:</td>
                  <td style="color: #16a34a; font-weight: 700; font-size: 18px;">${formatCurrency(quotedPrice)}/unit</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 8px 0;">Estimated Total:</td>
                  <td style="color: #1f2937; font-weight: 700; font-size: 18px;">${formatCurrency(quotedPrice * quantity)}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Action Required -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 0 12px 12px 0; padding: 20px; margin-bottom: 30px;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 15px; font-weight: 700;">
              ⚡ Action Required
            </h4>
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              Please log in to the admin panel and convert this quote to an order. You'll be able to:
            </p>
            <ul style="color: #92400e; margin: 10px 0 0 0; padding-left: 20px; font-size: 14px;">
              <li>Set advance payment amount (recommended 50%)</li>
              <li>Add shipping charges and GST</li>
              <li>Set delivery timeline</li>
              <li>Send order confirmation to customer</li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://nexarionimpex.com/nexarion/admin/login" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.4);">
              🛒 Convert to Order
            </a>
          </div>

          <!-- Help Section -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
              This is an automated notification from your admin panel.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 30px 20px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Nexarion Admin Panel
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
};
