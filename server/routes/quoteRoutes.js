const express = require('express');
const {
  getQuotes,
  getQuote,
  createQuote,
  updateQuote,
  respondToQuote,
  acceptQuote,
  rejectQuote,
  getMyQuotes,
  getQuoteStats,
  uploadQuoteAttachment
} = require('../controllers/quoteController');
const { protect, authorize } = require('../middleware/auth');
const { validate, createQuoteValidation, validateId } = require('../middleware/validation');
const { advancedFilter, sorting, paginate } = require('../middleware/pagination');
const Quote = require('../models/Quote');

const router = express.Router();

router.use(protect);

// User routes
router.get('/my/requests', getMyQuotes);
router.post('/upload-attachment', uploadQuoteAttachment);
router.post('/', createQuoteValidation, validate, createQuote);

// Admin routes
router.get('/stats', authorize('admin'), getQuoteStats);

router
  .route('/')
  .get(advancedFilter, sorting, paginate(Quote), getQuotes);

router
  .route('/:id')
  .get(validateId, validate, getQuote)
  .put(validateId, validate, updateQuote);

router.put('/:id/respond', authorize('supplier', 'admin'), validateId, validate, respondToQuote);
router.put('/:id/accept', validateId, validate, acceptQuote);
router.put('/:id/reject', validateId, validate, rejectQuote);

module.exports = router;
