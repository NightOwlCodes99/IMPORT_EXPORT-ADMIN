const asyncHandler = require('express-async-handler');
const Brand = require('../models/Brand');
const { ErrorResponse } = require('../middleware/error');
const cloudinary = require('../config/cloudinary');

// @desc    Get all brands
// @route   GET /api/admin/brands
// @access  Private/Admin
exports.getAllBrands = asyncHandler(async (req, res, next) => {
  const { search, isActive, page = 1, limit = 20 } = req.query;
  
  const filters = {};
  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } }
    ];
  }
  if (isActive !== undefined && isActive !== '') {
    filters.isActive = isActive === 'true';
  }

  const skip = (page - 1) * limit;

  const [brands, total] = await Promise.all([
    Brand.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Brand.countDocuments(filters)
  ]);

  res.status(200).json({
    success: true,
    data: brands,
    count: brands.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit)
  });
});

// @desc    Get brand by ID
// @route   GET /api/admin/brands/:id
// @access  Private/Admin
exports.getBrandById = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: brand
  });
});

// @desc    Create brand
// @route   POST /api/admin/brands
// @access  Private/Admin
exports.createBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Brand created successfully',
    data: brand
  });
});

// @desc    Update brand
// @route   PUT /api/admin/brands/:id
// @access  Private/Admin
exports.updateBrand = asyncHandler(async (req, res, next) => {
  let brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404));
  }

  brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Brand updated successfully',
    data: brand
  });
});

// @desc    Delete brand
// @route   DELETE /api/admin/brands/:id
// @access  Private/Admin
exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404));
  }

  // Delete logo from Cloudinary if exists
  if (brand.logo?.public_id) {
    await cloudinary.uploader.destroy(brand.logo.public_id);
  }

  await brand.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Brand deleted successfully'
  });
});

// @desc    Toggle brand active status
// @route   PATCH /api/admin/brands/:id/toggle-active
// @access  Private/Admin
exports.toggleBrandActive = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404));
  }

  brand.isActive = !brand.isActive;
  await brand.save();

  res.status(200).json({
    success: true,
    message: `Brand ${brand.isActive ? 'activated' : 'deactivated'} successfully`,
    data: brand
  });
});

// @desc    Toggle brand featured status
// @route   PATCH /api/admin/brands/:id/toggle-featured
// @access  Private/Admin
exports.toggleBrandFeatured = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404));
  }

  brand.isFeatured = !brand.isFeatured;
  await brand.save();

  res.status(200).json({
    success: true,
    message: `Brand ${brand.isFeatured ? 'marked as featured' : 'removed from featured'}`,
    data: brand
  });
});

// @desc    Upload brand logo
// @route   POST /api/admin/brands/upload-logo
// @access  Private/Admin
exports.uploadBrandLogo = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.logo) {
    return next(new ErrorResponse('Please upload a logo', 400));
  }

  const file = req.files.logo;

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: 'brands',
    width: 300,
    height: 300,
    crop: 'fit',
    background: 'transparent'
  });

  res.status(200).json({
    success: true,
    data: {
      public_id: result.public_id,
      url: result.secure_url
    }
  });
});

// @desc    Get brand statistics
// @route   GET /api/admin/brands/stats
// @access  Private/Admin
exports.getBrandStats = asyncHandler(async (req, res, next) => {
  const [
    total,
    active,
    inactive,
    featured,
    withProducts
  ] = await Promise.all([
    Brand.countDocuments(),
    Brand.countDocuments({ isActive: true }),
    Brand.countDocuments({ isActive: false }),
    Brand.countDocuments({ isFeatured: true }),
    Brand.countDocuments({ productCount: { $gt: 0 } })
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      active,
      inactive,
      featured,
      withProducts,
      empty: total - withProducts
    }
  });
});
