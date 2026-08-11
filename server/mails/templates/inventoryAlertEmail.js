/**
 * Inventory Alert Email Template
 * Sent when stock levels reach critical thresholds
 */

exports.inventoryAlertTemplate = (alertData) => {
  const { productName, productSku, currentStock, alertType, threshold } = alertData;

  const alertConfig = {
    'low_stock': {
      color: '#f59e0b',
      icon: '⚠️',
      title: 'Low Stock Alert',
      message: `Stock level is running low`,
      bgColor: '#fef3c7'
    },
    'out_of_stock': {
      color: '#ef4444',
      icon: '🚨',
      title: 'Out of Stock Alert',
      message: `Product is now out of stock`,
      bgColor: '#fee2e2'
    },
    'restock_needed': {
      color: '#8b5cf6',
      icon: '📦',
      title: 'Restock Required',
      message: `This product needs to be restocked`,
      bgColor: '#ede9fe'
    }
  };

  const config = alertConfig[alertType] || alertConfig['low_stock'];

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
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Inventory Management</p>
        </div>

        <!-- Content -->
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Alert Banner -->
          <div style="background: ${config.bgColor}; border-left: 4px solid ${config.color}; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
            <div style="font-size: 32px; margin-bottom: 10px;">${config.icon}</div>
            <h2 style="color: ${config.color}; margin: 0 0 8px 0; font-size: 20px;">${config.title}</h2>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">${config.message}</p>
          </div>

          <!-- Product Details -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">Product Details</h3>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="color: #6b7280; padding: 8px 0;">Product Name:</td>
                <td style="color: #1f2937; font-weight: 600; text-align: right;">${productName}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding: 8px 0;">SKU:</td>
                <td style="color: #1f2937; font-weight: 600; text-align: right;">${productSku}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding: 8px 0;">Current Stock:</td>
                <td style="color: ${config.color}; font-weight: 600; text-align: right; font-size: 18px;">${currentStock} units</td>
              </tr>
              ${threshold ? `
              <tr>
                <td style="color: #6b7280; padding: 8px 0;">Alert Threshold:</td>
                <td style="color: #1f2937; font-weight: 600; text-align: right;">${threshold} units</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin-bottom: 25px;">
            <a href="https://nexarionimpex.com/nexarion/admin/login" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Manage Inventory
            </a>
          </div>

          <!-- Recommendation -->
          <div style="background: #f0fdf4; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="color: #166534; margin: 0; font-size: 13px;">
              <strong>💡 Recommendation:</strong> Review your inventory levels and consider placing a restock order to avoid stockouts and maintain customer satisfaction.
            </p>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated alert from Nexarion Inventory Management System.<br>
              © ${new Date().getFullYear()} Nexarion Global Exports. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
