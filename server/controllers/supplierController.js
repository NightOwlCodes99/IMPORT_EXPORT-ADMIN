const asyncHandler = require('express-async-handler');
const Supplier = require('../models/Supplier');
const { ErrorResponse } = require('../middleware/error');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Public
exports.getSuppliers = asyncHandler(async (req, res, next) => {
  let query = Supplier.find(req.queryFilter || {});

  // Apply search
  if (req.searchQuery) {
    query = query.find({
      $or: [
        { companyName: { $regex: req.searchQuery, $options: 'i' } },
        { country: { $regex: req.searchQuery, $options: 'i' } },
        { description: { $regex: req.searchQuery, $options: 'i' } }
      ]
    });
  }

  // Apply sorting
  if (req.sortBy) {
    query = query.sort(req.sortBy);
  }

  // Apply pagination
  query = query.skip(req.startIndex).limit(req.limit);

  const suppliers = await query;

  res.status(200).json({
    success: true,
    count: suppliers.length,
    pagination: req.pagination,
    data: suppliers
  });
});

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Public
exports.getSupplier = asyncHandler(async (req, res, next) => {
  const supplier = await Supplier.findById(req.params.id)
    .populate('user', 'name email');

  if (!supplier) {
    return next(new ErrorResponse(`Supplier not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: supplier
  });
});

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private
exports.createSupplier = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  // Check if user already has a supplier profile
  const existingSupplier = await Supplier.findOne({ user: req.user.id });
  if (existingSupplier) {
    return next(new ErrorResponse('User already has a supplier profile', 400));
  }

  const supplier = await Supplier.create(req.body);

  res.status(201).json({
    success: true,
    data: supplier
  });
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private
exports.updateSupplier = asyncHandler(async (req, res, next) => {
  let supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return next(new ErrorResponse(`Supplier not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is supplier owner or admin
  if (supplier.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this supplier', 401));
  }

  supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: supplier
  });
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
exports.deleteSupplier = asyncHandler(async (req, res, next) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return next(new ErrorResponse(`Supplier not found with id of ${req.params.id}`, 404));
  }

  await supplier.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Supplier deleted successfully'
  });
});

// @desc    Verify supplier
// @route   PUT /api/suppliers/:id/verify
// @access  Private/Admin
exports.verifySupplier = asyncHandler(async (req, res, next) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return next(new ErrorResponse(`Supplier not found with id of ${req.params.id}`, 404));
  }

  supplier.isVerified = true;
  supplier.verificationDate = Date.now();
  await supplier.save();

  res.status(200).json({
    success: true,
    data: supplier
  });
});

// @desc    Get verified suppliers
// @route   GET /api/suppliers/verified
// @access  Public
exports.getVerifiedSuppliers = asyncHandler(async (req, res, next) => {
  const suppliers = await Supplier.find({ isVerified: true })
    .sort('-rating')
    .limit(20);

  res.status(200).json({
    success: true,
    count: suppliers.length,
    data: suppliers
  });
});

// @desc    Get supplier statistics
// @route   GET /api/suppliers/stats
// @access  Private/Admin
exports.getSupplierStats = asyncHandler(async (req, res, next) => {
  const totalSuppliers = await Supplier.countDocuments();
  const verifiedSuppliers = await Supplier.countDocuments({ isVerified: true });
  const activeSuppliers = await Supplier.countDocuments({ isActive: true });

  const topSuppliers = await Supplier.find()
    .sort('-rating')
    .limit(5)
    .select('companyName rating country');

  res.status(200).json({
    success: true,
    data: {
      total: totalSuppliers,
      verified: verifiedSuppliers,
      active: activeSuppliers,
      unverified: totalSuppliers - verifiedSuppliers,
      topSuppliers
    }
  });
});
