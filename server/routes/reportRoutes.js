const express = require('express');
const router = express.Router();
const {
  getReportOverview,
  getWeeklyReport,
  getMonthlyReport,
  getQuarterlyReport,
  getYearlyReport,
  getCustomReport,
  getRevenueReport,
  getRevenueTrend,
  getSalesByCategory,
  getSalesByRegion,
  getTopSellingProducts,
  getUserActivityReport,
  getNewRegistrations,
  getUserDemographics,
  getKPIMetrics,
  exportReport,
  getScheduledReports,
  createScheduledReport,
  updateScheduledReport,
  deleteScheduledReport,
  toggleScheduledReport,
  emailReport,
  sendScheduledReportNow
} = require('../controllers/reportController');
const { protect, requireAdmin } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

// Overview and Period Reports
router.get('/overview', getReportOverview);
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);
router.get('/quarterly', getQuarterlyReport);
router.get('/yearly', getYearlyReport);
router.get('/custom', getCustomReport);

// Revenue Reports
router.get('/revenue', getRevenueReport);
router.get('/revenue/trend', getRevenueTrend);

// Sales Reports
router.get('/sales/by-category', getSalesByCategory);
router.get('/sales/by-region', getSalesByRegion);

// Product Reports
router.get('/products/top-selling', getTopSellingProducts);

// User Reports
router.get('/users/activity', getUserActivityReport);
router.get('/users/registrations', getNewRegistrations);
router.get('/users/demographics', getUserDemographics);

// KPI Reports
router.get('/kpi', getKPIMetrics);

// Export Reports
router.get('/export/pdf', (req, res, next) => { req.params.format = 'pdf'; exportReport(req, res, next); });
router.get('/export/csv', (req, res, next) => { req.params.format = 'csv'; exportReport(req, res, next); });
router.get('/export/excel', (req, res, next) => { req.params.format = 'excel'; exportReport(req, res, next); });

// Scheduled Reports
router.route('/scheduled')
  .get(getScheduledReports)
  .post(createScheduledReport);

router.route('/scheduled/:id')
  .put(updateScheduledReport)
  .delete(deleteScheduledReport);

router.patch('/scheduled/:id/toggle', toggleScheduledReport);
router.post('/scheduled/:id/send-now', sendScheduledReportNow);

// Email Report
router.post('/email', emailReport);

module.exports = router;
