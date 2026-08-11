/**
 * Ticket Resolved Email Template
 * Sent when a ticket is marked as resolved
 */

exports.ticketResolvedTemplate = (resolveData) => {
  const {
    ticketId,
    subject,
    customerName,
    customerEmail,
    resolvedBy,
    resolvedAt
  } = resolveData;

  const fonts = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">`;

  const formatDate = (date) => new Date(date || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket Resolved – ${ticketId}</title>
  ${fonts}
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

    /* Resolution hero */
    .resolved-hero { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 26px 20px; text-align: center; margin-bottom: 26px; }
    .resolved-label { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: #059669; margin-bottom: 10px; }
    .resolved-value { font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 700; color: #047857; line-height: 1; margin-bottom: 6px; }
    .resolved-sub { font-size: 11px; color: #6b7280; margin-bottom: 14px; }
    .resolved-tag { display: inline-block; background: #dcfce7; border: 1px solid #bbf7d0; color: #065f46; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 4px 12px; border-radius: 2px; }

    /* Sections */
    .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #059669; margin-bottom: 10px; }
    .sec { margin-bottom: 24px; }
    .dtable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
    .dtable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
    .dtable tr:last-child td { border-bottom: none; }
    .dtable .lbl { color: #9ca3af; width: 150px; }
    .dtable .val { color: #1f2937; font-weight: 500; text-align: right; }

    /* Feedback box */
    .feedback-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #059669; border-radius: 4px; padding: 20px 18px; margin-bottom: 24px; text-align: center; }
    .feedback-box h4 { font-size: 14px; font-weight: 700; color: #065f46; margin-bottom: 8px; }
    .feedback-box p { font-size: 13px; color: #374151; line-height: 1.65; margin-bottom: 16px; }

    /* Reopen notice */
    .reopen-box { background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; border-radius: 4px; padding: 14px 16px; margin-bottom: 24px; }
    .reopen-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #991b1b; margin-bottom: 8px; }
    .reopen-box p { font-size: 13px; color: #7f1d1d; line-height: 1.65; }

    /* Steps */
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
    .cta-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .cta { display: inline-block; background: #065f46; color: #fff !important; text-decoration: none; padding: 13px 30px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
    .cta-outline { display: inline-block; background: transparent; color: #374151 !important; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 13px; font-weight: 600; border: 1px solid #d1d5db; }
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
        <div class="badge">Ticket Resolved</div>
      </div>
      <div class="header-title">Ticket<br>Resolved</div>
      <div class="header-sub">Issue Closed &nbsp;·&nbsp; ${formatDate(resolvedAt)}</div>
      <div class="pills">
        <div class="refpill"><span class="rl">Ticket</span><span class="ri">${ticketId}</span></div>
        <div class="spill"><span class="sdot"></span>Resolved</div>
      </div>
    </div>

    <div class="body">

      <p class="greeting">Dear <strong>${customerName}</strong>,</p>
      <p class="lead">
        We are pleased to inform you that your support ticket has been reviewed and marked as resolved by our team. Thank you for your patience throughout this process.
      </p>

      <div class="resolved-hero">
        <div class="resolved-label">Ticket Status</div>
        <div class="resolved-value">Resolved</div>
        <div class="resolved-sub">Closed by ${resolvedBy || 'Support Team'} on ${formatDate(resolvedAt)}</div>
        <span class="resolved-tag">No Further Action Required</span>
      </div>

      <div class="sec">
        <div class="slabel">Ticket Summary</div>
        <table class="dtable">
          <tr><td class="lbl">Ticket ID</td><td class="val" style="color:#065f46;font-weight:700;">${ticketId}</td></tr>
          <tr><td class="lbl">Subject</td><td class="val">${subject}</td></tr>
          <tr><td class="lbl">Status</td><td class="val"><span style="display:inline-block;padding:3px 10px;background:#f0fdf4;border:1px solid #bbf7d0;color:#065f46;border-radius:2px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">Resolved</span></td></tr>
          <tr><td class="lbl">Resolved By</td><td class="val">${resolvedBy || 'Support Team'}</td></tr>
          <tr><td class="lbl">Resolved At</td><td class="val">${formatDate(resolvedAt)}</td></tr>
        </table>
      </div>

      <div class="feedback-box">
        <h4>Your Feedback Matters</h4>
        <p>We continuously work to improve our support experience. If you have a moment, please share your thoughts on how we handled your request.</p>
        <a href="https://nexarionimpex.com/dashboard" class="cta" style="display:inline-block;">Leave Feedback</a>
      </div>

      <div class="steps-box">
        <h4>What This Means</h4>
        <div class="step"><div class="snum">01</div><div class="stxt">Your ticket has been fully reviewed and closed — no further action is required from you.</div></div>
        <div class="step"><div class="snum">02</div><div class="stxt">A full transcript of this ticket is available for review in your account dashboard.</div></div>
        <div class="step"><div class="snum">03</div><div class="stxt">If the issue recurs or is not fully resolved, you can reopen this ticket from your dashboard.</div></div>
        <div class="step"><div class="snum">04</div><div class="stxt">For new issues, submit a fresh support ticket and our team will assist you promptly.</div></div>
      </div>

      <div class="reopen-box">
        <h4>Issue Not Fully Resolved?</h4>
        <p>If you require further assistance, you may reopen this ticket directly from your dashboard or submit a new request. Our team is always here to help.</p>
      </div>

      <div class="divider"></div>

      <div class="cta-block">
        <p>View your ticket history or submit a new support request.</p>
        <div class="cta-row">
          <a href="https://nexarionimpex.com/dashboard" class="cta">View My Tickets</a>
          <a href="https://nexarionimpex.com/dashboard" class="cta-outline">New Request</a>
        </div>
      </div>

      <div class="help">
        Need further help? <a href="mailto:support@nexarionimpex.com">support@nexarionimpex.com</a>
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