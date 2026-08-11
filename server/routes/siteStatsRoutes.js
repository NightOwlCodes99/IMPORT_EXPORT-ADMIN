const express = require('express');
const router = express.Router();
const {
  getSiteStats,
  updateSiteStats,
  resetSiteStats
} = require('../controllers/siteStatsController');
const { protect, requireAdmin } = require('../middleware/auth');

// Public route - get stats for frontend display
router.get('/', getSiteStats);

// Admin routes
router.put('/', protect, requireAdmin, updateSiteStats);
router.post('/reset', protect, requireAdmin, resetSiteStats);

module.exports = router;
