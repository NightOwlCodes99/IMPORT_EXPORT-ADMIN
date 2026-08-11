const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
    // Not required - auto-generated in pre-save hook
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Not required - admin can create orders without buyer
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
    // Not required - quotes may not have supplier assigned
  },
  quote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
    // Reference to original quote if converted from quote
  },
  orderItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
      // Not required - custom quote items may not have product reference
    },
    name: {
      type: String,
      required: true
    },
    productName: {
      type: String
      // For manual orders - can be used instead of name
    },
    productDescription: {
      type: String
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: true
    },
    sku: String,
    image: String
  }],
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    company: String,
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      default: ''
    },
    street: {
      type: String,
      default: 'To be confirmed'
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    zipCode: {
      type: String,
      default: '00000'
    },
    country: {
      type: String,
      required: true
    }
  },
  billingAddress: {
    fullName: String,
    company: String,
    phone: String,
    email: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  shipmentInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment'
  },
  pricing: {
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    discount: {
      type: Number,
      default: 0.0
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0
    }
  },
  // Payment Terms & Advance Payment
  paymentTerms: {
    type: String,
    default: ''
  },
  advancePayment: {
    amount: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: Date,
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }
  },
  remainingPayment: {
    amount: {
      type: Number,
      default: 0
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: Date,
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Awaiting Payment', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  orderNotes: {
    type: String,
    maxlength: 1000
  },
  timeline: [{
    status: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true
});

// Generate unique order ID before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Database indexes for faster queries
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ supplier: 1 });
orderSchema.index({ 'orderItems.product': 1 });

module.exports = mongoose.model('Order', orderSchema);
