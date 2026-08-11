/**
 * Payment Received Email Template
 * Sent when payment is successfully completed
 */

exports.paymentReceivedTemplate = (paymentData) => {
  const {
    customerName,
    customerEmail,
    transactionId,
    orderId,
    amount,
    currency = 'USD',
    paymentMethod,
    paymentType,
    paymentDate,
    orderTotal,
    remainingBalance,
    companyInfo
  } = paymentData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value || 0);
  };

  const formatDate = (date) => {
    return new Date(date || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getPaymentTypeLabel = (type) => {
    const map = {
      'Advance': 'Advance Payment',
      'Remaining': 'Remaining Balance',
      'Partial': 'Partial Payment',
    };
    return map[type] || 'Full Payment';
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Received – ${transactionId}</title>
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
        .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 26px; }
        .amount-hero { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 26px 20px; text-align: center; margin-bottom: 26px; }
        .amount-label { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: #059669; margin-bottom: 10px; }
        .amount-value { font-family: 'Playfair Display', Georgia, serif; font-size: 40px; font-weight: 700; color: #047857; line-height: 1; margin-bottom: 8px; }
        .amount-type { display: inline-block; font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #065f46; background: #dcfce7; border: 1px solid #bbf7d0; padding: 4px 12px; border-radius: 2px; }
        .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #059669; margin-bottom: 10px; }
        .sec { margin-bottom: 24px; }
        .dtable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
        .dtable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
        .dtable tr:last-child td { border-bottom: none; }
        .dtable .lbl { color: #9ca3af; width: 140px; }
        .dtable .val { color: #1f2937; font-weight: 500; text-align: right; }
        .dtable .val.txid { color: #047857; font-weight: 700; }
        .summary-table { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
        .summary-table td { padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
        .summary-table tr:last-child td { border-bottom: none; border-top: 1px solid #e5e7eb; padding-top: 13px; padding-bottom: 13px; }
        .summary-table .slbl { color: #6b7280; }
        .summary-table .sval { text-align: right; font-weight: 500; color: #1f2937; }
        .summary-table .sval.paid { color: #059669; }
        .summary-table .sval.remaining { color: #d97706; font-weight: 700; }
        .summary-table .total-lbl { font-size: 13px; font-weight: 600; color: #1f2937; }
        .summary-table .total-val { text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 700; }
        .steps-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
        .steps-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #1d4ed8; margin-bottom: 12px; }
        .step { display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; border-bottom: 1px solid #dbeafe; }
        .step:last-child { border-bottom: none; }
        .snum { width: 20px; height: 20px; min-width: 20px; background: #dbeafe; border: 1px solid #bfdbfe; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #1e40af; }
        .stxt { font-size: 12px; color: #374151; line-height: 1.55; }
        .stxt strong { color: #1f2937; font-weight: 600; }
        .remaining-notice { background: #fefce8; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 4px; padding: 13px 16px; margin-bottom: 24px; }
        .remaining-notice p { font-size: 13px; color: #78350f; line-height: 1.65; }
        .remaining-notice strong { font-weight: 600; color: #92400e; }
        .receipt-note { text-align: center; font-size: 11px; color: #9ca3af; font-style: italic; margin-bottom: 22px; }
        .divider { height: 1px; background: #e5e7eb; margin: 22px 0; }
        .cta-block { text-align: center; margin-bottom: 20px; }
        .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
        .cta { display: inline-block; background: #047857; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
        .help { text-align: center; font-size: 12px; color: #9ca3af; padding-top: 16px; border-top: 1px solid #f3f4f6; }
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
            <div class="badge">Payment Receipt</div>
          </div>
          <div class="header-title">Payment<br>Received</div>
          <div class="header-sub">Confirmed &nbsp;·&nbsp; ${formatDate(paymentDate)}</div>
          <div class="pills">
            <div class="refpill"><span class="rl">Transaction</span><span class="ri">${transactionId}</span></div>
            <div class="spill"><span class="sdot"></span>Completed</div>
          </div>
        </div>

        <div class="body">

          <div class="amount-hero">
            <div class="amount-label">${getPaymentTypeLabel(paymentType)}</div>
            <div class="amount-value">${formatCurrency(amount)}</div>
            <span class="amount-type">${currency} &nbsp;·&nbsp; ${paymentMethod || 'Bank Transfer'}</span>
          </div>

          <p class="greeting">Dear <strong>${customerName}</strong>,</p>
          <p class="lead">
            We have successfully received your payment. Thank you for your business.
            This email serves as your official payment receipt — please retain it for your records.
          </p>

          <div class="sec">
            <div class="slabel">Transaction Details</div>
            <table class="dtable">
              <tr><td class="lbl">Transaction ID</td><td class="val txid">${transactionId}</td></tr>
              ${orderId ? `<tr><td class="lbl">Order Reference</td><td class="val">${orderId}</td></tr>` : ''}
              <tr><td class="lbl">Payment Method</td><td class="val">${paymentMethod || '—'}</td></tr>
              <tr><td class="lbl">Payment Type</td><td class="val">${getPaymentTypeLabel(paymentType)}</td></tr>
              <tr><td class="lbl">Date &amp; Time</td><td class="val">${formatDate(paymentDate)}</td></tr>
              <tr>
                <td class="lbl">Status</td>
                <td class="val">
                  <span style="display:inline-block;padding:3px 10px;background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;border-radius:2px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Completed</span>
                </td>
              </tr>
            </table>
          </div>

          ${orderTotal ? `
          <div class="sec">
            <div class="slabel">Order Summary</div>
            <table class="summary-table">
              <tr><td class="slbl">Order Total</td><td class="sval">${formatCurrency(orderTotal)}</td></tr>
              <tr><td class="slbl">Amount Paid</td><td class="sval paid">${formatCurrency(amount)}</td></tr>
              ${remainingBalance > 0
                ? `<tr><td class="total-lbl">Remaining Balance</td><td class="total-val remaining">${formatCurrency(remainingBalance)}</td></tr>`
                : `<tr><td class="total-lbl">Payment Status</td><td class="total-val" style="color:#047857;">Fully Paid</td></tr>`
              }
            </table>
          </div>
          ` : ''}

          ${remainingBalance > 0 ? `
          <div class="remaining-notice">
            <p><strong>Remaining Balance Due:</strong> A balance of ${formatCurrency(remainingBalance)} remains outstanding and must be settled prior to shipment dispatch. Please arrange the remaining payment at your earliest convenience.</p>
          </div>
          ` : ''}

          <div class="steps-box">
            <h4>What Happens Next</h4>
            <div class="step"><div class="snum">01</div><div class="stxt">Your payment has been recorded and your order is now being processed.</div></div>
            <div class="step"><div class="snum">02</div><div class="stxt">You will receive shipping updates via email once your order is dispatched.</div></div>
            <div class="step"><div class="snum">03</div><div class="stxt">Track your order status anytime from your account dashboard.</div></div>
            ${remainingBalance > 0 ? `<div class="step"><div class="snum">04</div><div class="stxt"><strong>Note:</strong> Shipment will be held until the remaining balance of ${formatCurrency(remainingBalance)} is received.</div></div>` : ''}
          </div>

          <p class="receipt-note">This email serves as your official payment receipt. Please save it for your records.</p>

          <div class="divider"></div>

          <div class="cta-block">
            <p>View your order details and payment history from your dashboard.</p>
            <a href="https://nexarionimpex.com/dashboard" class="cta">View Order Details</a>
          </div>

          <div class="help">
            Need help? Contact us at <a href="mailto:${companyInfo?.supportEmail || 'support@nexarionimpex.com'}">${companyInfo?.supportEmail || 'support@nexarionimpex.com'}</a>
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