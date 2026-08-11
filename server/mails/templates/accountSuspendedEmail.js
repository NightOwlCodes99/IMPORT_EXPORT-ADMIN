exports.accountSuspendedEmailTemplate = (name, reason = null) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Account Suspended – Nexarion Global Exports</title>
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
      background-color: #b91c1c;
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

    .brand span { color: #fca5a5; }

    .badge {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #fca5a5;
      border: 1px solid rgba(252, 165, 165, 0.5);
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
      background: #fca5a5;
      border-radius: 50%;
    }

    /* BODY */
    .body { padding: 36px 40px; background: #ffffff; }

    .greeting { font-size: 16px; color: #1f2937; margin-bottom: 12px; }
    .greeting strong { font-weight: 600; color: #991b1b; }

    .lead { font-size: 14px; color: #4b5563; line-height: 1.75; margin-bottom: 28px; }

    /* ALERT NOTICE */
    .alert-notice {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-left: 4px solid #dc2626;
      border-radius: 4px;
      padding: 20px 22px;
      margin-bottom: 28px;
    }

    .alert-notice h4 {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #991b1b;
      margin-bottom: 8px;
    }

    .alert-notice p { font-size: 13px; color: #b91c1c; line-height: 1.65; }

    /* REASON BOX */
    .reason-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-left: 4px solid #6b7280;
      border-radius: 4px;
      padding: 18px 20px;
      margin-bottom: 28px;
    }

    .reason-box h4 {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #374151;
      margin-bottom: 8px;
    }

    .reason-box p { font-size: 13px; color: #4b5563; line-height: 1.65; }

    /* SECTION LABEL */
    .slabel {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #dc2626;
      margin-bottom: 14px;
    }

    /* STEPS */
    .steps { margin-bottom: 28px; }

    .step {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      padding: 14px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .step:last-child { border-bottom: none; }

    .step-num {
      width: 26px;
      height: 26px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: #b91c1c;
      flex-shrink: 0;
    }

    .step-text { font-size: 13px; color: #4b5563; line-height: 1.65; }
    .step-text strong { color: #1f2937; font-weight: 600; }

    /* DIVIDER */
    .divider { height: 1px; background: #e5e7eb; margin: 28px 0; }

    /* CTA */
    .cta-block { text-align: center; margin-bottom: 28px; }
    .cta-block p { font-size: 13px; color: #6b7280; margin-bottom: 16px; line-height: 1.6; }

    .cta {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 36px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

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

    .fbrand { font-family: 'Playfair Display', Georgia, serif; font-size: 15px; color: #ffffff; }
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
      <div class="header-title">Account<br>Suspended</div>
      <div class="header-sub">Notice Issued &nbsp;·&nbsp; ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="status-pill"><span class="status-dot"></span>Status: Suspended</div>
    </div>

    <div class="body">
      <p class="greeting">Dear <strong>${name}</strong>,</p>
      <p class="lead">
        We regret to inform you that your Nexarion Global Exports account has been temporarily suspended.
        During this period, you will not be able to log in or access any platform services.
      </p>

      <div class="alert-notice">
        <h4>Current Account Status</h4>
        <p>Access to all features — including browsing suppliers, placing orders, requesting quotes, and viewing communications — is restricted until this matter is resolved.</p>
      </div>

      ${reason ? `
      <div class="reason-box">
        <h4>Reason for Suspension</h4>
        <p>${reason}</p>
      </div>
      ` : ''}

      <div class="slabel">Next Steps</div>
      <div class="steps">
        <div class="step">
          <div class="step-num">01</div>
          <div class="step-text">Contact our support team to understand the reason for suspension and discuss resolution steps.</div>
        </div>
        <div class="step">
          <div class="step-num">02</div>
          <div class="step-text">Review our <strong>Terms of Service</strong> and platform policies to ensure future compliance.</div>
        </div>
        <div class="step">
          <div class="step-num">03</div>
          <div class="step-text">If you have already submitted an appeal, please await review from our compliance team.</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="cta-block">
        <p>If you believe this suspension was issued in error or require clarification, please contact our support team promptly.</p>
        <a href="mailto:support@nexarionimpex.com" class="cta">Contact Support</a>
      </div>

      <p class="closing">
        We value your participation and aim to resolve this matter as quickly as possible.
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