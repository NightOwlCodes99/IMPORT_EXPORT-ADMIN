exports.verificationEmailTemplate = (name, code) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify Your Email - Nexarion</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333333;
      line-height: 1.5;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
    }
    .header {
      background-color: #047857;
      color: #ffffff;
      padding: 40px 30px 30px;
      text-align: center;
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
    }
    .greeting {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 20px;
      color: #1f2937;
    }
    .main-text {
      font-size: 15px;
      margin-bottom: 20px;
      color: #4b5563;
    }
    .code-container {
      background-color: #f3f4f6;
      border: 2px solid #059669;
      border-radius: 8px;
      padding: 28px 20px;
      text-align: center;
      margin: 28px 0;
    }
    .code-label {
      font-size: 14px;
      font-weight: 600;
      color: #059669;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .verification-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 10px;
      color: #047857;
      margin: 0;
      padding: 12px 0;
    }
    .expiry-notice {
      background-color: #fefce8;
      border-left: 4px solid #ca8a04;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #854d0e;
    }
    .expiry-notice strong {
      color: #92400e;
    }
    .security-notice {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      padding: 20px;
      border-radius: 6px;
      margin: 28px 0;
      font-size: 14px;
      color: #4b5563;
    }
    .security-notice strong {
      color: #1f2937;
    }
    .cta-section {
      text-align: center;
      margin: 32px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #059669;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 500;
      padding: 14px 36px;
      border-radius: 6px;
      font-size: 15px;
    }
    .closing {
      font-size: 14px;
      color: #6b7280;
      text-align: center;
      margin: 24px 0 32px;
    }
    .footer {
      background-color: #1f2937;
      color: #9ca3af;
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
      color: #10b981;
    }
    .footer-links a {
      color: #10b981;
      text-decoration: none;
      margin: 0 12px;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper { margin: 10px; border-width: 0; }
      .header { padding: 30px 20px 24px; }
      .content { padding: 28px 20px; }
      .header h1 { font-size: 24px; }
      .greeting { font-size: 17px; }
      .verification-code { font-size: 32px; letter-spacing: 8px; }
      .code-container { padding: 24px 16px; }
      .cta-button { padding: 14px 28px; width: 100%; box-sizing: border-box; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>Email Verification Required</h1>
      <p>Complete your Nexarion registration</p>
    </div>

    <div class="content">
      <p class="greeting">Dear ${name},</p>

      <p class="main-text">
        Thank you for registering with Nexarion. To activate your account and gain access to our global B2B import/export platform, please verify your email address using the code below.
      </p>

      <div class="code-container">
        <div class="code-label">Verification Code</div>
        <div class="verification-code">${code}</div>
      </div>

      <div class="expiry-notice">
        <strong>Important:</strong> This code expires in <strong>10 minutes</strong>. Please complete verification promptly to avoid needing a new code.
      </div>

      <div class="security-notice">
        <strong>If you did not register for a Nexarion account,</strong> please disregard this email. No action is required and your information remains secure.
      </div>

      <div class="cta-section">
        <a href="https://nexarionimpex.com/dashboard" class="cta-button">
          Verify Email Address
        </a>
      </div>

      <p class="closing">
        If the button above does not work, copy and paste the verification code into the appropriate field on our website.
      </p>
    </div>

    <div class="footer">
      <div class="footer-logo">Nexarion<span>.</span></div>
      <p>Global B2B Import/Export Platform</p>
      <p style="margin: 12px 0 0;">
        <a href="https://nexarionimpex.com">Privacy Policy</a> • <a href="https://nexarionimpex.com">Terms of Service</a> • <a href="https://nexarionimpex.com">Help Center</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
};
