/**
 * Checkout Confirmation Email Template
 * Sent when an order is successfully placed
 */

exports.checkoutConfirmationTemplate = (orderData) => {
  const {
    customerName,
    customerEmail,
    orderId,
    orderItems,
    shippingAddress,
    billingAddress,
    pricing,
    paymentMethod,
    paymentStatus,
    orderNotes,
    orderDate
  } = orderData;

  const formatCurrency = (value, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value || 0);
  };

  const formatDate = (date) => {
    return new Date(date || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getPaymentStatusBadge = (status) => {
    const map = {
      'Paid':    { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
      'Pending': { bg: '#fefce8', border: '#fde68a', text: '#92400e' },
      'Partial': { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
      'Failed':  { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
    };
    const c = map[status] || map['Pending'];
    return `<span style="display:inline-block;padding:3px 10px;background:${c.bg};border:1px solid ${c.border};color:${c.text};border-radius:2px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${status}</span>`;
  };

  const generateOrderItemsHTML = () => {
    if (!orderItems || orderItems.length === 0) {
      return '<tr><td colspan="4" style="text-align:center;padding:20px;color:#9ca3af;font-size:13px;">No items in order</td></tr>';
    }
    return orderItems.map(item => `
      <tr>
        <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;vertical-align:middle;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${item.image || 'https://via.placeholder.com/52'}" alt="${item.name}" style="width:52px;height:52px;object-fit:cover;border-radius:3px;border:1px solid #e5e7eb;flex-shrink:0;" />
            <div>
              <p style="margin:0;font-size:13px;font-weight:600;color:#1f2937;">${item.name}</p>
              ${item.sku ? `<p style="margin:3px 0 0;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;">SKU: ${item.sku}</p>` : ''}
            </div>
          </div>
        </td>
        <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;font-size:13px;">${item.quantity}</td>
        <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#6b7280;font-size:13px;">${formatCurrency(item.unitPrice || item.price / item.quantity)}</td>
        <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#1f2937;font-size:13px;font-weight:600;">${formatCurrency(item.price)}</td>
      </tr>
    `).join('');
  };

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
        .body { padding: 36px 40px; background: #fff; }
        .greeting { font-size: 15px; color: #1f2937; margin-bottom: 10px; }
        .greeting strong { font-weight: 600; color: #065f46; }
        .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 28px; }
        .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #059669; margin-bottom: 10px; }
        .meta-table { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 28px; }
        .meta-table td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
        .meta-table tr:last-child td { border-bottom: none; }
        .meta-table .lbl { color: #9ca3af; width: 130px; }
        .meta-table .val { color: #1f2937; font-weight: 500; text-align: right; }
        .meta-table .val.order-id { color: #047857; font-weight: 700; font-size: 14px; letter-spacing: .04em; }
        .items-table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 28px; }
        .items-table thead tr { background: #f9fafb; }
        .items-table th { padding: 10px 12px; font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #6b7280; }
        .items-table th:first-child { text-align: left; }
        .items-table th:nth-child(2) { text-align: center; }
        .items-table th:nth-child(3), .items-table th:nth-child(4) { text-align: right; }
        .pricing-table { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 28px; }
        .pricing-table td { padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
        .pricing-table tr:last-child td { border-bottom: none; border-top: 1px solid #e5e7eb; padding-top: 14px; padding-bottom: 14px; }
        .pricing-table .plbl { color: #6b7280; }
        .pricing-table .pval { text-align: right; font-weight: 500; color: #1f2937; }
        .pricing-table .pval.free { color: #059669; }
        .pricing-table .pval.disc { color: #dc2626; }
        .pricing-table .total-lbl { font-size: 14px; font-weight: 600; color: #1f2937; }
        .pricing-table .total-val { text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #047857; }
        .addr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
        .addr-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 16px; }
        .addr-card h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #059669; margin-bottom: 10px; }
        .addr-card p { font-size: 12px; color: #4b5563; line-height: 1.7; }
        .notes-box { background: #fefce8; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 4px; padding: 14px 16px; margin-bottom: 28px; }
        .notes-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #92400e; margin-bottom: 7px; }
        .notes-box p { font-size: 12px; color: #78350f; line-height: 1.65; font-style: italic; }
        .steps-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 18px; margin-bottom: 28px; }
        .step { display: flex; gap: 10px; align-items: flex-start; padding: 9px 0; border-bottom: 1px solid #f3f4f6; }
        .step:last-child { border-bottom: none; }
        .snum { width: 22px; height: 22px; min-width: 22px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #047857; }
        .stxt { font-size: 12px; color: #4b5563; line-height: 1.55; }
        .stxt strong { color: #1f2937; }
        .divider { height: 1px; background: #e5e7eb; margin: 22px 0; }
        .cta-block { text-align: center; margin-bottom: 22px; }
        .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
        .cta { display: inline-block; background: #047857; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
        .help { text-align: center; font-size: 12px; color: #9ca3af; padding-top: 18px; border-top: 1px solid #f3f4f6; }
        .help a { color: #059669; text-decoration: none; font-weight: 500; }
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
          .addr-grid { grid-template-columns: 1fr; }
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
          <div class="header-sub">Placed &nbsp;·&nbsp; ${formatDate(orderDate)}</div>
          <div class="pills">
            <div class="refpill"><span class="rl">Order</span><span class="ri">${orderId}</span></div>
            <div class="spill"><span class="sdot"></span>Processing</div>
          </div>
        </div>

        <div class="body">
          <p class="greeting">Dear <strong>${customerName}</strong>,</p>
          <p class="lead">
            Thank you for your order. We have received it and our team is now processing it.
            Below is a full summary of your order for your records.
          </p>

          <div class="slabel">Order Details</div>
          <table class="meta-table">
            <tr><td class="lbl">Order Number</td><td class="val order-id">${orderId}</td></tr>
            <tr><td class="lbl">Order Date</td><td class="val">${formatDate(orderDate)}</td></tr>
            <tr><td class="lbl">Payment Method</td><td class="val">${paymentMethod || 'Credit Card'}</td></tr>
            <tr><td class="lbl">Payment Status</td><td class="val">${getPaymentStatusBadge(paymentStatus || 'Pending')}</td></tr>
          </table>

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
            <tbody>${generateOrderItemsHTML()}</tbody>
          </table>

          <div class="slabel">Order Summary</div>
          <table class="pricing-table">
            <tr><td class="plbl">Subtotal</td><td class="pval">${formatCurrency(pricing?.itemsPrice || 0)}</td></tr>
            <tr><td class="plbl">Shipping</td><td class="pval ${(pricing?.shippingPrice || 0) === 0 ? 'free' : ''}">${(pricing?.shippingPrice || 0) === 0 ? 'Free' : formatCurrency(pricing?.shippingPrice)}</td></tr>
            <tr><td class="plbl">Tax</td><td class="pval">${formatCurrency(pricing?.taxPrice || 0)}</td></tr>
            ${pricing?.discount > 0 ? `<tr><td class="plbl">Discount</td><td class="pval disc">−${formatCurrency(pricing?.discount)}</td></tr>` : ''}
            <tr><td class="total-lbl">Total</td><td class="total-val">${formatCurrency(pricing?.totalPrice || 0)}</td></tr>
          </table>

          <div class="slabel">Delivery &amp; Billing</div>
          <div class="addr-grid">
            <div class="addr-card">
              <h4>Shipping Address</h4>
              <p>
                ${shippingAddress?.fullName || ''}<br/>
                ${shippingAddress?.company ? shippingAddress.company + '<br/>' : ''}
                ${shippingAddress?.street || ''}<br/>
                ${shippingAddress?.city || ''}${shippingAddress?.state ? ', ' + shippingAddress.state : ''} ${shippingAddress?.zipCode || ''}<br/>
                ${shippingAddress?.country || ''}
              </p>
            </div>
            <div class="addr-card">
              <h4>Billing Address</h4>
              <p>
                ${billingAddress?.fullName || shippingAddress?.fullName || ''}<br/>
                ${(billingAddress?.company || shippingAddress?.company) ? (billingAddress?.company || shippingAddress?.company) + '<br/>' : ''}
                ${billingAddress?.street || shippingAddress?.street || ''}<br/>
                ${billingAddress?.city || shippingAddress?.city || ''}${(billingAddress?.state || shippingAddress?.state) ? ', ' + (billingAddress?.state || shippingAddress?.state) : ''} ${billingAddress?.zipCode || shippingAddress?.zipCode || ''}<br/>
                ${billingAddress?.country || shippingAddress?.country || ''}
              </p>
            </div>
          </div>

          ${orderNotes ? `
          <div class="notes-box">
            <h4>Order Notes</h4>
            <p>"${orderNotes}"</p>
          </div>
          ` : ''}

          <div class="slabel">What Happens Next</div>
          <div class="steps-box">
            <div class="step"><div class="snum">01</div><div class="stxt">Your order is being reviewed and prepared by our operations team.</div></div>
            <div class="step"><div class="snum">02</div><div class="stxt">You will receive a shipping confirmation email once your order is dispatched.</div></div>
            <div class="step"><div class="snum">03</div><div class="stxt">Track your order status anytime from your account dashboard.</div></div>
            <div class="step"><div class="snum">04</div><div class="stxt">Estimated delivery: <strong>5–7 business days</strong> from dispatch.</div></div>
          </div>

          <div class="divider"></div>

          <div class="cta-block">
            <p>Manage and track your orders from your dashboard.</p>
            <a href="https://nexarionimpex.com/dashboard" class="cta">View My Orders</a>
          </div>

          <div class="help">
            Questions about your order? <a href="https://nexarionimpex.com/dashboard">Contact our support team</a>
          </div>

        </div>

        <div class="footer">
          <div class="fbrand">Nexarion Global Exports<span>.</span></div>
          <div class="fmeta">
            Sent to ${customerEmail}<br>
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