exports.adminOTPEmailTemplate = (name, code) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Admin Login OTP - Nexarion</title>
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #1a1a2e;
      color: #ffffff;
      line-height: 1.5;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 20px auto;
      background-color: #16213e;
      border: 1px solid #0f3460;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 40px 30px 30px;
      text-align: center;
    }
    .header-icon {
      width: 60px;
      height: 60px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      margin: 0 auto 15px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0;
      font-size: 15px;
      opacity: 0.9;
    }
    .content {
      padding: 35px 30px;
      background-color: #1a1a2e;
    }
    .greeting {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 20px;
      color: #ffffff;
    }
    .main-text {
      font-size: 15px;
      margin-bottom: 20px;
      color: #b8c5d6;
    }
    .code-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 28px 20px;
      text-align: center;
      margin: 28px 0;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    .code-label {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
    }
    .verification-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 42px;
      font-weight: 700;
      letter-spacing: 12px;
      color: #ffffff;
      margin: 0;
      padding: 12px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    .expiry-notice {
      background-color: #2d1f3d;
      border-left: 4px solid #e74c3c;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #ff6b6b;
    }
    .expiry-notice strong {
      color: #ff8a8a;
    }
    .security-notice {
      background-color: #0f3460;
      border: 1px solid #1e4d7b;
      padding: 20px;
      border-radius: 8px;
      margin: 28px 0;
      font-size: 14px;
      color: #b8c5d6;
    }
    .security-notice strong {
      color: #ffffff;
    }
    .security-list {
      margin: 15px 0 0;
      padding-left: 20px;
    }
    .security-list li {
      margin: 8px 0;
      color: #94a3b8;
    }
    .warning-box {
      background-color: #3d2c29;
      border: 1px solid #e74c3c;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .warning-box p {
      margin: 0;
      color: #ff6b6b;
      font-size: 14px;
    }
    .footer {
      background-color: #0f3460;
      color: #94a3b8;
      padding: 30px;
      text-align: center;
      font-size: 13px;
    }
    .footer-logo {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 12px;
    }
    .footer-logo span {
      color: #667eea;
    }
    .footer p {
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="header-icon">
        <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: white;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h1>🔐 Admin Login Verification</h1>
      <p>Secure Access Authentication</p>
    </div>

    <div class="content">
      <p class="greeting">Hello ${name},</p>
      
      <p class="main-text">
        A login attempt was made to the <strong>Nexarion Admin Dashboard</strong>. 
        Use the following One-Time Password (OTP) to complete your authentication:
      </p>

      <div class="code-container">
        <p class="code-label">🔑 Your Admin OTP Code</p>
        <p class="verification-code">${code}</p>
      </div>

      <div class="expiry-notice">
        <strong>⏰ This code expires in 10 minutes.</strong>
        <br>
        Do not share this code with anyone. Nexarion staff will never ask for your OTP.
      </div>

      <div class="security-notice">
        <strong>🛡️ Security Information:</strong>
        <ul class="security-list">
          <li>This OTP was generated for admin dashboard access</li>
          <li>IP address and login attempts are logged</li>
          <li>If you didn't request this, please secure your account immediately</li>
          <li>Contact support if you notice suspicious activity</li>
        </ul>
      </div>

      <div class="warning-box">
        <p>⚠️ If you did not attempt to login, please change your password immediately and contact the security team.</p>
      </div>
    </div>

    <div class="footer">
      <p class="footer-logo"><span>Nexarion</span> Global Exports</p>
      <p>Admin Security System</p>
      <p style="margin-top: 15px; font-size: 12px; color: #64748b;">
        This is an automated security email. Please do not reply.
      </p>
      <p style="font-size: 11px; color: #475569; margin-top: 10px;">
        © ${new Date().getFullYear()} Nexarion Global Exports. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};
