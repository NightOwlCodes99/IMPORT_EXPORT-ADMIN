/**
 * Ticket Reply Email Template
 * Sent when a reply is added to a support ticket
 */

exports.ticketReplyTemplate = (replyData) => {
  const {
    ticketId,
    subject,
    recipientName,
    recipientEmail,
    senderName,
    senderRole,
    message,
    repliedAt,
    isAdminNotification = false
  } = replyData;

  const fonts = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">`;

  const formatDate = (date) => new Date(date || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const initials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  const baseCSS = `
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f5f5f5; padding: 28px 16px; -webkit-font-smoothing: antialiased; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
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
    .body { padding: 36px 40px; background: #fff; }
    .greeting { font-size: 15px; color: #1f2937; margin-bottom: 10px; }
    .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 26px; }
    .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #3b82f6; margin-bottom: 10px; }
    .sec { margin-bottom: 24px; }
    .dtable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
    .dtable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
    .dtable tr:last-child td { border-bottom: none; }
    .dtable .lbl { color: #9ca3af; width: 150px; }
    .dtable .val { color: #1f2937; font-weight: 500; text-align: right; }
    .reply-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 24px; }
    .reply-card-header { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid #e5e7eb; }
    .avatar { width: 36px; height: 36px; min-width: 36px; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; }
    .sender-name { font-size: 13px; font-weight: 600; color: #1f2937; }
    .sender-meta { font-size: 11px; color: #9ca3af; margin-top: 2px; }
    .reply-card-body { padding: 18px; font-size: 13px; color: #374151; line-height: 1.75; white-space: pre-wrap; background: #fff; }
    .action-box { background: #fefce8; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 4px; padding: 14px 16px; margin-bottom: 24px; }
    .action-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #92400e; margin-bottom: 8px; }
    .action-box p { font-size: 13px; color: #78350f; line-height: 1.65; }
    .steps-box { border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
    .steps-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 12px; }
    .step { display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; border-bottom: 1px solid rgba(0,0,0,.05); }
    .step:last-child { border-bottom: none; }
    .snum { width: 20px; height: 20px; min-width: 20px; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; }
    .stxt { font-size: 12px; color: #374151; line-height: 1.55; }
    .divider { height: 1px; background: #e5e7eb; margin: 22px 0; }
    .cta-block { text-align: center; margin-bottom: 20px; }
    .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
    .cta { display: inline-block; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
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
      .cta { display: block; width: 100%; text-align: center; }
      .footer { flex-direction: column; align-items: flex-start; padding: 20px; }
      .fmeta { text-align: left; }
      .fmeta a { margin-left: 0; margin-right: 8px; }
    }
  `;

  // ─────────────────────────────────────────
  // ADMIN — staff receives customer reply
  // ─────────────────────────────────────────
  if (isAdminNotification) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customer Reply – ${ticketId}</title>
  ${fonts}
  <style>${baseCSS}</style>
</head>
<body>
  <div class="wrapper">

    <div class="header" style="background:#1e3a5f;">
      <div class="header-top">
        <div class="brand">Nexarion Global Exports<span style="color:#93c5fd;">.</span></div>
        <div class="badge" style="color:#93c5fd;border:1px solid rgba(147,197,253,.5);">Ticket Update</div>
      </div>
      <div class="header-title">Customer<br>Reply Received</div>
      <div class="header-sub">Ticket Updated &nbsp;·&nbsp; ${formatDate(repliedAt)}</div>
      <div class="pills">
        <div class="refpill"><span class="rl">Ticket</span><span class="ri">${ticketId}</span></div>
        <div class="spill"><span class="sdot" style="background:#93c5fd;"></span>Awaiting Response</div>
      </div>
    </div>

    <div class="body">

      <p class="greeting">Hi <strong style="color:#1e3a5f;">${recipientName}</strong>,</p>
      <p class="lead">
        A customer has replied to support ticket <strong style="color:#1f2937;">${ticketId}</strong>. Please review their message below and respond promptly.
      </p>

      <div class="sec">
        <div class="slabel">Ticket Reference</div>
        <table class="dtable">
          <tr><td class="lbl">Ticket ID</td><td class="val" style="color:#1e3a5f;font-weight:700;">${ticketId}</td></tr>
          <tr><td class="lbl">Subject</td><td class="val">${subject}</td></tr>
          <tr><td class="lbl">From</td><td class="val">${senderName}</td></tr>
          <tr><td class="lbl">Replied At</td><td class="val">${formatDate(repliedAt)}</td></tr>
        </table>
      </div>

      <div class="sec">
        <div class="slabel">Customer Reply</div>
        <div class="reply-card">
          <div class="reply-card-header">
            <div class="avatar" style="background:#1e3a5f;">${initials(senderName)}</div>
            <div>
              <div class="sender-name">${senderName}</div>
              <div class="sender-meta">Customer &nbsp;·&nbsp; ${formatDate(repliedAt)}</div>
            </div>
          </div>
          <div class="reply-card-body">${message}</div>
        </div>
      </div>

      <div class="action-box">
        <h4>Action Required</h4>
        <p>Please respond to this customer reply within the expected SLA for this ticket's priority level. Timely responses improve your support rating.</p>
      </div>

      <div class="steps-box" style="background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3b82f6;">
        <h4 style="color:#1d4ed8;">Next Steps</h4>
        <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">01</div><div class="stxt">Read the customer's reply carefully and review any previous conversation context.</div></div>
        <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">02</div><div class="stxt">Compose a clear and helpful response addressing all points raised by the customer.</div></div>
        <div class="step"><div class="snum" style="background:#dbeafe;border:1px solid #bfdbfe;color:#1e40af;">03</div><div class="stxt">Update the ticket status and add internal notes if escalation or follow-up is needed.</div></div>
      </div>

      <div class="divider"></div>

      <div class="cta-block">
        <p>Open the ticket in your admin panel to view the full thread and respond.</p>
        <a href="https://nexarionimpex.com/nexarion/admin/login" class="cta" style="background:#1e3a5f;">View Ticket & Reply</a>
      </div>

      <div class="help">
        Questions? <a href="mailto:support@nexarionimpex.com">support@nexarionimpex.com</a>
      </div>

    </div>

    <div class="footer">
      <div class="fbrand">Nexarion Global Exports<span>.</span></div>
      <div class="fmeta">
        Sent to ${recipientEmail || recipientName}<br>
        <a href="https://nexarionimpex.com">Privacy Policy</a>
        <a href="https://nexarionimpex.com">Terms of Service</a>
        <a href="https://nexarionimpex.com">Help Center</a>
      </div>
    </div>

  </div>
</body>
</html>
    `;
  }

  // ─────────────────────────────────────────
  // CUSTOMER — receives staff reply
  // ─────────────────────────────────────────
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reply on Your Ticket – ${ticketId}</title>
  ${fonts}
  <style>${baseCSS}</style>
</head>
<body>
  <div class="wrapper">

    <div class="header" style="background:#065f46;">
      <div class="header-top">
        <div class="brand">Nexarion Global Exports<span style="color:#6ee7b7;">.</span></div>
        <div class="badge" style="color:#6ee7b7;border:1px solid rgba(110,231,183,.5);">Support Reply</div>
      </div>
      <div class="header-title">New Reply<br>on Your Ticket</div>
      <div class="header-sub">Support Response &nbsp;·&nbsp; ${formatDate(repliedAt)}</div>
      <div class="pills">
        <div class="refpill"><span class="rl">Ticket</span><span class="ri">${ticketId}</span></div>
        <div class="spill"><span class="sdot" style="background:#6ee7b7;"></span>Reply Received</div>
      </div>
    </div>

    <div class="body">

      <p class="greeting">Dear <strong style="color:#065f46;">${recipientName}</strong>,</p>
      <p class="lead">
        Our support team has responded to your ticket. Please review the reply below — you can respond directly from your dashboard to continue the conversation.
      </p>

      <div class="sec">
        <div class="slabel">Ticket Reference</div>
        <table class="dtable">
          <tr><td class="lbl">Ticket ID</td><td class="val" style="color:#1e3a5f;font-weight:700;">${ticketId}</td></tr>
          <tr><td class="lbl">Subject</td><td class="val">${subject}</td></tr>
          <tr><td class="lbl">Replied By</td><td class="val">${senderName}</td></tr>
          <tr><td class="lbl">Replied At</td><td class="val">${formatDate(repliedAt)}</td></tr>
        </table>
      </div>

      <div class="sec">
        <div class="slabel">Support Reply</div>
        <div class="reply-card">
          <div class="reply-card-header">
            <div class="avatar" style="background:#065f46;">${initials(senderName)}</div>
            <div>
              <div class="sender-name">${senderName}</div>
              <div class="sender-meta">${senderRole || 'Support Team'} &nbsp;·&nbsp; ${formatDate(repliedAt)}</div>
            </div>
          </div>
          <div class="reply-card-body">${message}</div>
        </div>
      </div>

      <div class="action-box">
        <h4>Need to Continue the Conversation?</h4>
        <p>Reply directly from your dashboard using the button below, or email us at <strong>support@nexarionimpex.com</strong> quoting your Ticket ID: <strong>${ticketId}</strong>.</p>
      </div>

      <div class="steps-box" style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #059669;">
        <h4 style="color:#065f46;">What You Can Do</h4>
        <div class="step"><div class="snum" style="background:#dcfce7;border:1px solid #bbf7d0;color:#065f46;">01</div><div class="stxt">Review the support reply above and check if it resolves your query.</div></div>
        <div class="step"><div class="snum" style="background:#dcfce7;border:1px solid #bbf7d0;color:#065f46;">02</div><div class="stxt">If resolved, you can close the ticket from your dashboard — no action needed otherwise.</div></div>
        <div class="step"><div class="snum" style="background:#dcfce7;border:1px solid #bbf7d0;color:#065f46;">03</div><div class="stxt">If you need further assistance, reply via your dashboard and our team will follow up.</div></div>
      </div>

      <div class="divider"></div>

      <div class="cta-block">
        <p>Continue the conversation or close this ticket from your dashboard.</p>
        <a href="https://nexarionimpex.com/dashboard" class="cta" style="background:#065f46;">View Ticket & Reply</a>
      </div>

      <div class="help">
        Questions? Email <a href="mailto:support@nexarionimpex.com">support@nexarionimpex.com</a> quoting <strong>${ticketId}</strong>
      </div>

    </div>

    <div class="footer">
      <div class="fbrand">Nexarion Global Exports<span>.</span></div>
      <div class="fmeta">
        Sent to ${recipientEmail}<br>
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