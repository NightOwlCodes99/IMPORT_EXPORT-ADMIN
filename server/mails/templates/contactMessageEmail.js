/**
 * Contact Message Email Templates
 * Sent when a new contact form is submitted
 */

const formatDate = (date) => {
  return new Date(date || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getTypeBadge = (t) => {
  const map = {
    'general':     { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', label: 'General Inquiry' },
    'quote':       { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', label: 'Quote Request' },
    'support':     { bg: '#fefce8', border: '#fde68a', text: '#92400e', label: 'Support' },
    'partnership': { bg: '#f5f3ff', border: '#ddd6fe', text: '#3730a3', label: 'Partnership' },
    'complaint':   { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', label: 'Complaint' },
  };
  const c = map[t] || map['general'];
  return `<span style="display:inline-block;padding:3px 12px;background:${c.bg};border:1px solid ${c.border};color:${c.text};border-radius:2px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${c.label}</span>`;
};

const sharedStyles = `
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', -apple-system, sans-serif; background: #f5f5f5; padding: 28px 16px; -webkit-font-smoothing: antialiased; }
  .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
  .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .brand { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #fff; letter-spacing: .02em; }
  .header-title { font-family: 'Playfair Display', Georgia, serif; font-size: 30px; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 8px; }
  .header-sub { font-size: 11px; font-weight: 300; color: rgba(255,255,255,.6); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 20px; }
  .badge { font-size: 9px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; padding: 4px 10px; border-radius: 2px; }
  .refpill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); padding: 7px 14px; border-radius: 2px; }
  .rl { font-size: 9px; color: rgba(255,255,255,.6); letter-spacing: .1em; text-transform: uppercase; }
  .ri { font-size: 13px; font-weight: 700; color: #fff; }
  .spill { display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); color: #fff; font-size: 10px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; padding: 7px 13px 7px 9px; border-radius: 2px; }
  .sdot { width: 6px; height: 6px; border-radius: 50%; }
  .body { padding: 36px 40px; background: #fff; }
  .greeting { font-size: 15px; color: #1f2937; margin-bottom: 10px; }
  .greeting strong { font-weight: 600; }
  .lead { font-size: 13px; color: #4b5563; line-height: 1.75; margin-bottom: 24px; }
  .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; margin-bottom: 9px; }
  .sec { margin-bottom: 22px; }
  .itable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
  .itable td { padding: 9px 14px; font-size: 12px; border-bottom: 1px solid #f3f4f6; }
  .itable tr:last-child td { border-bottom: none; }
  .itable .lbl { color: #9ca3af; width: 100px; }
  .itable .val { color: #1f2937; font-weight: 500; }
  .itable .val a { text-decoration: none; }
  .subject-box { background: #f9fafb; border: 1px solid #e5e7eb; border-left: 3px solid; border-radius: 4px; padding: 14px 16px; margin-bottom: 22px; }
  .subject-box h4 { font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 6px; }
  .subject-box p { font-size: 14px; font-weight: 600; color: #1f2937; }
  .msg-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 16px 18px; margin-bottom: 22px; }
  .msg-box h4 { font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 8px; }
  .msg-box p { font-size: 13px; color: #374151; line-height: 1.7; white-space: pre-wrap; }
  .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
  .cta-block { text-align: center; margin-bottom: 18px; }
  .cta-block p { font-size: 11px; color: #6b7280; margin-bottom: 11px; }
  .cta { display: inline-block; color: #fff !important; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
  .help { text-align: center; font-size: 12px; color: #9ca3af; padding-top: 16px; border-top: 1px solid #f3f4f6; }
  .help a { text-decoration: none; font-weight: 500; }
  .footer { background: #1f2937; padding: 24px 40px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .fbrand { font-family: 'Playfair Display', Georgia, serif; font-size: 14px; color: #fff; }
  .fmeta { font-size: 10px; color: #6b7280; text-align: right; line-height: 1.7; }
  .fmeta a { color: #10b981; text-decoration: none; margin-left: 8px; }
  @media only screen and (max-width: 600px) {
    body { padding: 16px 8px; }
    .header { padding: 28px 20px 24px !important; }
    .header-top { flex-direction: column; align-items: flex-start; gap: 10px; }
    .header-title { font-size: 24px; }
    .body { padding: 26px 20px; }
    .cta { display: block; width: 100%; text-align: center; }
    .footer { flex-direction: column; align-items: flex-start; padding: 20px; }
    .fmeta { text-align: left; }
    .fmeta a { margin-left: 0; margin-right: 8px; }
  }
`;

// ── ADMIN NOTIFICATION ──────────────────────────────────────────────────────

exports.contactMessageAdminNotificationTemplate = (contactData) => {
  const { name, email, phone, company, subject, message, type = 'general', createdAt } = contactData;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Message – Nexarion Global Exports</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>${sharedStyles}
        .brand span { color: #a5b4fc; }
        .badge-wrap { color: #a5b4fc; border: 1px solid rgba(165,180,252,.5); }
        .slabel { color: #6366f1; }
        .itable .val a { color: #6366f1; }
        .subject-box { border-left-color: #6366f1; }
        .subject-box h4 { color: #4338ca; }
        .msg-box h4 { color: #6b7280; }
        .cta { background: #4f46e5; }
        .help a { color: #6366f1; }
      </style>
    </head>
    <body>
      <div class="wrapper">

        <div class="header" style="background:#312e81;padding:40px 40px 32px;">
          <div class="header-top">
            <div class="brand">Nexarion Global Exports<span>.</span></div>
            <div class="badge" style="color:#a5b4fc;border:1px solid rgba(165,180,252,.5);">Admin Alert</div>
          </div>
          <div class="header-title">New Contact<br>Message</div>
          <div class="header-sub">Received &nbsp;·&nbsp; ${formatDate(createdAt)}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <div class="refpill"><span class="rl">Type</span><span class="ri">${getTypeBadge(type)}</span></div>
          </div>
        </div>

        <div class="body">

          <div class="sec">
            <div class="slabel">Sender Information</div>
            <table class="itable">
              <tr><td class="lbl">Name</td><td class="val">${name}</td></tr>
              <tr><td class="lbl">Email</td><td class="val"><a href="mailto:${email}" style="color:#6366f1;">${email}</a></td></tr>
              ${phone ? `<tr><td class="lbl">Phone</td><td class="val"><a href="tel:${phone}" style="color:#6366f1;">${phone}</a></td></tr>` : ''}
              ${company ? `<tr><td class="lbl">Company</td><td class="val">${company}</td></tr>` : ''}
              <tr><td class="lbl">Received</td><td class="val">${formatDate(createdAt)}</td></tr>
            </table>
          </div>

          <div class="sec">
            <div class="slabel" style="color:#6366f1;">Subject</div>
            <div class="subject-box" style="border-left-color:#6366f1;">
              <h4 style="color:#4338ca;">Message Subject</h4>
              <p>${subject}</p>
            </div>
          </div>

          <div class="sec">
            <div class="slabel" style="color:#6366f1;">Message</div>
            <div class="msg-box">
              <h4 style="color:#6b7280;">Full Message</h4>
              <p>${message}</p>
            </div>
          </div>

          <div class="divider"></div>

          <div class="cta-block">
            <p>Review and respond to this message from the admin panel.</p>
            <a href="https://nexarionimpex.com/nexarion/admin/login" class="cta" style="background:#4f46e5;">View in Admin Panel</a>
          </div>

          <div class="help">
            Reply directly to this email to respond to the sender, or manage it from the admin panel.
          </div>

        </div>

        <div class="footer">
          <div class="fbrand">Nexarion Global Exports<span style="color:#10b981;">.</span></div>
          <div class="fmeta">Automated admin notification<br><a href="https://nexarionimpex.com">Admin Panel</a><a href="https://nexarionimpex.com">Help Center</a></div>
        </div>

      </div>
    </body>
    </html>
  `;
};

// ── CUSTOMER CONFIRMATION ───────────────────────────────────────────────────

exports.contactMessageConfirmationTemplate = (contactData) => {
  const { name, subject } = contactData;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Message Received – Nexarion Global Exports</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>${sharedStyles}</style>
    </head>
    <body>
      <div class="wrapper">

        <div class="header" style="background:#047857;padding:40px 40px 32px;">
          <div class="header-top">
            <div class="brand" style="font-family:'Playfair Display',Georgia,serif;font-size:18px;color:#fff;">Nexarion Global Exports<span style="color:#6ee7b7;">.</span></div>
            <div class="badge" style="color:#6ee7b7;border:1px solid rgba(110,231,183,.5);">Message Received</div>
          </div>
          <div class="header-title">We've Got<br>Your Message</div>
          <div class="header-sub">Confirmation &nbsp;·&nbsp; ${formatDate(null)}</div>
          <div style="display:flex;gap:8px;">
            <div class="spill"><span class="sdot" style="background:#6ee7b7;"></span>Under Review</div>
          </div>
        </div>

        <div class="body">
          <p class="greeting">Dear <strong style="color:#065f46;">${name}</strong>,</p>
          <p class="lead">
            Thank you for reaching out to Nexarion Global Exports. We have received your message regarding
            <strong style="color:#1f2937;">"${subject}"</strong> and our team is currently reviewing it.
          </p>

          <div class="sec">
            <div class="slabel" style="color:#059669;">Response Time</div>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:3px solid #059669;border-radius:4px;padding:14px 16px;">
              <p style="font-size:13px;color:#047857;line-height:1.65;">
                We typically respond within <strong>2–4 business hours</strong> during working hours
                (Monday – Friday, 9AM – 6PM GST).
              </p>
            </div>
          </div>

          <div class="sec">
            <div class="slabel" style="color:#059669;">In the Meantime</div>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;overflow:hidden;">
              <div style="display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-bottom:1px solid #f3f4f6;">
                <div style="width:20px;height:20px;min-width:20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#047857;">01</div>
                <div style="font-size:12px;color:#4b5563;">Browse our <a href="https://nexarionimpex.com/dashboard" style="color:#059669;font-weight:500;text-decoration:none;">product catalog</a> for eco-friendly disposable tableware.</div>
              </div>
              <div style="display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-bottom:1px solid #f3f4f6;">
                <div style="width:20px;height:20px;min-width:20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#047857;">02</div>
                <div style="font-size:12px;color:#4b5563;">Check our <a href="https://nexarionimpex.com/dashboard" style="color:#059669;font-weight:500;text-decoration:none;">frequently asked questions</a> for quick answers.</div>
              </div>
              <div style="display:flex;gap:10px;align-items:flex-start;padding:12px 14px;">
                <div style="width:20px;height:20px;min-width:20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#047857;">03</div>
                <div style="font-size:12px;color:#4b5563;">Submit a <a href="https://nexarionimpex.com/dashboard" style="color:#059669;font-weight:500;text-decoration:none;">product quote request</a> directly from your dashboard.</div>
              </div>
            </div>
          </div>

          <div style="background:#fefce8;border:1px solid #fde68a;border-left:3px solid #d97706;border-radius:4px;padding:13px 15px;margin-bottom:22px;">
            <p style="font-size:12px;color:#92400e;line-height:1.6;">For urgent matters, contact us directly at <strong>support@nexarionimpex.com</strong></p>
          </div>

          <p style="font-size:13px;color:#4b5563;line-height:1.7;">
            Best regards,<br>
            <strong style="color:#1f2937;">The Nexarion Global Exports Team</strong>
          </p>

        </div>

        <div class="footer">
          <div class="fbrand">Nexarion Global Exports<span style="color:#10b981;">.</span></div>
          <div class="fmeta">Your Trusted B2B Trade Partner<br><a href="https://nexarionimpex.com">Privacy Policy</a><a href="https://nexarionimpex.com">Terms of Service</a></div>
        </div>

      </div>
    </body>
    </html>
  `;
};

// ── ADMIN RESPONSE TO CUSTOMER ──────────────────────────────────────────────

exports.contactMessageResponseTemplate = (responseData) => {
  const {
    customerName,
    originalSubject,
    originalMessage,
    responseMessage,
    responderName = 'Customer Support Team',
    attachments = []
  } = responseData;

  const attachmentsHtml = attachments.length > 0 ? `
    <div class="sec">
      <div class="slabel" style="color:#059669;">Attached Documents</div>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:14px 16px;">
        ${attachments.map(att => `
          <a href="${att.url}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:#fff;padding:8px 12px;border-radius:3px;margin:4px 4px 4px 0;text-decoration:none;border:1px solid #d1fae5;color:#374151;font-size:12px;">
            <span style="color:#059669;font-size:12px;">PDF</span>
            <span>${att.name}</span>
            <span style="color:#9ca3af;font-size:11px;">${(att.size / 1024).toFixed(1)} KB</span>
          </a>
        `).join('')}
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Response to Your Inquiry – Nexarion Global Exports</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>${sharedStyles}</style>
    </head>
    <body>
      <div class="wrapper">

        <div class="header" style="background:#312e81;padding:40px 40px 32px;">
          <div class="header-top">
            <div class="brand" style="font-family:'Playfair Display',Georgia,serif;font-size:18px;color:#fff;">Nexarion Global Exports<span style="color:#a5b4fc;">.</span></div>
            <div class="badge" style="color:#a5b4fc;border:1px solid rgba(165,180,252,.5);">Inquiry Response</div>
          </div>
          <div class="header-title">Response to<br>Your Inquiry</div>
          <div class="header-sub">From Our Team &nbsp;·&nbsp; ${formatDate(null)}</div>
          <div class="spill"><span class="sdot" style="background:#a5b4fc;"></span>Responded</div>
        </div>

        <div class="body">
          <p class="greeting">Dear <strong style="color:#3730a3;">${customerName}</strong>,</p>
          <p class="lead">
            Thank you for contacting Nexarion Global Exports. We have reviewed your inquiry and prepared the following response.
          </p>

          <div class="sec">
            <div class="slabel" style="color:#6366f1;">Your Original Message</div>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-left:3px solid #9ca3af;border-radius:4px;padding:14px 16px;">
              <p style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;margin-bottom:6px;">${originalSubject}</p>
              <p style="font-size:12px;color:#6b7280;line-height:1.65;">${originalMessage?.substring(0, 300)}${originalMessage?.length > 300 ? '...' : ''}</p>
            </div>
          </div>

          <div class="sec">
            <div class="slabel" style="color:#6366f1;">Our Response</div>
            <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-left:3px solid #6366f1;border-radius:4px;padding:16px 18px;">
              <p style="font-size:13px;color:#374151;line-height:1.75;white-space:pre-wrap;">${responseMessage}</p>
            </div>
          </div>

          ${attachmentsHtml}

          <div style="background:#fefce8;border:1px solid #fde68a;border-left:3px solid #d97706;border-radius:4px;padding:13px 15px;margin-bottom:22px;">
            <p style="font-size:12px;color:#92400e;line-height:1.6;">Need further assistance? Reply to this email or contact us at <strong>support@nexarionimpex.com</strong></p>
          </div>

          <p style="font-size:13px;color:#4b5563;line-height:1.7;">
            Best regards,<br>
            <strong style="color:#1f2937;">${responderName}</strong><br>
            <span style="font-size:12px;color:#9ca3af;">Nexarion Global Exports</span>
          </p>

        </div>

        <div class="footer">
          <div class="fbrand">Nexarion Global Exports<span style="color:#10b981;">.</span></div>
          <div class="fmeta">Your Trusted B2B Trade Partner<br><a href="https://nexarionimpex.com">Privacy Policy</a><a href="https://nexarionimpex.com">Terms of Service</a><a href="https://nexarionimpex.com">Help Center</a></div>
        </div>

      </div>
    </body>
    </html>
  `;
};