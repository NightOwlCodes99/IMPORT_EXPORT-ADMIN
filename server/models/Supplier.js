const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Please provide company name'],
    trim: true
  },
  businessType: {
    type: String,
    enum: ['Manufacturer', 'Wholesaler', 'Distributor', 'Trading Company'],
    required: true
  },
  taxId: {
    type: String,
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  yearEstablished: {
    type: Number,
    min: 1900
  },
  businessLicense: {
    public_id: String,
    url: String
  },
  certificates: [{
    name: String,
    public_id: String,
    url: String
  }],
  // Text-based certifications (ISO, CE, etc.)
  certifications: [{
    type: String,
    trim: true
  }],
  productCategories: [{
    type: String
  }],
  mainProducts: {
    type: String,
    maxlength: 500
  },
  yearsInBusiness: {
    type: Number,
    min: 0
  },
  numberOfEmployees: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+']
  },
  annualRevenue: {
    type: String,
    enum: ['< $100K', '$100K - $500K', '$500K - $1M', '$1M - $5M', '$5M+']
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
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
  responseTime: {
    type: Number, // in hours
    default: 24
  },
  // Address details (structured)
  country: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  state: {
    type: String,
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: 2000
  },
  logo: {
    public_id: String,
    url: String
  },
  coverImage: {
    public_id: String,
    url: String
  },
  // Contact information
  contact: {
    phone: String,
    email: String,
    fax: String,
    whatsapp: String
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String
  },
  // Business capabilities
  paymentTerms: [{
    type: String,
    trim: true
  }],
  shippingMethods: [{
    type: String,
    trim: true
  }],
  minimumOrderValue: {
    type: Number,
    min: 0
  },
  leadTime: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);
