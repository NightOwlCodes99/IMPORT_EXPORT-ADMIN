/**
 * Ticket Assigned Email Template
 * Sent when a ticket is assigned to a staff member
 */

exports.ticketAssignedTemplate = (assignData) => {
  const {
    ticketId,
    subject,
    category,
    priority,
    assignedToName,
    assignedToEmail,
    assignedBy,
    customerName
  } = assignData;

  const fonts = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">`;

  const getPriorityStyles = (p) => {
    const styles = {
      'low':    { bg: '#f0fdf4', border: '#bbf7d0', accent: '#059669', text: '#065f46', label: 'Low Priority' },
      'medium': { bg: '#fefce8', border: '#fde68a', accent: '#d97706', text: '#92400e', label: 'Medium Priority' },
      'high':   { bg: '#fff7ed', border: '#fed7aa', accent: '#ea580c', text: '#c2410c', label: 'High Priority' },
      'urgent': { bg: '#fef2f2', border: '#fecaca', accent: '#dc2626', text: '#991b1b', label: 'Urgent Priority' }
    };
    return styles[p] || styles['medium'];
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      'general':   'General Inquiry',
      'order':     'Order Related',
      'payment':   'Payment Issue',
      'shipping':  'Shipping & Delivery',
      'product':   'Product Question',
      'technical': 'Technical Support',
      'account':   'Account Related',
      'other':     'Other'
    };
    return labels[cat] || cat;
  };

  const p = getPriorityStyles(priority);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket Assigned – ${ticketId}</title>
  ${fonts}
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f5f5f5; padding: 28px 16px; -webkit-font-smoothing: antialiased; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }

    /* Header */
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
    .sdot { width: 6px; height: 6px; border-radius: 50%; }

    /* Body */
    .body { padding: 36px 40px; background: #fff; }
    .greeting { font-size: 15px; color: #1f2937; margin-bottom: 10px; }
    .greeting strong { font-weight: 600; color: #1e3a5f; }
    .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 26px; }

    /* Priority hero */
    .priority-hero { border-radius: 4px; padding: 20px; text-align: center; margin-bottom: 26px; }
    .priority-label { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; margin-bottom: 10px; }
    .priority-value { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; line-height: 1; margin-bottom: 6px; }
    .priority-tag { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 4px 12px; border-radius: 2px; }

    /* Sections */
    .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #3b82f6; margin-bottom: 10px; }
    .sec { margin-bottom: 24px; }
    .dtable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
    .dtable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
    .dtable tr:last-child td { border-bottom: none; }
    .dtable .lbl { color: #9ca3af; width: 140px; }
    .dtable .val { color: #1f2937; font-weight: 500; text-align: right; }

    /* Action box */
    .action-box { background: #fefce8; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 4px; padding: 14px 16px; margin-bottom: 24px; }
    .action-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #92400e; margin-bottom: 8px; }
    .action-box p { font-size: 13px; color: #78350f; line-height: 1.65; }

    /* Steps */
    .steps-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
    .steps-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #1d4ed8; margin-bottom: 12px; }
    .step { display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; border-bottom: 1px solid #dbeafe; }
    .step:last-child { border-bottom: none; }
    .snum { width: 20px; height: 20px; min-width: 20px; background: #dbeafe; border: 1px solid #bfdbfe; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #1e40af; }
    .stxt { font-size: 12px; color: #374151; line-height: 1.55; }

    /* CTA */
    .divider { height: 1px; background: #e5e7eb; margin: 22px 0; }
    .cta-block { text-align: center; margin-bottom: 20px; }
    .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
    .cta { display: inline-block; background: #1e3a5f; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
    .help { text-align: center; font-size: 12px; color: #9ca3af; padding-top: 16px; border-top: 1px solid #f3f4f6; }
    .help a { color: #3b82f6; text-decoration: none; font-weight: 500; }

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
        <div class="badge">Support Ticket</div>
      </div>
      <div class="header-title">Ticket<br>Assigned</div>
      <div class="header-sub">Action Required &nbsp;·&nbsp; ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="pills">
        <div class="refpill"><span class="rl">Ticket</span><span class="ri">${ticketId}</span></div>
        <div class="spill"><span class="sdot" style="background:${p.accent};"></span>${p.label}</div>
      </div>
    </div>

    <div class="body">

      <p class="greeting">Hi <strong>${assignedToName}</strong>,</p>
      <p class="lead">
        <strong style="color:#1f2937;">${assignedBy}</strong> has assigned a support ticket to you. Please review the details below and respond to the customer within the expected timeframe based on priority level.
      </p>

      <div class="priority-hero" style="background:${p.bg};border:1px solid ${p.border};border-left:4px solid ${p.accent};">
        <div class="priority-label" style="color:${p.accent};">Priority Level</div>
        <div class="priority-value" style="color:${p.text};">${p.label}</div>
        <div style="font-size:11px;color:#6b7280;margin-bottom:12px;">Respond promptly based on priority SLA</div>
        <span class="priority-tag" style="background:${p.border};color:${p.text};">${getCategoryLabel(category)}</span>
      </div>

      <div class="sec">
        <div class="slabel">Ticket Details</div>
        <table class="dtable">
          <tr><td class="lbl">Ticket ID</td><td class="val" style="color:#1e3a5f;font-weight:700;">${ticketId}</td></tr>
          <tr><td class="lbl">Subject</td><td class="val">${subject}</td></tr>
          <tr><td class="lbl">Category</td><td class="val">${getCategoryLabel(category)}</td></tr>
          <tr><td class="lbl">Priority</td><td class="val"><span style="display:inline-block;padding:3px 10px;background:${p.bg};border:1px solid ${p.border};color:${p.text};border-radius:2px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">${p.label}</span></td></tr>
          <tr><td class="lbl">Customer</td><td class="val">${customerName || 'N/A'}</td></tr>
          <tr><td class="lbl">Assigned By</td><td class="val">${assignedBy}</td></tr>
          <tr><td class="lbl">Assigned To</td><td class="val">${assignedToName}</td></tr>
        </table>
      </div>

      <div class="action-box">
        <h4>Action Required</h4>
        <p>Please review this ticket and respond to the customer within the expected timeframe. Urgent tickets require a response within <strong>1 hour</strong>, High within <strong>4 hours</strong>, and Medium/Low within <strong>24 hours</strong>.</p>
      </div>

      <div class="steps-box">
        <h4>How to Handle This Ticket</h4>
        <div class="step"><div class="snum">01</div><div class="stxt">Open the ticket in your admin dashboard and review the full customer message and history.</div></div>
        <div class="step"><div class="snum">02</div><div class="stxt">Respond to the customer promptly with a clear, professional, and helpful reply.</div></div>
        <div class="step"><div class="snum">03</div><div class="stxt">Update the ticket status and add any internal notes for your team as needed.</div></div>
        <div class="step"><div class="snum">04</div><div class="stxt">Escalate to a senior agent if the issue cannot be resolved within your scope.</div></div>
      </div>

      <div class="divider"></div>

      <div class="cta-block">
        <p>Open your dashboard to view and respond to this ticket.</p>
        <a href="https://nexarionimpex.com/nexarion/admin/login" class="cta">View Assigned Ticket</a>
      </div>

      <div class="help">
        Questions? Contact <a href="mailto:support@nexarionimpex.com">support@nexarionimpex.com</a>
      </div>

    </div>

    <div class="footer">
      <div class="fbrand">Nexarion Global Exports<span>.</span></div>
      <div class="fmeta">
        Sent to ${assignedToEmail || assignedToName}<br>
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