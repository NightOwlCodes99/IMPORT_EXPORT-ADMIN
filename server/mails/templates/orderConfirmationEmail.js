/**
 * Order Confirmation Email Template
 * Sent when order is created with detailed payment breakdown
 * Includes advance payment, remaining balance, GST, and shipping info
 */

exports.orderConfirmationTemplate = (orderData) => {
  const {
    customerName,
    orderId,
    quoteId,
    orderItems,
    shippingAddress,
    pricing,
    paymentBreakdown,
    paymentTerms,
    expectedDeliveryDate,
    companyInfo
  } = orderData;

  const advanceAmount = paymentBreakdown?.advanceAmount || pricing?.advancePayment || 0;
  const totalPrice = pricing?.totalPrice || 0;
  const calculatedRemainingAmount = totalPrice - advanceAmount;

  const paymentInfo = paymentBreakdown || {
    advanceAmount,
    advancePercentage: pricing?.advancePercent || 0,
    remainingAmount: calculatedRemainingAmount > 0 ? calculatedRemainingAmount : 0,
    taxRate: pricing?.taxRate || 18,
    advancePaid: pricing?.advancePaid || false
  };

  if (paymentInfo.remainingAmount === paymentInfo.advanceAmount || paymentInfo.remainingAmount === totalPrice) {
    paymentInfo.remainingAmount = totalPrice - paymentInfo.advanceAmount;
    if (paymentInfo.remainingAmount < 0) paymentInfo.remainingAmount = 0;
  }

  const formatDate = (date) => {
    if (!date) return 'To be confirmed';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const itemsHtml = orderItems?.map(item => `
    <tr>
      <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;vertical-align:middle;">
        <div style="display:flex;align-items:center;gap:12px;">
          ${item.image
            ? `<img src="${item.image}" alt="${item.name}" style="width:52px;height:52px;object-fit:cover;border-radius:3px;border:1px solid #e5e7eb;flex-shrink:0;">`
            : `<div style="width:52px;height:52px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:3px;flex-shrink:0;"></div>`}
          <div>
            <p style="margin:0;font-size:13px;font-weight:600;color:#1f2937;">${item.name}</p>
            ${item.sku ? `<p style="margin:3px 0 0;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;">SKU: ${item.sku}</p>` : ''}
          </div>
        </div>
      </td>
      <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;font-size:13px;">${item.quantity}</td>
      <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#6b7280;font-size:13px;">${formatCurrency(item.price)}</td>
      <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#1f2937;font-size:13px;font-weight:600;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmed – ${orderId}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f5f5f5; padding: 28px 16px; -webkit-font-smoothing: antialiased; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }

        /* HEADER */
        .header { background: #047857; padding: 40px 40px 32px; }
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

        /* BODY */
        .body { padding: 36px 40px; background: #fff; }
        .greeting { font-size: 15px; color: #1f2937; margin-bottom: 10px; }
        .greeting strong { font-weight: 600; color: #065f46; }
        .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 28px; }
        .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #059669; margin-bottom: 10px; }
        .sec { margin-bottom: 26px; }

        /* ITEMS TABLE */
        .items-table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
        .items-table thead tr { background: #f9fafb; }
        .items-table th { padding: 10px 12px; font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #6b7280; }
        .items-table th:first-child { text-align: left; }
        .items-table th:nth-child(2) { text-align: center; }
        .items-table th:nth-child(3), .items-table th:nth-child(4) { text-align: right; }

        /* PRICING TABLE */
        .pricing-table { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
        .pricing-table td { padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
        .pricing-table tr:last-child td { border-bottom: none; border-top: 1px solid #e5e7eb; padding-top: 14px; padding-bottom: 14px; }
        .pricing-table .plbl { color: #6b7280; }
        .pricing-table .pval { text-align: right; font-weight: 500; color: #1f2937; }
        .pricing-table .pval.free { color: #059669; }
        .pricing-table .pval.disc { color: #dc2626; }
        .pricing-table .total-lbl { font-size: 14px; font-weight: 600; color: #1f2937; }
        .pricing-table .total-val { text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #047857; }

        /* PAYMENT SCHEDULE */
        .pay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 26px; }
        .pay-card { border-radius: 4px; padding: 20px 16px; text-align: center; }
        .pay-card.advance { background: #fffbeb; border: 1px solid #fde68a; }
        .pay-card.balance { background: #f0fdf4; border: 1px solid #bbf7d0; }
        .pay-step { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 2px; font-size: 11px; font-weight: 700; margin-bottom: 10px; }
        .pay-card.advance .pay-step { background: #fde68a; color: #92400e; }
        .pay-card.balance .pay-step { background: #bbf7d0; color: #065f46; }
        .pay-card-label { font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 8px; }
        .pay-card.advance .pay-card-label { color: #92400e; }
        .pay-card.balance .pay-card-label { color: #065f46; }
        .pay-card-amount { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; margin-bottom: 5px; }
        .pay-card.advance .pay-card-amount { color: #d97706; }
        .pay-card.balance .pay-card-amount { color: #047857; }
        .pay-card-sub { font-size: 11px; margin-bottom: 12px; }
        .pay-card.advance .pay-card-sub { color: #92400e; }
        .pay-card.balance .pay-card-sub { color: #065f46; }
        .pay-status { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 4px 10px; border-radius: 2px; }

        /* ADDRESS CARD */
        .addr-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 16px; margin-bottom: 26px; }
        .addr-card h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #059669; margin-bottom: 10px; }
        .addr-card .name { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 5px; }
        .addr-card .detail { font-size: 12px; color: #4b5563; line-height: 1.7; }
        .addr-card .contact { font-size: 12px; color: #6b7280; margin-top: 8px; }

        /* DELIVERY */
        .delivery-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 16px 20px; margin-bottom: 26px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .delivery-label { font-size: 9px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: #059669; }
        .delivery-date { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 700; color: #047857; }

        /* NOTICE */
        .notice-box { background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 4px; padding: 14px 16px; margin-bottom: 26px; }
        .notice-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #92400e; margin-bottom: 10px; }
        .notice-list { list-style: none; padding: 0; }
        .notice-list li { font-size: 12px; color: #92400e; line-height: 1.65; padding: 5px 0; border-bottom: 1px solid rgba(253,230,138,.5); display: flex; gap: 8px; }
        .notice-list li:last-child { border-bottom: none; }
        .notice-list li::before { content: '—'; color: #d97706; flex-shrink: 0; }

        /* PAYMENT TERMS */
        .terms-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 14px 16px; margin-bottom: 26px; }
        .terms-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #6b7280; margin-bottom: 7px; }
        .terms-box p { font-size: 12px; color: #4b5563; line-height: 1.65; }

        /* DIVIDER */
        .divider { height: 1px; background: #e5e7eb; margin: 22px 0; }

        /* CTA */
        .cta-block { text-align: center; margin-bottom: 22px; }
        .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
        .cta { display: inline-block; background: #047857; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }

        /* HELP */
        .help { text-align: center; font-size: 12px; color: #9ca3af; padding-top: 16px; border-top: 1px solid #f3f4f6; }
        .help a { color: #059669; text-decoration: none; font-weight: 500; }

        /* FOOTER */
        .footer { background: #1f2937; padding: 24px 40px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
        .fbrand { font-family: 'Playfair Display', Georgia, serif; font-size: 14px; color: #fff; }
        .fbrand span { color: #10b981; }
        .fmeta { font-size: 10px; color: #6b7280; text-align: right; line-height: 1.7; }
        .fmeta a { color: #10b981; text-decoration: none; margin-left: 8px; }

        /* RESPONSIVE */
        @media only screen and (max-width: 600px) {
          body { padding: 16px 8px; }
          .header { padding: 28px 20px 24px; }
          .header-top { flex-direction: column; align-items: flex-start; gap: 10px; }
          .header-title { font-size: 24px; }
          .body { padding: 26px 20px; }
          .pay-grid { grid-template-columns: 1fr; }
          .delivery-box { flex-direction: column; align-items: flex-start; }
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
            <div class="badge">Order Confirmation</div>
          </div>
          <div class="header-title">Order<br>Confirmed</div>
          <div class="header-sub">${quoteId ? `Quote ${quoteId} Approved &nbsp;·&nbsp; ` : ''}${formatDate(new Date())}</div>
          <div class="pills">
            <div class="refpill"><span class="rl">Order</span><span class="ri">${orderId}</span></div>
            ${quoteId ? `<div class="refpill"><span class="rl">Quote</span><span class="ri">${quoteId}</span></div>` : ''}
            <div class="spill"><span class="sdot"></span>Processing</div>
          </div>
        </div>

        <div class="body">
          <p class="greeting">Dear <strong>${customerName}</strong>,</p>
          <p class="lead">
            ${quoteId
              ? `Your quote <strong>${quoteId}</strong> has been approved and converted to an order. A full summary is provided below for your records.`
              : 'Your order has been successfully placed and is now being processed. A full summary is provided below for your records.'}
          </p>

          <!-- ORDER ITEMS -->
          <div class="sec">
            <div class="slabel">Order Items</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="text-align:left;">Product</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Unit Price</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
          </div>

          <!-- PRICING -->
          <div class="sec">
            <div class="slabel">Payment Summary</div>
            <table class="pricing-table">
              <tr><td class="plbl">Subtotal</td><td class="pval">${formatCurrency(pricing?.itemsPrice)}</td></tr>
              ${pricing?.taxPrice > 0 ? `<tr><td class="plbl">GST / Tax (${paymentInfo?.taxRate || 18}%)</td><td class="pval">${formatCurrency(pricing?.taxPrice)}</td></tr>` : ''}
              ${pricing?.shippingPrice > 0 ? `<tr><td class="plbl">Shipping &amp; Handling</td><td class="pval">${formatCurrency(pricing?.shippingPrice)}</td></tr>` : ''}
              ${pricing?.discount > 0 ? `<tr><td class="plbl">Discount</td><td class="pval disc">−${formatCurrency(pricing?.discount)}</td></tr>` : ''}
              <tr><td class="total-lbl">Grand Total</td><td class="total-val">${formatCurrency(pricing?.totalPrice)}</td></tr>
            </table>
          </div>

          <!-- PAYMENT SCHEDULE -->
          ${paymentInfo?.advanceAmount > 0 ? `
          <div class="sec">
            <div class="slabel">Payment Schedule</div>
            <div class="pay-grid">
              <div class="pay-card advance">
                <div class="pay-step">01</div>
                <div class="pay-card-label">Advance Payment</div>
                <div class="pay-card-amount">${formatCurrency(paymentInfo?.advanceAmount)}</div>
                <div class="pay-card-sub">${paymentInfo?.advancePercentage}% of total</div>
                <span class="pay-status" style="background:${paymentInfo?.advancePaid ? '#f0fdf4' : '#fef2f2'};border:1px solid ${paymentInfo?.advancePaid ? '#bbf7d0' : '#fecaca'};color:${paymentInfo?.advancePaid ? '#166534' : '#dc2626'};">${paymentInfo?.advancePaid ? 'Paid' : 'Due Now'}</span>
              </div>
              <div class="pay-card balance">
                <div class="pay-step">02</div>
                <div class="pay-card-label">Balance Due</div>
                <div class="pay-card-amount">${formatCurrency(paymentInfo?.remainingAmount)}</div>
                <div class="pay-card-sub">Before shipment</div>
                <span class="pay-status" style="background:#fefce8;border:1px solid #fde68a;color:#92400e;">Pending</span>
              </div>
            </div>
          </div>
          ` : ''}

          <!-- SHIPPING ADDRESS -->
          ${shippingAddress ? `
          <div class="sec">
            <div class="slabel">Shipping Address</div>
            <div class="addr-card">
              <h4>Delivery To</h4>
              <div class="name">${shippingAddress.fullName}</div>
              ${shippingAddress.company ? `<div class="detail">${shippingAddress.company}</div>` : ''}
              <div class="detail">
                ${shippingAddress.street}<br>
                ${shippingAddress.city}${shippingAddress.state ? ', ' + shippingAddress.state : ''} ${shippingAddress.zipCode}<br>
                ${shippingAddress.country}
              </div>
              ${shippingAddress.phone || shippingAddress.email ? `
              <div class="contact">
                ${shippingAddress.phone ? shippingAddress.phone : ''}${shippingAddress.phone && shippingAddress.email ? ' &nbsp;·&nbsp; ' : ''}${shippingAddress.email ? shippingAddress.email : ''}
              </div>` : ''}
            </div>
          </div>
          ` : ''}

          <!-- ESTIMATED DELIVERY -->
          ${expectedDeliveryDate ? `
          <div class="delivery-box">
            <div class="delivery-label">Estimated Delivery</div>
            <div class="delivery-date">${formatDate(expectedDeliveryDate)}</div>
          </div>
          ` : ''}

          <!-- IMPORTANT NOTICE -->
          <div class="notice-box">
            <h4>Important Information</h4>
            <ul class="notice-list">
              ${paymentInfo?.advanceAmount > 0 ? `<li>Advance payment of <strong>${formatCurrency(paymentInfo?.advanceAmount)}</strong> is required to begin order processing.</li>` : ''}
              <li>GST and applicable taxes are charged as per government regulations.</li>
              <li>Shipping charges may vary based on actual weight and destination.</li>
              <li>A final invoice will be issued before dispatch for remaining payment confirmation.</li>
            </ul>
          </div>

          <!-- PAYMENT TERMS -->
          ${paymentTerms ? `
          <div class="terms-box">
            <h4>Payment Terms</h4>
            <p>${paymentTerms}</p>
          </div>
          ` : ''}

          <div class="divider"></div>

          <div class="cta-block">
            <p>Track and manage your order from your dashboard.</p>
            <a href="https://nexarionimpex.com/dashboard" class="cta">View Order Details</a>
          </div>

          <div class="help">
            Questions about your order? <a href="mailto:${companyInfo?.supportEmail || 'support@nexarionimpex.com'}">${companyInfo?.supportEmail || 'support@nexarionimpex.com'}</a>
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