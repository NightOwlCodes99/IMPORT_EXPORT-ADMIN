/**
 * Notification Alert Email Template
 * Sent when important notifications are triggered (optional email alerts)
 */

exports.notificationAlertTemplate = (data) => {
  const { recipientName, notificationType, title, message, actionUrl, actionText, priority } = data;

  const typeConfig = {
    'order': { color: '#3b82f6', icon: '🛒', label: 'Order Update' },
    'payment': { color: '#10b981', icon: '💳', label: 'Payment Update' },
    'shipment': { color: '#8b5cf6', icon: '🚚', label: 'Shipment Update' },
    'quote': { color: '#f59e0b', icon: '📋', label: 'Quote Update' },
    'message': { color: '#06b6d4', icon: '💬', label: 'New Message' },
    'review': { color: '#eab308', icon: '⭐', label: 'Review Update' },
    'product': { color: '#f97316', icon: '📦', label: 'Product Update' },
    'system': { color: '#6b7280', icon: 'ℹ️', label: 'System Notice' },
    'promotion': { color: '#ec4899', icon: '🎉', label: 'Promotion' },
  };

  const config = typeConfig[notificationType] || typeConfig['system'];
  const priorityBadge = priority === 'high' 
    ? '<span style="background-color: #ef4444; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">HIGH PRIORITY</span>' 
    : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Nexarion</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Notification Alert</p>
        </div>

        <!-- Content -->
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">Hello <strong>${recipientName}</strong>,</p>
          
          <!-- Notification Type Badge -->
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <span style="background-color: ${config.color}15; color: ${config.color}; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1px solid ${config.color}30;">
              ${config.icon} ${config.label}
            </span>
            &nbsp;&nbsp;${priorityBadge}
          </div>

          <!-- Notification Card -->
          <div style="background: linear-gradient(135deg, ${config.color}08, ${config.color}15); border: 1px solid ${config.color}25; border-radius: 12px; padding: 24px; margin: 0 0 24px 0;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 20px;">${title}</h2>
            <p style="color: #4b5563; margin: 0; font-size: 15px; line-height: 1.6;">${message}</p>
          </div>

          ${actionUrl ? `
          <!-- Action Button -->
          <div style="text-align: center; margin: 24px 0;">
            <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, ${config.color}, ${config.color}dd); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              ${actionText || 'View Details'}
            </a>
          </div>
          ` : ''}

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            This notification was sent from your Nexarion account. You can manage your notification preferences in your dashboard settings.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Nexarion Global Exports. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
