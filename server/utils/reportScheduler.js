const cron = require('node-cron');
const ScheduledReport = require('../models/ScheduledReport');
const { generateReportPDF } = require('./pdfGenerator');
const { sendEmail } = require('../config/email');
const { gatherFullReportData } = require('../controllers/reportController');

// Generate and send report
const generateAndSendReport = async (scheduledReport) => {
  try {

    const period = scheduledReport.reportType;
    
    // Gather complete report data using shared helper
    const reportData = await gatherFullReportData(period);
    const { startDate, endDate } = reportData.overview.reportPeriod;

    // Generate PDF
    const doc = generateReportPDF(reportData, period);
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    
    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
      doc.end();
    });
    
    const pdfBuffer = Buffer.concat(chunks);
    const filename = `${period}-report-${new Date().toISOString().split('T')[0]}.pdf`;

    // Send email to each recipient
    const emailPromises = scheduledReport.recipients.map(async (recipient) => {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📊 Scheduled ${period.charAt(0).toUpperCase() + period.slice(1)} Report</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Nexarion Global Exports</p>
            </div>
            <div class="content">
              <p>Hello${recipient.name ? ' ' + recipient.name : ''},</p>
              <p>Your scheduled "${scheduledReport.name}" report has been generated and is attached to this email.</p>
              
              <h3>Quick Summary</h3>
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <tr style="background: #667eea; color: white;">
                  <td style="padding: 10px; border-radius: 5px 0 0 0;">Revenue</td>
                  <td style="padding: 10px;">Orders</td>
                  <td style="padding: 10px; border-radius: 0 5px 0 0;">New Users</td>
                </tr>
                <tr style="background: white;">
                  <td style="padding: 15px; text-align: center; font-weight: bold;">$${(reportData.overview.revenue.current || 0).toLocaleString()}</td>
                  <td style="padding: 15px; text-align: center; font-weight: bold;">${reportData.overview.orders.current}</td>
                  <td style="padding: 15px; text-align: center; font-weight: bold;">${reportData.overview.newUsers.current}</td>
                </tr>
              </table>
              
              <p style="text-align: center; margin-top: 20px;">
                <strong>📎 Full detailed report is attached as PDF</strong>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated scheduled report from Nexarion Global Exports</p>
              <p>Report: ${scheduledReport.name} | Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return sendEmail({
        email: recipient.email,
        subject: `Scheduled Report: ${scheduledReport.name}`,
        html: emailHtml,
        attachments: [{
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      });
    });

    await Promise.all(emailPromises);

    // Update last sent and next scheduled
    scheduledReport.lastSentAt = new Date();
    scheduledReport.nextScheduledAt = scheduledReport.calculateNextSchedule();
    await scheduledReport.save();

    return true;
  } catch (error) {
    console.error(`❌ Error sending scheduled report "${scheduledReport.name}":`, error.message);
    return false;
  }
};

// Check and process due reports
const processDueReports = async () => {
  try {
    const now = new Date();
    
    // Find all active reports that are due
    const dueReports = await ScheduledReport.find({
      isActive: true,
      nextScheduledAt: { $lte: now }
    });

    if (dueReports.length > 0) {

      for (const report of dueReports) {
        await generateAndSendReport(report);
      }
    }
  } catch (error) {
    console.error('❌ Error processing scheduled reports:', error.message);
  }
};

// Initialize scheduler
const initScheduler = () => {

  // Run every minute to check for due reports
  cron.schedule('* * * * *', async () => {
    await processDueReports();
  });

};

module.exports = {
  initScheduler,
  generateAndSendReport,
  processDueReports
};
