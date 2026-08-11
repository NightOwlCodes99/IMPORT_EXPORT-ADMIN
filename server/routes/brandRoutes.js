const express = require('express');
const router = express.Router();
const {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandActive,
  toggleBrandFeatured,
  uploadBrandLogo,
  getBrandStats
} = require('../controllers/brandController');
const { protect, requireAdmin } = require('../middleware/auth');

// Apply authentication and admin check to all routes
router.use(protect, requireAdmin);

// Brand routes
router.get('/stats', getBrandStats);
router.post('/upload-logo', uploadBrandLogo);
router.route('/').get(getAllBrands).post(createBrand);
router.route('/:id').get(getBrandById).put(updateBrand).delete(deleteBrand);
router.patch('/:id/toggle-active', toggleBrandActive);
router.patch('/:id/toggle-featured', toggleBrandFeatured);

module.exports = router;
