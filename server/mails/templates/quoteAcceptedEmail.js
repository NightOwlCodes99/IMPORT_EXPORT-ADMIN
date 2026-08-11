const quoteAcceptedEmail = ({ 
  supplierName, 
  quoteId, 
  productName, 
  quantity, 
  unit,
  quotedPrice,
  buyerName,
  buyerCompany,
  buyerEmail,
  buyerPhone,
  deliveryLocation,
  acceptedAt 
}) => {
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Accepted – ${quoteId}</title>
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
    .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #059669; margin-bottom: 10px; }
    .sec { margin-bottom: 24px; }
    .dtable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
    .dtable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
    .dtable tr:last-child td { border-bottom: none; }
    .dtable .lbl { color: #9ca3af; width: 150px; }
    .dtable .val { color: #1f2937; font-weight: 500; text-align: right; }
    .dtable .val.qid { color: #047857; font-weight: 700; }
    .dtable .val.price { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: #047857; font-weight: 700; }
    .buyer-table { width: 100%; border-collapse: collapse; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; overflow: hidden; }
    .buyer-table td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #dbeafe; }
    .buyer-table tr:last-child td { border-bottom: none; }
    .buyer-table .lbl { color: #93c5fd; width: 130px; }
    .buyer-table .val { color: #1e3a8a; font-weight: 500; text-align: right; }
    .buyer-table .val a { color: #2563eb; text-decoration: none; font-weight: 500; }
    .steps-box { background: #fefce8; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
    .steps-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #92400e; margin-bottom: 12px; }
    .step { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #fde68a; }
    .step:last-child { border-bottom: none; }
    .snum { width: 20px; height: 20px; min-width: 20px; background: #fef9c3; border: 1px solid #fde68a; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #92400e; }
    .stxt { font-size: 12px; color: #78350f; line-height: 1.55; }
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
        <div class="badge">Quote Update</div>
      </div>
      <div class="header-title">Quote<br>Accepted</div>
      <div class="header-sub">Accepted &nbsp;·&nbsp; ${formatDate(acceptedAt)}</div>
      <div class="pills">
        <div class="refpill"><span class="rl">Quote</span><span class="ri">${quoteId}</span></div>
        <div class="spill"><span class="sdot"></span>Accepted</div>
      </div>
    </div>

    <div class="body">

      <p class="greeting">Dear <strong>${supplierName}</strong>,</p>
      <p class="lead">
        Your quote has been accepted by the buyer. This constitutes a confirmed intent to proceed with the order.
        Please review the details below and contact the buyer to finalise the arrangement.
      </p>

      <div class="sec">
        <div class="slabel">Accepted Quote Details</div>
        <table class="dtable">
          <tr><td class="lbl">Quote ID</td><td class="val qid">${quoteId}</td></tr>
          <tr><td class="lbl">Product</td><td class="val">${productName}</td></tr>
          <tr><td class="lbl">Quantity</td><td class="val">${quantity?.toLocaleString()} ${unit}</td></tr>
          <tr><td class="lbl">Quoted Price</td><td class="val price">$${quotedPrice?.toFixed(2)} / ${unit}</td></tr>
          <tr><td class="lbl">Delivery Location</td><td class="val">${deliveryLocation}</td></tr>
          <tr><td class="lbl">Accepted On</td><td class="val">${formatDate(acceptedAt)}</td></tr>
        </table>
      </div>

      <div class="sec">
        <div class="slabel">Buyer Contact Information</div>
        <table class="buyer-table">
          <tr><td class="lbl">Name</td><td class="val">${buyerName}</td></tr>
          ${buyerCompany ? `<tr><td class="lbl">Company</td><td class="val">${buyerCompany}</td></tr>` : ''}
          <tr><td class="lbl">Email</td><td class="val"><a href="mailto:${buyerEmail}">${buyerEmail}</a></td></tr>
          <tr><td class="lbl">Phone</td><td class="val">${buyerPhone}</td></tr>
        </table>
      </div>

      <div class="steps-box">
        <h4>Next Steps</h4>
        <div class="step"><div class="snum">01</div><div class="stxt">Contact the buyer to confirm order details and quantities.</div></div>
        <div class="step"><div class="snum">02</div><div class="stxt">Finalise payment terms and shipping arrangements.</div></div>
        <div class="step"><div class="snum">03</div><div class="stxt">Prepare and share the invoice with the buyer.</div></div>
        <div class="step"><div class="snum">04</div><div class="stxt">Begin order processing once payment is confirmed.</div></div>
      </div>

      <div class="divider"></div>

      <div class="cta-block">
        <p>Review and manage this quote from your dashboard.</p>
        <a href="https://nexarionimpex.com/dashboard" class="cta">View Quote Details</a>
      </div>

      <div class="help">
        Questions? Contact us at <a href="mailto:support@nexarionimpex.com">support@nexarionimpex.com</a>
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

module.exports = quoteAcceptedEmail;