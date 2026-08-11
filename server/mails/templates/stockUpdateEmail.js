/**
 * Stock Update Email Template
 * Sent when stock is updated by admin
 */

exports.stockUpdateTemplate = (updateData) => {
  const { 
    supplierName, 
    productName, 
    productSku, 
    previousStock, 
    newStock, 
    changeType, 
    reason,
    supplierReference,
    arrivalDate,
    updatedBy 
  } = updateData;

  const changeConfig = {
    'increase': {
      color: '#10b981',
      icon: '📈',
      title: 'Stock Increased',
      message: 'Your product stock has been increased'
    },
    'decrease': {
      color: '#ef4444',
      icon: '📉',
      title: 'Stock Decreased',
      message: 'Your product stock has been reduced'
    },
    'arrival': {
      color: '#3b82f6',
      icon: '📦',
      title: 'New Stock Arrival',
      message: 'New stock has been added to your product'
    },
    'no_change': {
      color: '#6b7280',
      icon: '📊',
      title: 'Stock Updated',
      message: 'Your product stock record has been updated'
    }
  };

  const config = changeConfig[changeType] || changeConfig['no_change'];
  const difference = newStock - previousStock;
  const differenceText = difference > 0 ? `+${difference}` : `${difference}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.title} - ${productName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Nexarion</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Stock Update Notification</p>
        </div>

        <!-- Content -->
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">Hello <strong>${supplierName || 'Supplier'}</strong>,</p>
          
          <!-- Status Banner -->
          <div style="background: ${config.color}15; border-left: 4px solid ${config.color}; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
            <div style="font-size: 32px; margin-bottom: 10px;">${config.icon}</div>
            <h2 style="color: ${config.color}; margin: 0 0 8px 0; font-size: 20px;">${config.title}</h2>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">${config.message}</p>
          </div>

          <!-- Product Details -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">Product Details</h3>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="color: #6b7280; padding: 8px 0;">Product:</td>
                <td style="color: #1f2937; font-weight: 600; text-align: right;">${productName}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding: 8px 0;">SKU:</td>
                <td style="color: #1f2937; font-weight: 600; text-align: right;">${productSku}</td>
              </tr>
            </table>
          </div>

          <!-- Stock Change Details -->
          <div style="background: linear-gradient(135deg, ${config.color}10 0%, ${config.color}05 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; text-align: center;">
            <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 16px;">Stock Change Summary</h3>
            <div style="display: inline-block; margin: 0 20px;">
              <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px;">Previous</p>
              <p style="color: #1f2937; margin: 0; font-size: 28px; font-weight: 700;">${previousStock}</p>
            </div>
            <div style="display: inline-block; margin: 0 20px;">
              <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px;">Change</p>
              <p style="color: ${config.color}; margin: 0; font-size: 28px; font-weight: 700;">${differenceText}</p>
            </div>
            <div style="display: inline-block; margin: 0 20px;">
              <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px;">New Stock</p>
              <p style="color: #1f2937; margin: 0; font-size: 28px; font-weight: 700;">${newStock}</p>
            </div>
          </div>

          <!-- Additional Info -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">Additional Information</h3>
            <table style="width: 100%; font-size: 14px;">
              ${reason ? `
              <tr>
                <td style="color: #6b7280; padding: 8px 0;">Reason:</td>
                <td style="color: #1f2937; text-align: right;">${reason}</td>
              </tr>
              ` : ''}
              ${supplierReference ? `
              <tr>
                <td style="color: #6b7280; padding: 8px 0;">Reference:</td>
                <td style="color: #1f2937; text-align: right;">${supplierReference}</td>
              </tr>
              ` : ''}
              ${arrivalDate ? `
              <tr>
                <td style="color: #6b7280; padding: 8px 0;">Arrival Date:</td>
                <td style="color: #1f2937; text-align: right;">${new Date(arrivalDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="color: #6b7280; padding: 8px 0;">Updated By:</td>
                <td style="color: #1f2937; font-weight: 600; text-align: right;">${updatedBy || 'Admin'}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding: 8px 0;">Date:</td>
                <td style="color: #1f2937; text-align: right;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            </table>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated notification from Nexarion Inventory Management System.<br>
              If you have questions about this update, please contact our support team.<br><br>
              © ${new Date().getFullYear()} Nexarion Global Exports. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
