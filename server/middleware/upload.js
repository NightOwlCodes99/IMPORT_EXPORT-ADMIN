const { ErrorResponse } = require('./error');

// File upload validation middleware
exports.validateFileUpload = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file || req.files.image;

  // Make sure the file is an image
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check file size (5MB max)
  if (file.size > process.env.MAX_FILE_SIZE || file.size > 5000000) {
    return next(new ErrorResponse('Please upload an image less than 5MB', 400));
  }

  next();
};

// Multiple files validation
exports.validateMultipleFiles = (maxFiles = 5) => {
  return (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorResponse('Please upload files', 400));
    }

    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

    if (files.length > maxFiles) {
      return next(new ErrorResponse(`You can only upload up to ${maxFiles} files`, 400));
    }

    // Validate each file
    for (let file of files) {
      if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('All files must be images', 400));
      }

      if (file.size > 5000000) {
        return next(new ErrorResponse('Each image must be less than 5MB', 400));
      }
    }

    next();
  };
};

// Document upload validation (for invoices, etc.)
exports.validateDocumentUpload = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file || req.files.document;

  // Allowed document types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return next(new ErrorResponse('Please upload a valid document (PDF, DOC, DOCX, XLS, XLSX)', 400));
  }

  // Check file size (10MB max for documents)
  if (file.size > 10000000) {
    return next(new ErrorResponse('Please upload a document less than 10MB', 400));
  }

  next();
};
