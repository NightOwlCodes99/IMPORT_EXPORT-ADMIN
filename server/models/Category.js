const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide category name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    default: 'fas fa-box'
  },
  image: {
    public_id: String,
    url: String
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subCategories: [{
    type: String,
    trim: true
  }],
  productCount: {
    type: Number,
    default: 0
  },
  gradient: {
    from: {
      type: String,
      default: 'blue-500'
    },
    to: {
      type: String,
      default: 'blue-700'
    }
  },
  order: {
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
  isHot: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isTopSelling: {
    type: Boolean,
    default: false
  },
  badge: {
    text: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: 'bg-emerald-500'
    }
  },
  metadata: {
    keywords: [String],
    metaTitle: String,
    metaDescription: String
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Generate slug before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  }
  next();
});

// Virtual for getting actual product count
categorySchema.virtual('actualProductCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Ensure virtuals are included in JSON
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);
