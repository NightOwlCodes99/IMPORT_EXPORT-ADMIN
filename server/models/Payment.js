const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: [
      'Credit Card',
      'Debit Card',
      'PayPal',
      'Stripe',
      'Bank Transfer',
      'Wire Transfer',
      'Letter of Credit',
      'Cash on Delivery',
      'Escrow',
      'Other'
    ]
  },
  paymentGateway: {
    type: String,
    enum: ['Stripe', 'PayPal', 'Razorpay', 'Square', 'Manual'],
    default: 'Stripe'
  },
  gatewayTransactionId: {
    type: String
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Refunded', 'Cancelled'],
    default: 'Pending'
  },
  paymentDetails: {
    cardType: String,
    cardLastFour: String,
    cardholderName: String,
    bankName: String,
    accountNumber: String
  },
  billingAddress: {
    fullName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  refundInfo: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    refundTransactionId: String
  },
  timeline: [{
    status: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  receiptUrl: {
    type: String
  },
  invoiceUrl: {
    type: String
  },
  failureReason: {
    type: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: String
  },
  escrowDetails: {
    isEscrow: {
      type: Boolean,
      default: false
    },
    releaseCondition: String,
    releasedAt: Date
  },
  // Partial Payment Support (for advance payments)
  paymentType: {
    type: String,
    enum: ['Full', 'Advance', 'Remaining', 'Partial'],
    default: 'Full'
  },
  partialPaymentInfo: {
    totalOrderAmount: Number,
    advancePercentage: Number,
    advanceAmount: Number,
    remainingAmount: Number,
    isAdvancePaid: {
      type: Boolean,
      default: false
    },
    isRemainingPaid: {
      type: Boolean,
      default: false
    }
  },
  // Razorpay specific fields
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  razorpayPaymentLinkId: {
    type: String
  },
  razorpayPaymentLinkUrl: {
    type: String
  },
  paymentTerms: {
    type: String,
    maxlength: 500
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate unique transaction ID before saving
paymentSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const count = await mongoose.model('Payment').countDocuments();
    this.transactionId = `TXN-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
