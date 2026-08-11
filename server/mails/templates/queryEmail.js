/**
 * Query Email Templates
 * Sent when a user raises a query through the services page
 */

// Customer confirmation email
exports.queryConfirmationTemplate = (queryData) => {
  const {
    name,
    subject,
    message,
    queryType
  } = queryData;

  // Query type labels
  const queryTypeLabels = {
    'general': 'General Inquiry',
    'product': 'Product Information',
    'pricing': 'Pricing & Quotes',
    'shipping': 'Shipping & Logistics',
    'support': 'Technical Support',
    'partnership': 'Partnership',
    'other': 'Other'
  };

  const queryTypeLabel = queryTypeLabels[queryType] || queryType || 'General Inquiry';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Query Received - Nexarion Global Exports</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
          <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">💬</span>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Query Received!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">We'll get back to you within 24 hours</p>
        </div>

        <!-- Main Content -->
        <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          
          <!-- Greeting -->
          <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">Hi <strong>${name}</strong>,</p>
          <p style="color: #6b7280; font-size: 15px; margin: 0 0 30px 0;">
            Thank you for reaching out to Nexarion Global Exports! We have received your query and our team will review it promptly.
          </p>
          
          <!-- Query Details Card -->
          <div style="background: linear-gradient(135deg, #e0e7ff 0%, #c4b5fd 100%); border-radius: 16px; padding: 25px; margin-bottom: 30px; border: 2px solid #6366f1;">
            <h3 style="color: #3730a3; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">📋 Query Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; color: #4338ca; font-size: 14px; font-weight: 500; width: 100px; vertical-align: top;">Type:</td>
                <td style="padding: 12px 0; color: #1e1b4b; font-size: 14px; font-weight: 600;">${queryTypeLabel}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #4338ca; font-size: 14px; font-weight: 500; vertical-align: top;">Subject:</td>
                <td style="padding: 12px 0; color: #1e1b4b; font-size: 14px; font-weight: 600;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #4338ca; font-size: 14px; font-weight: 500; vertical-align: top;">Message:</td>
                <td style="padding: 12px 0; color: #1e1b4b; font-size: 14px;">${message}</td>
              </tr>
            </table>
          </div>

          <!-- What Happens Next -->
          <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #22c55e;">
            <h4 style="color: #166534; margin: 0 0 12px 0; font-size: 15px; font-weight: 600;">⏱️ What Happens Next?</h4>
            <ul style="color: #15803d; font-size: 14px; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Our team will review your query within 2-4 hours</li>
              <li style="margin-bottom: 8px;">You'll receive a detailed response via email</li>
              <li>For urgent matters, contact us on WhatsApp: +91 9909246267, +91 8866897043, +91 99040 48673</li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">Need immediate assistance?</p>
            <a href="https://wa.me/919909246267" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 30px 20px;">
          <p style="color: #9ca3af; font-size: 13px; margin: 0 0 10px 0;">
            © ${new Date().getFullYear()} Nexarion Global Exports. All rights reserved.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Gujarat, India | nexarionglobalexports@gmail.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Admin notification email
exports.queryAdminNotificationTemplate = (queryData) => {
  const {
    name,
    email,
    phone,
    company,
    subject,
    message,
    queryType,
    createdAt
  } = queryData;

  // Query type labels
  const queryTypeLabels = {
    'general': 'General Inquiry',
    'product': 'Product Information',
    'pricing': 'Pricing & Quotes',
    'shipping': 'Shipping & Logistics',
    'support': 'Technical Support',
    'partnership': 'Partnership',
    'other': 'Other'
  };

  const queryTypeLabel = queryTypeLabels[queryType] || queryType || 'General Inquiry';

  // Format date
  const formatDateTime = (date) => {
    try {
      return new Date(date).toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata'
      });
    } catch {
      return date;
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Query Received - Admin Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">🔔 New Query Received</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Action Required - Respond within 24 hours</p>
        </div>

        <!-- Main Content -->
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          
          <!-- Priority Badge -->
          <div style="background: #fef2f2; border-radius: 8px; padding: 12px 16px; margin-bottom: 25px; border: 1px solid #fecaca;">
            <span style="color: #dc2626; font-size: 14px; font-weight: 600;">⚡ Query Type: ${queryTypeLabel}</span>
          </div>

          <!-- Customer Info -->
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">👤 Customer Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Name:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px;"><a href="mailto:${email}" style="color: #6366f1;">${email}</a></td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Phone:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px;"><a href="tel:${phone}" style="color: #6366f1;">${phone}</a></td>
              </tr>
              ` : ''}
              ${company ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Company:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px;">${company}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Submitted:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px;">${formatDateTime(createdAt)}</td>
              </tr>
            </table>
          </div>

          <!-- Query Details -->
          <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #bfdbfe;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">📝 Query Details</h3>
            <p style="color: #1e3a8a; font-size: 14px; margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #dbeafe;">
              <p style="color: #374151; font-size: 14px; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; padding-top: 20px;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 10px;">
              ✉️ Reply via Email
            </a>
            ${phone ? `
            <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              💬 WhatsApp
            </a>
            ` : ''}
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This is an automated notification from Nexarion Global Exports CRM
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
