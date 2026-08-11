exports.catalogDownloadEmailTemplate = (name, catalogTitle, categoryName, downloadUrl) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Your Catalog Download - Nexarion</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f3f4f6;
          padding: 20px;
        }
        
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .email-header {
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%);
          padding: 40px 20px;
          text-align: center;
        }
        
        .logo {
          font-size: 28px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .header-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        
        .header-title {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          margin-top: 10px;
        }
        
        .header-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          margin-top: 5px;
        }
        
        .email-body {
          padding: 40px 30px;
        }
        
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        
        .message {
          font-size: 15px;
          color: #4b5563;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        
        .catalog-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%);
          border: 1px solid #d1fae5;
          border-radius: 12px;
          padding: 25px;
          margin: 25px 0;
        }
        
        .catalog-title {
          font-size: 18px;
          font-weight: 700;
          color: #065f46;
          margin-bottom: 8px;
        }
        
        .catalog-category {
          display: inline-block;
          background: linear-gradient(135deg, #10b981, #14b8a6);
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 15px;
        }
        
        .catalog-description {
          font-size: 14px;
          color: #374151;
          margin-bottom: 20px;
        }
        
        .download-btn {
          display: inline-block;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          transition: transform 0.2s;
        }
        
        .download-btn:hover {
          transform: translateY(-2px);
        }
        
        .info-section {
          background: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        
        .info-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 10px;
        }
        
        .info-list {
          list-style: none;
          padding: 0;
        }
        
        .info-list li {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }
        
        .info-list li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
        }
        
        .cta-section {
          text-align: center;
          padding: 20px 0;
          border-top: 1px solid #e5e7eb;
          margin-top: 25px;
        }
        
        .cta-text {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 15px;
        }
        
        .explore-btn {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          padding: 12px 25px;
          border-radius: 8px;
          text-decoration: none;
        }
        
        .email-footer {
          background: #f9fafb;
          padding: 25px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 10px;
        }
        
        .social-links {
          margin-top: 15px;
        }
        
        .social-link {
          display: inline-block;
          color: #9ca3af;
          font-size: 12px;
          margin: 0 10px;
          text-decoration: none;
        }
        
        .social-link:hover {
          color: #10b981;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-header">
          <div class="logo">Nexarion</div>
          <div class="header-icon">📚</div>
          <h1 class="header-title">Your Catalog is Ready!</h1>
          <p class="header-subtitle">Thank you for downloading from our catalog library</p>
        </div>
        
        <div class="email-body">
          <p class="greeting">Hello ${name}! 👋</p>
          
          <p class="message">
            Thank you for your interest in our products. We're excited to share our catalog with you. 
            Your requested catalog is now ready for download.
          </p>
          
          <div class="catalog-card">
            <h2 class="catalog-title">📖 ${catalogTitle}</h2>
            <span class="catalog-category">${categoryName}</span>
            <p class="catalog-description">
              This catalog contains detailed information about our products, including specifications, 
              pricing, and ordering information.
            </p>
            <a href="${downloadUrl}" class="download-btn">
              ⬇️ Download Catalog
            </a>
          </div>
          
          <div class="info-section">
            <h3 class="info-title">What's Inside This Catalog:</h3>
            <ul class="info-list">
              <li>Complete product specifications and details</li>
              <li>High-quality product images</li>
              <li>Competitive pricing information</li>
              <li>Minimum order quantities and lead times</li>
              <li>Contact information for inquiries</li>
            </ul>
          </div>
          
          <div class="cta-section">
            <p class="cta-text">Explore more catalogs and products on our platform</p>
            <a href="https://nexarionimpex.com/dashboard" class="explore-btn">
              Browse All Catalogs
            </a>
          </div>
        </div>
        
        <div class="email-footer">
          <p class="footer-text">
            This email was sent because you requested a catalog download from Nexarion.
            If you didn't make this request, please ignore this email.
          </p>
          <p class="footer-text">
            © ${new Date().getFullYear()} Nexarion. All rights reserved.
          </p>
          <div class="social-links">
            <a href="https://nexarionimpex.com" class="social-link">LinkedIn</a>
            <a href="https://nexarionimpex.com" class="social-link">Twitter</a>
            <a href="https://nexarionimpex.com" class="social-link">Facebook</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
