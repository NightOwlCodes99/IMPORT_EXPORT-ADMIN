/**
 * Meeting Booking Email Templates
 * Sent when a user books a meeting through the contact page
 */

// Customer confirmation email
exports.meetingBookingConfirmationTemplate = (meetingData) => {
  const {
    name,
    meetingType,
    preferredDate,
    preferredTime,
    timezone,
    notes
  } = meetingData;

  // Format date nicely
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Format time nicely  
  const formatTime = (timeStr) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes || '00'} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  // Meeting type labels
  const meetingTypeLabels = {
    'demo': 'Product Demo',
    'consultation': 'Business Consultation',
    'support': 'Technical Support',
    'partnership': 'Partnership Discussion',
    'other': 'General Meeting'
  };

  const meetingTypeLabel = meetingTypeLabels[meetingType] || meetingType || 'Meeting';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Meeting Booking Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
          <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">📅</span>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Meeting Booked!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">Your meeting request has been received</p>
        </div>

        <!-- Main Content -->
        <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          
          <!-- Greeting -->
          <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">Hi <strong>${name}</strong>,</p>
          <p style="color: #6b7280; font-size: 15px; margin: 0 0 30px 0;">
            Thank you for scheduling a meeting with Nexarion Global Exports! We're excited to connect with you.
          </p>
          
          <!-- Meeting Details Card -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 16px; padding: 25px; margin-bottom: 30px; border: 2px solid #f59e0b;">
            <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">📋 Meeting Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; color: #78350f; font-size: 14px; font-weight: 500; width: 120px; vertical-align: top;">Meeting Type:</td>
                <td style="padding: 12px 0; color: #451a03; font-size: 14px; font-weight: 600;">${meetingTypeLabel}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #78350f; font-size: 14px; font-weight: 500; vertical-align: top;">Date:</td>
                <td style="padding: 12px 0; color: #451a03; font-size: 14px; font-weight: 600;">${formatDate(preferredDate)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #78350f; font-size: 14px; font-weight: 500; vertical-align: top;">Time:</td>
                <td style="padding: 12px 0; color: #451a03; font-size: 14px; font-weight: 600;">${formatTime(preferredTime)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #78350f; font-size: 14px; font-weight: 500; vertical-align: top;">Timezone:</td>
                <td style="padding: 12px 0; color: #451a03; font-size: 14px; font-weight: 600;">${timezone}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 12px 0; color: #78350f; font-size: 14px; font-weight: 500; vertical-align: top;">Notes:</td>
                <td style="padding: 12px 0; color: #451a03; font-size: 14px;">${notes}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Free Badge -->
          <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; padding: 16px 20px; margin-bottom: 30px; display: flex; align-items: center;">
            <span style="font-size: 24px; margin-right: 12px;">✅</span>
            <div>
              <p style="color: #166534; font-weight: 600; margin: 0; font-size: 14px;">100% Free - No Obligation</p>
              <p style="color: #15803d; margin: 4px 0 0 0; font-size: 13px;">This meeting is completely free with no commitments required.</p>
            </div>
          </div>
          
          <!-- What's Next -->
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">📌 What's Next?</h3>
            <ol style="color: #6b7280; font-size: 14px; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 10px;">Our team will review your meeting request</li>
              <li style="margin-bottom: 10px;">You'll receive a calendar invite with the meeting link</li>
              <li style="margin-bottom: 10px;">If needed, we may contact you to confirm the time</li>
            </ol>
          </div>

          <!-- Need Help -->
          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Need to reschedule or have questions?</p>
            <a href="mailto:nexarionglobalexports@gmail.com" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 14px;">Contact Us</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 30px 20px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">Nexarion Global Exports</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0 0 20px 0;">Your trusted partner in global import-export solutions</p>
          <div style="margin-bottom: 15px;">
            <a href="https://www.instagram.com/nexarion_global_exports" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none;">Instagram</a>
            <span style="color: #d1d5db;">|</span>
            <a href="https://www.linkedin.com/in/nexarion-global-exports-2828773a6" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none;">LinkedIn</a>
          </div>
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Nexarion Global Exports. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Admin notification email
exports.meetingBookingAdminNotificationTemplate = (meetingData) => {
  const {
    name,
    email,
    phone,
    company,
    meetingType,
    preferredDate,
    preferredTime,
    timezone,
    notes,
    createdAt
  } = meetingData;

  // Format date
  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes || '00'} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  // Meeting type labels
  const meetingTypeLabels = {
    'demo': 'Product Demo',
    'consultation': 'Business Consultation',
    'support': 'Technical Support',
    'partnership': 'Partnership Discussion',
    'other': 'General Meeting'
  };

  const meetingTypeLabel = meetingTypeLabels[meetingType] || meetingType || 'Meeting';

  // Priority colors based on meeting type
  const getPriorityStyle = (type) => {
    const styles = {
      'demo': { bg: '#dbeafe', text: '#1e40af', label: 'Demo Request' },
      'consultation': { bg: '#dcfce7', text: '#166534', label: 'Consultation' },
      'support': { bg: '#fef3c7', text: '#92400e', label: 'Support' },
      'partnership': { bg: '#e0e7ff', text: '#3730a3', label: 'Partnership' },
      'other': { bg: '#f3f4f6', text: '#374151', label: 'General' }
    };
    return styles[type] || styles['other'];
  };

  const priorityStyle = getPriorityStyle(meetingType);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Meeting Booking</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
          <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">📅</span>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">New Meeting Request</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">A customer wants to schedule a meeting</p>
        </div>

        <!-- Main Content -->
        <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          
          <!-- Type Badge -->
          <div style="text-align: center; margin-bottom: 25px;">
            <span style="display: inline-block; padding: 8px 20px; background: ${priorityStyle.bg}; color: ${priorityStyle.text}; border-radius: 20px; font-weight: 600; font-size: 14px;">
              ${meetingTypeLabel}
            </span>
          </div>
          
          <!-- Customer Info -->
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">👤 Customer Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Name:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  <a href="mailto:${email}" style="color: #f59e0b; text-decoration: none;">${email}</a>
                </td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Phone:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  <a href="tel:${phone}" style="color: #f59e0b; text-decoration: none;">${phone}</a>
                </td>
              </tr>
              ` : ''}
              ${company ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Company:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${company}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <!-- Meeting Details -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 2px solid #f59e0b;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">📋 Requested Meeting Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #78350f; font-size: 14px; font-weight: 500; width: 120px;">Date:</td>
                <td style="padding: 10px 0; color: #451a03; font-size: 14px; font-weight: 600;">${formatDate(preferredDate)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #78350f; font-size: 14px; font-weight: 500;">Time:</td>
                <td style="padding: 10px 0; color: #451a03; font-size: 14px; font-weight: 600;">${formatTime(preferredTime)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #78350f; font-size: 14px; font-weight: 500;">Timezone:</td>
                <td style="padding: 10px 0; color: #451a03; font-size: 14px; font-weight: 600;">${timezone}</td>
              </tr>
            </table>
          </div>

          ${notes ? `
          <!-- Notes -->
          <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #22c55e;">
            <h4 style="color: #166534; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">📝 Additional Notes</h4>
            <p style="color: #15803d; font-size: 14px; margin: 0; line-height: 1.6;">${notes}</p>
          </div>
          ` : ''}
          
          <!-- Action Buttons -->
          <div style="text-align: center; padding: 20px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">Please review and respond to this meeting request</p>
            <a href="mailto:${email}?subject=Meeting Confirmation - Nexarion Global Exports&body=Hi ${name},%0D%0A%0D%0AThank you for scheduling a meeting with us.%0D%0A%0D%0AWe confirm your meeting for ${formatDate(preferredDate)} at ${formatTime(preferredTime)} (${timezone}).%0D%0A%0D%0ABest regards,%0D%0ANexarion Global Exports Team" 
               style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 25px; font-weight: 600; font-size: 14px; margin-right: 10px;">
              Confirm Meeting
            </a>
          </div>
          
          <!-- Timestamp -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Request received: ${new Date(createdAt).toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">This is an automated notification from Nexarion Global Exports</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
