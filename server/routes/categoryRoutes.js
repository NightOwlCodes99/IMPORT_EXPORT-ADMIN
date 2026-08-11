const express = require('express');
const {
  getCategories,
  getCategory,
  getCategoryBySlug,
  getFeaturedCategories,
  getHotCategories,
  getTrendingCategories,
  getTopSellingCategories,
  getNewCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  getCategoryStats,
  toggleCategoryActive,
  toggleCategoryFeatured,
  toggleCategoryHot,
  toggleCategoryTrending,
  toggleCategoryNew,
  toggleCategoryTopSelling,
  updateCategoryOrder,
  bulkUpdateCategoryOrder,
  getAllCategoriesAdmin,
  syncProductCounts
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validateId } = require('../middleware/validation');

const router = express.Router();

// Public routes - specific routes before parameterized routes
router.get('/stats', getCategoryStats);
router.get('/featured', getFeaturedCategories);
router.get('/hot', getHotCategories);
router.get('/trending', getTrendingCategories);
router.get('/top-selling', getTopSellingCategories);
router.get('/new', getNewCategories);
router.get('/slug/:slug', getCategoryBySlug);

// Protected routes (Admin only) - must come BEFORE /:id
router.get('/admin/all', protect, authorize('admin'), getAllCategoriesAdmin);
router.post('/upload-image', protect, authorize('admin'), uploadCategoryImage);
router.patch('/bulk-order', protect, authorize('admin'), bulkUpdateCategoryOrder);
router.post('/sync-counts', protect, authorize('admin'), syncProductCounts);

// Public routes
router.get('/', getCategories);
router.get('/:id', validateId, validate, getCategory);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), validateId, validate, updateCategory);
router.delete('/:id', protect, authorize('admin'), validateId, validate, deleteCategory);
router.patch('/:id/toggle-active', protect, authorize('admin'), toggleCategoryActive);
router.patch('/:id/toggle-featured', protect, authorize('admin'), toggleCategoryFeatured);
router.patch('/:id/toggle-hot', protect, authorize('admin'), toggleCategoryHot);
router.patch('/:id/toggle-trending', protect, authorize('admin'), toggleCategoryTrending);
router.patch('/:id/toggle-new', protect, authorize('admin'), toggleCategoryNew);
router.patch('/:id/toggle-top-selling', protect, authorize('admin'), toggleCategoryTopSelling);
router.patch('/:id/order', protect, authorize('admin'), updateCategoryOrder);

module.exports = router;
