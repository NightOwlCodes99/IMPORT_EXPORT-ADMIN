/**
 * Order Status Update Email Template
 * Sent when admin updates order status
 */

exports.orderStatusUpdateTemplate = (orderData) => {
  const { customerName, orderId, newStatus, orderItems, totalPrice, trackingNumber, estimatedDelivery, statusMessage } = orderData;

  const statusConfig = {
    'Pending':    { headerBg: '#92400e', accent: '#d97706', pillBg: '#fefce8', pillBorder: '#fde68a', pillText: '#92400e', label: 'Awaiting Processing' },
    'Processing': { headerBg: '#1e40af', accent: '#3b82f6', pillBg: '#eff6ff', pillBorder: '#bfdbfe', pillText: '#1e40af', label: 'Being Prepared' },
    'Confirmed':  { headerBg: '#047857', accent: '#059669', pillBg: '#f0fdf4', pillBorder: '#bbf7d0', pillText: '#166534', label: 'Order Confirmed' },
    'Shipped':    { headerBg: '#5b21b6', accent: '#7c3aed', pillBg: '#f5f3ff', pillBorder: '#ddd6fe', pillText: '#5b21b6', label: 'Shipment Dispatched' },
    'Delivered':  { headerBg: '#065f46', accent: '#10b981', pillBg: '#f0fdf4', pillBorder: '#bbf7d0', pillText: '#065f46', label: 'Successfully Delivered' },
    'Cancelled':  { headerBg: '#991b1b', accent: '#dc2626', pillBg: '#fef2f2', pillBorder: '#fecaca', pillText: '#991b1b', label: 'Order Cancelled' },
    'Refunded':   { headerBg: '#c2410c', accent: '#ea580c', pillBg: '#fff7ed', pillBorder: '#fed7aa', pillText: '#c2410c', label: 'Payment Refunded' },
  };

  const cfg = statusConfig[newStatus] || statusConfig['Pending'];

  const itemsHtml = orderItems?.map(item => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:500;color:#1f2937;">${item.name}</td>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px;color:#374151;">${item.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;font-weight:600;color:#1f2937;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update – ${orderId}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f5f5f5; padding: 28px 16px; -webkit-font-smoothing: antialiased; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
        .header { background: ${cfg.headerBg}; padding: 40px 40px 32px; }
        .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .brand { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #fff; letter-spacing: .02em; }
        .brand span { color: rgba(255,255,255,.5); }
        .badge { font-size: 9px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.7); border: 1px solid rgba(255,255,255,.3); padding: 4px 10px; border-radius: 2px; }
        .header-title { font-family: 'Playfair Display', Georgia, serif; font-size: 30px; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 8px; }
        .header-sub { font-size: 11px; font-weight: 300; color: rgba(255,255,255,.6); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 20px; }
        .pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .refpill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); padding: 7px 14px; border-radius: 2px; }
        .rl { font-size: 9px; color: rgba(255,255,255,.6); letter-spacing: .1em; text-transform: uppercase; }
        .ri { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: .06em; }
        .spill { display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); color: #fff; font-size: 10px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; padding: 7px 13px 7px 9px; border-radius: 2px; }
        .sdot { width: 6px; height: 6px; background: rgba(255,255,255,.7); border-radius: 50%; }
        .body { padding: 36px 40px; background: #fff; }
        .greeting { font-size: 15px; color: #1f2937; margin-bottom: 10px; }
        .greeting strong { font-weight: 600; color: ${cfg.headerBg}; }
        .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 26px; }
        .status-block { background: ${cfg.pillBg}; border: 1px solid ${cfg.pillBorder}; border-left: 4px solid ${cfg.accent}; border-radius: 4px; padding: 18px 20px; margin-bottom: 26px; }
        .status-block h3 { font-size: 13px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${cfg.pillText}; margin-bottom: 6px; }
        .status-block p { font-size: 13px; color: #4b5563; line-height: 1.6; }
        .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: ${cfg.accent}; margin-bottom: 10px; }
        .sec { margin-bottom: 24px; }
        .dtable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
        .dtable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
        .dtable tr:last-child td { border-bottom: none; }
        .dtable .lbl { color: #9ca3af; width: 140px; }
        .dtable .val { color: #1f2937; font-weight: 500; text-align: right; }
        .dtable .val.track { color: ${cfg.accent}; font-weight: 700; }
        .items-table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
        .items-table thead tr { background: #f9fafb; }
        .items-table th { padding: 10px 12px; font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #6b7280; }
        .items-table th:first-child { text-align: left; }
        .items-table th:nth-child(2) { text-align: center; }
        .items-table th:last-child { text-align: right; }
        .total-row { display: flex; align-items: center; justify-content: space-between; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 13px 16px; }
        .total-lbl { font-size: 13px; font-weight: 600; color: #1f2937; }
        .total-val { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: ${cfg.accent}; }
        .divider { height: 1px; background: #e5e7eb; margin: 22px 0; }
        .cta-block { text-align: center; margin-bottom: 20px; }
        .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
        .cta { display: inline-block; background: ${cfg.headerBg}; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
        .help { text-align: center; font-size: 12px; color: #9ca3af; padding-top: 16px; border-top: 1px solid #f3f4f6; }
        .help a { color: ${cfg.accent}; text-decoration: none; font-weight: 500; }
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
            <div class="badge">Order Update</div>
          </div>
          <div class="header-title">Order<br>${newStatus}</div>
          <div class="header-sub">${cfg.label} &nbsp;·&nbsp; ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div class="pills">
            <div class="refpill"><span class="rl">Order</span><span class="ri">${orderId}</span></div>
            <div class="spill"><span class="sdot"></span>${newStatus}</div>
          </div>
        </div>

        <div class="body">

          <p class="greeting">Dear <strong>${customerName}</strong>,</p>
          <p class="lead">
            We are writing to inform you that the status of your order has been updated.
            Please review the details below.
          </p>

          <div class="status-block">
            <h3>Status: ${newStatus}</h3>
            <p>${statusMessage || cfg.label}</p>
          </div>

          <div class="sec">
            <div class="slabel">Order Details</div>
            <table class="dtable">
              <tr><td class="lbl">Order Reference</td><td class="val">${orderId}</td></tr>
              ${trackingNumber ? `<tr><td class="lbl">Tracking Number</td><td class="val track">${trackingNumber}</td></tr>` : ''}
              ${estimatedDelivery ? `<tr><td class="lbl">Est. Delivery</td><td class="val">${estimatedDelivery}</td></tr>` : ''}
            </table>
          </div>

          ${orderItems && orderItems.length > 0 ? `
          <div class="sec">
            <div class="slabel">Items in This Order</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="text-align:left;">Product</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Amount</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div class="total-row">
              <span class="total-lbl">Order Total</span>
              <span class="total-val">$${totalPrice?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          ` : ''}

          <div class="divider"></div>

          <div class="cta-block">
            <p>View the full details and history of this order from your dashboard.</p>
            <a href="https://nexarionimpex.com/dashboard" class="cta">View Order Details</a>
          </div>

          <div class="help">
            Questions about your order? Contact us at <a href="mailto:support@nexarionimpex.com">support@nexarionimpex.com</a>
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