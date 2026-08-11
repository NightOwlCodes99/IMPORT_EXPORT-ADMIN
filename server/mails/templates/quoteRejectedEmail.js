const quoteRejectedEmail = ({ 
  supplierName, 
  quoteId, 
  productName, 
  quantity, 
  unit,
  quotedPrice,
  buyerName,
  rejectionReason,
  rejectedAt 
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
  <title>Quote Not Accepted – ${quoteId}</title>
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
    .slabel { font-size: 9px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: #dc2626; margin-bottom: 10px; }
    .sec { margin-bottom: 24px; }
    .dtable { width: 100%; border-collapse: collapse; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
    .dtable td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
    .dtable tr:last-child td { border-bottom: none; }
    .dtable .lbl { color: #9ca3af; width: 150px; }
    .dtable .val { color: #1f2937; font-weight: 500; text-align: right; }
    .dtable .val.qid { color: #991b1b; font-weight: 700; }
    .feedback-box { background: #fff7ed; border: 1px solid #fed7aa; border-left: 4px solid #d97706; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
    .feedback-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #92400e; margin-bottom: 8px; }
    .feedback-box p { font-size: 13px; color: #78350f; line-height: 1.65; font-style: italic; }
    .tips-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #059669; border-radius: 4px; padding: 16px 18px; margin-bottom: 24px; }
    .tips-box h4 { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #065f46; margin-bottom: 12px; }
    .tip { display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; border-bottom: 1px solid #d1fae5; }
    .tip:last-child { border-bottom: none; }
    .tnum { width: 20px; height: 20px; min-width: 20px; background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #065f46; }
    .ttxt { font-size: 12px; color: #374151; line-height: 1.55; }
    .divider { height: 1px; background: #e5e7eb; margin: 22px 0; }
    .cta-block { text-align: center; margin-bottom: 20px; }
    .cta-block p { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
    .cta { display: inline-block; background: #991b1b; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: .04em; }
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
        <div class="badge">Quote Update</div>
      </div>
      <div class="header-title">Quote Not<br>Accepted</div>
      <div class="header-sub">Decision &nbsp;·&nbsp; ${formatDate(rejectedAt)}</div>
      <div class="pills">
        <div class="refpill"><span class="rl">Quote</span><span class="ri">${quoteId}</span></div>
        <div class="spill"><span class="sdot"></span>Not Accepted</div>
      </div>
    </div>

    <div class="body">

      <p class="greeting">Dear <strong>${supplierName}</strong>,</p>
      <p class="lead">
        We regret to inform you that the buyer has decided not to proceed with your quote at this time.
        While this opportunity did not result in an order, we encourage you to continue engaging with other buyers on the platform.
      </p>

      <div class="sec">
        <div class="slabel">Quote Details</div>
        <table class="dtable">
          <tr><td class="lbl">Quote ID</td><td class="val qid">${quoteId}</td></tr>
          <tr><td class="lbl">Product</td><td class="val">${productName}</td></tr>
          <tr><td class="lbl">Quantity</td><td class="val">${quantity?.toLocaleString()} ${unit}</td></tr>
          <tr><td class="lbl">Quoted Price</td><td class="val">$${quotedPrice?.toFixed(2)} / ${unit}</td></tr>
          <tr><td class="lbl">Buyer</td><td class="val">${buyerName}</td></tr>
          <tr><td class="lbl">Decision Date</td><td class="val">${formatDate(rejectedAt)}</td></tr>
        </table>
      </div>

      ${rejectionReason ? `
      <div class="feedback-box">
        <h4>Buyer's Feedback</h4>
        <p>"${rejectionReason}"</p>
      </div>
      ` : ''}

      <div class="tips-box">
        <h4>Tips for Better Success</h4>
        <div class="tip"><div class="tnum">01</div><div class="ttxt">Research current market rates to ensure your pricing remains competitive.</div></div>
        <div class="tip"><div class="tnum">02</div><div class="ttxt">Respond promptly to quote requests — speed builds buyer confidence.</div></div>
        <div class="tip"><div class="tnum">03</div><div class="ttxt">Provide detailed product specifications and certifications upfront.</div></div>
        <div class="tip"><div class="tnum">04</div><div class="ttxt">Offer flexible payment and shipping terms to accommodate buyer needs.</div></div>
        <div class="tip"><div class="tnum">05</div><div class="ttxt">Maintain clear and professional communication throughout the process.</div></div>
      </div>

      <div class="divider"></div>

      <div class="cta-block">
        <p>Explore and respond to other active quote requests on the platform.</p>
        <a href="https://nexarionimpex.com/dashboard" class="cta">View Other Quote Requests</a>
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

module.exports = quoteRejectedEmail;