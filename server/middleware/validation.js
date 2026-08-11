const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User validation rules
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['buyer', 'supplier', 'admin', 'importer', 'exporter', 'customer', 'user']).withMessage('Invalid role')
];

exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Product validation rules
exports.createProductValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  body('supplier')
    .notEmpty().withMessage('Supplier is required')
    .isMongoId().withMessage('Invalid supplier ID'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('priceMin')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('moq')
    .notEmpty().withMessage('MOQ is required')
    .isInt({ min: 1 }).withMessage('MOQ must be at least 1')
];

// Quote validation rules
exports.createQuoteValidation = [
  body('product')
    .optional()
    .isMongoId().withMessage('Invalid product ID'),
  body('productName')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .custom((value) => {
      const num = Number(value);
      if (isNaN(num) || !Number.isInteger(num) || num < 1) {
        throw new Error('Quantity must be a positive integer (at least 1)');
      }
      return true;
    }),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('specifications')
    .optional()
    .isLength({ max: 1000 }).withMessage('Specifications cannot exceed 1000 characters'),
  body('deliveryLocation.country')
    .trim()
    .notEmpty().withMessage('Delivery country is required'),
  body('urgency')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Invalid urgency level')
];

// Order validation rules
exports.createOrderValidation = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.product')
    .notEmpty().withMessage('Product is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('shippingAddress.street')
    .trim()
    .notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  body('shippingAddress.country')
    .trim()
    .notEmpty().withMessage('Country is required')
];

// Contact validation rules
exports.contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 10 }).withMessage('Phone number must be at least 10 digits'),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters')
];

// Review validation rules
exports.reviewValidation = [
  body('product')
    .notEmpty().withMessage('Product is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters')
];

// MongoDB ID validation
exports.validateId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];
