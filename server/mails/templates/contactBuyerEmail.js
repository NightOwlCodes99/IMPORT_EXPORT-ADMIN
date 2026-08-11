const contactBuyerEmailTemplate = (buyerName, subject, message, quoteId, adminName = 'Admin', responseDeadlineDays = 3) => {
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + responseDeadlineDays);
  const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Message from Nexarion Global Exports</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); padding: 30px 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
            📬 Message from Admin
          </h1>
          <p style="color: #e0f2f1; margin: 10px 0 0 0; font-size: 14px;">
            Regarding Quote: ${quoteId}
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
          <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Dear <strong>${buyerName}</strong>,
          </p>

          <!-- Subject -->
          <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 15px 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
            <p style="color: #0d9488; font-size: 12px; text-transform: uppercase; font-weight: 600; margin: 0 0 5px 0;">Subject</p>
            <p style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0;">${subject}</p>
          </div>

          <!-- Message -->
          <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <p style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>

          <!-- Response Deadline Warning -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #f59e0b;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 24px; margin-right: 12px;">⚠️</span>
              <h3 style="color: #92400e; margin: 0; font-size: 16px; font-weight: 700;">Important: Response Required</h3>
            </div>
            <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0;">
              Please respond to this message by <strong>${formattedDeadline}</strong> (within ${responseDeadlineDays} days). 
              If we do not receive a response by this date, we may need to <strong>cancel the quote/order</strong> as per our policy.
            </p>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://nexarionimpex.com/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(13, 148, 136, 0.3);">
              View My Quotes →
            </a>
          </div>

          <!-- Contact Options -->
          <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <h4 style="color: #0369a1; margin: 0 0 15px 0; font-size: 14px;">📞 Need to Contact Us?</h4>
            <p style="color: #475569; font-size: 14px; margin: 0 0 10px 0;">
              <strong>Email:</strong> <a href="mailto:support@nexarionimpex.com" style="color: #0891b2;">support@nexarionimpex.com</a>
            </p>
            <p style="color: #475569; font-size: 14px; margin: 0;">
              <strong>Phone:</strong> <a href="tel:+1234567890" style="color: #0891b2;">+1 (234) 567-890</a>
            </p>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
            Best regards,<br>
            <strong style="color: #334155;">${adminName}</strong><br>
            <span style="color: #0d9488;">Nexarion Global Exports Team</span>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #1e293b; padding: 25px 40px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0 0 10px 0;">
            This email was sent regarding your quote request on Nexarion Global Exports
          </p>
          <p style="color: #64748b; font-size: 11px; margin: 0;">
            © ${new Date().getFullYear()} Nexarion Global Exports. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { contactBuyerEmailTemplate };
