/**
 * Report Email Template
 * Sent when a scheduled report is generated or when admin emails a report
 * Includes summary metrics and period-specific data
 */

exports.reportEmailTemplate = (reportData) => {
  const {
    recipientName,
    reportType, // weekly, monthly, quarterly, yearly
    reportPeriod,
    summary,
    metrics,
    companyInfo,
    downloadUrl
  } = reportData;

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format percentage
  const formatPercentage = (value) => {
    const num = parseFloat(value) || 0;
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  // Get report title based on type
  const getReportTitle = () => {
    const titles = {
      weekly: 'Weekly Performance Report',
      monthly: 'Monthly Performance Report',
      quarterly: 'Quarterly Performance Report',
      yearly: 'Yearly Performance Report'
    };
    return titles[reportType] || 'Performance Report';
  };

  // Get period label
  const getPeriodLabel = () => {
    if (reportPeriod?.startDate && reportPeriod?.endDate) {
      return `${formatDate(reportPeriod.startDate)} - ${formatDate(reportPeriod.endDate)}`;
    }
    return reportType?.charAt(0).toUpperCase() + reportType?.slice(1) + ' Report';
  };

  // Metrics card HTML
  const metricsHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <!-- Revenue -->
        <td style="padding: 8px;">
          <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 16px; padding: 20px; text-align: center;">
            <div style="width: 48px; height: 48px; margin: 0 auto 12px; background: #10b981; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 20px;">💵</span>
            </div>
            <p style="margin: 0; color: #059669; font-size: 12px; font-weight: 600; text-transform: uppercase;">Revenue</p>
            <p style="margin: 8px 0 0 0; color: #065f46; font-size: 24px; font-weight: 800;">${formatCurrency(metrics?.revenue?.current)}</p>
            <p style="margin: 4px 0 0 0; color: ${(metrics?.revenue?.growth || 0) >= 0 ? '#10b981' : '#ef4444'}; font-size: 12px; font-weight: 700;">
              ${formatPercentage(metrics?.revenue?.growth)} vs last period
            </p>
          </div>
        </td>
        <!-- Orders -->
        <td style="padding: 8px;">
          <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 16px; padding: 20px; text-align: center;">
            <div style="width: 48px; height: 48px; margin: 0 auto 12px; background: #3b82f6; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 20px;">🛒</span>
            </div>
            <p style="margin: 0; color: #2563eb; font-size: 12px; font-weight: 600; text-transform: uppercase;">Orders</p>
            <p style="margin: 8px 0 0 0; color: #1e40af; font-size: 24px; font-weight: 800;">${metrics?.orders?.current || 0}</p>
            <p style="margin: 4px 0 0 0; color: ${(metrics?.orders?.growth || 0) >= 0 ? '#10b981' : '#ef4444'}; font-size: 12px; font-weight: 700;">
              ${formatPercentage(metrics?.orders?.growth)} vs last period
            </p>
          </div>
        </td>
      </tr>
      <tr>
        <!-- New Users -->
        <td style="padding: 8px;">
          <div style="background: linear-gradient(135deg, #faf5ff, #f3e8ff); border-radius: 16px; padding: 20px; text-align: center;">
            <div style="width: 48px; height: 48px; margin: 0 auto 12px; background: #8b5cf6; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 20px;">👤</span>
            </div>
            <p style="margin: 0; color: #7c3aed; font-size: 12px; font-weight: 600; text-transform: uppercase;">New Users</p>
            <p style="margin: 8px 0 0 0; color: #5b21b6; font-size: 24px; font-weight: 800;">${metrics?.newUsers?.current || 0}</p>
            <p style="margin: 4px 0 0 0; color: ${(metrics?.newUsers?.growth || 0) >= 0 ? '#10b981' : '#ef4444'}; font-size: 12px; font-weight: 700;">
              ${formatPercentage(metrics?.newUsers?.growth)} vs last period
            </p>
          </div>
        </td>
        <!-- Conversion Rate -->
        <td style="padding: 8px;">
          <div style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border-radius: 16px; padding: 20px; text-align: center;">
            <div style="width: 48px; height: 48px; margin: 0 auto 12px; background: #f97316; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 20px;">📈</span>
            </div>
            <p style="margin: 0; color: #ea580c; font-size: 12px; font-weight: 600; text-transform: uppercase;">Conversion</p>
            <p style="margin: 8px 0 0 0; color: #c2410c; font-size: 24px; font-weight: 800;">${(parseFloat(metrics?.conversionRate?.current) || 0).toFixed(1)}%</p>
            <p style="margin: 4px 0 0 0; color: ${(metrics?.conversionRate?.growth || 0) >= 0 ? '#10b981' : '#ef4444'}; font-size: 12px; font-weight: 700;">
              ${formatPercentage(metrics?.conversionRate?.growth)} vs last period
            </p>
          </div>
        </td>
      </tr>
    </table>
  `;

  // Summary section HTML
  const summaryHtml = summary ? `
    <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 700;">
        📊 Report Summary
      </h3>
      <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.8;">
        ${summary.text || `Overall performance is <strong>${summary.performance || 'stable'}</strong> this ${reportType?.replace('ly', '')}. 
        Revenue ${(metrics?.revenue?.growth || 0) >= 0 ? 'increased' : 'decreased'} by ${formatPercentage(metrics?.revenue?.growth)}, 
        with ${metrics?.orders?.current || 0} orders processed and ${metrics?.newUsers?.current || 0} new users registered.`}
      </p>
      ${summary.highlights ? `
        <ul style="margin: 16px 0 0 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
          ${summary.highlights.map(h => `<li style="margin-bottom: 8px;">${h}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${getReportTitle()}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      
      <!-- Container -->
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%); padding: 40px 32px; text-align: center;">
            <div style="width: 64px; height: 64px; margin: 0 auto 16px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px;">📊</span>
            </div>
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
              ${getReportTitle()}
            </h1>
            <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500;">
              ${getPeriodLabel()}
            </p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding: 32px 32px 16px 32px;">
            <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">
              Hello ${recipientName || 'Admin'},
            </p>
            <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
              Your ${reportType || 'scheduled'} performance report is ready. Here's an overview of key metrics and business insights for the reporting period.
            </p>
          </td>
        </tr>

        <!-- Key Metrics -->
        <tr>
          <td style="padding: 0 24px;">
            ${metricsHtml}
          </td>
        </tr>

        <!-- Summary -->
        <tr>
          <td style="padding: 0 32px;">
            ${summaryHtml}
          </td>
        </tr>

        <!-- Download Button -->
        ${downloadUrl ? `
        <tr>
          <td style="padding: 24px 32px; text-align: center;">
            <a href="${downloadUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);">
              📥 Download Full Report
            </a>
            <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
              Report available in PDF format
            </p>
          </td>
        </tr>
        ` : ''}

        <!-- View Dashboard -->
        <tr>
          <td style="padding: 24px 32px;">
            <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 16px; padding: 24px; text-align: center;">
              <p style="margin: 0 0 16px 0; color: #065f46; font-size: 14px; font-weight: 600;">
                📈 View detailed analytics in your admin dashboard
              </p>
              <a href="https://nexarionimpex.com/nexarion/admin/login" style="display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px;">
                Open Dashboard
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background: #1f2937; padding: 32px; text-align: center;">
            <div style="width: 48px; height: 48px; margin: 0 auto 16px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 24px;">🌐</span>
            </div>
            <p style="margin: 0; color: #ffffff; font-weight: 700; font-size: 16px;">
              ${companyInfo?.name || 'Nexarion Global Exports'}
            </p>
            <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
              ${companyInfo?.tagline || 'Connecting Global Trade Partners'}
            </p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #374151;">
              <p style="margin: 0; color: #6b7280; font-size: 11px;">
                This is an automated report from your Nexarion admin panel.<br>
                To unsubscribe from scheduled reports, update your notification settings.
              </p>
              <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 11px;">
                © ${new Date().getFullYear()} ${companyInfo?.name || 'Nexarion Global Exports'}. All rights reserved.
              </p>
            </div>
          </td>
        </tr>
        
      </table>
      
    </body>
    </html>
  `;
};
