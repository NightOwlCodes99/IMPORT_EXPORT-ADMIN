exports.passwordResetEmailTemplate = (name, resetLink) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Password Reset - Nexarion</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f3f4f6;
          padding: 20px;
        }
        
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
          padding: 40px 30px;
          text-align: center;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        
        .header .icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        
        .content {
          padding: 40px 30px;
          background: #ffffff;
        }
        
        .content h2 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
        }
        
        .content p {
          color: #4b5563;
          font-size: 16px;
          margin-bottom: 15px;
        }
        
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        
        .reset-button {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(20, 184, 166, 0.3);
          transition: all 0.3s ease;
        }
        
        .reset-button:hover {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
          box-shadow: 0 6px 8px rgba(20, 184, 166, 0.4);
          transform: translateY(-2px);
        }
        
        .link-box {
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #e5e7eb;
          word-break: break-all;
        }
        
        .link-box p {
          color: #6b7280;
          font-size: 12px;
          margin: 5px 0;
        }
        
        .link-box a {
          color: #14b8a6;
          text-decoration: none;
          font-size: 13px;
        }
        
        .warning-box {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        
        .warning-box p {
          color: #991b1b;
          margin: 0;
          font-size: 14px;
        }
        
        .warning-box strong {
          color: #7f1d1d;
        }
        
        .info-box {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        
        .info-box p {
          color: #1e3a8a;
          margin: 0;
          font-size: 14px;
        }
        
        .security-tips {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .security-tips h3 {
          color: #1f2937;
          font-size: 16px;
          margin-bottom: 10px;
        }
        
        .security-tips ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        
        .security-tips li {
          color: #4b5563;
          font-size: 14px;
          margin: 5px 0;
        }
        
        .footer {
          background: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
          color: #6b7280;
          font-size: 14px;
          margin: 5px 0;
        }
        
        .footer .social-links {
          margin: 15px 0;
        }
        
        .footer .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #14b8a6;
          text-decoration: none;
          font-size: 14px;
        }
        
        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 20px 0;
        }
        
        /* Responsive Design */
        @media only screen and (max-width: 600px) {
          body {
            padding: 10px;
          }
          
          .email-wrapper {
            border-radius: 8px;
          }
          
          .header {
            padding: 30px 20px;
          }
          
          .header h1 {
            font-size: 24px;
          }
          
          .header .icon {
            font-size: 40px;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          .content h2 {
            font-size: 20px;
          }
          
          .reset-button {
            padding: 14px 30px;
            font-size: 15px;
          }
          
          .footer {
            padding: 20px;
          }
        }
        
        @media only screen and (max-width: 480px) {
          .content h2 {
            font-size: 18px;
          }
          
          .content p {
            font-size: 14px;
          }
          
          .reset-button {
            padding: 12px 25px;
            font-size: 14px;
          }
          
          .security-tips h3 {
            font-size: 14px;
          }
          
          .security-tips li {
            font-size: 13px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
          <div class="icon">🔐</div>
          <h1>Password Reset Request</h1>
        </div>
        
        <!-- Content -->
        <div class="content">
          <h2>Hello ${name}! 👋</h2>
          
          <p>We received a request to reset the password for your <strong>Nexarion Global Exports</strong> account.</p>
          
          <p>If you made this request, click the button below to reset your password:</p>
          
          <!-- Reset Button -->
          <div class="button-container">
            <a href="${resetLink}" class="reset-button">Reset Your Password</a>
          </div>
          
          <!-- Link Alternative -->
          <div class="link-box">
            <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
            <a href="${resetLink}">${resetLink}</a>
          </div>
          
          <!-- Warning -->
          <div class="warning-box">
            <p><strong>⏰ Time Sensitive:</strong> This password reset link will expire in <strong>30 minutes</strong> for security reasons.</p>
          </div>
          
          <!-- Security Info -->
          <div class="info-box">
            <p><strong>🛡️ Didn't request this?</strong><br>
            If you didn't request a password reset, please ignore this email or contact our support team immediately. Your account security is our priority.</p>
          </div>
          
          <!-- Security Tips -->
          <div class="security-tips">
            <h3>🔒 Password Security Tips:</h3>
            <ul>
              <li>Use at least 8 characters with a mix of letters, numbers, and symbols</li>
              <li>Never share your password with anyone</li>
              <li>Use a unique password for each account</li>
              <li>Consider using a password manager</li>
              <li>Enable two-factor authentication when available</li>
            </ul>
          </div>
          
          <div class="divider"></div>
          
          <p>If you have any questions or concerns, our support team is here to help.</p>
          
          <p>Best regards,<br>
          <strong>The Nexarion Security Team</strong></p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p><strong>Nexarion Global Exports</strong></p>
          <p>Connecting verified suppliers and buyers worldwide</p>
          
          <div class="social-links">
            <a href="https://nexarionimpex.com">Website</a> •
            <a href="https://nexarionimpex.com">Support</a> •
            <a href="https://nexarionimpex.com">Contact</a>
          </div>
          
          <div class="divider"></div>
          
          <p style="font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} Nexarion Global Exports. All rights reserved.<br>
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
