const express = require('express');
const router = express.Router();
const {
  getMyTickets,
  getTicket,
  createTicket,
  replyToTicket,
  updateTicketStatus,
  assignTicket,
  closeTicket,
  rateTicket,
  addInternalNote,
  getAllTickets,
  getTicketStats,
  getUnreadCount,
  getStaffForAssignment,
  deleteTicket
} = require('../controllers/supportTicketController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Static routes first (before :id params)
router.post('/', createTicket);
router.get('/my-tickets', getMyTickets);
router.get('/unread-count', getUnreadCount);

// Admin static routes (before :id params)
router.get('/admin/all', authorize('admin'), getAllTickets);
router.get('/admin/stats', authorize('admin'), getTicketStats);
router.get('/admin/staff', authorize('admin'), getStaffForAssignment);

// Dynamic routes with :id
router.get('/:id', getTicket);
router.post('/:id/reply', replyToTicket);
router.put('/:id/close', closeTicket);
router.put('/:id/rate', rateTicket);

// Admin dynamic routes
router.put('/:id/status', authorize('admin'), updateTicketStatus);
router.put('/:id/assign', authorize('admin'), assignTicket);
router.post('/:id/notes', authorize('admin'), addInternalNote);
router.delete('/:id', authorize('admin'), deleteTicket);

module.exports = router;
