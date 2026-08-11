const asyncHandler = require('express-async-handler');
const SiteStats = require('../models/SiteStats');

// @desc    Get site statistics (public)
// @route   GET /api/site-stats
// @access  Public
exports.getSiteStats = asyncHandler(async (req, res) => {
  const stats = await SiteStats.getStats();
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Update site statistics (admin only)
// @route   PUT /api/site-stats
// @access  Private/Admin
exports.updateSiteStats = asyncHandler(async (req, res) => {
  const {
    activeUsers,
    countries,
    productsListed,
    yearsExperience,
    satisfactionRate,
    verifiedSuppliers
  } = req.body;

  let stats = await SiteStats.findOne();
  
  if (!stats) {
    stats = new SiteStats({});
  }

  // Update each stat if provided
  if (activeUsers !== undefined) {
    if (activeUsers.value !== undefined) stats.activeUsers.value = activeUsers.value;
    if (activeUsers.suffix !== undefined) stats.activeUsers.suffix = activeUsers.suffix;
    if (activeUsers.label !== undefined) stats.activeUsers.label = activeUsers.label;
  }
  
  if (countries !== undefined) {
    if (countries.value !== undefined) stats.countries.value = countries.value;
    if (countries.suffix !== undefined) stats.countries.suffix = countries.suffix;
    if (countries.label !== undefined) stats.countries.label = countries.label;
  }
  
  if (productsListed !== undefined) {
    if (productsListed.value !== undefined) stats.productsListed.value = productsListed.value;
    if (productsListed.suffix !== undefined) stats.productsListed.suffix = productsListed.suffix;
    if (productsListed.label !== undefined) stats.productsListed.label = productsListed.label;
  }
  
  if (yearsExperience !== undefined) {
    if (yearsExperience.value !== undefined) stats.yearsExperience.value = yearsExperience.value;
    if (yearsExperience.suffix !== undefined) stats.yearsExperience.suffix = yearsExperience.suffix;
    if (yearsExperience.label !== undefined) stats.yearsExperience.label = yearsExperience.label;
  }
  
  if (satisfactionRate !== undefined) {
    if (satisfactionRate.value !== undefined) stats.satisfactionRate.value = satisfactionRate.value;
    if (satisfactionRate.suffix !== undefined) stats.satisfactionRate.suffix = satisfactionRate.suffix;
    if (satisfactionRate.label !== undefined) stats.satisfactionRate.label = satisfactionRate.label;
  }
  
  if (verifiedSuppliers !== undefined) {
    if (verifiedSuppliers.value !== undefined) stats.verifiedSuppliers.value = verifiedSuppliers.value;
    if (verifiedSuppliers.suffix !== undefined) stats.verifiedSuppliers.suffix = verifiedSuppliers.suffix;
    if (verifiedSuppliers.label !== undefined) stats.verifiedSuppliers.label = verifiedSuppliers.label;
  }

  stats.updatedBy = req.user._id;
  await stats.save();

  res.status(200).json({
    success: true,
    message: 'Site statistics updated successfully',
    data: stats
  });
});

// @desc    Reset site statistics to defaults (admin only)
// @route   POST /api/site-stats/reset
// @access  Private/Admin
exports.resetSiteStats = asyncHandler(async (req, res) => {
  await SiteStats.deleteMany({});
  const stats = await SiteStats.getStats();
  
  stats.updatedBy = req.user._id;
  await stats.save();

  res.status(200).json({
    success: true,
    message: 'Site statistics reset to defaults',
    data: stats
  });
});
