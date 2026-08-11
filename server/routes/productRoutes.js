const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsBySupplier,
  getFeaturedProducts,
  toggleFeatured,
  updateStock,
  updateProductSummary
} = require('../controllers/productController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validate, createProductValidation, validateId } = require('../middleware/validation');
const { advancedFilter, sorting, paginate, fieldSelection } = require('../middleware/pagination');
const Product = require('../models/Product');

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryId', validateId, validate, getProductsByCategory);
router.get('/supplier/:supplierId', validateId, validate, getProductsBySupplier);

router
  .route('/')
  .get(advancedFilter, sorting, fieldSelection, paginate(Product), getProducts)
  .post(protect, authorize('supplier', 'admin'), createProductValidation, validate, createProduct);

router
  .route('/:id')
  .get(optionalAuth, validateId, validate, getProduct)
  .put(protect, authorize('supplier', 'admin'), validateId, validate, updateProduct)
  .delete(protect, authorize('supplier', 'admin'), validateId, validate, deleteProduct);

// Admin only routes
router.put('/:id/toggle-featured', protect, authorize('admin'), validateId, validate, toggleFeatured);
router.put('/:id/stock', protect, authorize('supplier', 'admin'), validateId, validate, updateStock);
router.put('/:id/summary', protect, authorize('admin'), validateId, validate, updateProductSummary);

module.exports = router;
