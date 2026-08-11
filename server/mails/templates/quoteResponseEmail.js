/**
 * Quote Response Email Template
 * Sent when admin sends a quote response to customer
 */

exports.quoteResponseTemplate = (quoteData) => {
  const { 
    customerName, 
    quoteId, 
    productName, 
    quantity,
    unit,
    quotedPrice,
    moq,
    leadTime,
    paymentTerms,
    shippingTerms,
    validUntil,
    notes
  } = quoteData;

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const totalPrice = (quotedPrice * quantity).toFixed(2);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote Ready – ${quoteId}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f5f5f5; padding: 28px 16px; -webkit-font-smoothing: antialiased; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
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
        .body { padding: 36px 40px; background: #fff; }
        .greeting { font-size: 15px; color: #1f2937; margin-bottom: 10px; }
        .greeting strong { font-weight: 600; color: #1e3a5f; }
        .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 26px; }
        .price-hero { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 26px 20px; text-align: center; margin-bottom: 26px; }
        .price-product { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 4px; }
        .price-qty { font-size: 11px; color: #6b7280; margin-bottom: 16px; letter-spacing: .04em; }
        .price-label { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: #059669; margin-bottom: 8px; }
        .price-value { font-family: 'Playfair Display', Georgia, serif; font-size: 42px; font-weight: 700; color: #047857; line-height: 1; margin-bottom: 6px; }
        .price-unit { font-size: 11px; color: #6b7280; margin-bottom: 14px; }
        .price-total { display: inline-block; background: #dcfce7; border: 1px solid #bbf7d0; color: #065f46; font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 2px; letter-spacing: .04em; }
        .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #3b82f6; margin-bottom: 10px; }
        .sec { margin-bottom: 24px; }
        .dtable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
        .dtable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
        .dtable tr:last-child td { border-bottom: none; }
        .dtable .lbl { color: #9ca3af; width: 170px; }
        .dtable .val { color: #1f2937; font-weight: 500; text-align: right; }
        .dtable .val.exp { color: #d97706; font-weight: 700; }
        .notes-box { background: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid #d1d5db; border-radius: 4px; padding: 14px 16px; margin-bottom: 24px; }
        .notes-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
        .notes-box p { font-size: 13px; color: #4b5563; line-height: 1.65; }
        .validity-bar { background: #fefce8; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 4px; padding: 13px 16px; margin-bottom: 24px; }
        .validity-bar p { font-size: 12px; color: #92400e; line-height: 1.55; }
        .validity-bar strong { color: #78350f; }
        .divider { height: 1px; background: #e5e7eb; margin: 22px 0; }
        .cta-block { text-align: center; margin-bottom: 20px; }
        .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 14px; }
        .cta-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .cta { display: inline-block; background: #047857; color: #fff !important; text-decoration: none; padding: 13px 30px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
        .cta-outline { display: inline-block; background: transparent; color: #374151 !important; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; border: 1px solid #d1d5db; }
        .help { text-align: center; font-size: 12px; color: #9ca3af; padding-top: 16px; border-top: 1px solid #f3f4f6; }
        .help a { color: #3b82f6; text-decoration: none; font-weight: 500; }
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
          .price-value { font-size: 34px; }
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
            <div class="badge">Quote Ready</div>
          </div>
          <div class="header-title">Your Quote<br>Is Ready</div>
          <div class="header-sub">Prepared for Review &nbsp;·&nbsp; ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div class="pills">
            <div class="refpill"><span class="rl">Quote</span><span class="ri">${quoteId}</span></div>
            <div class="spill"><span class="sdot"></span>Awaiting Response</div>
          </div>
        </div>

        <div class="body">

          <p class="greeting">Dear <strong>${customerName}</strong>,</p>
          <p class="lead">
            We have prepared a quotation in response to your request. Please review the pricing and terms below, and accept or negotiate at your convenience before the validity date.
          </p>

          <div class="price-hero">
            <div class="price-product">${productName}</div>
            <div class="price-qty">${quantity?.toLocaleString()} ${unit}</div>
            <div class="price-label">Quoted Price Per Unit</div>
            <div class="price-value">$${quotedPrice?.toFixed(2) || '0.00'}</div>
            <div class="price-unit">per ${unit}</div>
            <span class="price-total">Total: $${totalPrice}</span>
          </div>

          <div class="sec">
            <div class="slabel">Quote Terms</div>
            <table class="dtable">
              <tr><td class="lbl">Minimum Order Qty</td><td class="val">${moq?.toLocaleString()} ${unit}</td></tr>
              <tr><td class="lbl">Lead Time</td><td class="val">${leadTime?.value} ${leadTime?.unit}</td></tr>
              ${paymentTerms ? `<tr><td class="lbl">Payment Terms</td><td class="val">${paymentTerms}</td></tr>` : ''}
              ${shippingTerms ? `<tr><td class="lbl">Shipping Terms</td><td class="val">${shippingTerms}</td></tr>` : ''}
              <tr><td class="lbl">Valid Until</td><td class="val exp">${formatDate(validUntil)}</td></tr>
            </table>
          </div>

          ${notes ? `
          <div class="notes-box">
            <h4>Additional Notes</h4>
            <p>${notes}</p>
          </div>
          ` : ''}

          <div class="validity-bar">
            <p>This quote expires on <strong>${formatDate(validUntil)}</strong>. Please accept or negotiate before this date to secure the pricing above.</p>
          </div>

          <div class="divider"></div>

          <div class="cta-block">
            <p>Review this quote and take action from your dashboard.</p>
            <div class="cta-row">
              <a href="https://nexarionimpex.com/dashboard" class="cta">Accept Quote</a>
              <a href="https://nexarionimpex.com/dashboard" class="cta-outline">Negotiate</a>
            </div>
          </div>

          <div class="help">
            Questions about this quote? Contact us at <a href="mailto:support@nexarionimpex.com">support@nexarionimpex.com</a>
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