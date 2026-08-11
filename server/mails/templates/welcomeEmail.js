exports.welcomeEmailTemplate = (name, role) => {
  const fonts = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">`;

  const roleInfo = {
    customer: {
      title: 'Welcome to\nNexarion',
      sub: 'Explore quality products from verified suppliers worldwide',
      badge: 'New Member'
    },
    importer: {
      title: 'Welcome,\nImporter',
      sub: 'Discover and source products from trusted global suppliers',
      badge: 'Importer Account'
    },
    exporter: {
      title: 'Welcome,\nExporter',
      sub: 'Connect with buyers worldwide and grow your export business',
      badge: 'Exporter Account'
    },
    supplier: {
      title: 'Welcome,\nSupplier',
      sub: 'Showcase your products to a global B2B marketplace',
      badge: 'Supplier Account'
    },
    buyer: {
      title: 'Welcome,\nBuyer',
      sub: 'Find quality products from verified and trusted suppliers',
      badge: 'Buyer Account'
    }
  };

  const info = roleInfo[role] || roleInfo.customer;
  const titleLines = info.title.split('\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Nexarion – ${name}</title>
  ${fonts}
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f5f5f5; padding: 28px 16px; -webkit-font-smoothing: antialiased; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }

    /* Header */
    .header { background: #065f46; padding: 40px 40px 32px; }
    .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .brand { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #fff; letter-spacing: .02em; }
    .brand span { color: #6ee7b7; }
    .badge { font-size: 9px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: #6ee7b7; border: 1px solid rgba(110,231,183,.5); padding: 4px 10px; border-radius: 2px; }
    .header-title { font-family: 'Playfair Display', Georgia, serif; font-size: 30px; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 8px; }
    .header-sub { font-size: 11px; font-weight: 300; color: rgba(255,255,255,.6); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 20px; }
    .pills { display: flex; gap: 8px; flex-wrap: wrap; }
    .refpill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); padding: 7px 14px; border-radius: 2px; }
    .rl { font-size: 9px; color: rgba(255,255,255,.6); letter-spacing: .1em; text-transform: uppercase; }
    .ri { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: .06em; }
    .spill { display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); color: #fff; font-size: 10px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; padding: 7px 13px 7px 9px; border-radius: 2px; }
    .sdot { width: 6px; height: 6px; background: #6ee7b7; border-radius: 50%; }

    /* Body */
    .body { padding: 36px 40px; background: #fff; }
    .greeting { font-size: 15px; color: #1f2937; margin-bottom: 10px; }
    .greeting strong { font-weight: 600; color: #065f46; }
    .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 26px; }

    /* Welcome hero */
    .welcome-hero { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 24px 20px; text-align: center; margin-bottom: 26px; }
    .welcome-hero-label { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: #059669; margin-bottom: 8px; }
    .welcome-hero-name { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; color: #047857; line-height: 1; margin-bottom: 6px; }
    .welcome-hero-sub { font-size: 12px; color: #6b7280; margin-bottom: 14px; }
    .welcome-tag { display: inline-block; background: #dcfce7; border: 1px solid #bbf7d0; color: #065f46; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 4px 12px; border-radius: 2px; }

    /* Feature grid — using table for email client compat */
    .feat-table { width: 100%; border-collapse: separate; border-spacing: 8px; margin-bottom: 8px; }
    .feat-cell { width: 50%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 16px 14px; vertical-align: top; }
    .feat-label { font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #059669; margin-bottom: 6px; }
    .feat-title { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 4px; }
    .feat-desc { font-size: 12px; color: #6b7280; line-height: 1.5; }

    /* Info box */
    .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 14px 16px; margin-bottom: 24px; }
    .info-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #1d4ed8; margin-bottom: 8px; }
    .info-box p { font-size: 13px; color: #374151; line-height: 1.65; }

    /* Steps */
    .steps-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #059669; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
    .steps-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #065f46; margin-bottom: 12px; }
    .step { display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; border-bottom: 1px solid #d1fae5; }
    .step:last-child { border-bottom: none; }
    .snum { width: 20px; height: 20px; min-width: 20px; background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #065f46; }
    .stxt { font-size: 12px; color: #374151; line-height: 1.55; }

    /* Slabel */
    .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #059669; margin-bottom: 10px; }
    .sec { margin-bottom: 24px; }

    /* CTA */
    .divider { height: 1px; background: #e5e7eb; margin: 22px 0; }
    .cta-block { text-align: center; margin-bottom: 20px; }
    .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
    .cta-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .cta { display: inline-block; background: #065f46; color: #fff !important; text-decoration: none; padding: 13px 30px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
    .cta-outline { display: inline-block; background: transparent; color: #374151 !important; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 13px; font-weight: 600; border: 1px solid #d1d5db; }
    .help { text-align: center; font-size: 12px; color: #9ca3af; padding-top: 16px; border-top: 1px solid #f3f4f6; }
    .help a { color: #059669; text-decoration: none; font-weight: 500; }

    /* Footer */
    .footer { background: #1f2937; padding: 24px 40px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
    .fbrand { font-family: 'Playfair Display', Georgia, serif; font-size: 14px; color: #fff; }
    .fbrand span { color: #10b981; }
    .fmeta { font-size: 10px; color: #6b7280; text-align: right; line-height: 1.7; }
    .fmeta a { color: #10b981; text-decoration: none; margin-left: 8px; }

    @media only screen and (max-width: 600px) {
      body { padding: 16px 8px; }
      .header { padding: 28px 20px 24px; }
      .header-top { flex-direction: column; align-items: flex-start; gap: 10px; }
      .header-title { font-size: 24px; }
      .body { padding: 26px 20px; }
      .feat-table, .feat-cell { display: block; width: 100%; margin-bottom: 8px; }
      .cta-row { flex-direction: column; align-items: center; }
      .cta, .cta-outline { width: 100%; text-align: center; }
      .footer { flex-direction: column; align-items: flex-start; padding: 20px; }
      .fmeta { text-align: left; }
      .fmeta a { margin-left: 0; margin-right: 8px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <div class="header-top">
        <div class="brand">Nexarion Global Exports<span>.</span></div>
        <div class="badge">${info.badge}</div>
      </div>
      <div class="header-title">${titleLines[0]}<br>${titleLines[1]}</div>
      <div class="header-sub">${info.sub}</div>
      <div class="pills">
        <div class="refpill"><span class="rl">Member</span><span class="ri">${name}</span></div>
        <div class="spill"><span class="sdot"></span>Account Active</div>
      </div>
    </div>

    <div class="body">

      <p class="greeting">Welcome, <strong>${name}</strong>!</p>
      <p class="lead">
        Congratulations — your account has been successfully verified and you are now part of the <strong style="color:#1f2937;">Nexarion Global Exports</strong> community. We're thrilled to have you on board as you begin your journey in global trade.
      </p>

      <div class="welcome-hero">
        <div class="welcome-hero-label">Account Verified</div>
        <div class="welcome-hero-name">${name}</div>
        <div class="welcome-hero-sub">${info.badge} &nbsp;·&nbsp; Ready to Trade</div>
        <span class="welcome-tag">Welcome to the Platform</span>
      </div>

      <div class="sec">
        <div class="slabel">Platform Features</div>
        <table class="feat-table">
          <tr>
            <td class="feat-cell">
              <div class="feat-label">Trust</div>
              <div class="feat-title">Verified Suppliers</div>
              <div class="feat-desc">Trade with confidence knowing every supplier is vetted and verified.</div>
            </td>
            <td class="feat-cell">
              <div class="feat-label">Reach</div>
              <div class="feat-title">Global Network</div>
              <div class="feat-desc">Connect with buyers and suppliers across 100+ countries worldwide.</div>
            </td>
          </tr>
          <tr>
            <td class="feat-cell">
              <div class="feat-label">Security</div>
              <div class="feat-title">Secure Payments</div>
              <div class="feat-desc">Protected transactions with escrow and multi-currency support.</div>
            </td>
            <td class="feat-cell">
              <div class="feat-label">Insights</div>
              <div class="feat-title">Trade Analytics</div>
              <div class="feat-desc">Track orders, shipments, and performance from your dashboard.</div>
            </td>
          </tr>
        </table>
      </div>

      <div class="steps-box">
        <h4>Getting Started</h4>
        <div class="step"><div class="snum">01</div><div class="stxt">Complete your business profile to build trust with potential trade partners.</div></div>
        <div class="step"><div class="snum">02</div><div class="stxt">Upload your verification documents to unlock all platform features.</div></div>
        <div class="step"><div class="snum">03</div><div class="stxt">Browse the marketplace and connect with verified global suppliers or buyers.</div></div>
        <div class="step"><div class="snum">04</div><div class="stxt">Submit your first quote request or list your products to start trading.</div></div>
      </div>

      <div class="info-box">
        <h4>Quick Tip</h4>
        <p>Add your business details, preferences, and verification documents to your profile. A complete profile builds trust with potential partners and unlocks priority features on the platform.</p>
      </div>

      <div class="divider"></div>

      <div class="cta-block">
        <p>Your account is ready — start exploring the Nexarion platform now.</p>
        <div class="cta-row">
          <a href="https://nexarionimpex.com/dashboard" class="cta">Explore Platform</a>
          <a href="https://nexarionimpex.com/dashboard" class="cta-outline">Complete Profile</a>
        </div>
      </div>
      
      <div class="help">
        Need help getting started? <a href="mailto:support@nexarionimpex.com">support@nexarionimpex.com</a>
      </div>

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