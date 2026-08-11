exports.adminRFQCreatedTemplate = (quoteData) => {
  const { 
    customerName, 
    quoteId, 
    productName, 
    category,
    quantity,
    unit,
    description,
    targetPrice,
    deliveryLocation,
    expectedDeliveryDate,
    urgency
  } = quoteData;

  const urgencyConfig = {
    'Low':    { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Low Priority' },
    'Medium': { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Medium Priority' },
    'High':   { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', label: 'High Priority' },
    'Urgent': { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Urgent' }
  };

  const config = urgencyConfig[urgency] || urgencyConfig['Medium'];

  const formatLocation = (loc) => {
    if (!loc) return 'Not specified';
    const parts = [loc.city, loc.state, loc.country].filter(Boolean);
    return parts.join(', ') || 'Not specified';
  };

  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Quote Request – ${quoteId}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style type="text/css">
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #f5f5f5;
      padding: 28px 16px;
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
    .header {
      background-color: #1e1b4b;
      padding: 44px 40px 36px;
    }
    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
    }
    .brand { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #fff; letter-spacing: .02em; }
    .brand span { color: #a5b4fc; }
    .badge { font-size: 9px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: #a5b4fc; border: 1px solid rgba(165,180,252,.4); padding: 4px 10px; border-radius: 2px; }
    .header-title { font-family: 'Playfair Display', Georgia, serif; font-size: 30px; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 8px; }
    .header-sub { font-size: 11px; font-weight: 300; color: rgba(255,255,255,.55); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 18px; }
    .quote-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,255,255,.1);
      border: 1px solid rgba(255,255,255,.2);
      padding: 8px 16px;
      border-radius: 2px;
    }
    .quote-label { font-size: 9px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.5); }
    .quote-id { font-size: 14px; font-weight: 600; color: #a5b4fc; letter-spacing: .06em; }
    .body { padding: 36px 40px; background: #fff; }
    .greeting { font-size: 15px; color: #1f2937; margin-bottom: 11px; }
    .greeting strong { font-weight: 600; color: #1e1b4b; }
    .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 28px; }
    .urgency-tag {
      display: inline-block;
      background: ${config.bg};
      border: 1px solid ${config.border};
      color: ${config.color};
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      padding: 5px 12px;
      border-radius: 2px;
      margin-bottom: 24px;
    }
    .slabel { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: #6366f1; margin-bottom: 12px; }
    .dtable { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    .dtable tr { border-bottom: 1px solid #f3f4f6; }
    .dtable tr:last-child { border-bottom: none; }
    .dtable td { font-size: 13px; padding: 11px 0; vertical-align: top; }
    .dtable td:first-child { color: #9ca3af; width: 38%; padding-right: 12px; font-weight: 400; }
    .dtable td:last-child { color: #1f2937; font-weight: 500; }
    .desc-box {
      background: #f9fafb;
      border-left: 3px solid #6366f1;
      border-radius: 3px;
      padding: 16px 18px;
      margin-bottom: 28px;
    }
    .desc-box p { font-size: 13px; color: #4b5563; line-height: 1.7; }
    .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
    .cta-block { text-align: center; margin-bottom: 24px; }
    .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 14px; }
    .cta {
      display: inline-block;
      background: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 34px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
    }
    .closing { font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.7; }
    .footer {
      background-color: #1f2937;
      padding: 24px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }
    .fbrand { font-family: 'Playfair Display', Georgia, serif; font-size: 14px; color: #fff; }
    .fbrand span { color: #10b981; }
    .fmeta { font-size: 10px; color: #6b7280; text-align: right; line-height: 1.7; }
    .fmeta a { color: #10b981; text-decoration: none; margin-left: 8px; }
    @media only screen and (max-width: 600px) {
      body { padding: 16px 8px; }
      .header { padding: 30px 24px 26px; }
      .header-top { flex-direction: column; align-items: flex-start; gap: 10px; }
      .header-title { font-size: 24px; }
      .body { padding: 28px 20px; }
      .cta { display: block; width: 100%; text-align: center; }
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
        <div class="badge">RFQ Notice</div>
      </div>
      <div class="header-title">Quote Request<br>Submitted</div>
      <div class="header-sub">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="quote-pill">
        <span class="quote-label">Reference</span>
        <span class="quote-id">${quoteId}</span>
      </div>
    </div>

    <div class="body">
      <p class="greeting">Dear <strong>${customerName}</strong>,</p>
      <p class="lead">Your quote request has been received and is now under review by our sourcing team. You will receive a detailed quotation within 24–48 hours.</p>

      <div class="urgency-tag">${config.label}</div>

      <div class="slabel">Request Details</div>
      <table class="dtable">
        <tr><td>Product</td><td>${productName}</td></tr>
        <tr><td>Category</td><td>${category}</td></tr>
        <tr><td>Quantity</td><td>${quantity.toLocaleString()} ${unit || 'pieces'}</td></tr>
        ${targetPrice ? `<tr><td>Target Price</td><td>$${parseFloat(targetPrice).toLocaleString()}</td></tr>` : ''}
        <tr><td>Delivery Location</td><td>${formatLocation(deliveryLocation)}</td></tr>
        ${expectedDeliveryDate ? `<tr><td>Expected Delivery</td><td>${new Date(expectedDeliveryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>` : ''}
      </table>

      ${description ? `
      <div class="desc-box">
        <p>${description}</p>
      </div>
      ` : ''}

      <div class="divider"></div>

      <div class="cta-block">
        <p>Track the status of your quote from your dashboard.</p>
        <a href="https://nexarionimpex.com/dashboard" class="cta">View Quote Status</a>
      </div>

      <p class="closing">Questions? Contact us at <a href="mailto:support@nexarionimpex.com" style="color:#4f46e5;text-decoration:none;">support@nexarionimpex.com</a></p>
    </div>

    <div class="footer">
      <div class="fbrand">Nexarion Global Exports<span>.</span></div>
      <div class="fmeta">
        Global B2B Import/Export Platform<br>
        <a href="https://nexarionimpex.com">Privacy Policy</a>
        <a href="https://nexarionimpex.com">Terms of Service</a>
      </div>
    </div>

  </div>
</body>
</html>
  `;
};