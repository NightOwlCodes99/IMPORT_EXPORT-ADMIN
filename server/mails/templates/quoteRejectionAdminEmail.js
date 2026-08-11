/**
 * Email template sent to ADMIN when a buyer rejects a quote
 * Notifies admin so they can prepare a revised quote
 */

const rejectionCategoryLabels = {
  'price_too_high': 'Price Too High',
  'delivery_time_long': 'Delivery Time Too Long',
  'found_better_offer': 'Found Better Offer',
  'quality_concerns': 'Quality Concerns',
  'terms_not_acceptable': 'Terms Not Acceptable',
  'budget_changed': 'Budget Changed',
  'project_cancelled': 'Project Cancelled',
  'other': 'Other Reason'
};

const quoteRejectionAdminEmail = ({ 
  quoteId, 
  productName, 
  category,
  quantity, 
  unit,
  quotedPrice,
  buyerName,
  buyerEmail,
  buyerPhone,
  buyerCompany,
  rejectionCategory,
  rejectionReason,
  rejectedAt,
  revisionNumber
}) => {
  const categoryLabel = rejectionCategoryLabels[rejectionCategory] || 'Not Specified';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Rejected - Action Required</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fef2f2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center;">
        <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 15px; line-height: 60px;">
          <span style="font-size: 28px;">⚠️</span>
        </div>
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Quote Rejected by Buyer</h1>
        <p style="color: #fecaca; margin: 8px 0 0; font-size: 14px;">Revision ${revisionNumber || 1} - Action may be required</p>
      </td>
    </tr>

    <!-- Alert Banner -->
    <tr>
      <td style="background-color: #fef3c7; padding: 15px 30px; border-bottom: 2px solid #fbbf24;">
        <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
          🔔 The buyer has rejected your quote. Consider sending a revised offer to win this opportunity.
        </p>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 30px;">
        <!-- Quote Details -->
        <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #e5e7eb;">
          <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 16px; border-bottom: 2px solid #d1d5db; padding-bottom: 10px;">
            📋 Quote Details
          </h3>
          <table width="100%" cellpadding="8" cellspacing="0">
            <tr>
              <td style="color: #6b7280; font-size: 13px; width: 35%;">Quote ID:</td>
              <td style="color: #111827; font-size: 13px; font-weight: 600;">#${quoteId}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-size: 13px;">Product:</td>
              <td style="color: #111827; font-size: 13px; font-weight: 600;">${productName}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-size: 13px;">Category:</td>
              <td style="color: #111827; font-size: 13px; font-weight: 600;">${category || 'N/A'}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-size: 13px;">Quantity:</td>
              <td style="color: #111827; font-size: 13px; font-weight: 600;">${quantity?.toLocaleString()} ${unit}</td>
            </tr>
            ${quotedPrice ? `
            <tr>
              <td style="color: #6b7280; font-size: 13px;">Your Quoted Price:</td>
              <td style="color: #dc2626; font-size: 13px; font-weight: 700;">$${quotedPrice?.toFixed(2)} per ${unit}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="color: #6b7280; font-size: 13px;">Rejected At:</td>
              <td style="color: #111827; font-size: 13px; font-weight: 600;">${new Date(rejectedAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
            </tr>
          </table>
        </div>

        <!-- Buyer Information -->
        <div style="background-color: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #bfdbfe;">
          <h3 style="color: #1e40af; margin: 0 0 15px; font-size: 16px; border-bottom: 2px solid #93c5fd; padding-bottom: 10px;">
            👤 Buyer Information
          </h3>
          <table width="100%" cellpadding="8" cellspacing="0">
            <tr>
              <td style="color: #6b7280; font-size: 13px; width: 35%;">Name:</td>
              <td style="color: #111827; font-size: 13px; font-weight: 600;">${buyerName}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-size: 13px;">Email:</td>
              <td style="color: #1e40af; font-size: 13px; font-weight: 600;"><a href="mailto:${buyerEmail}" style="color: #1e40af;">${buyerEmail}</a></td>
            </tr>
            ${buyerPhone ? `
            <tr>
              <td style="color: #6b7280; font-size: 13px;">Phone:</td>
              <td style="color: #111827; font-size: 13px; font-weight: 600;"><a href="tel:${buyerPhone}" style="color: #1e40af;">${buyerPhone}</a></td>
            </tr>
            ` : ''}
            ${buyerCompany ? `
            <tr>
              <td style="color: #6b7280; font-size: 13px;">Company:</td>
              <td style="color: #111827; font-size: 13px; font-weight: 600;">${buyerCompany}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <!-- Rejection Reason - IMPORTANT -->
        <div style="background-color: #fef2f2; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 2px solid #f87171;">
          <h3 style="color: #991b1b; margin: 0 0 12px; font-size: 16px;">❌ Rejection Reason</h3>
          <div style="background: #fee2e2; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
            <p style="color: #7c2d12; font-size: 14px; margin: 0; font-weight: 600;">
              Category: ${categoryLabel}
            </p>
          </div>
          ${rejectionReason ? `
          <div style="background: rgba(255,255,255,0.7); padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <p style="color: #374151; font-size: 13px; line-height: 1.6; margin: 0; font-style: italic;">
              "${rejectionReason}"
            </p>
          </div>
          ` : '<p style="color: #6b7280; font-size: 13px; margin: 0;">No additional details provided.</p>'}
        </div>

        <!-- Suggestions Based on Rejection Category -->
        <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #bbf7d0;">
          <h3 style="color: #166534; margin: 0 0 12px; font-size: 15px;">💡 Suggested Actions</h3>
          ${rejectionCategory === 'price_too_high' ? `
          <ul style="color: #15803d; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>Consider a 5-15% price reduction</strong> if margins allow</li>
            <li>Offer volume-based discounts for larger quantities</li>
            <li>Propose flexible payment terms (installments, credit)</li>
            <li>Bundle with complementary products for better value</li>
          </ul>
          ` : rejectionCategory === 'delivery_time_long' ? `
          <ul style="color: #15803d; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>Check if expedited shipping is possible</strong></li>
            <li>Offer partial delivery in phases</li>
            <li>Source from alternative warehouses/locations</li>
            <li>Provide real-time tracking and updates</li>
          </ul>
          ` : rejectionCategory === 'found_better_offer' ? `
          <ul style="color: #15803d; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>Price match if competitive</strong></li>
            <li>Highlight unique value propositions (quality, warranty, support)</li>
            <li>Offer additional services at no extra cost</li>
            <li>Act quickly - buyer may still be deciding</li>
          </ul>
          ` : rejectionCategory === 'quality_concerns' ? `
          <ul style="color: #15803d; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>Provide quality certifications and test reports</strong></li>
            <li>Offer free samples for verification</li>
            <li>Share customer testimonials and case studies</li>
            <li>Extend warranty or guarantee period</li>
          </ul>
          ` : rejectionCategory === 'terms_not_acceptable' ? `
          <ul style="color: #15803d; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>Review and revise payment/shipping terms</strong></li>
            <li>Offer more flexible contract conditions</li>
            <li>Consider escrow or letter of credit options</li>
            <li>Negotiate specific terms that concern the buyer</li>
          </ul>
          ` : `
          <ul style="color: #15803d; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Contact the buyer directly to understand their needs</li>
            <li>Prepare a revised quote addressing their concerns</li>
            <li>Consider alternative solutions or products</li>
            <li>Follow up within 24-48 hours</li>
          </ul>
          `}
        </div>

        <!-- CTA Buttons -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://nexarionimpex.com/nexarion/admin/login" 
             style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 5px;">
            Send Revised Quote →
          </a>
          <a href="mailto:${buyerEmail}?subject=Re: Quote ${quoteId} - Revised Offer" 
             style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 5px;">
            Email Buyer
          </a>
        </div>

        <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 20px 0 0; text-align: center;">
          Don't give up! Many deals close after addressing buyer concerns with a revised offer.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #1e293b; padding: 25px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">
          This is an automated notification from Nexarion Global Exports Admin System
        </p>
        <p style="color: #64748b; font-size: 11px; margin: 0;">
          © ${new Date().getFullYear()} Nexarion Global Exports. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

module.exports = quoteRejectionAdminEmail;
