const express = require('express');
const {
  getShipments,
  getShipment,
  getShipmentWithOrder,
  getMyShipments,
  createShipment,
  updateShipment,
  deleteShipment,
  updateShipmentStatus,
  addTrackingUpdate,
  trackShipment,
  getShipmentStats,
  notifyCustomer,
  exportShipmentsReport
} = require('../controllers/shipmentController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validateId } = require('../middleware/validation');

const router = express.Router();

// Public route for tracking
router.get('/track/:trackingNumber', trackShipment);

// Protected routes
router.use(protect);

// User's shipments route (must be before /:id routes)
router.get('/my-shipments', getMyShipments);

// Stats and export routes (must be before /:id routes)
router.get('/stats', authorize('admin'), getShipmentStats);
router.get('/export', authorize('admin'), exportShipmentsReport);

router
  .route('/')
  .get(authorize('admin'), getShipments)
  .post(authorize('admin'), createShipment);

router
  .route('/:id')
  .get(validateId, validate, getShipment)
  .put(authorize('admin'), validateId, validate, updateShipment)
  .delete(authorize('admin'), validateId, validate, deleteShipment);

// Get shipment with full order details
router.get('/:id/with-order', authorize('admin'), validateId, validate, getShipmentWithOrder);

router.put('/:id/status', authorize('admin'), validateId, validate, updateShipmentStatus);
router.put('/:id/tracking', authorize('admin'), validateId, validate, addTrackingUpdate);
router.post('/:id/notify', authorize('admin'), validateId, validate, notifyCustomer);

module.exports = router;
