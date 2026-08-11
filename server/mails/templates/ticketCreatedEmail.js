/**
 * Ticket Created Email Template
 * Sent when a new support ticket is created
 */

exports.ticketCreatedTemplate = (ticketData) => {
  const {
    ticketId,
    subject,
    category,
    priority,
    department,
    customerName,
    customerEmail,
    message,
    createdAt,
    isAdminNotification = false
  } = ticketData;

  const fonts = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">`;

  const formatDate = (date) => {
    return new Date(date || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
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

  const getPriorityStyles = (p) => {
    const styles = {
      'low':    { bg: '#f0fdf4', border: '#bbf7d0', accent: '#059669', text: '#065f46', label: 'Low Priority' },
      'medium': { bg: '#fefce8', border: '#fde68a', accent: '#d97706', text: '#92400e', label: 'Medium Priority' },
      'high':   { bg: '#fff7ed', border: '#fed7aa', accent: '#ea580c', text: '#c2410c', label: 'High Priority' },
      'urgent': { bg: '#fef2f2', border: '#fecaca', accent: '#dc2626', text: '#991b1b', label: 'Urgent Priority' }
    };
    return styles[p] || styles['medium'];
  };

  const getDepartmentLabel = (dept) => {
    const labels = {
      'support':    'Customer Support',
      'sales':      'Sales Team',
      'billing':    'Billing Department',
      'technical':  'Technical Team',
      'shipping':   'Shipping Department',
      'management': 'Management',
      'other':      'General'
    };
    return labels[dept] || dept;
  };

  const p = getPriorityStyles(priority);

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
    .greeting strong { font-weight: 600; }
    .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 26px; }
    .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #3b82f6; margin-bottom: 10px; }
    .sec { margin-bottom: 24px; }
    .dtable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
    .dtable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
    .dtable tr:last-child td { border-bottom: none; }
    .dtable .lbl { color: #9ca3af; width: 150px; }
    .dtable .val { color: #1f2937; font-weight: 500; text-align: right; }
    .dtable .val a { color: #3b82f6; text-decoration: none; }
    .priority-hero { border-radius: 4px; padding: 20px; text-align: center; margin-bottom: 26px; }
    .priority-label-txt { font-size: 9px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; margin-bottom: 10px; }
    .priority-value { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; line-height: 1; margin-bottom: 6px; }
    .priority-sub { font-size: 11px; color: #6b7280; margin-bottom: 12px; }
    .priority-tag { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 4px 12px; border-radius: 2px; }
    .subject-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
    .subject-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #1d4ed8; margin-bottom: 8px; }
    .subject-box p { font-size: 14px; font-weight: 600; color: #1e3a5f; line-height: 1.5; }
    .message-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
    .message-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #6b7280; margin-bottom: 10px; }
    .message-box p { font-size: 13px; color: #374151; line-height: 1.7; white-space: pre-wrap; }
    .steps-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
    .steps-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #1d4ed8; margin-bottom: 12px; }
    .step { display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; border-bottom: 1px solid #dbeafe; }
    .step:last-child { border-bottom: none; }
    .snum { width: 20px; height: 20px; min-width: 20px; background: #dbeafe; border: 1px solid #bfdbfe; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #1e40af; }
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
  // ADMIN NOTIFICATION
  // ─────────────────────────────────────────
  if (isAdminNotification) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Support Ticket – ${ticketId}</title>
  ${fonts}
  <style>${baseCSS}</style>
</head>
<body>
  <div class="wrapper">

    <div class="header" style="background:#92400e;">
      <div class="header-top">
        <div class="brand">Nexarion Global Exports<span style="color:#fcd34d;">.</span></div>
        <div class="badge" style="color:#fcd34d;border:1px solid rgba(252,211,77,.5);">Admin Alert</div>
      </div>
      <div class="header-title">New Support<br>Ticket</div>
      <div class="header-sub">Requires Attention &nbsp;·&nbsp; ${formatDate(createdAt)}</div>
      <div class="pills">
        <div class="refpill"><span class="rl">Ticket</span><span class="ri">${ticketId}</span></div>
        <div class="spill"><span class="sdot" style="background:${p.accent};"></span>${p.label}</div>
      </div>
    </div>

    <div class="body">

      <p class="greeting">A new support ticket has been submitted and requires your attention.</p>
      <p class="lead">Please review the ticket details below, assign it to the appropriate team member, and ensure the customer receives a timely response based on the priority level.</p>

      <div class="priority-hero" style="background:${p.bg};border:1px solid ${p.border};border-left:4px solid ${p.accent};">
        <div class="priority-label-txt" style="color:${p.accent};">Priority Level</div>
        <div class="priority-value" style="color:${p.text};">${p.label}</div>
        <div class="priority-sub">Assign and respond promptly</div>
        <span class="priority-tag" style="background:${p.border};color:${p.text};">${getCategoryLabel(category)}</span>
      </div>

      <div class="sec">
        <div class="slabel">Ticket Details</div>
        <table class="dtable">
          <tr><td class="lbl">Ticket ID</td><td class="val" style="color:#1e3a5f;font-weight:700;">${ticketId}</td></tr>
          <tr><td class="lbl">Customer</td><td class="val">${customerName}</td></tr>
          <tr><td class="lbl">Email</td><td class="val"><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
          <tr><td class="lbl">Category</td><td class="val">${getCategoryLabel(category)}</td></tr>
          <tr><td class="lbl">Department</td><td class="val">${getDepartmentLabel(department)}</td></tr>
          <tr><td class="lbl">Priority</td><td class="val"><span style="display:inline-block;padding:3px 10px;background:${p.bg};border:1px solid ${p.border};color:${p.text};border-radius:2px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">${p.label}</span></td></tr>
          <tr><td class="lbl">Submitted</td><td class="val">${formatDate(createdAt)}</td></tr>
        </table>
      </div>

      <div class="subject-box">
        <h4>Subject</h4>
        <p>${subject}</p>
      </div>

      <div class="message-box">
        <h4>Customer Message</h4>
        <p>${message}</p>
      </div>

      <div class="steps-box">
        <h4>Recommended Actions</h4>
        <div class="step"><div class="snum">01</div><div class="stxt">Review the ticket details and customer message above.</div></div>
        <div class="step"><div class="snum">02</div><div class="stxt">Assign the ticket to the appropriate support agent or department.</div></div>
        <div class="step"><div class="snum">03</div><div class="stxt">Ensure a response is sent to the customer within the SLA for this priority level.</div></div>
        <div class="step"><div class="snum">04</div><div class="stxt">Monitor the ticket status and escalate if needed.</div></div>
      </div>

      <div class="divider"></div>

      <div class="cta-block">
        <p>Open the admin panel to view, assign, and manage this ticket.</p>
        <a href="https://nexarionimpex.com/nexarion/admin/login" class="cta" style="background:#92400e;">View Ticket Details</a>
      </div>

      <div class="help">
        Questions? <a href="mailto:support@nexarionimpex.com">support@nexarionimpex.com</a>
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
  }

  // ─────────────────────────────────────────
  // CUSTOMER CONFIRMATION
  // ─────────────────────────────────────────
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket Received – ${ticketId}</title>
  ${fonts}
  <style>${baseCSS}</style>
</head>
<body>
  <div class="wrapper">

    <div class="header" style="background:#1e3a5f;">
      <div class="header-top">
        <div class="brand">Nexarion Global Exports<span style="color:#93c5fd;">.</span></div>
        <div class="badge" style="color:#93c5fd;border:1px solid rgba(147,197,253,.5);">Support</div>
      </div>
      <div class="header-title">Ticket<br>Received</div>
      <div class="header-sub">We'll Be in Touch &nbsp;·&nbsp; ${formatDate(createdAt)}</div>
      <div class="pills">
        <div class="refpill"><span class="rl">Ticket</span><span class="ri">${ticketId}</span></div>
        <div class="spill"><span class="sdot" style="background:#93c5fd;"></span>Under Review</div>
      </div>
    </div>

    <div class="body">

      <p class="greeting">Dear <strong style="color:#1e3a5f;">${customerName}</strong>,</p>
      <p class="lead">
        Thank you for reaching out. Your support ticket has been successfully submitted and our team has been notified. We will review your request and respond as soon as possible.
      </p>

      <div class="sec">
        <div class="slabel">Your Ticket Details</div>
        <table class="dtable">
          <tr><td class="lbl">Ticket ID</td><td class="val" style="color:#1e3a5f;font-weight:700;">${ticketId}</td></tr>
          <tr><td class="lbl">Category</td><td class="val">${getCategoryLabel(category)}</td></tr>
          <tr><td class="lbl">Department</td><td class="val">${getDepartmentLabel(department)}</td></tr>
          <tr><td class="lbl">Priority</td><td class="val"><span style="display:inline-block;padding:3px 10px;background:${p.bg};border:1px solid ${p.border};color:${p.text};border-radius:2px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">${p.label}</span></td></tr>
          <tr><td class="lbl">Submitted</td><td class="val">${formatDate(createdAt)}</td></tr>
        </table>
      </div>

      <div class="subject-box">
        <h4>Your Subject</h4>
        <p>${subject}</p>
      </div>

      <div class="message-box">
        <h4>Your Message</h4>
        <p>${message}</p>
      </div>

      <div class="steps-box">
        <h4>What Happens Next</h4>
        <div class="step"><div class="snum">01</div><div class="stxt">Our support team has been notified and will review your ticket shortly.</div></div>
        <div class="step"><div class="snum">02</div><div class="stxt">You will receive an email response from our team with next steps or a resolution.</div></div>
        <div class="step"><div class="snum">03</div><div class="stxt">You can track the status of your ticket from your account dashboard at any time.</div></div>
        <div class="step"><div class="snum">04</div><div class="stxt">If urgent, please reply to this email quoting your Ticket ID: <strong>${ticketId}</strong>.</div></div>
      </div>

      <div class="divider"></div>

      <div class="cta-block">
        <p>Track the status of your ticket from your account dashboard.</p>
        <a href="https://nexarionimpex.com/dashboard" class="cta" style="background:#1e3a5f;">View My Tickets</a>
      </div>

      <div class="help">
        Need urgent help? Email us at <a href="mailto:support@nexarionimpex.com">support@nexarionimpex.com</a> quoting <strong>${ticketId}</strong>
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