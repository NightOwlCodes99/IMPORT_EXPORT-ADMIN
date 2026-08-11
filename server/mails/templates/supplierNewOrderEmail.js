exports.supplierNewOrderEmailTemplate = (supplierName, order, products) => {
  const fonts = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">`;

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const productRows = products.map(item => `
    <tr>
      <td class="lbl" style="width:auto;color:#1f2937;font-weight:500;">${item.product?.name || item.name || 'N/A'}</td>
      <td class="val" style="text-align:center;width:80px;">${item.quantity || 1}</td>
      <td class="val" style="text-align:right;width:110px;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
    </tr>
  `).join('');

  const totalAmount = products.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

  const buyer = order.buyer || order.user;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Received – #${order.orderNumber || order._id || 'N/A'}</title>
  ${fonts}
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f5f5f5; padding: 28px 16px; -webkit-font-smoothing: antialiased; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }

    /* Header */
    .header { background: #1e3a5f; padding: 40px 40px 32px; }
    .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .brand { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #fff; letter-spacing: .02em; }
    .brand span { color: #93c5fd; }
    .badge { font-size: 9px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: #93c5fd; border: 1px solid rgba(147,197,253,.5); padding: 4px 10px; border-radius: 2px; }
    .header-title { font-family: 'Playfair Display', Georgia, serif; font-size: 30px; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 8px; }
    .header-sub { font-size: 11px; font-weight: 300; color: rgba(255,255,255,.6); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 20px; }
    .pills { display: flex; gap: 8px; flex-wrap: wrap; }
    .refpill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); padding: 7px 14px; border-radius: 2px; }
    .rl { font-size: 9px; color: rgba(255,255,255,.6); letter-spacing: .1em; text-transform: uppercase; }
    .ri { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: .06em; }
    .spill { display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); color: #fff; font-size: 10px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; padding: 7px 13px 7px 9px; border-radius: 2px; }
    .sdot { width: 6px; height: 6px; background: #93c5fd; border-radius: 50%; }

    /* Body */
    .body { padding: 36px 40px; background: #fff; }
    .greeting { font-size: 15px; color: #1f2937; margin-bottom: 10px; }
    .greeting strong { font-weight: 600; color: #1e3a5f; }
    .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 26px; }

    /* Total hero */
    .total-hero { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 26px 20px; text-align: center; margin-bottom: 26px; }
    .total-label { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: #1d4ed8; margin-bottom: 10px; }
    .total-value { font-family: 'Playfair Display', Georgia, serif; font-size: 42px; font-weight: 700; color: #1e3a5f; line-height: 1; margin-bottom: 6px; }
    .total-items { display: inline-block; background: #dbeafe; border: 1px solid #bfdbfe; color: #1e40af; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 4px 12px; border-radius: 2px; }

    /* Section label */
    .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #3b82f6; margin-bottom: 10px; }
    .sec { margin-bottom: 24px; }

    /* Data table */
    .dtable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
    .dtable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
    .dtable tr:last-child td { border-bottom: none; }
    .dtable .lbl { color: #9ca3af; width: 150px; }
    .dtable .val { color: #1f2937; font-weight: 500; text-align: right; }

    /* Products table */
    .ptable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 24px; }
    .ptable th { background: #f1f5f9; padding: 9px 14px; font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
    .ptable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; color: #4b5563; }
    .ptable tr:last-child td { border-bottom: none; }
    .ptable .total-row td { background: #eff6ff; border-top: 1px solid #bfdbfe; font-size: 13px; font-weight: 700; color: #1e3a5f; }

    /* Buyer info box */
    .buyer-box { background: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
    .buyer-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #1d4ed8; margin-bottom: 12px; }

    /* Action box */
    .action-box { background: #fefce8; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 4px; padding: 14px 16px; margin-bottom: 24px; }
    .action-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #92400e; margin-bottom: 8px; }
    .action-box p { font-size: 13px; color: #78350f; line-height: 1.65; }

    /* Steps */
    .steps-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
    .steps-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #1d4ed8; margin-bottom: 12px; }
    .step { display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; border-bottom: 1px solid #dbeafe; }
    .step:last-child { border-bottom: none; }
    .snum { width: 20px; height: 20px; min-width: 20px; background: #dbeafe; border: 1px solid #bfdbfe; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #1e40af; }
    .stxt { font-size: 12px; color: #374151; line-height: 1.55; }

    /* CTA */
    .divider { height: 1px; background: #e5e7eb; margin: 22px 0; }
    .cta-block { text-align: center; margin-bottom: 20px; }
    .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
    .cta { display: inline-block; background: #1e3a5f; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
    .help { text-align: center; font-size: 12px; color: #9ca3af; padding-top: 16px; border-top: 1px solid #f3f4f6; }
    .help a { color: #3b82f6; text-decoration: none; font-weight: 500; }

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
      .total-value { font-size: 34px; }
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
        <div class="badge">New Order</div>
      </div>
      <div class="header-title">New Order<br>Received</div>
      <div class="header-sub">Order Confirmed &nbsp;·&nbsp; ${order.createdAt ? formatDate(order.createdAt) : formatDate(new Date())}</div>
      <div class="pills">
        <div class="refpill"><span class="rl">Order</span><span class="ri">#${order.orderNumber || order._id || 'N/A'}</span></div>
        <div class="spill"><span class="sdot"></span>Action Required</div>
      </div>
    </div>

    <div class="body">

      <p class="greeting">Dear <strong>${supplierName}</strong>,</p>
      <p class="lead">
        You have received a new order on Nexarion Global Exports. Please review the details below and process the order within 24 hours to maintain your seller rating.
      </p>

      <div class="total-hero">
        <div class="total-label">Order Total</div>
        <div class="total-value">$${totalAmount.toFixed(2)}</div>
        <div style="font-size:11px;color:#6b7280;margin-bottom:14px;">${products.length} product${products.length !== 1 ? 's' : ''} ordered</div>
        <span class="total-items">New Order &nbsp;·&nbsp; Awaiting Confirmation</span>
      </div>

      <div class="sec">
        <div class="slabel">Order Details</div>
        <table class="dtable">
          <tr><td class="lbl">Order ID</td><td class="val">#${order.orderNumber || order._id || 'N/A'}</td></tr>
          <tr><td class="lbl">Order Date</td><td class="val">${order.createdAt ? formatDate(order.createdAt) : 'N/A'}</td></tr>
          <tr><td class="lbl">Status</td><td class="val"><span style="display:inline-block;padding:3px 10px;background:#eff6ff;border:1px solid #bfdbfe;color:#1e40af;border-radius:2px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">New Order</span></td></tr>
          ${order.paymentMethod ? `<tr><td class="lbl">Payment Method</td><td class="val">${order.paymentMethod}</td></tr>` : ''}
        </table>
      </div>

      <div class="sec">
        <div class="slabel">Products Ordered</div>
        <table class="ptable">
          <thead>
            <tr>
              <th style="text-align:left;">Product</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
            <tr class="total-row">
              <td colspan="2" style="text-align:right;padding:12px 14px;">Order Total</td>
              <td style="text-align:right;padding:12px 14px;">$${totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      ${buyer ? `
      <div class="buyer-box">
        <h4>Buyer Information</h4>
        <table class="dtable" style="background:#fff;">
          ${buyer.name ? `<tr><td class="lbl">Name</td><td class="val">${buyer.name}</td></tr>` : ''}
          ${buyer.email ? `<tr><td class="lbl">Email</td><td class="val">${buyer.email}</td></tr>` : ''}
          ${buyer.company ? `<tr><td class="lbl">Company</td><td class="val">${buyer.company}</td></tr>` : ''}
          ${order.shippingAddress ? `<tr><td class="lbl">Ship To</td><td class="val">${[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode, order.shippingAddress.country].filter(Boolean).join(', ')}</td></tr>` : ''}
        </table>
      </div>
      ` : ''}

      <div class="action-box">
        <h4>Action Required</h4>
        <p>Please confirm and process this order within <strong>24 hours</strong> to maintain your seller rating and ensure a positive buyer experience.</p>
      </div>

      <div class="steps-box">
        <h4>Next Steps</h4>
        <div class="step"><div class="snum">01</div><div class="stxt">Review and confirm the order details in your supplier dashboard.</div></div>
        <div class="step"><div class="snum">02</div><div class="stxt">Prepare and package the products for shipment according to the order specifications.</div></div>
        <div class="step"><div class="snum">03</div><div class="stxt">Update the order status to Shipped once the goods are dispatched.</div></div>
        <div class="step"><div class="snum">04</div><div class="stxt">Add tracking information so the buyer can monitor their delivery.</div></div>
      </div>

      <div class="divider"></div>

      <div class="cta-block">
        <p>View full order details and take action from your supplier dashboard.</p>
        <a href="https://nexarionimpex.com/dashboard" class="cta">View Order Details</a>
      </div>

      <div class="help">
        Need help? Contact us at <a href="mailto:support@nexarionimpex.com">support@nexarionimpex.com</a>
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