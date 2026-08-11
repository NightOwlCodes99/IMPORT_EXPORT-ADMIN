exports.supplierProfileUpdatedEmailTemplate = (supplierName, supplier, isFirstUpdate) => {
  const title = isFirstUpdate ? 'Welcome! Your Business Profile is Set Up' : 'Business Profile Updated';
  const subtitle = isFirstUpdate 
    ? 'Great job! Your business profile has been created successfully.' 
    : 'Your business profile has been updated successfully.';
  
  const verificationBadge = supplier.verificationStatus === 'verified' 
    ? `<span style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">✓ Verified</span>`
    : `<span style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">⏳ Pending Verification</span>`;

  return `
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title} - Nexarion</title>
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
      background-color: #1e293b;
      color: #ffffff;
      padding: 40px 30px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 600;
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
      margin-bottom: 24px;
      color: #4b5563;
    }
    .profile-card {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 24px;
      margin: 28px 0;
    }
    .profile-card h3 {
      margin: 0 0 16px;
      font-size: 17px;
      color: #1f2937;
    }
    .profile-detail {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
    }
    .profile-detail:last-child {
      border-bottom: none;
    }
    .profile-detail .label {
      color: #64748b;
      font-weight: 500;
      min-width: 140px;
    }
    .profile-detail .value {
      color: #1f2937;
      text-align: right;
      word-break: break-word;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      margin-top: 16px;
      text-align: center;
      width: 100%;
      box-sizing: border-box;
    }
    .tips-section {
      background-color: #fffbeb;
      border-left: 4px solid #d97706;
      padding: 20px;
      margin: 28px 0;
      border-radius: 4px;
    }
    .tips-section h4 {
      margin: 0 0 12px;
      font-size: 16px;
      color: #92400e;
    }
    .tips-section ul {
      margin: 0;
      padding-left: 20px;
      font-size: 14px;
      color: #78350f;
    }
    .tips-section li {
      margin-bottom: 8px;
    }
    .cta-section {
      text-align: center;
      margin: 32px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #d97706;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 500;
      padding: 14px 32px;
      border-radius: 6px;
      font-size: 15px;
      margin: 0 8px 12px;
    }
    .secondary-button {
      display: inline-block;
      background-color: #ffffff;
      color: #1f2937 !important;
      text-decoration: none;
      font-weight: 500;
      padding: 12px 28px;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      font-size: 14px;
      margin: 0 8px;
    }
    .closing {
      font-size: 14px;
      color: #6b7280;
      text-align: center;
      margin: 24px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #64748b;
    }
    .footer .brand {
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper { margin: 10px; border-width: 0; }
      .header { padding: 30px 20px 24px; }
      .content { padding: 28px 20px; }
      .header h1 { font-size: 24px; }
      .greeting { font-size: 17px; }
      .profile-detail { flex-direction: column; gap: 4px; }
      .profile-detail .value { text-align: left; }
      .cta-button, .secondary-button { display: block; margin: 12px auto; width: 100%; max-width: 280px; box-sizing: border-box; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>${title}</h1>
    </div>

    <div class="content">
      <p class="greeting">Hello ${supplierName},</p>

      <p class="main-text">${subtitle}</p>

      <div class="profile-card">
        <h3>Your Business Profile</h3>

        <div class="profile-detail">
          <span class="label">Company Name</span>
          <span class="value">${supplier.companyName || 'Not specified'}</span>
        </div>

        <div class="profile-detail">
          <span class="label">Business Type</span>
          <span class="value">${supplier.businessType || 'Not specified'}</span>
        </div>

        <div class="profile-detail">
          <span class="label">Location</span>
          <span class="value">${supplier.city || ''}, ${supplier.country || 'Not specified'}</span>
        </div>

        ${supplier.numberOfEmployees ? `
        <div class="profile-detail">
          <span class="label">Employees</span>
          <span class="value">${supplier.numberOfEmployees}</span>
        </div>
        ` : ''}

        ${supplier.yearEstablished ? `
        <div class="profile-detail">
          <span class="label">Year Established</span>
          <span class="value">${supplier.yearEstablished}</span>
        </div>
        ` : ''}

        ${supplier.website ? `
        <div class="profile-detail">
          <span class="label">Website</span>
          <span class="value"><a href="${supplier.website}" style="color: #2563eb; text-decoration: none;">${supplier.website}</a></span>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 16px;">
          ${verificationBadge}
        </div>
      </div>

      ${isFirstUpdate || supplier.verificationStatus === 'pending' ? `
      <div class="tips-section">
        <h4>Tips to Complete Verification Faster</h4>
        <ul>
          <li>Upload your official business license or registration document</li>
          <li>Add relevant certifications (ISO, CE, FDA, etc.)</li>
          <li>Fill in all required business profile fields</li>
          <li>List at least 5 products in your catalog</li>
          <li>Configure payment terms and shipping options</li>
        </ul>
      </div>
      ` : ''}

      <p class="closing">
        A complete and verified profile increases buyer confidence and improves your visibility on the platform.
      </p>

      <div class="cta-section">
        <a href="https://nexarionimpex.com/dashboard" class="cta-button">
          View & Edit Profile
        </a>
        <a href="https://nexarionimpex.com/dashboard" class="secondary-button">
          Add Products
        </a>
      </div>
    </div>

    <div class="footer">
      <p class="brand">Nexarion</p>
      <p>Global B2B Import/Export Platform</p>
      <p style="margin-top: 12px;">
        This is an automated notification regarding your business profile update.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};
