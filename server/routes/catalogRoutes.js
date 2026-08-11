const express = require('express');
const {
  getCatalogs,
  getCatalog,
  getCatalogsByCategory,
  getFeaturedCatalogs,
  downloadCatalog,
  trackCatalogView,
  getCatalogStats,
  getAllCatalogsAdmin,
  createCatalog,
  updateCatalog,
  deleteCatalog,
  uploadCatalogPdf,
  uploadCatalogCover,
  toggleCatalogActive,
  toggleCatalogFeatured,
  getCategoriesWithCatalogCounts
} = require('../controllers/catalogController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validateId } = require('../middleware/validation');

const router = express.Router();

// Public routes - specific routes before parameterized routes
router.get('/featured', getFeaturedCatalogs);
router.get('/stats', protect, authorize('admin'), getCatalogStats);
router.get('/categories-with-counts', getCategoriesWithCatalogCounts);
router.get('/category/:categoryId', getCatalogsByCategory);

// Admin routes - must come BEFORE /:id
router.get('/admin/all', protect, authorize('admin'), getAllCatalogsAdmin);
router.post('/upload-pdf', protect, authorize('admin'), uploadCatalogPdf);
router.post('/upload-cover', protect, authorize('admin'), uploadCatalogCover);

// Public routes
router.get('/', getCatalogs);
router.get('/:id', validateId, validate, getCatalog);
router.post('/:id/view', validateId, validate, trackCatalogView);
router.post('/:id/download', validateId, validate, downloadCatalog);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createCatalog);
router.put('/:id', protect, authorize('admin'), validateId, validate, updateCatalog);
router.delete('/:id', protect, authorize('admin'), validateId, validate, deleteCatalog);
router.patch('/:id/toggle-active', protect, authorize('admin'), validateId, validate, toggleCatalogActive);
router.patch('/:id/toggle-featured', protect, authorize('admin'), validateId, validate, toggleCatalogFeatured);

module.exports = router;
