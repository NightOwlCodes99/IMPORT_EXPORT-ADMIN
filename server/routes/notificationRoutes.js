const express = require('express');
const {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validateId } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread', getUnreadNotifications);
router.get('/unread/count', getUnreadCount);
router.put('/read/all', markAllAsRead);
router.delete('/all', deleteAllNotifications);

router.post('/', authorize('admin'), createNotification);

router.put('/:id/read', validateId, validate, markAsRead);
router.delete('/:id', validateId, validate, deleteNotification);

module.exports = router;
