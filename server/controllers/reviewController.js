const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { ErrorResponse } = require('../middleware/error');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  let query = Review.find(req.queryFilter || {})
    .populate('user', 'name avatar')
    .populate('product', 'name images');

  // Apply sorting
  if (req.sortBy) {
    query = query.sort(req.sortBy);
  }

  // Apply pagination
  query = query.skip(req.startIndex).limit(req.limit);

  const reviews = await query;

  res.status(200).json({
    success: true,
    count: reviews.length,
    pagination: req.pagination,
    data: reviews
  });
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = asyncHandler(async (req, res, next) => {
  const productId = req.params.productId;
  
  // Validate productId format
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new ErrorResponse('Invalid product ID format', 400));
  }
  
  // Find all reviews for this product (showing all, including unapproved for now)
  const reviews = await Review.find({ product: productId })
    .populate('user', 'name avatar')
    .sort('-createdAt');

  // Calculate average rating (need ObjectId for aggregate)
  const objectId = new mongoose.Types.ObjectId(productId);
  const stats = await Review.aggregate([
    { $match: { product: objectId } },
    { $group: { 
      _id: null, 
      avgRating: { $avg: '$rating' },
      totalReviews: { $sum: 1 }
    }}
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    stats: stats.length > 0 ? stats[0] : { avgRating: 0, totalReviews: 0 },
    data: reviews
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'name avatar')
    .populate('product', 'name images');

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private/Buyer
exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  // Check if product exists
  const product = await Product.findById(req.body.product);
  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.body.product}`, 404));
  }

  // Set supplier from product (optional)
  req.body.supplier = product.supplier || null;

  // Check if user has already reviewed this product
  let existingReview = await Review.findOne({
    user: req.user.id,
    product: req.body.product
  });

  // Check if user has ordered this product (for verified purchase badge)
  const hasOrdered = await Order.findOne({
    buyer: req.user.id,
    'orderItems.product': req.body.product,
    orderStatus: 'Delivered'
  });

  req.body.isVerifiedPurchase = !!hasOrdered;
  if (hasOrdered) {
    req.body.order = hasOrdered._id;
  }

  // Auto-approve reviews for now (can add moderation later)
  req.body.isApproved = true;

  let review;
  if (existingReview) {
    // Update existing review
    existingReview.rating = req.body.rating;
    existingReview.title = req.body.title;
    existingReview.comment = req.body.comment;
    existingReview.isApproved = true;
    review = await existingReview.save();

  } else {
    // Create new review
    review = await Review.create(req.body);
    
  }

  // Update product rating
  await updateProductRating(req.body.product);

  res.status(201).json({
    success: true,
    data: review,
    message: existingReview ? 'Review updated successfully' : 'Review created successfully'
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is review owner
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this review', 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Update product rating
  await updateProductRating(review.product);

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is review owner or admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this review', 401));
  }

  const productId = review.product;
  await review.deleteOne();

  // Update product rating
  await updateProductRating(productId);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Toggle review helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.toggleHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
  }

  const userId = req.user.id;
  const index = review.helpfulBy.indexOf(userId);

  if (index > -1) {
    // User already marked as helpful, remove
    review.helpfulBy.splice(index, 1);
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
  } else {
    // Add user to helpful
    review.helpfulBy.push(userId);
    review.helpfulCount = review.helpfulCount + 1;
  }

  await review.save();

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Get my reviews
// @route   GET /api/reviews/my/reviews
// @access  Private
exports.getMyReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id })
    .populate('product', 'name images')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// Helper function to update product rating
async function updateProductRating(productId) {
  // Convert to ObjectId for aggregate to work
  const objectId = new mongoose.Types.ObjectId(productId);
  
  const stats = await Review.aggregate([
    { $match: { product: objectId } },
    { $group: { 
      _id: null, 
      avgRating: { $avg: '$rating' },
      totalReviews: { $sum: 1 }
    }}
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      totalReviews: 0
    });
  }
}
