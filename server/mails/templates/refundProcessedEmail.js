/**
 * Refund Processed Email Template
 * Sent when a refund is successfully processed
 */

exports.refundProcessedTemplate = (refundData) => {
  const {
    customerName,
    customerEmail,
    transactionId,
    refundTransactionId,
    orderId,
    originalAmount,
    refundAmount,
    currency = 'USD',
    refundReason,
    refundDate,
    paymentMethod,
    estimatedArrival,
    companyInfo
  } = refundData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value || 0);
  };

  const formatDate = (date) => {
    return new Date(date || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const isPartialRefund = refundAmount < originalAmount;
  const remainingAmount = originalAmount - refundAmount;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refund Processed – ${refundTransactionId || transactionId}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f5f5f5; padding: 28px 16px; -webkit-font-smoothing: antialiased; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }

    /* Header */
    .header { background: #065f46; padding: 40px 40px 32px; }
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

    /* Body */
    .body { padding: 36px 40px; background: #fff; }
    .greeting { font-size: 15px; color: #1f2937; margin-bottom: 10px; }
    .greeting strong { font-weight: 600; color: #065f46; }
    .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 26px; }

    /* Refund hero */
    .refund-hero { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 26px 20px; text-align: center; margin-bottom: 26px; }
    .refund-type { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: #059669; margin-bottom: 10px; }
    .refund-value { font-family: 'Playfair Display', Georgia, serif; font-size: 42px; font-weight: 700; color: #047857; line-height: 1; margin-bottom: 6px; }
    .refund-method { display: inline-block; background: #dcfce7; border: 1px solid #bbf7d0; color: #065f46; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 4px 12px; border-radius: 2px; }

    /* Section label */
    .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #059669; margin-bottom: 10px; }
    .sec { margin-bottom: 24px; }

    /* Data table */
    .dtable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
    .dtable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
    .dtable tr:last-child td { border-bottom: none; }
    .dtable .lbl { color: #9ca3af; width: 170px; }
    .dtable .val { color: #1f2937; font-weight: 500; text-align: right; }
    .dtable .val.refund { color: #047857; font-weight: 700; }
    .dtable .val.remaining { color: #1e3a5f; font-weight: 700; }

    /* Reason box */
    .reason-box { background: #fefce8; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 4px; padding: 14px 16px; margin-bottom: 24px; }
    .reason-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #92400e; margin-bottom: 8px; }
    .reason-box p { font-size: 13px; color: #78350f; line-height: 1.65; }

    /* Timeline box */
    .timeline-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
    .timeline-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #1d4ed8; margin-bottom: 8px; }
    .timeline-box p { font-size: 13px; color: #374151; line-height: 1.65; }

    /* Steps box */
    .steps-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #059669; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
    .steps-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #065f46; margin-bottom: 12px; }
    .step { display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; border-bottom: 1px solid #d1fae5; }
    .step:last-child { border-bottom: none; }
    .snum { width: 20px; height: 20px; min-width: 20px; background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #065f46; }
    .stxt { font-size: 12px; color: #374151; line-height: 1.55; }

    /* CTA */
    .divider { height: 1px; background: #e5e7eb; margin: 22px 0; }
    .cta-block { text-align: center; margin-bottom: 20px; }
    .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
    .cta { display: inline-block; background: #065f46; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
    .help { text-align: center; font-size: 12px; color: #9ca3af; padding-top: 16px; border-top: 1px solid #f3f4f6; }
    .help a { color: #059669; text-decoration: none; font-weight: 500; }

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
      .refund-value { font-size: 34px; }
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
        <div class="badge">Refund Update</div>
      </div>
      <div class="header-title">Refund<br>Processed</div>
      <div class="header-sub">Successfully Initiated &nbsp;·&nbsp; ${formatDate(refundDate)}</div>
      <div class="pills">
        <div class="refpill"><span class="rl">Refund</span><span class="ri">${refundTransactionId || 'Processing'}</span></div>
        ${orderId ? `<div class="refpill"><span class="rl">Order</span><span class="ri">${orderId}</span></div>` : ''}
        <div class="spill"><span class="sdot"></span>${isPartialRefund ? 'Partial Refund' : 'Full Refund'}</div>
      </div>
    </div>

    <div class="body">

      <p class="greeting">Dear <strong>${customerName}</strong>,</p>
      <p class="lead">
        Your refund has been successfully processed and initiated back to your original payment method. Please allow a few business days for the amount to reflect in your account.
      </p>

      <div class="refund-hero">
        <div class="refund-type">${isPartialRefund ? 'Partial Refund Issued' : 'Full Refund Issued'}</div>
        <div class="refund-value">${formatCurrency(refundAmount)}</div>
        <div style="font-size:11px;color:#6b7280;margin-bottom:14px;">refunded to your account</div>
        <span class="refund-method">${currency} &nbsp;·&nbsp; ${paymentMethod || 'Original Payment Method'}</span>
      </div>

      <div class="sec">
        <div class="slabel">Refund Summary</div>
        <table class="dtable">
          ${refundTransactionId ? `<tr><td class="lbl">Refund ID</td><td class="val">${refundTransactionId}</td></tr>` : ''}
          <tr><td class="lbl">Original Transaction</td><td class="val">${transactionId}</td></tr>
          ${orderId ? `<tr><td class="lbl">Order Reference</td><td class="val">${orderId}</td></tr>` : ''}
          <tr><td class="lbl">Original Amount</td><td class="val">${formatCurrency(originalAmount)}</td></tr>
          <tr><td class="lbl">Refund Amount</td><td class="val refund">${formatCurrency(refundAmount)}</td></tr>
          ${isPartialRefund ? `<tr><td class="lbl">Remaining Balance</td><td class="val remaining">${formatCurrency(remainingAmount)}</td></tr>` : ''}
          <tr><td class="lbl">Refund Date</td><td class="val">${formatDate(refundDate)}</td></tr>
        </table>
      </div>

      ${refundReason ? `
      <div class="reason-box">
        <h4>Reason for Refund</h4>
        <p>${refundReason}</p>
      </div>
      ` : ''}

      <div class="timeline-box">
        <h4>Estimated Arrival</h4>
        <p>${estimatedArrival || 'Refunds typically take 5–10 business days to appear in your account, depending on your payment provider and bank. Credit card refunds may vary based on your card issuer\'s processing time.'}</p>
      </div>

      <div class="steps-box">
        <h4>Good to Know</h4>
        <div class="step"><div class="snum">01</div><div class="stxt">The refund will be credited to the same payment method used for the original purchase.</div></div>
        <div class="step"><div class="snum">02</div><div class="stxt">You will receive a notification once the refund is fully completed by your bank.</div></div>
        <div class="step"><div class="snum">03</div><div class="stxt">If you don't see the refund after 10 business days, please contact our support team.</div></div>
        <div class="step"><div class="snum">04</div><div class="stxt">Keep this email as confirmation of your refund for your records.</div></div>
      </div>

      <div class="divider"></div>

      <div class="cta-block">
        <p>View your full payment and refund history from your dashboard.</p>
        <a href="https://nexarionimpex.com/dashboard" class="cta">View Payment History</a>
      </div>

      <div class="help">
        Questions about your refund? Contact us at <a href="mailto:${companyInfo?.supportEmail || 'support@nexarionimpex.com'}">${companyInfo?.supportEmail || 'support@nexarionimpex.com'}</a>
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