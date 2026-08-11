const express = require('express');
const {
  getInventoryOverview,
  getInventoryItems,
  updateInventoryStock,
  bulkUpdateStock,
  addStock,
  reduceStock,
  getStockHistory,
  exportInventory,
  getLowStockAlerts
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');
const { validateId, validate } = require('../middleware/validation');

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Overview and stats
router.get('/overview', getInventoryOverview);

// Alerts
router.get('/alerts', getLowStockAlerts);

// Export
router.get('/export', exportInventory);

// Bulk operations
router.put('/bulk-update', bulkUpdateStock);

// Main inventory routes
router.get('/', getInventoryItems);

// Single product operations
router.put('/:id/stock', validateId, validate, updateInventoryStock);
router.post('/:id/add-stock', validateId, validate, addStock);
router.post('/:id/reduce-stock', validateId, validate, reduceStock);
router.get('/:id/history', validateId, validate, getStockHistory);

module.exports = router;
