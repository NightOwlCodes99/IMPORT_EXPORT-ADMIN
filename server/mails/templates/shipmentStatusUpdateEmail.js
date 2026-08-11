// Shipment Status Update Email Templates

const fonts = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">`;

const baseCSS = `
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f5f5f5; padding: 28px 16px; -webkit-font-smoothing: antialiased; }
  .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }

  /* Header */
  .header { padding: 40px 40px 32px; }
  .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .brand { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #fff; letter-spacing: .02em; }
  .badge { font-size: 9px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; padding: 4px 10px; border-radius: 2px; }
  .header-title { font-family: 'Playfair Display', Georgia, serif; font-size: 30px; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 8px; }
  .header-sub { font-size: 11px; font-weight: 300; color: rgba(255,255,255,.6); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 20px; }
  .pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .refpill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); padding: 7px 14px; border-radius: 2px; }
  .rl { font-size: 9px; color: rgba(255,255,255,.6); letter-spacing: .1em; text-transform: uppercase; }
  .ri { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: .06em; }
  .spill { display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); color: #fff; font-size: 10px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; padding: 7px 13px 7px 9px; border-radius: 2px; }
  .sdot { width: 6px; height: 6px; border-radius: 50%; }

  /* Body */
  .body { padding: 36px 40px; background: #fff; }
  .greeting { font-size: 15px; color: #1f2937; margin-bottom: 10px; }
  .greeting strong { font-weight: 600; }
  .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 26px; }

  /* Tracking hero */
  .track-hero { border-radius: 4px; padding: 22px 20px; text-align: center; margin-bottom: 26px; }
  .track-label { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; margin-bottom: 10px; }
  .track-number { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; letter-spacing: .06em; line-height: 1; margin-bottom: 6px; }
  .track-order { font-size: 11px; color: #6b7280; }

  /* Info grid */
  .grid2 { display: table; width: 100%; border-collapse: separate; border-spacing: 8px; margin-bottom: 16px; }
  .grid2-cell { display: table-cell; width: 50%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 12px 14px; vertical-align: top; }
  .cell-label { font-size: 9px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: #9ca3af; margin-bottom: 5px; }
  .cell-value { font-size: 13px; font-weight: 600; color: #1f2937; }

  /* Delivery date box */
  .delivery-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #059669; border-radius: 4px; padding: 14px 18px; margin-bottom: 24px; }
  .delivery-box .dlabel { font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #065f46; margin-bottom: 6px; }
  .delivery-box .dval { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 700; color: #047857; }

  /* Notes / reason box */
  .notes-box { background: #fefce8; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 4px; padding: 14px 16px; margin-bottom: 24px; }
  .notes-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #92400e; margin-bottom: 8px; }
  .notes-box p { font-size: 13px; color: #78350f; line-height: 1.65; }

  /* Info box (blue) */
  .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
  .info-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #1d4ed8; margin-bottom: 8px; }
  .info-box p { font-size: 13px; color: #374151; line-height: 1.65; }

  /* Steps box */
  .steps-box { border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
  .steps-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 12px; }
  .step { display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; border-bottom: 1px solid rgba(0,0,0,.06); }
  .step:last-child { border-bottom: none; }
  .snum { width: 20px; height: 20px; min-width: 20px; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; }
  .stxt { font-size: 12px; color: #374151; line-height: 1.55; }

  /* Timeline */
  .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; margin-bottom: 10px; }
  .sec { margin-bottom: 24px; }
  .dtable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
  .dtable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
  .dtable tr:last-child td { border-bottom: none; }
  .dtable .lbl { color: #9ca3af; width: 160px; }
  .dtable .val { color: #1f2937; font-weight: 500; text-align: right; }

  /* CTA */
  .divider { height: 1px; background: #e5e7eb; margin: 22px 0; }
  .cta-block { text-align: center; margin-bottom: 20px; }
  .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
  .cta { display: inline-block; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
  .cta-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .cta-outline { display: inline-block; background: transparent; color: #374151 !important; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; border: 1px solid #d1d5db; }
  .help { text-align: center; font-size: 12px; color: #9ca3af; padding-top: 16px; border-top: 1px solid #f3f4f6; }
  .help a { text-decoration: none; font-weight: 500; }

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
    .grid2, .grid2-cell { display: block; width: 100%; margin-bottom: 8px; }
    .cta { display: block; width: 100%; text-align: center; }
    .footer { flex-direction: column; align-items: flex-start; padding: 20px; }
    .fmeta { text-align: left; }
    .fmeta a { margin-left: 0; margin-right: 8px; }
  }
`;

const formatDate = (date, opts = {}) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', ...opts
  });

const footer = (email = '') => `
  <div class="footer">
    <div class="fbrand">Nexarion Global Exports<span>.</span></div>
    <div class="fmeta">
      ${email ? `Sent to ${email}<br>` : 'Global B2B Import/Export Platform<br>'}
      <a href="https://nexarionimpex.com">Privacy Policy</a>
      <a href="https://nexarionimpex.com">Terms of Service</a>
      <a href="https://nexarionimpex.com">Help Center</a>
    </div>
  </div>
`;

// ─────────────────────────────────────────────
// 1. SHIPMENT STATUS UPDATE (generic)
// ─────────────────────────────────────────────
exports.shipmentStatusUpdateTemplate = (data) => {
  const {
    customerName, trackingNumber, orderId, status,
    currentLocation, estimatedDelivery, carrier,
    origin, destination, timeline = [], notes, customerEmail
  } = data;

  const trackingUrl = `https://nexarionimpex.com/dashboard`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shipment Update – ${trackingNumber}</title>
  ${fonts}
  <style>${baseCSS}</style>
</head>
<body>
<div class="wrapper">
  <div class="header" style="background:#1e3a5f;">
    <div class="header-top">
      <div class="brand">Nexarion Global Exports<span style="color:#93c5fd;">.</span></div>
      <div class="badge" style="color:#93c5fd;border:1px solid rgba(147,197,253,.5);">Shipment Update</div>
    </div>
    <div class="header-title">Shipment<br>Status Update</div>
    <div class="header-sub">Status Changed &nbsp;·&nbsp; ${formatDate(new Date())}</div>
    <div class="pills">
      <div class="refpill"><span class="rl">Tracking</span><span class="ri">${trackingNumber}</span></div>
      ${orderId ? `<div class="refpill"><span class="rl">Order</span><span class="ri">${orderId}</span></div>` : ''}
      <div class="spill"><span class="sdot" style="background:#93c5fd;"></span>${status}</div>
    </div>
  </div>

  <div class="body">
    <p class="greeting">Dear <strong style="color:#1e3a5f;">${customerName}</strong>,</p>
    <p class="lead">Your shipment has a new status update. Please review the latest details below and track your package for real-time information.</p>

    <div class="track-hero" style="background:#eff6ff;border:1px solid #bfdbfe;">
      <div class="track-label" style="color:#1d4ed8;">Tracking Number</div>
      <div class="track-number" style="color:#1e3a5f;">${trackingNumber}</div>
      ${orderId ? `<div class="track-order">Order #${orderId}</div>` : ''}
    </div>

    <div class="grid2">
      <div class="grid2-cell"><div class="cell-label">Carrier</div><div class="cell-value">${carrier || 'N/A'}</div></div>
      <div class="grid2-cell"><div class="cell-label">Current Location</div><div class="cell-value">${currentLocation || 'In Transit'}</div></div>
    </div>
    <div class="grid2">
      <div class="grid2-cell"><div class="cell-label">Origin</div><div class="cell-value">${origin || '—'}</div></div>
      <div class="grid2-cell"><div class="cell-label">Destination</div><div class="cell-value">${destination || '—'}</div></div>
    </div>

    ${estimatedDelivery ? `
    <div class="delivery-box">
      <div class="dlabel">Estimated Delivery</div>
      <div class="dval">${formatDate(estimatedDelivery, { weekday: 'long' })}</div>
    </div>` : ''}

    ${notes ? `
    <div class="notes-box">
      <h4>Note</h4>
      <p>${notes}</p>
    </div>` : ''}

    ${timeline.length > 0 ? `
    <div class="sec">
      <div class="slabel" style="color:#1d4ed8;">Recent Updates</div>
      <table class="dtable">
        ${timeline.slice(0, 4).map(item => `
        <tr>
          <td class="lbl">${item.location ? item.location + '<br>' : ''}<span style="font-size:11px;color:#bfdbfe;">${new Date(item.timestamp).toLocaleString()}</span></td>
          <td class="val">${item.status}${item.description ? '<br><span style="font-size:11px;color:#6b7280;font-weight:400;">' + item.description + '</span>' : ''}</td>
        </tr>`).join('')}
      </table>
    </div>` : ''}

    <div class="divider"></div>
    <div class="cta-block">
      <p>Track your shipment live from your dashboard.</p>
      <a href="${trackingUrl}" class="cta" style="background:#1e3a5f;">Track Shipment</a>
    </div>
    <div class="help">Questions? <a href="mailto:support@nexarionimpex.com" style="color:#3b82f6;">support@nexarionimpex.com</a></div>
  </div>
  ${footer(customerEmail)}
</div>
</body></html>`;
};

// ─────────────────────────────────────────────
// 2. SHIPMENT CREATED
// ─────────────────────────────────────────────
exports.shipmentCreatedTemplate = (data) => {
  const { customerName, trackingNumber, orderId, carrier, estimatedDelivery, origin, destination, customerEmail } = data;
  const trackingUrl = `https://nexarionimpex.com/dashboard`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped – ${trackingNumber}</title>
  ${fonts}
  <style>${baseCSS}</style>
</head>
<body>
<div class="wrapper">
  <div class="header" style="background:#1e3a5f;">
    <div class="header-top">
      <div class="brand">Nexarion Global Exports<span style="color:#93c5fd;">.</span></div>
      <div class="badge" style="color:#93c5fd;border:1px solid rgba(147,197,253,.5);">Order Shipped</div>
    </div>
    <div class="header-title">Your Order<br>Has Shipped</div>
    <div class="header-sub">Shipment Created &nbsp;·&nbsp; ${formatDate(new Date())}</div>
    <div class="pills">
      <div class="refpill"><span class="rl">Tracking</span><span class="ri">${trackingNumber}</span></div>
      ${orderId ? `<div class="refpill"><span class="rl">Order</span><span class="ri">${orderId}</span></div>` : ''}
      <div class="spill"><span class="sdot" style="background:#93c5fd;"></span>In Transit</div>
    </div>
  </div>

  <div class="body">
    <p class="greeting">Dear <strong style="color:#1e3a5f;">${customerName}</strong>,</p>
    <p class="lead">Great news — your order has been dispatched and is now on its way to you. Use the tracking number below to follow your shipment in real time.</p>

    <div class="track-hero" style="background:#eff6ff;border:1px solid #bfdbfe;">
      <div class="track-label" style="color:#1d4ed8;">Your Tracking Number</div>
      <div class="track-number" style="color:#1e3a5f;">${trackingNumber}</div>
      ${orderId ? `<div class="track-order">Order #${orderId}</div>` : ''}
    </div>

    <div class="grid2">
      <div class="grid2-cell"><div class="cell-label">Carrier</div><div class="cell-value">${carrier || 'N/A'}</div></div>
      <div class="grid2-cell"><div class="cell-label">Est. Delivery</div><div class="cell-value">${estimatedDelivery ? formatDate(estimatedDelivery) : 'TBD'}</div></div>
    </div>
    <div class="grid2">
      <div class="grid2-cell"><div class="cell-label">Origin</div><div class="cell-value">${origin || '—'}</div></div>
      <div class="grid2-cell"><div class="cell-label">Destination</div><div class="cell-value">${destination || '—'}</div></div>
    </div>

    ${estimatedDelivery ? `
    <div class="delivery-box">
      <div class="dlabel">Estimated Delivery</div>
      <div class="dval">${formatDate(estimatedDelivery, { weekday: 'long' })}</div>
    </div>` : ''}

    <div class="steps-box" style="background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3b82f6;">
      <h4 style="color:#1d4ed8;">What Happens Next</h4>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">01</div><div class="stxt">Your order has been collected by the carrier and is in transit.</div></div>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">02</div><div class="stxt">Use your tracking number to monitor the shipment in real time.</div></div>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">03</div><div class="stxt">You'll receive an email notification when your package is out for delivery.</div></div>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">04</div><div class="stxt">Contact our support team if you have any concerns about your shipment.</div></div>
    </div>

    <div class="divider"></div>
    <div class="cta-block">
      <p>Track your shipment live from your dashboard.</p>
      <a href="${trackingUrl}" class="cta" style="background:#1e3a5f;">Track My Shipment</a>
    </div>
    <div class="help">Questions? <a href="mailto:support@nexarionimpex.com" style="color:#3b82f6;">support@nexarionimpex.com</a></div>
  </div>
  ${footer(customerEmail)}
</div>
</body></html>`;
};

// ─────────────────────────────────────────────
// 3. SHIPMENT DELIVERED
// ─────────────────────────────────────────────
exports.shipmentDeliveredTemplate = (data) => {
  const { customerName, trackingNumber, orderId, deliveredAt, signedBy, customerEmail } = data;
  const reviewUrl = `https://nexarionimpex.com/dashboard`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Package Delivered – ${trackingNumber}</title>
  ${fonts}
  <style>${baseCSS}</style>
</head>
<body>
<div class="wrapper">
  <div class="header" style="background:#065f46;">
    <div class="header-top">
      <div class="brand">Nexarion Global Exports<span style="color:#6ee7b7;">.</span></div>
      <div class="badge" style="color:#6ee7b7;border:1px solid rgba(110,231,183,.5);">Delivery Confirmed</div>
    </div>
    <div class="header-title">Package<br>Delivered</div>
    <div class="header-sub">Successfully Delivered &nbsp;·&nbsp; ${formatDate(deliveredAt)}</div>
    <div class="pills">
      <div class="refpill"><span class="rl">Tracking</span><span class="ri">${trackingNumber}</span></div>
      ${orderId ? `<div class="refpill"><span class="rl">Order</span><span class="ri">${orderId}</span></div>` : ''}
      <div class="spill"><span class="sdot" style="background:#6ee7b7;"></span>Delivered</div>
    </div>
  </div>

  <div class="body">
    <p class="greeting">Dear <strong style="color:#065f46;">${customerName}</strong>,</p>
    <p class="lead">Your package has been successfully delivered. We hope everything arrived in perfect condition. Thank you for trading with Nexarion Global Exports.</p>

    <div class="track-hero" style="background:#f0fdf4;border:1px solid #bbf7d0;">
      <div class="track-label" style="color:#059669;">Tracking Number</div>
      <div class="track-number" style="color:#047857;">${trackingNumber}</div>
      ${orderId ? `<div class="track-order">Order #${orderId}</div>` : ''}
      ${signedBy ? `<div style="margin-top:10px;font-size:12px;color:#6b7280;">Signed by: <strong>${signedBy}</strong></div>` : ''}
    </div>

    <div class="sec">
      <div class="slabel" style="color:#059669;">Delivery Confirmation</div>
      <table class="dtable">
        <tr><td class="lbl">Status</td><td class="val"><span style="display:inline-block;padding:3px 10px;background:#f0fdf4;border:1px solid #bbf7d0;color:#065f46;border-radius:2px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Delivered</span></td></tr>
        <tr><td class="lbl">Delivered At</td><td class="val">${new Date(deliveredAt).toLocaleString()}</td></tr>
        ${signedBy ? `<tr><td class="lbl">Signed By</td><td class="val">${signedBy}</td></tr>` : ''}
      </table>
    </div>

    <div class="steps-box" style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #059669;">
      <h4 style="color:#065f46;">What's Next</h4>
      <div class="step"><div class="snum" style="background:#dcfce7;border:1px solid #bbf7d0;color:#065f46;">01</div><div class="stxt">Inspect your goods carefully and confirm everything matches your order.</div></div>
      <div class="step"><div class="snum" style="background:#dcfce7;border:1px solid #bbf7d0;color:#065f46;">02</div><div class="stxt">Leave a review to help us improve our service for future orders.</div></div>
      <div class="step"><div class="snum" style="background:#dcfce7;border:1px solid #bbf7d0;color:#065f46;">03</div><div class="stxt">Contact support within 48 hours if there are any issues with your delivery.</div></div>
    </div>

    <div class="divider"></div>
    <div class="cta-block">
      <p>Share your experience — it helps us serve you better.</p>
      <div class="cta-row">
        <a href="${reviewUrl}" class="cta" style="background:#065f46;">Leave a Review</a>
        <a href="https://nexarionimpex.com/dashboard" class="cta-outline">View Orders</a>
      </div>
    </div>
    <div class="help">Questions? <a href="mailto:support@nexarionimpex.com" style="color:#059669;">support@nexarionimpex.com</a></div>
  </div>
  ${footer(customerEmail)}
</div>
</body></html>`;
};

// ─────────────────────────────────────────────
// 4. SHIPMENT DELAYED
// ─────────────────────────────────────────────
exports.shipmentDelayedTemplate = (data) => {
  const { customerName, trackingNumber, orderId, reason, newEstimatedDelivery, currentLocation, customerEmail } = data;
  const trackingUrl = `https://nexarionimpex.com/dashboard`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shipment Delayed – ${trackingNumber}</title>
  ${fonts}
  <style>${baseCSS}</style>
</head>
<body>
<div class="wrapper">
  <div class="header" style="background:#991b1b;">
    <div class="header-top">
      <div class="brand">Nexarion Global Exports<span style="color:#fca5a5;">.</span></div>
      <div class="badge" style="color:#fca5a5;border:1px solid rgba(252,165,165,.5);">Delay Notice</div>
    </div>
    <div class="header-title">Shipment<br>Delayed</div>
    <div class="header-sub">Update Recorded &nbsp;·&nbsp; ${formatDate(new Date())}</div>
    <div class="pills">
      <div class="refpill"><span class="rl">Tracking</span><span class="ri">${trackingNumber}</span></div>
      ${orderId ? `<div class="refpill"><span class="rl">Order</span><span class="ri">${orderId}</span></div>` : ''}
      <div class="spill"><span class="sdot" style="background:#fca5a5;"></span>Delayed</div>
    </div>
  </div>

  <div class="body">
    <p class="greeting">Dear <strong style="color:#991b1b;">${customerName}</strong>,</p>
    <p class="lead">We regret to inform you that your shipment is experiencing an unexpected delay. We sincerely apologize for any inconvenience and are working to resolve this as quickly as possible.</p>

    <div class="track-hero" style="background:#fef2f2;border:1px solid #fecaca;">
      <div class="track-label" style="color:#dc2626;">Tracking Number</div>
      <div class="track-number" style="color:#991b1b;">${trackingNumber}</div>
      ${orderId ? `<div class="track-order">Order #${orderId}</div>` : ''}
    </div>

    <div class="sec">
      <div class="slabel" style="color:#dc2626;">Delay Details</div>
      <table class="dtable">
        ${currentLocation ? `<tr><td class="lbl">Current Location</td><td class="val">${currentLocation}</td></tr>` : ''}
        ${newEstimatedDelivery ? `<tr><td class="lbl">New Est. Delivery</td><td class="val" style="color:#991b1b;font-weight:700;">${formatDate(newEstimatedDelivery, { weekday: 'long' })}</td></tr>` : ''}
      </table>
    </div>

    ${reason ? `
    <div class="notes-box">
      <h4>Reason for Delay</h4>
      <p>${reason}</p>
    </div>` : ''}

    ${newEstimatedDelivery ? `
    <div class="delivery-box">
      <div class="dlabel">Revised Estimated Delivery</div>
      <div class="dval">${formatDate(newEstimatedDelivery, { weekday: 'long' })}</div>
    </div>` : ''}

    <div class="steps-box" style="background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626;">
      <h4 style="color:#991b1b;">What Happens Next</h4>
      <div class="step"><div class="snum" style="background:#fee2e2;border:1px solid #fecaca;color:#991b1b;">01</div><div class="stxt">Our logistics team is actively working to resolve the delay and update the shipment route.</div></div>
      <div class="step"><div class="snum" style="background:#fee2e2;border:1px solid #fecaca;color:#991b1b;">02</div><div class="stxt">You will receive an email update as soon as the shipment is back on schedule.</div></div>
      <div class="step"><div class="snum" style="background:#fee2e2;border:1px solid #fecaca;color:#991b1b;">03</div><div class="stxt">Track your shipment in real time using your tracking number below.</div></div>
      <div class="step"><div class="snum" style="background:#fee2e2;border:1px solid #fecaca;color:#991b1b;">04</div><div class="stxt">Contact our support team if you require urgent assistance or have concerns.</div></div>
    </div>

    <div class="divider"></div>
    <div class="cta-block">
      <p>Monitor live updates for your shipment.</p>
      <a href="${trackingUrl}" class="cta" style="background:#991b1b;">Track Shipment</a>
    </div>
    <div class="help">Urgent help? <a href="mailto:support@nexarionimpex.com" style="color:#dc2626;">support@nexarionimpex.com</a></div>
  </div>
  ${footer(customerEmail)}
</div>
</body></html>`;
};

// ─────────────────────────────────────────────
// 5. OUT FOR DELIVERY
// ─────────────────────────────────────────────
exports.shipmentOutForDeliveryTemplate = (data) => {
  const { customerName, trackingNumber, orderId, estimatedDelivery, carrier, destination, customerEmail } = data;
  const trackingUrl = `https://nexarionimpex.com/dashboard`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Out for Delivery – ${trackingNumber}</title>
  ${fonts}
  <style>${baseCSS}</style>
</head>
<body>
<div class="wrapper">
  <div class="header" style="background:#1e3a5f;">
    <div class="header-top">
      <div class="brand">Nexarion Global Exports<span style="color:#93c5fd;">.</span></div>
      <div class="badge" style="color:#93c5fd;border:1px solid rgba(147,197,253,.5);">Out for Delivery</div>
    </div>
    <div class="header-title">Out for<br>Delivery</div>
    <div class="header-sub">Expected Today &nbsp;·&nbsp; ${formatDate(new Date())}</div>
    <div class="pills">
      <div class="refpill"><span class="rl">Tracking</span><span class="ri">${trackingNumber}</span></div>
      ${orderId ? `<div class="refpill"><span class="rl">Order</span><span class="ri">${orderId}</span></div>` : ''}
      <div class="spill"><span class="sdot" style="background:#93c5fd;"></span>Out for Delivery</div>
    </div>
  </div>

  <div class="body">
    <p class="greeting">Dear <strong style="color:#1e3a5f;">${customerName}</strong>,</p>
    <p class="lead">Your package is with the courier and is expected to arrive today. Please ensure someone is available at the delivery address to receive it.</p>

    <div class="track-hero" style="background:#eff6ff;border:1px solid #bfdbfe;">
      <div class="track-label" style="color:#1d4ed8;">Tracking Number</div>
      <div class="track-number" style="color:#1e3a5f;">${trackingNumber}</div>
      ${orderId ? `<div class="track-order">Order #${orderId}</div>` : ''}
    </div>

    <div class="grid2">
      <div class="grid2-cell"><div class="cell-label">Carrier</div><div class="cell-value">${carrier || 'N/A'}</div></div>
      <div class="grid2-cell"><div class="cell-label">Delivery Address</div><div class="cell-value">${destination || '—'}</div></div>
    </div>

    ${estimatedDelivery ? `
    <div class="delivery-box">
      <div class="dlabel">Expected Delivery</div>
      <div class="dval">${formatDate(estimatedDelivery, { weekday: 'long' })}</div>
    </div>` : ''}

    <div class="steps-box" style="background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3b82f6;">
      <h4 style="color:#1d4ed8;">Delivery Tips</h4>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">01</div><div class="stxt">Ensure someone is available at the delivery address to receive the package.</div></div>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">02</div><div class="stxt">Keep your phone accessible — the courier may call ahead of arrival.</div></div>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">03</div><div class="stxt">Check your entrance area and mailbox if you miss the initial attempt.</div></div>
    </div>

    <div class="divider"></div>
    <div class="cta-block">
      <p>Track your delivery in real time.</p>
      <a href="${trackingUrl}" class="cta" style="background:#1e3a5f;">Track Live Location</a>
    </div>
    <div class="help">Questions? <a href="mailto:support@nexarionimpex.com" style="color:#3b82f6;">support@nexarionimpex.com</a></div>
  </div>
  ${footer(customerEmail)}
</div>
</body></html>`;
};

// ─────────────────────────────────────────────
// 6. IN TRANSIT
// ─────────────────────────────────────────────
exports.shipmentInTransitTemplate = (data) => {
  const { customerName, trackingNumber, orderId, currentLocation, estimatedDelivery, carrier, origin, destination, customerEmail } = data;
  const trackingUrl = `https://nexarionimpex.com/dashboard`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>In Transit – ${trackingNumber}</title>
  ${fonts}
  <style>${baseCSS}</style>
</head>
<body>
<div class="wrapper">
  <div class="header" style="background:#1e3a5f;">
    <div class="header-top">
      <div class="brand">Nexarion Global Exports<span style="color:#93c5fd;">.</span></div>
      <div class="badge" style="color:#93c5fd;border:1px solid rgba(147,197,253,.5);">In Transit</div>
    </div>
    <div class="header-title">Package<br>In Transit</div>
    <div class="header-sub">On the Move &nbsp;·&nbsp; ${formatDate(new Date())}</div>
    <div class="pills">
      <div class="refpill"><span class="rl">Tracking</span><span class="ri">${trackingNumber}</span></div>
      ${orderId ? `<div class="refpill"><span class="rl">Order</span><span class="ri">${orderId}</span></div>` : ''}
      <div class="spill"><span class="sdot" style="background:#93c5fd;"></span>In Transit</div>
    </div>
  </div>

  <div class="body">
    <p class="greeting">Dear <strong style="color:#1e3a5f;">${customerName}</strong>,</p>
    <p class="lead">Your package is on the move and making its way to you. Here's the latest update on your shipment's progress.</p>

    <div class="track-hero" style="background:#eff6ff;border:1px solid #bfdbfe;">
      <div class="track-label" style="color:#1d4ed8;">Tracking Number</div>
      <div class="track-number" style="color:#1e3a5f;">${trackingNumber}</div>
      ${orderId ? `<div class="track-order">Order #${orderId}</div>` : ''}
    </div>

    <div class="grid2">
      <div class="grid2-cell"><div class="cell-label">Carrier</div><div class="cell-value">${carrier || 'N/A'}</div></div>
      <div class="grid2-cell"><div class="cell-label">Current Location</div><div class="cell-value">${currentLocation || 'In Transit'}</div></div>
    </div>
    <div class="grid2">
      <div class="grid2-cell"><div class="cell-label">Origin</div><div class="cell-value">${origin || '—'}</div></div>
      <div class="grid2-cell"><div class="cell-label">Destination</div><div class="cell-value">${destination || '—'}</div></div>
    </div>

    ${estimatedDelivery ? `
    <div class="delivery-box">
      <div class="dlabel">Estimated Delivery</div>
      <div class="dval">${formatDate(estimatedDelivery, { weekday: 'long' })}</div>
    </div>` : ''}

    <div class="steps-box" style="background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3b82f6;">
      <h4 style="color:#1d4ed8;">Shipment Progress</h4>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">01</div><div class="stxt">Your shipment has been dispatched and is currently in transit with the carrier.</div></div>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">02</div><div class="stxt">The package is moving through the logistics network toward its destination.</div></div>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">03</div><div class="stxt">You will receive an update when the package is out for delivery.</div></div>
    </div>

    <div class="divider"></div>
    <div class="cta-block">
      <p>Follow your package's journey in real time.</p>
      <a href="${trackingUrl}" class="cta" style="background:#1e3a5f;">Track Your Package</a>
    </div>
    <div class="help">Questions? <a href="mailto:support@nexarionimpex.com" style="color:#3b82f6;">support@nexarionimpex.com</a></div>
  </div>
  ${footer(customerEmail)}
</div>
</body></html>`;
};

// ─────────────────────────────────────────────
// 7. CUSTOMS CLEARANCE
// ─────────────────────────────────────────────
exports.shipmentCustomsClearanceTemplate = (data) => {
  const { customerName, trackingNumber, orderId, currentLocation, estimatedDelivery, customerEmail } = data;
  const trackingUrl = `https://nexarionimpex.com/dashboard`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customs Clearance – ${trackingNumber}</title>
  ${fonts}
  <style>${baseCSS}</style>
</head>
<body>
<div class="wrapper">
  <div class="header" style="background:#1e3a5f;">
    <div class="header-top">
      <div class="brand">Nexarion Global Exports<span style="color:#93c5fd;">.</span></div>
      <div class="badge" style="color:#93c5fd;border:1px solid rgba(147,197,253,.5);">Customs Update</div>
    </div>
    <div class="header-title">Customs<br>Clearance</div>
    <div class="header-sub">Processing in Progress &nbsp;·&nbsp; ${formatDate(new Date())}</div>
    <div class="pills">
      <div class="refpill"><span class="rl">Tracking</span><span class="ri">${trackingNumber}</span></div>
      ${orderId ? `<div class="refpill"><span class="rl">Order</span><span class="ri">${orderId}</span></div>` : ''}
      <div class="spill"><span class="sdot" style="background:#93c5fd;"></span>Customs Clearance</div>
    </div>
  </div>

  <div class="body">
    <p class="greeting">Dear <strong style="color:#1e3a5f;">${customerName}</strong>,</p>
    <p class="lead">Your international shipment has arrived at customs and is currently being processed. This is a standard procedure for all international packages — no action is required from you at this time.</p>

    <div class="track-hero" style="background:#eff6ff;border:1px solid #bfdbfe;">
      <div class="track-label" style="color:#1d4ed8;">Tracking Number</div>
      <div class="track-number" style="color:#1e3a5f;">${trackingNumber}</div>
      ${orderId ? `<div class="track-order">Order #${orderId}</div>` : ''}
    </div>

    ${currentLocation ? `
    <div class="sec">
      <div class="slabel" style="color:#1d4ed8;">Current Location</div>
      <table class="dtable">
        <tr><td class="lbl">Processing At</td><td class="val">${currentLocation}</td></tr>
      </table>
    </div>` : ''}

    <div class="info-box">
      <h4>What to Expect</h4>
      <p>Customs clearance typically takes 1–3 business days. In some cases, additional documentation may be required — we will contact you directly if this applies to your shipment.</p>
    </div>

    <div class="steps-box" style="background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3b82f6;">
      <h4 style="color:#1d4ed8;">Clearance Process</h4>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">01</div><div class="stxt">Your shipment is being reviewed by customs authorities at the destination country.</div></div>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">02</div><div class="stxt">Standard clearance takes 1–3 business days with no action required from you.</div></div>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">03</div><div class="stxt">We will notify you immediately once the package has cleared customs.</div></div>
      <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">04</div><div class="stxt">If additional documentation is needed, our team will contact you promptly.</div></div>
    </div>

    ${estimatedDelivery ? `
    <div class="delivery-box">
      <div class="dlabel">Estimated Delivery (after clearance)</div>
      <div class="dval">${formatDate(estimatedDelivery, { weekday: 'long' })}</div>
    </div>` : ''}

    <div class="divider"></div>
    <div class="cta-block">
      <p>Track your shipment's customs progress.</p>
      <a href="${trackingUrl}" class="cta" style="background:#1e3a5f;">Track Your Package</a>
    </div>
    <div class="help">Questions? <a href="mailto:support@nexarionimpex.com" style="color:#3b82f6;">support@nexarionimpex.com</a></div>
  </div>
  ${footer(customerEmail)}
</div>
</body></html>`;
};

// ─────────────────────────────────────────────
// 8. FAILED DELIVERY
// ─────────────────────────────────────────────
exports.shipmentFailedDeliveryTemplate = (data) => {
  const { customerName, trackingNumber, orderId, reason, nextAttempt, customerEmail } = data;
  const trackingUrl = `https://nexarionimpex.com/dashboard`;
  const contactUrl = `https://nexarionimpex.com/dashboard`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Delivery Attempt Failed – ${trackingNumber}</title>
  ${fonts}
  <style>${baseCSS}</style>
</head>
<body>
<div class="wrapper">
  <div class="header" style="background:#991b1b;">
    <div class="header-top">
      <div class="brand">Nexarion Global Exports<span style="color:#fca5a5;">.</span></div>
      <div class="badge" style="color:#fca5a5;border:1px solid rgba(252,165,165,.5);">Delivery Alert</div>
    </div>
    <div class="header-title">Delivery<br>Attempt Failed</div>
    <div class="header-sub">Action May Be Required &nbsp;·&nbsp; ${formatDate(new Date())}</div>
    <div class="pills">
      <div class="refpill"><span class="rl">Tracking</span><span class="ri">${trackingNumber}</span></div>
      ${orderId ? `<div class="refpill"><span class="rl">Order</span><span class="ri">${orderId}</span></div>` : ''}
      <div class="spill"><span class="sdot" style="background:#fca5a5;"></span>Failed Delivery</div>
    </div>
  </div>

  <div class="body">
    <p class="greeting">Dear <strong style="color:#991b1b;">${customerName}</strong>,</p>
    <p class="lead">Unfortunately, our courier was unable to deliver your package today. Your shipment is safe and a re-delivery attempt will be scheduled — please review the details below.</p>

    <div class="track-hero" style="background:#fef2f2;border:1px solid #fecaca;">
      <div class="track-label" style="color:#dc2626;">Tracking Number</div>
      <div class="track-number" style="color:#991b1b;">${trackingNumber}</div>
      ${orderId ? `<div class="track-order">Order #${orderId}</div>` : ''}
    </div>

    ${reason ? `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626;border-radius:4px;padding:14px 16px;margin-bottom:24px;">
      <h4 style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#991b1b;margin-bottom:8px;">Reason for Failed Delivery</h4>
      <p style="font-size:13px;color:#7f1d1d;line-height:1.65;">${reason}</p>
    </div>` : ''}

    ${nextAttempt ? `
    <div class="delivery-box">
      <div class="dlabel">Next Delivery Attempt</div>
      <div class="dval">${formatDate(nextAttempt, { weekday: 'long' })}</div>
    </div>` : ''}

    <div class="steps-box" style="background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626;">
      <h4 style="color:#991b1b;">To Ensure Successful Delivery</h4>
      <div class="step"><div class="snum" style="background:#fee2e2;border:1px solid #fecaca;color:#991b1b;">01</div><div class="stxt">Ensure someone is available at the delivery address on the next attempt.</div></div>
      <div class="step"><div class="snum" style="background:#fee2e2;border:1px solid #fecaca;color:#991b1b;">02</div><div class="stxt">Verify your delivery address is correct in your account settings.</div></div>
      <div class="step"><div class="snum" style="background:#fee2e2;border:1px solid #fecaca;color:#991b1b;">03</div><div class="stxt">Keep your phone accessible so the courier can reach you before arrival.</div></div>
      <div class="step"><div class="snum" style="background:#fee2e2;border:1px solid #fecaca;color:#991b1b;">04</div><div class="stxt">Contact our support team if you need to reschedule or redirect delivery.</div></div>
    </div>

    <div class="divider"></div>
    <div class="cta-block">
      <p>Track your package or contact us to rearrange delivery.</p>
      <div class="cta-row">
        <a href="${trackingUrl}" class="cta" style="background:#991b1b;">Track Package</a>
        <a href="${contactUrl}" class="cta-outline">Contact Support</a>
      </div>
    </div>
    <div class="help">Urgent help? <a href="mailto:support@nexarionimpex.com" style="color:#dc2626;">support@nexarionimpex.com</a></div>
  </div>
  ${footer(customerEmail)}
</div>
</body></html>`;
};