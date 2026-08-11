const mongoose = require('mongoose');

const catalogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide catalog title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide category for the catalog']
  },
  pdfFile: {
    public_id: {
      type: String,
      required: [true, 'Please upload a PDF file']
    },
    url: {
      type: String,
      required: [true, 'Please upload a PDF file']
    },
    fileName: String,
    fileSize: Number
  },
  coverImage: {
    public_id: String,
    url: String
  },
  thumbnails: [{
    public_id: String,
    url: String
  }],
  totalPages: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  version: {
    type: String,
    default: '1.0'
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    fileType: {
      type: String,
      default: 'application/pdf'
    },
    language: {
      type: String,
      default: 'English'
    },
    lastUpdated: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
catalogSchema.index({ category: 1, isActive: 1 });
catalogSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Pre-save middleware
catalogSchema.pre('save', function(next) {
  if (this.isModified('pdfFile')) {
    this.metadata.lastUpdated = new Date();
  }
  next();
});

// Increment download count
catalogSchema.methods.incrementDownload = async function() {
  this.downloads += 1;
  await this.save();
};

// Increment view count
catalogSchema.methods.incrementView = async function() {
  this.views += 1;
  await this.save();
};

module.exports = mongoose.model('Catalog', catalogSchema);
