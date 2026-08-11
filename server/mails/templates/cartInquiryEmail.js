/**
 * Cart Inquiry Email Template
 * Sent when customer raises an inquiry for cart items
 */

exports.cartInquiryTemplate = (inquiryData) => {
  const { 
    customerName,
    customerEmail,
    customerPhone,
    country,
    inquiryId,
    items,
    totalAmount,
    totalItems,
    message,
    createdAt
  } = inquiryData;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${item.product?.images?.[0]?.url || 'https://via.placeholder.com/56'}" alt="${item.product?.name}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 4px; border: 1px solid #e5e7eb; flex-shrink: 0;">
          <div>
            <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1f2937;">${item.product?.name || 'Product'}</p>
            <p style="margin: 3px 0 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em;">${item.product?.category?.name || 'Uncategorized'}</p>
          </div>
        </div>
      </td>
      <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151; font-size: 13px;">${item.quantity}</td>
      <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280; font-size: 13px;">$${item.price?.toFixed(2)}</td>
      <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937; font-size: 13px; font-weight: 600;">$${item.subtotal?.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cart Inquiry – ${inquiryId}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f5f5f5; padding: 28px 16px; -webkit-font-smoothing: antialiased; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
        .header { background: #c2410c; padding: 40px 40px 32px; }
        .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .brand { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #fff; letter-spacing: .02em; }
        .brand span { color: #fdba74; }
        .badge { font-size: 9px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: #fdba74; border: 1px solid rgba(253,186,116,.5); padding: 4px 10px; border-radius: 2px; }
        .header-title { font-family: 'Playfair Display', Georgia, serif; font-size: 30px; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 8px; }
        .header-sub { font-size: 11px; font-weight: 300; color: rgba(255,255,255,.6); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 20px; }
        .ref-pill { display: inline-flex; align-items: center; gap: 10px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); padding: 8px 16px; border-radius: 2px; }
        .ref-label { font-size: 10px; color: rgba(255,255,255,.6); letter-spacing: .1em; text-transform: uppercase; }
        .ref-id { font-size: 14px; font-weight: 700; color: #fff; letter-spacing: .08em; }
        .body { padding: 36px 40px; }
        .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #c2410c; margin-bottom: 12px; }
        .section { margin-bottom: 28px; }
        .info-table { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
        .info-table td { padding: 10px 14px; font-size: 13px; }
        .info-table tr { border-bottom: 1px solid #f3f4f6; }
        .info-table tr:last-child { border-bottom: none; }
        .info-table .lbl { color: #9ca3af; width: 110px; font-weight: 400; }
        .info-table .val { color: #1f2937; font-weight: 500; }
        .info-table .val a { color: #2563eb; text-decoration: none; }
        .items-table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
        .items-table thead tr { background: #f9fafb; }
        .items-table th { padding: 11px 12px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #6b7280; }
        .items-table th:first-child { text-align: left; }
        .items-table th:nth-child(2) { text-align: center; }
        .items-table th:nth-child(3), .items-table th:nth-child(4) { text-align: right; }
        .total-row { display: flex; align-items: center; justify-content: space-between; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 4px; padding: 16px 20px; margin-bottom: 28px; }
        .total-label { font-size: 13px; font-weight: 500; color: #374151; }
        .total-amount { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; color: #c2410c; }
        .msg-box { background: #fefce8; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 4px; padding: 16px 18px; margin-bottom: 28px; }
        .msg-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #92400e; margin-bottom: 8px; }
        .msg-box p { font-size: 13px; color: #78350f; line-height: 1.65; }
        .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
        .cta-block { text-align: center; margin-bottom: 4px; }
        .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 14px; }
        .cta { display: inline-block; background: #c2410c; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
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
            <div class="badge">New Inquiry</div>
          </div>
          <div class="header-title">Cart Inquiry<br>Submitted</div>
          <div class="header-sub">Received &nbsp;·&nbsp; ${new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div class="ref-pill">
            <span class="ref-label">Reference</span>
            <span class="ref-id">${inquiryId}</span>
          </div>
        </div>

        <div class="body">

          <div class="section">
            <div class="slabel">Customer Details</div>
            <table class="info-table">
              <tr><td class="lbl">Name</td><td class="val">${customerName}</td></tr>
              <tr><td class="lbl">Email</td><td class="val"><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
              ${customerPhone ? `<tr><td class="lbl">Phone</td><td class="val">${customerPhone}</td></tr>` : ''}
              ${country ? `<tr><td class="lbl">Country</td><td class="val">${country}</td></tr>` : ''}
              <tr><td class="lbl">Submitted</td><td class="val">${new Date(createdAt).toLocaleString()}</td></tr>
            </table>
          </div>

          <div class="section">
            <div class="slabel">Cart Items &nbsp;(${totalItems})</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="text-align:left;">Product</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Unit Price</th>
                  <th style="text-align:right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
          </div>

          <div class="total-row">
            <span class="total-label">Total Inquiry Amount</span>
            <span class="total-amount">$${totalAmount?.toFixed(2)}</span>
          </div>

          ${message ? `
          <div class="msg-box">
            <h4>Customer Message</h4>
            <p>${message}</p>
          </div>
          ` : ''}

          <div class="divider"></div>

          <div class="cta-block">
            <p>Review and respond to this inquiry from the admin dashboard.</p>
            <a href="https://nexarionimpex.com/nexarion/admin/login" class="cta">View All Inquiries</a>
          </div>

        </div>

        <div class="footer">
          <div class="fbrand">Nexarion Global Exports<span>.</span></div>
          <div class="fmeta">Global B2B Import/Export Platform<br><a href="https://nexarionimpex.com">Privacy Policy</a><a href="https://nexarionimpex.com">Terms of Service</a></div>
        </div>

      </div>
    </body>
    </html>
  `;
};

exports.cartInquiryCustomerTemplate = (inquiryData) => {
  const { 
    customerName,
    country,
    inquiryId,
    items,
    totalAmount,
    totalItems,
    createdAt
  } = inquiryData;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; font-weight: 500; color: #1f2937;">${item.product?.name || 'Product'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 13px; color: #374151;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13px; font-weight: 600; color: #1f2937;">$${item.subtotal?.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Inquiry Received – ${inquiryId}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f5f5f5; padding: 28px 16px; -webkit-font-smoothing: antialiased; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
        .header { background: #047857; padding: 40px 40px 32px; }
        .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .brand { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #fff; letter-spacing: .02em; }
        .brand span { color: #6ee7b7; }
        .badge { font-size: 9px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: #6ee7b7; border: 1px solid rgba(110,231,183,.5); padding: 4px 10px; border-radius: 2px; }
        .header-title { font-family: 'Playfair Display', Georgia, serif; font-size: 30px; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 8px; }
        .header-sub { font-size: 11px; font-weight: 300; color: rgba(255,255,255,.6); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 20px; }
        .ref-pill { display: inline-flex; align-items: center; gap: 10px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); padding: 8px 16px; border-radius: 2px; }
        .ref-label { font-size: 10px; color: rgba(255,255,255,.6); letter-spacing: .1em; text-transform: uppercase; }
        .ref-id { font-size: 14px; font-weight: 700; color: #fff; letter-spacing: .08em; }
        .status-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); color: #fff; font-size: 11px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; padding: 6px 14px 6px 10px; border-radius: 2px; margin-top: 12px; }
        .status-dot { width: 7px; height: 7px; background: #6ee7b7; border-radius: 50%; }
        .body { padding: 36px 40px; }
        .greeting { font-size: 15px; color: #1f2937; margin-bottom: 12px; }
        .greeting strong { font-weight: 600; color: #065f46; }
        .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 28px; }
        .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #059669; margin-bottom: 12px; }
        .section { margin-bottom: 28px; }
        .items-table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
        .items-table thead tr { background: #f9fafb; }
        .items-table th { padding: 11px 12px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #6b7280; }
        .items-table th:first-child { text-align: left; }
        .items-table th:nth-child(2) { text-align: center; }
        .items-table th:last-child { text-align: right; }
        .total-row { display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 16px 20px; margin-bottom: 28px; }
        .total-label { font-size: 13px; font-weight: 500; color: #374151; }
        .total-amount { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; color: #047857; }
        .steps-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 20px; margin-bottom: 28px; }
        .step { display: flex; gap: 12px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
        .step:last-child { border-bottom: none; }
        .step-num { width: 22px; height: 22px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #047857; flex-shrink: 0; }
        .step-text { font-size: 12px; color: #4b5563; line-height: 1.55; }
        .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
        .cta-block { text-align: center; margin-bottom: 4px; }
        .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 14px; }
        .cta { display: inline-block; background: #047857; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
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
            <div class="badge">Inquiry Confirmation</div>
          </div>
          <div class="header-title">Inquiry<br>Received</div>
          <div class="header-sub">Submitted &nbsp;·&nbsp; ${new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:0;">
            <div class="ref-pill">
              <span class="ref-label">Reference</span>
              <span class="ref-id">${inquiryId}</span>
            </div>
            <div class="status-pill"><span class="status-dot"></span>Under Review</div>
          </div>
        </div>

        <div class="body">
          <p class="greeting">Dear <strong>${customerName}</strong>,</p>
          <p class="lead">Thank you for your interest in our products. We have received your inquiry and our team will review it shortly. You can expect a response within 24–48 business hours.</p>

          <div class="section">
            <div class="slabel">Inquiry Summary &nbsp;(${totalItems} items)</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="text-align:left;">Product</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
          </div>

          <div class="total-row">
            <span class="total-label">Estimated Total</span>
            <span class="total-amount">$${totalAmount?.toFixed(2)}</span>
          </div>

          <div class="section">
            <div class="slabel">What Happens Next</div>
            <div class="steps-box">
              <div class="step"><div class="step-num">01</div><div class="step-text">Our team will review your inquiry and assess product availability.</div></div>
              <div class="step"><div class="step-num">02</div><div class="step-text">We will prepare a detailed, competitive quote tailored to your requirements.</div></div>
              <div class="step"><div class="step-num">03</div><div class="step-text">You will receive the quote via email within 24–48 business hours.</div></div>
              <div class="step"><div class="step-num">04</div><div class="step-text">Accept the quote to confirm and proceed with the order.</div></div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="cta-block">
            <p>Track the status of your inquiry and quotes from your dashboard.</p>
            <a href="https://nexarionimpex.com/dashboard" class="cta">Track Your Inquiries</a>
          </div>

        </div>

        <div class="footer">
          <div class="fbrand">Nexarion Global Exports<span>.</span></div>
          <div class="fmeta">Need help? <a href="mailto:support@nexarionimpex.com">support@nexarionimpex.com</a><br><a href="https://nexarionimpex.com">Privacy Policy</a><a href="https://nexarionimpex.com">Terms of Service</a></div>
        </div>

      </div>
    </body>
    </html>
  `;
};