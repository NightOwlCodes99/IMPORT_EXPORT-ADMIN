exports.accountDeletedEmailTemplate = (name) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Account Closed – Nexarion Global Exports</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        *, *::before, *::after {
          margin: 0; padding: 0; box-sizing: border-box;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background-color: #f0ede8;
          padding: 32px 16px;
          -webkit-font-smoothing: antialiased;
        }

        .wrapper {
          max-width: 600px;
          margin: 0 auto;
          background: #fafaf8;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #e2ddd7;
          box-shadow: 0 2px 24px rgba(0,0,0,0.07);
        }

        /* ── HEADER ── */
        .header {
          background: #1a1a18;
          padding: 48px 40px 40px;
          position: relative;
          overflow: hidden;
        }

        .header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #b8935a 0%, #d4a96a 50%, #b8935a 100%);
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 36px;
        }

        .brand {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: #fafaf8;
          letter-spacing: 0.02em;
        }

        .brand span {
          color: #b8935a;
        }

        .badge {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #b8935a;
          border: 1px solid #b8935a;
          padding: 4px 10px;
          border-radius: 2px;
        }

        .header-title {
          font-family: 'Playfair Display', serif;
          font-size: 34px;
          font-weight: 700;
          color: #fafaf8;
          line-height: 1.2;
          margin-bottom: 10px;
        }

        .header-sub {
          font-size: 13px;
          font-weight: 300;
          color: #9c9890;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* ── BODY ── */
        .body {
          padding: 44px 40px;
          background: #fafaf8;
        }

        .greeting {
          font-size: 16px;
          color: #2c2c2a;
          margin-bottom: 16px;
          font-weight: 400;
        }

        .greeting strong {
          font-weight: 600;
          color: #1a1a18;
        }

        .lead {
          font-size: 14px;
          color: #6b6b67;
          line-height: 1.75;
          margin-bottom: 32px;
        }

        /* ── NOTICE STRIP ── */
        .notice {
          border-top: 1px solid #e2ddd7;
          border-bottom: 1px solid #e2ddd7;
          padding: 24px 0;
          margin-bottom: 36px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .notice-icon {
          width: 36px;
          height: 36px;
          border: 1px solid #b8935a;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notice-icon svg {
          width: 16px; height: 16px;
          stroke: #b8935a;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .notice-text h4 {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a18;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .notice-text p {
          font-size: 13px;
          color: #6b6b67;
          line-height: 1.65;
        }

        /* ── SECTION LABEL ── */
        .section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #b8935a;
          margin-bottom: 16px;
        }

        /* ── DATA REMOVED TABLE ── */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 36px;
        }

        .data-table tr {
          border-bottom: 1px solid #eeeae4;
        }

        .data-table tr:last-child {
          border-bottom: none;
        }

        .data-table td {
          padding: 14px 0;
          font-size: 13px;
          color: #4a4a46;
          vertical-align: top;
        }

        .data-table td:first-child {
          font-weight: 600;
          color: #1a1a18;
          width: 44%;
          padding-right: 16px;
        }

        .data-table td:last-child {
          color: #6b6b67;
          font-weight: 300;
        }

        /* ── DIVIDER ── */
        .divider {
          height: 1px;
          background: #e2ddd7;
          margin: 36px 0;
        }

        /* ── RETURN BLOCK ── */
        .return-block {
          background: #1a1a18;
          border-radius: 3px;
          padding: 28px 32px;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .return-block-text h4 {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #fafaf8;
          margin-bottom: 6px;
        }

        .return-block-text p {
          font-size: 12px;
          color: #9c9890;
          font-weight: 300;
          line-height: 1.6;
          max-width: 260px;
        }

        .cta {
          display: inline-block;
          background: #b8935a;
          color: #fafaf8;
          text-decoration: none;
          padding: 13px 28px;
          border-radius: 2px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── CONTACT ── */
        .contact {
          font-size: 13px;
          color: #6b6b67;
          line-height: 1.7;
        }

        .contact a {
          color: #b8935a;
          text-decoration: none;
          font-weight: 500;
        }

        /* ── FOOTER ── */
        .footer {
          background: #13130f;
          padding: 28px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-brand {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          color: #fafaf8;
        }

        .footer-brand span { color: #b8935a; }

        .footer-meta {
          font-size: 11px;
          color: #5a5a56;
          text-align: right;
          line-height: 1.6;
        }

        .footer-meta a {
          color: #7a7a74;
          text-decoration: none;
          margin-left: 12px;
        }

        /* ── RESPONSIVE ── */
        @media only screen and (max-width: 600px) {
          body { padding: 16px 8px; }

          .header { padding: 32px 24px 28px; }
          .header-title { font-size: 26px; }
          .header-top { flex-direction: column; align-items: flex-start; gap: 12px; }

          .body { padding: 32px 24px; }

          .return-block {
            flex-direction: column;
            align-items: flex-start;
            padding: 24px 20px;
          }

          .return-block-text p { max-width: 100%; }

          .cta { width: 100%; text-align: center; }

          .footer {
            flex-direction: column;
            align-items: flex-start;
            padding: 24px;
          }

          .footer-meta { text-align: left; }
          .footer-meta a { margin-left: 0; margin-right: 12px; }

          .data-table td:first-child { width: 40%; }
        }

        @media only screen and (max-width: 400px) {
          .notice { flex-direction: column; }
          .data-table td { display: block; width: 100%; padding: 6px 0; }
          .data-table tr { padding: 10px 0; display: block; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">

        <!-- HEADER -->
        <div class="header">
          <div class="header-top">
            <div class="brand">Nexarion Global Exports<span>.</span></div>
            <div class="badge">Account Notice</div>
          </div>
          <div class="header-title">Account<br>Permanently Closed</div>
          <div class="header-sub">Closure Confirmation &nbsp;·&nbsp; ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>

        <!-- BODY -->
        <div class="body">

          <p class="greeting">Dear <strong>${name}</strong>,</p>

          <p class="lead">
            This correspondence serves as formal confirmation that your Nexarion Global Exports account has been 
            permanently closed and all associated data has been purged from our systems. 
            This action was carried out in accordance with your request or applicable administrative policy.
          </p>

          <!-- NOTICE -->
          <div class="notice">
            <div class="notice-icon">
              <svg viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            </div>
            <div class="notice-text">
              <h4>Irreversible Action</h4>
              <p>
                Account closures are permanent and cannot be undone. Your credentials, data, and 
                access privileges have been revoked with immediate effect. No further correspondence 
                will be sent to this address from Nexarion Global Exports.
              </p>
            </div>
          </div>

          <!-- DATA REMOVED -->
          <div class="section-label">Data Removed From Our Systems</div>
          <table class="data-table">
            <tr>
              <td>Profile &amp; Identity</td>
              <td>Full name, contact details, login credentials, and account preferences</td>
            </tr>
            <tr>
              <td>Transaction Records</td>
              <td>Order history, invoices, and associated payment references</td>
            </tr>
            <tr>
              <td>Communications</td>
              <td>All inbound and outbound message threads and correspondence logs</td>
            </tr>
            <tr>
              <td>Saved Content</td>
              <td>Wishlist items, saved searches, and product bookmarks</td>
            </tr>
          </table>

          <div class="divider"></div>

          <!-- RETURN CTA -->
          <div class="return-block">
            <div class="return-block-text">
              <h4>Should You Return</h4>
              <p>You are welcome to re-engage with our platform at any time by registering a new account.</p>
            </div>
            <a href="https://nexarionimpex.com/dashboard" class="cta">Create New Account</a>
          </div>

          <!-- CONTACT -->
          <p class="contact">
            For queries regarding this closure or data handling, contact our compliance desk at
            <a href="mailto:support@nexarionimpex.com">support@nexarionimpex.com</a>. 
            Please include your registered email address in all correspondence for verification purposes.
          </p>

        </div>

        <!-- FOOTER -->
        <div class="footer">
          <div class="footer-brand">Nexarion Global Exports<span>.</span></div>
          <div class="footer-meta">
            Global B2B Trade Platform<br>
            <a href="https://nexarionimpex.com">Privacy Policy</a>
            <a href="https://nexarionimpex.com">Terms of Service</a>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
};