exports.supplierProductRejectedEmailTemplate = (supplierName, product, rejectionReason) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Product Review Update - Nexarion</title>
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
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 24px;
          margin: 20px 0;
        }
        
        .product-card h3 {
          color: #991b1b;
          font-size: 18px;
          margin-bottom: 12px;
        }
        
        .product-detail {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #fecaca;
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
          background: #fee2e2;
          color: #991b1b;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        
        .reason-box {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 16px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        
        .reason-box h4 {
          color: #991b1b;
          margin-bottom: 8px;
          font-size: 16px;
        }
        
        .reason-box p {
          color: #b91c1c;
          margin: 0;
          font-size: 14px;
        }
        
        .info-box {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 16px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        
        .info-box p {
          color: #1e40af;
          margin: 0;
          font-size: 14px;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
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
          <div class="icon">⚠️</div>
          <h1>Product Needs Attention</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${supplierName},</h2>
          <p>Unfortunately, your product submission could not be approved at this time. Please review the feedback below and make the necessary updates.</p>
          
          <div class="product-card">
            <h3>Product Details</h3>
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
              <span class="label">Status</span>
              <span class="status-badge">✗ Rejected</span>
            </div>
          </div>
          
          <div class="reason-box">
            <h4>Rejection Reason:</h4>
            <p>${rejectionReason || 'Please contact support for more details.'}</p>
          </div>
          
          <div class="info-box">
            <p>💡 Don't worry! You can edit your product and resubmit it for review. Our team is here to help you succeed on Nexarion.</p>
          </div>
          
          <p>Common reasons for rejection and how to fix them:</p>
          <ul style="color: #4b5563; margin-left: 20px; margin-bottom: 20px;">
            <li><strong>Incomplete information:</strong> Add detailed descriptions and specifications</li>
            <li><strong>Poor image quality:</strong> Upload clear, high-resolution product photos</li>
            <li><strong>Pricing issues:</strong> Ensure pricing is competitive and accurate</li>
            <li><strong>Category mismatch:</strong> Select the correct product category</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="https://nexarionimpex.com/dashboard" class="cta-button">Edit &amp; Resubmit</a>
          </p>
          
          <p>If you have questions about the rejection, please contact our support team.</p>
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
