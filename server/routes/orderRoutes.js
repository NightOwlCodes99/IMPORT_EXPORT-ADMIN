const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
  cancelOrder,
  getMyOrders,
  getOrderStats,
  getOrdersPendingShipment,
  getOrdersPendingPayment
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validate, createOrderValidation, validateId } = require('../middleware/validation');
const { advancedFilter, sorting, paginate } = require('../middleware/pagination');
const Order = require('../models/Order');

const router = express.Router();

router.use(protect);

// User routes
router.get('/my/orders', getMyOrders);
router.post('/', createOrderValidation, validate, createOrder);
router.put('/:id/cancel', validateId, validate, cancelOrder);

// Admin routes
router.get('/stats', authorize('admin'), getOrderStats);
router.get('/pending-shipment', authorize('admin'), getOrdersPendingShipment);
router.get('/pending-payment', authorize('admin'), getOrdersPendingPayment);

router
  .route('/')
  .get(advancedFilter, sorting, paginate(Order), getOrders);

router
  .route('/:id')
  .get(validateId, validate, getOrder)
  .put(authorize('admin'), validateId, validate, updateOrder);

router.put('/:id/status', authorize('admin'), validateId, validate, updateOrderStatus);

module.exports = router;
