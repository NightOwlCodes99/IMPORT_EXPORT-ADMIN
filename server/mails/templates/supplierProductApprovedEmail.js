exports.supplierProductApprovedEmailTemplate = (supplierName, product) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Product Approved - Nexarion</title>
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
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          padding: 40px 30px;
          text-align: center;
        }
        
        .header h1 {
          margin: 10px 0 0 0;
          font-size: 24px;
          font-weight: 700;
        }
        
        .header .icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        
        .content {
          padding: 40px 30px;
          background: #ffffff;
        }
        
        .content h2 {
          color: #1f2937;
          font-size: 22px;
          margin-bottom: 20px;
        }
        
        .content p {
          color: #4b5563;
          font-size: 16px;
          margin-bottom: 15px;
        }
        
        .product-card {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 24px;
          margin: 20px 0;
        }
        
        .product-card h3 {
          color: #166534;
          font-size: 18px;
          margin-bottom: 12px;
        }
        
        .product-detail {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #bbf7d0;
        }
        
        .product-detail:last-child {
          border-bottom: none;
        }
        
        .product-detail .label {
          color: #6b7280;
          font-size: 14px;
        }
        
        .product-detail .value {
          color: #1f2937;
          font-size: 14px;
          font-weight: 600;
        }
        
        .status-badge {
          display: inline-block;
          background: #dcfce7;
          color: #166534;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        
        .success-box {
          background: #f0fdf4;
          border-left: 4px solid #10b981;
          padding: 16px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        
        .success-box p {
          color: #166534;
          margin: 0;
          font-size: 14px;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
        }
        
        .cta-button:hover {
          opacity: 0.9;
        }
        
        .footer {
          background: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
          color: #6b7280;
          font-size: 14px;
          margin: 5px 0;
        }
        
        .footer .brand {
          color: #10b981;
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="icon">✅</div>
          <h1>Product Approved!</h1>
        </div>
        
        <div class="content">
          <h2>Great news, ${supplierName}!</h2>
          <p>Your product has been approved and is now live on the Nexarion marketplace. Buyers can now view and order your product.</p>
          
          <div class="product-card">
            <h3>Approved Product</h3>
            <div class="product-detail">
              <span class="label">Product Name</span>
              <span class="value">${product.name || 'N/A'}</span>
            </div>
            <div class="product-detail">
              <span class="label">SKU</span>
              <span class="value">${product.sku || 'N/A'}</span>
            </div>
            <div class="product-detail">
              <span class="label">Price</span>
              <span class="value">$${product.price?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="product-detail">
              <span class="label">Category</span>
              <span class="value">${product.category?.name || product.category || 'N/A'}</span>
            </div>
            <div class="product-detail">
              <span class="label">Status</span>
              <span class="status-badge">✓ Approved & Live</span>
            </div>
          </div>
          
          <div class="success-box">
            <p>🎉 Your product is now visible to thousands of potential buyers on Nexarion!</p>
          </div>
          
          <p style="text-align: center;">
            <a href="https://nexarionimpex.com/dashboard" class="cta-button">View Your Products</a>
          </p>
          
          <p>Tips to maximize your sales:</p>
          <ul style="color: #4b5563; margin-left: 20px; margin-bottom: 20px;">
            <li>Keep your inventory levels updated</li>
            <li>Respond quickly to buyer inquiries</li>
            <li>Add more high-quality product images</li>
            <li>Offer competitive pricing</li>
          </ul>
          
          <p>Thank you for being a valued supplier on Nexarion!</p>
        </div>
        
        <div class="footer">
          <p class="brand">Nexarion Global Exports</p>
          <p>Your trusted partner in global trade</p>
          <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} Nexarion. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
