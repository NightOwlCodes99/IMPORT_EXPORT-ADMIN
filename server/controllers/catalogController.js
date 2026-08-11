const asyncHandler = require('express-async-handler');
const Catalog = require('../models/Catalog');
const Category = require('../models/Category');
const { ErrorResponse } = require('../middleware/error');
const cloudinary = require('cloudinary').v2;
const sendEmail = require('../config/email');
const { catalogDownloadEmailTemplate } = require('../mails/templates/catalogDownloadEmail');

// @desc    Get all catalogs (public)
// @route   GET /api/catalogs
// @access  Public
exports.getCatalogs = asyncHandler(async (req, res, next) => {
  const { category, search, featured, limit = 10, page = 1 } = req.query;
  const parsedLimit = Math.min(parseInt(limit, 10) || 10, 50);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  
  const query = { isActive: true };
  
  if (category) {
    query.category = category;
  }
  
  if (featured === 'true') {
    query.isFeatured = true;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  
  const skip = (parsedPage - 1) * parsedLimit;
  
  const [catalogs, total] = await Promise.all([
    Catalog.find(query)
      .populate('category', 'name slug icon image')
      .sort({ isFeatured: -1, publishedAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Catalog.countDocuments(query)
  ]);
  
  res.status(200).json({
    success: true,
    count: catalogs.length,
    total,
    pages: Math.ceil(total / parsedLimit),
    page: parsedPage,
    data: catalogs
  });
});

// @desc    Get single catalog
// @route   GET /api/catalogs/:id
// @access  Public
exports.getCatalog = asyncHandler(async (req, res, next) => {
  const catalog = await Catalog.findById(req.params.id)
    .populate('category', 'name slug icon image description')
    .populate('uploadedBy', 'name email');
  
  if (!catalog) {
    return next(new ErrorResponse('Catalog not found', 404));
  }
  
  // Increment view count
  await catalog.incrementView();
  
  res.status(200).json({
    success: true,
    data: catalog
  });
});

// @desc    Get catalogs by category
// @route   GET /api/catalogs/category/:categoryId
// @access  Public
exports.getCatalogsByCategory = asyncHandler(async (req, res, next) => {
  const catalogs = await Catalog.find({ 
    category: req.params.categoryId,
    isActive: true 
  })
    .populate('category', 'name slug icon image')
    .sort({ isFeatured: -1, publishedAt: -1 })
    .lean();
  
  res.status(200).json({
    success: true,
    count: catalogs.length,
    data: catalogs
  });
});

// @desc    Get featured catalogs
// @route   GET /api/catalogs/featured
// @access  Public
exports.getFeaturedCatalogs = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 6;
  
  const catalogs = await Catalog.find({ 
    isActive: true,
    isFeatured: true 
  })
    .populate('category', 'name slug icon image')
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
  
  res.status(200).json({
    success: true,
    count: catalogs.length,
    data: catalogs
  });
});

// @desc    Track catalog view
// @route   POST /api/catalogs/:id/view
// @access  Public
exports.trackCatalogView = asyncHandler(async (req, res, next) => {
  const catalog = await Catalog.findById(req.params.id);
  
  if (!catalog) {
    return next(new ErrorResponse('Catalog not found', 404));
  }
  
  // Increment view count
  await catalog.incrementView();
  
  res.status(200).json({
    success: true,
    data: {
      views: catalog.views
    }
  });
});

// @desc    Download catalog (with email notification)
// @route   POST /api/catalogs/:id/download
// @access  Public (optional auth for tracking)
exports.downloadCatalog = asyncHandler(async (req, res, next) => {
  const catalog = await Catalog.findById(req.params.id)
    .populate('category', 'name');
  
  if (!catalog) {
    return next(new ErrorResponse('Catalog not found', 404));
  }
  
  // Increment download count and view count
  await catalog.incrementDownload();
  await catalog.incrementView();
  
  // If user provided email, send download confirmation
  const { email, name } = req.body;
  
  if (email) {
    try {
      const emailContent = catalogDownloadEmailTemplate(
        name || 'Valued Customer',
        catalog.title,
        catalog.category?.name || 'General',
        catalog.pdfFile.url
      );
      
      await sendEmail({
        to: email,
        subject: `Your Catalog Download: ${catalog.title}`,
        html: emailContent
      });
    } catch (error) {
      console.error('Failed to send download notification email:', error);
      // Don't fail the download if email fails
    }
  }
  
  res.status(200).json({
    success: true,
    message: 'Download tracked successfully',
    data: {
      downloadUrl: catalog.pdfFile.url,
      fileName: catalog.pdfFile.fileName || `${catalog.title}.pdf`,
      downloads: catalog.downloads
    }
  });
});

// @desc    Get catalog statistics
// @route   GET /api/catalogs/stats
// @access  Private (Admin)
exports.getCatalogStats = asyncHandler(async (req, res, next) => {
  const totalCatalogs = await Catalog.countDocuments();
  const activeCatalogs = await Catalog.countDocuments({ isActive: true });
  const featuredCatalogs = await Catalog.countDocuments({ isFeatured: true });
  
  const downloadStats = await Catalog.aggregate([
    {
      $group: {
        _id: null,
        totalDownloads: { $sum: '$downloads' },
        totalViews: { $sum: '$views' }
      }
    }
  ]);
  
  const categoryCounts = await Catalog.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    { $unwind: '$categoryInfo' },
    {
      $project: {
        category: '$categoryInfo.name',
        count: 1
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      totalCatalogs,
      activeCatalogs,
      featuredCatalogs,
      totalDownloads: downloadStats[0]?.totalDownloads || 0,
      totalViews: downloadStats[0]?.totalViews || 0,
      categoryCounts
    }
  });
});

// ==================== ADMIN ENDPOINTS ====================

// @desc    Get all catalogs (Admin)
// @route   GET /api/catalogs/admin/all
// @access  Private (Admin)
exports.getAllCatalogsAdmin = asyncHandler(async (req, res, next) => {
  const { category, search, status, page = 1, limit = 20 } = req.query;
  const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  
  const query = {};
  
  if (category) {
    query.category = category;
  }
  
  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  const skip = (parsedPage - 1) * parsedLimit;
  
  const [catalogs, total] = await Promise.all([
    Catalog.find(query)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Catalog.countDocuments(query)
  ]);
  
  res.status(200).json({
    success: true,
    count: catalogs.length,
    total,
    pages: Math.ceil(total / parsedLimit),
    page: parsedPage,
    data: catalogs
  });
});

// @desc    Create catalog
// @route   POST /api/catalogs
// @access  Private (Admin)
exports.createCatalog = asyncHandler(async (req, res, next) => {
  req.body.uploadedBy = req.user.id;
  
  // Validate category exists
  const category = await Category.findById(req.body.category);
  if (!category) {
    return next(new ErrorResponse('Invalid category', 400));
  }
  
  const catalog = await Catalog.create(req.body);
  
  await catalog.populate('category', 'name slug icon image');
  
  res.status(201).json({
    success: true,
    message: 'Catalog created successfully',
    data: catalog
  });
});

// @desc    Update catalog
// @route   PUT /api/catalogs/:id
// @access  Private (Admin)
exports.updateCatalog = asyncHandler(async (req, res, next) => {
  let catalog = await Catalog.findById(req.params.id);
  
  if (!catalog) {
    return next(new ErrorResponse('Catalog not found', 404));
  }
  
  // If updating category, validate it exists
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return next(new ErrorResponse('Invalid category', 400));
    }
  }
  
  catalog = await Catalog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('category', 'name slug icon image');
  
  res.status(200).json({
    success: true,
    message: 'Catalog updated successfully',
    data: catalog
  });
});

// @desc    Delete catalog
// @route   DELETE /api/catalogs/:id
// @access  Private (Admin)
exports.deleteCatalog = asyncHandler(async (req, res, next) => {
  const catalog = await Catalog.findById(req.params.id);
  
  if (!catalog) {
    return next(new ErrorResponse('Catalog not found', 404));
  }
  
  // Delete PDF from cloudinary
  if (catalog.pdfFile?.public_id) {
    try {
      await cloudinary.uploader.destroy(catalog.pdfFile.public_id, { resource_type: 'raw' });
    } catch (error) {
      console.error('Failed to delete PDF from Cloudinary:', error);
    }
  }
  
  // Delete cover image from cloudinary
  if (catalog.coverImage?.public_id) {
    try {
      await cloudinary.uploader.destroy(catalog.coverImage.public_id);
    } catch (error) {
      console.error('Failed to delete cover image from Cloudinary:', error);
    }
  }
  
  // Delete thumbnails from cloudinary
  if (catalog.thumbnails?.length > 0) {
    for (const thumb of catalog.thumbnails) {
      if (thumb.public_id) {
        try {
          await cloudinary.uploader.destroy(thumb.public_id);
        } catch (error) {
          console.error('Failed to delete thumbnail from Cloudinary:', error);
        }
      }
    }
  }
  
  await catalog.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Catalog deleted successfully',
    data: {}
  });
});

// @desc    Upload catalog PDF
// @route   POST /api/catalogs/upload-pdf
// @access  Private (Admin)
exports.uploadCatalogPdf = asyncHandler(async (req, res, next) => {

  if (!req.files || !req.files.pdf) {
    
    return next(new ErrorResponse('Please upload a PDF file', 400));
  }
  
  const file = req.files.pdf;

  // Validate file type
  if (file.mimetype !== 'application/pdf') {
    
    return next(new ErrorResponse('Please upload a valid PDF file', 400));
  }
  
  // Check file size (max 50MB)
  if (file.size > 50 * 1024 * 1024) {
    
    return next(new ErrorResponse('PDF file size should be less than 50MB', 400));
  }
  
  try {

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: 'raw',
      folder: 'catalogs/pdfs'
    });

    res.status(200).json({
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        fileName: file.name,
        fileSize: file.size
      }
    });
  } catch (cloudinaryError) {
    console.error('❌ Cloudinary upload error:', cloudinaryError);
    return next(new ErrorResponse('Failed to upload PDF to cloud storage', 500));
  }
});

// @desc    Upload catalog cover image
// @route   POST /api/catalogs/upload-cover
// @access  Private (Admin)
exports.uploadCatalogCover = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.image) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }
  
  const file = req.files.image;
  
  // Validate file type
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload a valid image file', 400));
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return next(new ErrorResponse('Image size should be less than 5MB', 400));
  }
  
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: 'catalogs/covers',
    transformation: [
      { width: 800, height: 1000, crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  });
  
  res.status(200).json({
    success: true,
    data: {
      public_id: result.public_id,
      url: result.secure_url
    }
  });
});

// @desc    Toggle catalog active status
// @route   PATCH /api/catalogs/:id/toggle-active
// @access  Private (Admin)
exports.toggleCatalogActive = asyncHandler(async (req, res, next) => {
  const catalog = await Catalog.findById(req.params.id);
  
  if (!catalog) {
    return next(new ErrorResponse('Catalog not found', 404));
  }
  
  catalog.isActive = !catalog.isActive;
  await catalog.save();
  
  res.status(200).json({
    success: true,
    message: `Catalog ${catalog.isActive ? 'activated' : 'deactivated'} successfully`,
    data: catalog
  });
});

// @desc    Toggle catalog featured status
// @route   PATCH /api/catalogs/:id/toggle-featured
// @access  Private (Admin)
exports.toggleCatalogFeatured = asyncHandler(async (req, res, next) => {
  const catalog = await Catalog.findById(req.params.id);
  
  if (!catalog) {
    return next(new ErrorResponse('Catalog not found', 404));
  }
  
  catalog.isFeatured = !catalog.isFeatured;
  await catalog.save();
  
  res.status(200).json({
    success: true,
    message: `Catalog ${catalog.isFeatured ? 'marked as featured' : 'removed from featured'} successfully`,
    data: catalog
  });
});

// @desc    Get categories with catalog counts
// @route   GET /api/catalogs/categories-with-counts
// @access  Public
exports.getCategoriesWithCatalogCounts = asyncHandler(async (req, res, next) => {
  const categoryCounts = await Catalog.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', catalogCount: { $sum: 1 }, totalDownloads: { $sum: '$downloads' } } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: '$category' },
    { $match: { 'category.isActive': true } },
    {
      $project: {
        _id: '$category._id',
        name: '$category.name',
        slug: '$category.slug',
        icon: '$category.icon',
        image: '$category.image',
        description: '$category.description',
        catalogCount: 1,
        totalDownloads: 1
      }
    },
    { $sort: { catalogCount: -1 } }
  ]);
  
  res.status(200).json({
    success: true,
    count: categoryCounts.length,
    data: categoryCounts
  });
});
