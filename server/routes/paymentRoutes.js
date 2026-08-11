const express = require('express');
const {
  getPayments,
  getPayment,
  createPayment,
  updatePaymentStatus,
  processRefund,
  processPayout,
  getMyPayments,
  getPaymentStats,
  getCommissionBreakdown,
  getPaymentMethodsDistribution,
  exportPaymentsReport,
  createManualPayment,
  // Stripe payment functions
  createStripePaymentIntent,
  confirmStripePayment,
  stripeWebhook,
  createStripeCheckoutSession,
  getStripeCheckoutSession,
  // Bank transfer functions
  getBankDetails,
  submitBankTransferProof,
  verifyBankTransfer,
  getOrderPaymentDetails
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validateId } = require('../middleware/validation');

const router = express.Router();

// Stripe webhook (must be before protect middleware - no auth needed)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.use(protect);

// User routes
router.get('/my/payments', getMyPayments);
router.post('/', createPayment);

// Stripe payment routes
router.post('/stripe/create-intent', createStripePaymentIntent);
router.post('/stripe/confirm', confirmStripePayment);
router.post('/stripe/create-checkout-session', createStripeCheckoutSession);
router.get('/stripe/checkout-session/:sessionId', getStripeCheckoutSession);

// Bank transfer routes
router.get('/bank-details', getBankDetails);
router.post('/bank-transfer/submit', submitBankTransferProof);
router.put('/bank-transfer/:id/verify', authorize('admin'), verifyBankTransfer);

// Order payment details (for user payment page)
router.get('/order/:orderId/details', getOrderPaymentDetails);

// Admin routes - specific routes before parameterized routes
router.get('/stats', authorize('admin'), getPaymentStats);
router.get('/commission-breakdown', authorize('admin'), getCommissionBreakdown);
router.get('/methods-distribution', authorize('admin'), getPaymentMethodsDistribution);
router.get('/export', authorize('admin'), exportPaymentsReport);
router.post('/admin/manual', authorize('admin'), createManualPayment);

router
  .route('/')
  .get(getPayments);

router
  .route('/:id')
  .get(validateId, validate, getPayment);

router.put('/:id/status', authorize('admin'), validateId, validate, updatePaymentStatus);
router.put('/:id/refund', authorize('admin'), validateId, validate, processRefund);
router.post('/:id/payout', authorize('admin'), validateId, validate, processPayout);

module.exports = router;
