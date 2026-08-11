const express = require('express');
const {
  getContacts,
  getContact,
  createContact,
  bookMeeting,
  raiseQuery,
  updateContactStatus,
  respondToContact,
  assignContact,
  addNote,
  deleteContact,
  getContactStats
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');
const { validate, contactValidation, validateId } = require('../middleware/validation');
const { advancedFilter, sorting, paginate } = require('../middleware/pagination');
const Contact = require('../models/Contact');

const router = express.Router();

// Public routes
router.post('/', contactValidation, validate, createContact);
router.post('/book-meeting', bookMeeting);
router.post('/raise-query', raiseQuery);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getContactStats);

router
  .route('/')
  .get(advancedFilter, sorting, paginate(Contact), getContacts);

router
  .route('/:id')
  .get(validateId, validate, getContact)
  .delete(validateId, validate, deleteContact);

router.put('/:id/status', validateId, validate, updateContactStatus);
router.put('/:id/respond', validateId, validate, respondToContact);
router.put('/:id/assign', validateId, validate, assignContact);
router.put('/:id/notes', validateId, validate, addNote);

// Upload attachment endpoint
const { uploadContactAttachment } = require('../controllers/contactController');
router.post('/upload-attachment', uploadContactAttachment);

module.exports = router;
