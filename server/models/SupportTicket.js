const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['user', 'admin', 'support', 'assigned'],
    default: 'user'
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    size: Number
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

const supportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true
    // Auto-generated in pre-save hook
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['general', 'order', 'payment', 'shipping', 'product', 'account', 'technical', 'other'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'waiting-reply', 'resolved', 'closed'],
    default: 'open'
  },
  department: {
    type: String,
    enum: ['support', 'sales', 'technical', 'billing', 'shipping', 'administration', 'general'],
    default: 'support'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedRole: {
    type: String,
    enum: ['super-admin', 'manager', 'cto', 'hr', 'sales', 'support', 'accountant', 'labour', null],
    default: null
  },
  messages: [messageSchema],
  // Reference to related entities
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  relatedQuote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
  },
  relatedShipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment'
  },
  // Ticket metadata
  lastReplyAt: {
    type: Date
  },
  lastReplyBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  closedAt: Date,
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Rating/Feedback after resolution
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },
  // Internal notes (visible only to admin/support)
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Tags for organization
  tags: [String],
  // Track if user has unread messages
  hasUnreadByUser: {
    type: Boolean,
    default: false
  },
  hasUnreadByAdmin: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate unique ticket ID before saving
supportTicketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const count = await mongoose.model('SupportTicket').countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    this.ticketId = `TKT-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Indexes for faster queries
supportTicketSchema.index({ user: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ assignedTo: 1 });
supportTicketSchema.index({ department: 1 });
supportTicketSchema.index({ priority: 1 });
// ticketId index already created by unique: true

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
