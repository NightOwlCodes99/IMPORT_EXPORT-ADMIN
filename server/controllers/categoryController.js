const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { ErrorResponse } = require('../middleware/error');
const cloudinary = require('cloudinary').v2;
const { cache, CACHE_KEYS, CACHE_TTL } = require('../utils/cache');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  // Check cache first
  const cacheKey = CACHE_KEYS.CATEGORIES_LIST;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      success: true,
      count: cachedData.length,
      data: cachedData,
      cached: true
    });
  }

  const categories = await Category.find({ isActive: true }).sort('order name').lean();

  // Get actual product counts for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({ 
        category: category._id,
        isApproved: 'approved',
        isActive: true
      });
      return {
        ...category,
        productCount
      };
    })
  );

  // Cache for 5 minutes
  cache.set(cacheKey, categoriesWithCount, CACHE_TTL.CATEGORIES_LIST);

  res.status(200).json({
    success: true,
    count: categoriesWithCount.length,
    data: categoriesWithCount
  });
});

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
exports.getFeaturedCategories = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 6;
  
  const categories = await Category.find({ 
    isActive: true, 
    isFeatured: true 
  })
    .sort('-productCount order')
    .limit(limit);

  // Get actual product counts
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({ 
        category: category._id,
        isApproved: 'approved',
        isActive: true
      });
      return {
        ...category.toObject(),
        productCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: categoriesWithCount.length,
    data: categoriesWithCount
  });
});

// @desc    Get hot categories
// @route   GET /api/categories/hot
// @access  Public
exports.getHotCategories = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 4;
  const cacheKey = `${CACHE_KEYS.HOT_CATEGORIES}_${limit}`;
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      success: true,
      count: cachedData.length,
      data: cachedData,
      cached: true
    });
  }
  
  const categories = await Category.find({ 
    isActive: true, 
    isHot: true 
  })
    .sort('-productCount order')
    .limit(limit);

  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({ 
        category: category._id,
        isApproved: 'approved',
        isActive: true
      });
      return {
        ...category.toObject(),
        productCount
      };
    })
  );

  // Cache the results
  cache.set(cacheKey, categoriesWithCount, CACHE_TTL.HOT_CATEGORIES);

  res.status(200).json({
    success: true,
    count: categoriesWithCount.length,
    data: categoriesWithCount
  });
});

// @desc    Get trending categories
// @route   GET /api/categories/trending
// @access  Public
exports.getTrendingCategories = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 4;
  
  const categories = await Category.find({ 
    isActive: true, 
    isTrending: true 
  })
    .sort('-productCount order')
    .limit(limit);

  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({ 
        category: category._id,
        isApproved: 'approved',
        isActive: true
      });
      return {
        ...category.toObject(),
        productCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: categoriesWithCount.length,
    data: categoriesWithCount
  });
});

// @desc    Get top selling categories
// @route   GET /api/categories/top-selling
// @access  Public
exports.getTopSellingCategories = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 4;
  
  const categories = await Category.find({ 
    isActive: true, 
    isTopSelling: true 
  })
    .sort('-productCount order')
    .limit(limit);

  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({ 
        category: category._id,
        isApproved: 'approved',
        isActive: true
      });
      return {
        ...category.toObject(),
        productCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: categoriesWithCount.length,
    data: categoriesWithCount
  });
});

// @desc    Get new categories
// @route   GET /api/categories/new
// @access  Public
exports.getNewCategories = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 4;
  
  const categories = await Category.find({ 
    isActive: true, 
    isNew: true 
  })
    .sort('-createdAt')
    .limit(limit);

  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({ 
        category: category._id,
        isApproved: 'approved',
        isActive: true
      });
      return {
        ...category.toObject(),
        productCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: categoriesWithCount.length,
    data: categoriesWithCount
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  // Get products count in this category
  const productsCount = await Product.countDocuments({ category: req.params.id });

  res.status(200).json({
    success: true,
    data: {
      ...category.toObject(),
      productsCount
    }
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });

  if (!category) {
    return next(new ErrorResponse(`Category not found with slug ${req.params.slug}`, 404));
  }

  const productsCount = await Product.countDocuments({ category: category._id });

  res.status(200).json({
    success: true,
    data: {
      ...category.toObject(),
      productsCount
    }
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  // Handle image upload if present
  if (req.files && req.files.image) {
    const file = req.files.image;
    
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'categories',
      width: 800,
      height: 600,
      crop: 'fill',
      quality: 'auto:good'
    });

    req.body.image = {
      public_id: result.public_id,
      url: result.secure_url
    };
  }

  // Parse JSON fields if they come as strings
  if (typeof req.body.gradient === 'string') {
    try {
      req.body.gradient = JSON.parse(req.body.gradient);
    } catch (e) {
      // Keep as is if not valid JSON
    }
  }
  
  if (typeof req.body.badge === 'string') {
    try {
      req.body.badge = JSON.parse(req.body.badge);
    } catch (e) {
      // Keep as is if not valid JSON
    }
  }

  // Convert string booleans to actual booleans
  const booleanFields = ['isActive', 'isFeatured', 'isHot', 'isTrending', 'isNew', 'isTopSelling'];
  booleanFields.forEach(field => {
    if (req.body[field] === 'true') req.body[field] = true;
    if (req.body[field] === 'false') req.body[field] = false;
  });

  const category = await Category.create(req.body);

  // Invalidate categories cache
  cache.delete(CACHE_KEYS.CATEGORIES_LIST);
  cache.invalidateByPrefix('hot_categories');
  cache.invalidateByPrefix('featured_categories');

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  // Handle image upload if present
  if (req.files && req.files.image) {
    const file = req.files.image;
    
    // Delete old image from Cloudinary if exists
    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }
    
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'categories',
      width: 800,
      height: 600,
      crop: 'fill',
      quality: 'auto:good'
    });

    req.body.image = {
      public_id: result.public_id,
      url: result.secure_url
    };
  }

  // Parse JSON fields if they come as strings
  if (typeof req.body.gradient === 'string') {
    try {
      req.body.gradient = JSON.parse(req.body.gradient);
    } catch (e) {
      // Keep as is if not valid JSON
    }
  }
  
  if (typeof req.body.badge === 'string') {
    try {
      req.body.badge = JSON.parse(req.body.badge);
    } catch (e) {
      // Keep as is if not valid JSON
    }
  }

  // Convert string booleans to actual booleans
  const booleanFields = ['isActive', 'isFeatured', 'isHot', 'isTrending', 'isNew', 'isTopSelling'];
  booleanFields.forEach(field => {
    if (req.body[field] === 'true') req.body[field] = true;
    if (req.body[field] === 'false') req.body[field] = false;
  });

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Invalidate categories cache
  cache.delete(CACHE_KEYS.CATEGORIES_LIST);
  cache.invalidateByPrefix('hot_categories');
  cache.invalidateByPrefix('featured_categories');

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  // Check if category has products
  const productsCount = await Product.countDocuments({ category: req.params.id });
  if (productsCount > 0) {
    return next(new ErrorResponse(`Cannot delete category with ${productsCount} products. Please move or delete products first.`, 400));
  }

  // Delete image from Cloudinary if exists
  if (category.image?.public_id) {
    await cloudinary.uploader.destroy(category.image.public_id);
  }

  await category.deleteOne();

  // Invalidate categories cache
  cache.delete(CACHE_KEYS.CATEGORIES_LIST);
  cache.invalidateByPrefix('hot_categories');
  cache.invalidateByPrefix('featured_categories');

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Upload category image
// @route   POST /api/categories/upload-image
// @access  Private/Admin
exports.uploadCategoryImage = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.image) {
    return next(new ErrorResponse('Please upload an image', 400));
  }

  const file = req.files.image;

  // Validate file type
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check file size (5MB max)
  if (file.size > 5000000) {
    return next(new ErrorResponse('Please upload an image less than 5MB', 400));
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: 'categories',
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto:good'
  });

  res.status(200).json({
    success: true,
    data: {
      public_id: result.public_id,
      url: result.secure_url
    }
  });
});

// @desc    Get category statistics
// @route   GET /api/categories/stats
// @access  Private/Admin
exports.getCategoryStats = asyncHandler(async (req, res, next) => {
  const [
    total,
    active,
    inactive,
    featured,
    hot,
    trending,
    newCategories,
    topSelling
  ] = await Promise.all([
    Category.countDocuments(),
    Category.countDocuments({ isActive: true }),
    Category.countDocuments({ isActive: false }),
    Category.countDocuments({ isFeatured: true }),
    Category.countDocuments({ isHot: true }),
    Category.countDocuments({ isTrending: true }),
    Category.countDocuments({ isNew: true }),
    Category.countDocuments({ isTopSelling: true })
  ]);

  // Get categories with product counts
  const categoriesWithProducts = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products'
      }
    },
    {
      $project: {
        name: 1,
        productsCount: { $size: '$products' },
        icon: 1,
        image: 1,
        gradient: 1
      }
    },
    {
      $sort: { productsCount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Calculate total products
  const totalProducts = await Product.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      total,
      active,
      inactive,
      featured,
      hot,
      trending,
      new: newCategories,
      topSelling,
      totalProducts,
      topCategories: categoriesWithProducts
    }
  });
});

// @desc    Toggle category active status
// @route   PATCH /api/categories/:id/toggle-active
// @access  Private/Admin
exports.toggleCategoryActive = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  category.isActive = !category.isActive;
  await category.save();

  res.status(200).json({
    success: true,
    message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
    data: category
  });
});

// @desc    Toggle category featured status
// @route   PATCH /api/categories/:id/toggle-featured
// @access  Private/Admin
exports.toggleCategoryFeatured = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  category.isFeatured = !category.isFeatured;
  await category.save();

  // Invalidate featured categories cache
  cache.invalidateByPrefix(CACHE_KEYS.FEATURED_CATEGORIES);

  res.status(200).json({
    success: true,
    message: `Category ${category.isFeatured ? 'marked as featured' : 'removed from featured'}`,
    data: category
  });
});

// @desc    Toggle category hot status
// @route   PATCH /api/categories/:id/toggle-hot
// @access  Private/Admin
exports.toggleCategoryHot = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  category.isHot = !category.isHot;
  // Update badge if hot
  if (category.isHot) {
    category.badge = { text: '🔥 Hot', color: 'bg-red-500' };
  } else if (!category.isTrending && !category.isNew) {
    category.badge = { text: '', color: '' };
  }
  await category.save();

  // Invalidate hot categories cache
  cache.invalidateByPrefix(CACHE_KEYS.HOT_CATEGORIES);

  res.status(200).json({
    success: true,
    message: `Category ${category.isHot ? 'marked as hot' : 'removed from hot'}`,
    data: category
  });
});

// @desc    Toggle category trending status
// @route   PATCH /api/categories/:id/toggle-trending
// @access  Private/Admin
exports.toggleCategoryTrending = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  category.isTrending = !category.isTrending;
  // Update badge if trending
  if (category.isTrending) {
    category.badge = { text: '📈 Trending', color: 'bg-purple-500' };
  } else if (!category.isHot && !category.isNew) {
    category.badge = { text: '', color: '' };
  }
  await category.save();

  res.status(200).json({
    success: true,
    message: `Category ${category.isTrending ? 'marked as trending' : 'removed from trending'}`,
    data: category
  });
});

// @desc    Toggle category new status
// @route   PATCH /api/categories/:id/toggle-new
// @access  Private/Admin
exports.toggleCategoryNew = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  category.isNew = !category.isNew;
  // Update badge if new
  if (category.isNew) {
    category.badge = { text: '✨ New', color: 'bg-emerald-500' };
  } else if (!category.isHot && !category.isTrending) {
    category.badge = { text: '', color: '' };
  }
  await category.save();

  res.status(200).json({
    success: true,
    message: `Category ${category.isNew ? 'marked as new' : 'removed from new'}`,
    data: category
  });
});

// @desc    Toggle category top selling status
// @route   PATCH /api/categories/:id/toggle-top-selling
// @access  Private/Admin
exports.toggleCategoryTopSelling = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  category.isTopSelling = !category.isTopSelling;
  // Update badge if top selling
  if (category.isTopSelling) {
    category.badge = { text: '⭐ Top', color: 'bg-yellow-500' };
  } else if (!category.isHot && !category.isTrending && !category.isNew) {
    category.badge = { text: '', color: '' };
  }
  await category.save();

  res.status(200).json({
    success: true,
    message: `Category ${category.isTopSelling ? 'marked as top selling' : 'removed from top selling'}`,
    data: category
  });
});

// @desc    Update category order
// @route   PATCH /api/categories/:id/order
// @access  Private/Admin
exports.updateCategoryOrder = asyncHandler(async (req, res, next) => {
  const { order } = req.body;
  
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  category.order = order;
  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category order updated successfully',
    data: category
  });
});

// @desc    Bulk update category orders
// @route   PATCH /api/categories/bulk-order
// @access  Private/Admin
exports.bulkUpdateCategoryOrder = asyncHandler(async (req, res, next) => {
  const { categories } = req.body; // Array of { id, order }

  if (!categories || !Array.isArray(categories)) {
    return next(new ErrorResponse('Please provide an array of categories with orders', 400));
  }

  const bulkOps = categories.map(cat => ({
    updateOne: {
      filter: { _id: cat.id },
      update: { order: cat.order }
    }
  }));

  await Category.bulkWrite(bulkOps);

  res.status(200).json({
    success: true,
    message: 'Category orders updated successfully'
  });
});

// @desc    Get all categories with pagination (Admin)
// @route   GET /api/categories/admin/all
// @access  Private/Admin
exports.getAllCategoriesAdmin = asyncHandler(async (req, res, next) => {
  const { search, isActive, isFeatured, isHot, isTrending, page = 1, limit = 20 } = req.query;
  
  const filters = {};
  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (isActive !== undefined && isActive !== '') {
    filters.isActive = isActive === 'true';
  }
  if (isFeatured !== undefined && isFeatured !== '') {
    filters.isFeatured = isFeatured === 'true';
  }
  if (isHot !== undefined && isHot !== '') {
    filters.isHot = isHot === 'true';
  }
  if (isTrending !== undefined && isTrending !== '') {
    filters.isTrending = isTrending === 'true';
  }

  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    Category.find(filters)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Category.countDocuments(filters)
  ]);

  // Get product counts for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({ category: category._id });
      return {
        ...category.toObject(),
        productCount
      };
    })
  );

  res.status(200).json({
    success: true,
    data: categoriesWithCount,
    count: categoriesWithCount.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit)
  });
});

// @desc    Sync product counts for all categories
// @route   POST /api/categories/sync-counts
// @access  Private/Admin
exports.syncProductCounts = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();

  for (const category of categories) {
    const count = await Product.countDocuments({ category: category._id });
    category.productCount = count;
    await category.save();
  }

  res.status(200).json({
    success: true,
    message: `Product counts synced for ${categories.length} categories`
  });
});
