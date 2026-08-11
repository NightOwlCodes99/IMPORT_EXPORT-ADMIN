/**
 * Payment Failed Email Template
 * Sent when a payment fails or is declined
 */

exports.paymentFailedTemplate = (paymentData) => {
  const {
    customerName,
    customerEmail,
    transactionId,
    orderId,
    amount,
    currency = 'USD',
    paymentMethod,
    failureReason,
    attemptDate,
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

  const getFailureSolution = (reason) => {
    const r = (reason || '').toLowerCase();
    if (r.includes('insufficient') || r.includes('funds'))
      return 'Please ensure you have sufficient funds in your account and try again.';
    if (r.includes('declined') || r.includes('card'))
      return 'Your card was declined. Please contact your bank or try a different payment method.';
    if (r.includes('expired'))
      return 'Your card appears to be expired. Please update your card details and try again.';
    if (r.includes('cvv') || r.includes('security'))
      return 'Please verify your card security code (CVV) and billing address are correct.';
    return 'Please verify your payment details and try again, or contact your bank for assistance.';
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Failed – ${transactionId || 'Action Required'}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f5f5f5; padding: 28px 16px; -webkit-font-smoothing: antialiased; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
        .header { background: #991b1b; padding: 40px 40px 32px; }
        .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .brand { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #fff; letter-spacing: .02em; }
        .brand span { color: #fca5a5; }
        .badge { font-size: 9px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: #fca5a5; border: 1px solid rgba(252,165,165,.5); padding: 4px 10px; border-radius: 2px; }
        .header-title { font-family: 'Playfair Display', Georgia, serif; font-size: 30px; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 8px; }
        .header-sub { font-size: 11px; font-weight: 300; color: rgba(255,255,255,.6); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 20px; }
        .pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .refpill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); padding: 7px 14px; border-radius: 2px; }
        .rl { font-size: 9px; color: rgba(255,255,255,.6); letter-spacing: .1em; text-transform: uppercase; }
        .ri { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: .06em; }
        .spill { display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); color: #fff; font-size: 10px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; padding: 7px 13px 7px 9px; border-radius: 2px; }
        .sdot { width: 6px; height: 6px; background: #fca5a5; border-radius: 50%; }
        .body { padding: 36px 40px; background: #fff; }
        .greeting { font-size: 15px; color: #1f2937; margin-bottom: 10px; }
        .greeting strong { font-weight: 600; color: #991b1b; }
        .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 26px; }
        .amount-hero { background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 24px 20px; text-align: center; margin-bottom: 26px; }
        .amount-label { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: #dc2626; margin-bottom: 10px; }
        .amount-value { font-family: 'Playfair Display', Georgia, serif; font-size: 38px; font-weight: 700; color: #991b1b; line-height: 1; margin-bottom: 8px; }
        .amount-method { display: inline-block; font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #b91c1c; background: #fee2e2; border: 1px solid #fecaca; padding: 4px 12px; border-radius: 2px; }
        .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #dc2626; margin-bottom: 10px; }
        .sec { margin-bottom: 24px; }
        .dtable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
        .dtable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
        .dtable tr:last-child td { border-bottom: none; }
        .dtable .lbl { color: #9ca3af; width: 140px; }
        .dtable .val { color: #1f2937; font-weight: 500; text-align: right; }
        .reason-box { background: #fefce8; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
        .reason-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #92400e; margin-bottom: 12px; }
        .reason-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 12px; line-height: 1.6; }
        .reason-row:last-child { margin-bottom: 0; }
        .reason-key { color: #92400e; font-weight: 600; flex-shrink: 0; }
        .reason-val { color: #78350f; }
        .steps-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
        .steps-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #1d4ed8; margin-bottom: 12px; }
        .step { display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; border-bottom: 1px solid #dbeafe; }
        .step:last-child { border-bottom: none; }
        .snum { width: 20px; height: 20px; min-width: 20px; background: #dbeafe; border: 1px solid #bfdbfe; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #1e40af; }
        .stxt { font-size: 12px; color: #374151; line-height: 1.55; }
        .saved-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #059669; border-radius: 4px; padding: 14px 16px; margin-bottom: 24px; }
        .saved-box p { font-size: 13px; color: #065f46; line-height: 1.65; }
        .saved-box strong { font-weight: 600; }
        .divider { height: 1px; background: #e5e7eb; margin: 22px 0; }
        .cta-block { text-align: center; margin-bottom: 16px; }
        .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
        .cta { display: inline-block; background: #991b1b; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
        .cta-secondary { display: block; text-align: center; margin-top: 12px; font-size: 12px; color: #6b7280; text-decoration: none; }
        .cta-secondary a { color: #dc2626; font-weight: 500; text-decoration: none; }
        .help { text-align: center; font-size: 12px; color: #9ca3af; padding-top: 16px; border-top: 1px solid #f3f4f6; }
        .help a { color: #dc2626; text-decoration: none; font-weight: 500; }
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
            <div class="badge">Payment Alert</div>
          </div>
          <div class="header-title">Payment<br>Failed</div>
          <div class="header-sub">Attempt Recorded &nbsp;·&nbsp; ${formatDate(attemptDate)}</div>
          <div class="pills">
            ${transactionId ? `<div class="refpill"><span class="rl">Transaction</span><span class="ri">${transactionId}</span></div>` : ''}
            <div class="spill"><span class="sdot"></span>Failed</div>
          </div>
        </div>

        <div class="body">

          <div class="amount-hero">
            <div class="amount-label">Payment Unsuccessful</div>
            <div class="amount-value">${formatCurrency(amount)}</div>
            <span class="amount-method">${currency} &nbsp;·&nbsp; ${paymentMethod || 'N/A'}</span>
          </div>

          <p class="greeting">Dear <strong>${customerName}</strong>,</p>
          <p class="lead">
            Unfortunately, we were unable to process your payment. Your order has been saved and no charges have been made to your account.
            You can retry the payment at any time from your dashboard.
          </p>

          <div class="sec">
            <div class="slabel">Transaction Details</div>
            <table class="dtable">
              ${transactionId ? `<tr><td class="lbl">Transaction ID</td><td class="val">${transactionId}</td></tr>` : ''}
              <tr><td class="lbl">Order Reference</td><td class="val">${orderId || '—'}</td></tr>
              <tr><td class="lbl">Payment Method</td><td class="val">${paymentMethod || '—'}</td></tr>
              <tr><td class="lbl">Attempt Date</td><td class="val">${formatDate(attemptDate)}</td></tr>
              <tr>
                <td class="lbl">Status</td>
                <td class="val"><span style="display:inline-block;padding:3px 10px;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;border-radius:2px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Failed</span></td>
              </tr>
            </table>
          </div>

          <div class="reason-box">
            <h4>Failure Details</h4>
            <div class="reason-row"><span class="reason-key">Reason:</span><span class="reason-val">${failureReason || 'The payment could not be authorized'}</span></div>
            <div class="reason-row"><span class="reason-key">Suggested Action:</span><span class="reason-val">${getFailureSolution(failureReason)}</span></div>
          </div>

          <div class="steps-box">
            <h4>What You Can Do</h4>
            <div class="step"><div class="snum">01</div><div class="stxt">Double-check your payment details and ensure all information is correct.</div></div>
            <div class="step"><div class="snum">02</div><div class="stxt">Verify sufficient funds are available in your account.</div></div>
            <div class="step"><div class="snum">03</div><div class="stxt">Try a different payment method if the issue persists.</div></div>
            <div class="step"><div class="snum">04</div><div class="stxt">Contact your bank or our support team for further assistance.</div></div>
          </div>

          <div class="saved-box">
            <p><strong>Your order is safe.</strong> No charges have been applied. Your order remains saved and is awaiting payment — you can complete it at any time from your dashboard.</p>
          </div>

          <div class="divider"></div>

          <div class="cta-block">
            <p>Return to your dashboard to retry the payment.</p>
            <a href="https://nexarionimpex.com/dashboard" class="cta">Retry Payment</a>
          </div>

          <div class="cta-secondary">
            Need help? <a href="https://nexarionimpex.com/dashboard">Contact our support team</a>
          </div>

          <div class="help" style="margin-top:16px;">
            Immediate assistance: <a href="mailto:${companyInfo?.supportEmail || 'support@nexarionimpex.com'}">${companyInfo?.supportEmail || 'support@nexarionimpex.com'}</a>
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