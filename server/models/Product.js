const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  summary: {
    type: String,
    maxlength: [3000, 'Summary cannot exceed 3000 characters']
  },
  sku: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: false  // Made optional - admin products don't need supplier
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: false
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  moq: {
    type: Number,
    required: [true, 'Please provide Minimum Order Quantity'],
    min: 1
  },
  unit: {
    type: String,
    default: 'pieces'
  },
  stock: {
    type: Number,
    default: 0
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  specifications: [{
    key: String,
    value: String
  }],
  features: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  material: {
    type: String,
    trim: true
  },
  color: [{
    type: String
  }],
  size: [{
    type: String
  }],
  weight: {
    value: Number,
    unit: {
      type: String,
      default: 'kg'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      default: 'cm'
    }
  },
  packaging: {
    type: String,
    maxlength: 500
  },
  leadTime: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      default: 'days'
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
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
  isApproved: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  badges: [{
    type: String,
    enum: ['New', 'Hot Deal', 'Sale', 'Trending', 'Best Seller']
  }],
  certifications: [{
    name: String,
    public_id: String,
    url: String
  }]
}, {
  timestamps: true
});

// Indexing for better search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, supplier: 1 });

module.exports = mongoose.model('Product', productSchema);
