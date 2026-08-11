const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const { ErrorResponse } = require('../middleware/error');
const { sendSupplierProductSubmittedEmail } = require('../config/email');
const { cache, CACHE_KEYS, CACHE_TTL } = require('../utils/cache');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  // Base filter: only approved and active products for public access
  const baseFilter = {
    isApproved: 'approved',
    isActive: true,
    ...(req.queryFilter || {})
  };

  // Build search filter if search query provided
  let searchFilter = {};
  if (req.searchQuery) {
    searchFilter = {
      $or: [
        { name: { $regex: req.searchQuery, $options: 'i' } },
        { description: { $regex: req.searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(req.searchQuery, 'i')] } }
      ]
    };
  }

  // Combined filter for count and query
  const combinedFilter = { ...baseFilter, ...searchFilter };

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const startIndex = (page - 1) * limit;

  let query = Product.find(combinedFilter)
    .populate('category', 'name')
    .populate('supplier', 'companyName country');

  // Apply sorting
  if (req.sortBy) {
    query = query.sort(req.sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Apply field selection
  if (req.selectFields) {
    query = query.select(req.selectFields);
  }

  // Apply pagination
  query = query.skip(startIndex).limit(limit).lean();

  const [productsResult, total] = await Promise.all([
    query,
    Product.countDocuments(combinedFilter)
  ]);

  let products = productsResult;
  const totalPages = Math.ceil(total / limit);

  // Filter by supplier country if specified
  if (req.countryFilter) {
    products = products.filter(p => p.supplier && p.supplier.country === req.countryFilter);
  }

  res.status(200).json({
    success: true,
    count: products.length,
    page: page,
    pages: totalPages,
    total: total,
    pagination: {
      current: page,
      totalPages: totalPages,
      totalResults: total,
      limit: limit
    },
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name icon')
    .populate('supplier', 'companyName country rating email phone')
    .populate('brand', 'name logo');

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Increment views
  product.views = (product.views || 0) + 1;
  await product.save();

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Supplier
exports.createProduct = asyncHandler(async (req, res, next) => {
  // If supplier role, find their supplier profile and add to req.body
  if (req.user.role === 'supplier') {
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier) {
      return next(new ErrorResponse('Supplier profile not found. Please complete your profile first.', 404));
    }
    req.body.supplier = supplier._id;
  }

  const product = await Product.create(req.body);

  // Send email notification to supplier about product submission
  if (req.user.role === 'supplier') {
    try {
      await sendSupplierProductSubmittedEmail(
        req.user.email,
        req.user.name,
        product
      );
    } catch (emailError) {
      
      // Don't fail the request if email fails
    }
  }

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Supplier/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is product owner or admin
  if (product.supplier.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this product', 401));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Supplier/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is product owner or admin
  if (product.supplier.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this product', 401));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ 
    category: req.params.categoryId,
    isApproved: 'approved',
    isActive: true
  })
    .populate('supplier', 'companyName country rating')
    .lean();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get products by supplier
// @route   GET /api/products/supplier/:supplierId
// @access  Public
exports.getProductsBySupplier = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ supplier: req.params.supplierId })
    .populate('category', 'name')
    .lean();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = asyncHandler(async (req, res, next) => {
  // Check cache first
  const cachedData = cache.get(CACHE_KEYS.FEATURED_PRODUCTS);
  if (cachedData) {
    return res.status(200).json({
      success: true,
      count: cachedData.length,
      data: cachedData,
      cached: true
    });
  }

  const products = await Product.find({ isFeatured: true, isApproved: 'approved', isActive: true })
    .limit(10)
    .populate('category', 'name')
    .populate('supplier', 'companyName country')
    .lean();

  // Cache the results
  cache.set(CACHE_KEYS.FEATURED_PRODUCTS, products, CACHE_TTL.FEATURED_PRODUCTS);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Toggle product featured status
// @route   PUT /api/products/:id/toggle-featured
// @access  Private/Admin
exports.toggleFeatured = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  product.isFeatured = !product.isFeatured;
  await product.save();

  // Invalidate featured products cache
  cache.delete(CACHE_KEYS.FEATURED_PRODUCTS);

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Supplier/Admin
exports.updateStock = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  product.stock = req.body.stock;
  await product.save();

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Update product summary
// @route   PUT /api/products/:id/summary
// @access  Private/Admin
exports.updateProductSummary = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  product.summary = req.body.summary;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product summary updated successfully',
    data: product
  });
});
