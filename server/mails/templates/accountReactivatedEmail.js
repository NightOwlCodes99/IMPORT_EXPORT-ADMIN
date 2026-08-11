exports.accountReactivatedEmailTemplate = (name) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Account Reactivated – Nexarion Global Exports</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style type="text/css">
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #f5f5f5;
      padding: 28px 16px;
      color: #333333;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    /* HEADER */
    .header {
      background-color: #047857;
      padding: 44px 40px 36px;
    }

    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
    }

    .brand {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      color: #ffffff;
      letter-spacing: 0.02em;
    }

    .brand span { color: #6ee7b7; }

    .badge {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #6ee7b7;
      border: 1px solid rgba(110, 231, 183, 0.5);
      padding: 4px 10px;
      border-radius: 2px;
    }

    .header-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
      margin-bottom: 8px;
    }

    .header-sub {
      font-size: 11px;
      font-weight: 300;
      color: rgba(255,255,255,0.6);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.25);
      color: #ffffff;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 6px 14px 6px 10px;
      border-radius: 2px;
    }

    .status-dot {
      width: 7px; height: 7px;
      background: #6ee7b7;
      border-radius: 50%;
    }

    /* BODY */
    .body { padding: 36px 40px; background: #ffffff; }

    .greeting { font-size: 16px; color: #1f2937; margin-bottom: 12px; }
    .greeting strong { font-weight: 600; color: #065f46; }

    .lead { font-size: 14px; color: #4b5563; line-height: 1.75; margin-bottom: 28px; }

    /* NOTICE */
    .notice {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 4px solid #059669;
      border-radius: 4px;
      padding: 20px 22px;
      margin-bottom: 32px;
    }

    .notice h4 {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #065f46;
      margin-bottom: 8px;
    }

    .notice p { font-size: 13px; color: #047857; line-height: 1.65; }

    /* SECTION LABEL */
    .slabel {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #059669;
      margin-bottom: 14px;
    }

    /* FEATURES GRID */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 32px;
    }

    .feature-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-top: 3px solid #059669;
      border-radius: 4px;
      padding: 18px 16px;
    }

    .feature-card h4 { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 6px; }
    .feature-card p { font-size: 12px; color: #6b7280; font-weight: 300; line-height: 1.55; }

    /* DIVIDER */
    .divider { height: 1px; background: #e5e7eb; margin: 28px 0; }

    /* CTA */
    .cta-block { text-align: center; margin-bottom: 28px; }
    .cta-block p { font-size: 13px; color: #6b7280; margin-bottom: 16px; }

    .cta {
      display: inline-block;
      background-color: #059669;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 36px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    /* REMINDER */
    .reminder {
      background-color: #fefce8;
      border: 1px solid #fde68a;
      border-left: 4px solid #d97706;
      border-radius: 4px;
      padding: 18px 20px;
      margin-bottom: 28px;
    }

    .reminder h4 {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #92400e;
      margin-bottom: 7px;
    }

    .reminder p { font-size: 13px; color: #854d0e; line-height: 1.65; }

    .closing { font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.7; }

    /* FOOTER */
    .footer {
      background-color: #1f2937;
      padding: 28px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .fbrand { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: #ffffff; }
    .fbrand span { color: #10b981; }

    .fmeta { font-size: 11px; color: #6b7280; text-align: right; line-height: 1.7; }
    .fmeta a { color: #10b981; text-decoration: none; margin-left: 10px; }

    /* RESPONSIVE */
    @media only screen and (max-width: 600px) {
      body { padding: 16px 8px; }
      .header { padding: 30px 24px 26px; }
      .header-top { flex-direction: column; align-items: flex-start; gap: 10px; }
      .header-title { font-size: 26px; }
      .body { padding: 28px 20px; }
      .features-grid { grid-template-columns: 1fr; }
      .cta { display: block; width: 100%; text-align: center; }
      .footer { flex-direction: column; align-items: flex-start; padding: 24px 20px; }
      .fmeta { text-align: left; }
      .fmeta a { margin-left: 0; margin-right: 10px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <div class="header-top">
        <div class="brand">Nexarion Global Exports<span>.</span></div>
        <div class="badge">Account Notice</div>
      </div>
      <div class="header-title">Account<br>Reactivated</div>
      <div class="header-sub">Access Restored &nbsp;·&nbsp; ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="status-pill"><span class="status-dot"></span>Status: Active</div>
    </div>

    <div class="body">
      <p class="greeting">Dear <strong>${name}</strong>,</p>
      <p class="lead">
        We confirm that your Nexarion Global Exports account has been successfully reactivated.
        All previous data, settings, and access privileges have been fully restored effective immediately.
      </p>

      <div class="notice">
        <h4>Account Status: Active</h4>
        <p>You may now log in to browse verified global suppliers, place orders, request quotes, track shipments, and engage in secure B2B communications.</p>
      </div>

      <div class="slabel">Key Capabilities Available</div>
      <div class="features-grid">
        <div class="feature-card">
          <h4>Place &amp; Manage Orders</h4>
          <p>Resume transactions with verified international suppliers</p>
        </div>
        <div class="feature-card">
          <h4>Request Competitive Quotes</h4>
          <p>Receive tailored pricing from global trade partners</p>
        </div>
        <div class="feature-card">
          <h4>Track Shipments</h4>
          <p>Monitor logistics and delivery status in real time</p>
        </div>
        <div class="feature-card">
          <h4>Connect &amp; Communicate</h4>
          <p>Engage directly with buyers and suppliers worldwide</p>
        </div>
      </div>

      <div class="divider"></div>

      <div class="cta-block">
        <p>Your account is ready. Log in to resume your global trade activities.</p>
        <a href="https://nexarionimpex.com/dashboard" class="cta">Log In to Nexarion Global Exports</a>
      </div>

      <div class="reminder">
        <h4>Account Compliance Reminder</h4>
        <p>To ensure continued access, please adhere to our Terms of Service and Community Guidelines. These standards uphold a trusted environment for international trade.</p>
      </div>

      <p class="closing">
        Thank you for returning to Nexarion Global Exports.<br>We look forward to supporting your global trade activities.
      </p>
    </div>

    <div class="footer">
      <div class="fbrand">Nexarion Global Exports<span>.</span></div>
      <div class="fmeta">
        Global B2B Import/Export Platform<br>
        <a href="https://nexarionimpex.com">Privacy Policy</a>
        <a href="https://nexarionimpex.com">Terms of Service</a>
        <a href="https://nexarionimpex.com">Help Center</a>
      </div>
    </div>

  </div>
</body>
</html>
  `;
};