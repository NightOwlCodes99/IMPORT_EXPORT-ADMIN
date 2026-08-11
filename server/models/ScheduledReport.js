const mongoose = require('mongoose');

const scheduledReportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Report name is required'],
    trim: true,
    maxlength: 100
  },
  reportType: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    required: [true, 'Report type is required']
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: [true, 'Frequency is required']
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
    default: 1 // Monday
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
    default: 1
  },
  time: {
    type: String,
    default: '09:00'
  },
  recipients: [{
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    name: String
  }],
  includeAttachment: {
    type: Boolean,
    default: true
  },
  format: {
    type: String,
    enum: ['pdf', 'csv', 'excel'],
    default: 'pdf'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSentAt: Date,
  nextScheduledAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate next scheduled date
scheduledReportSchema.methods.calculateNextSchedule = function() {
  const now = new Date();
  const [hours, minutes] = this.time.split(':').map(Number);
  let next = new Date();
  
  next.setHours(hours, minutes, 0, 0);
  
  if (this.frequency === 'daily') {
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else if (this.frequency === 'weekly') {
    const currentDay = next.getDay();
    let daysToAdd = this.dayOfWeek - currentDay;
    if (daysToAdd <= 0 || (daysToAdd === 0 && next <= now)) {
      daysToAdd += 7;
    }
    next.setDate(next.getDate() + daysToAdd);
  } else if (this.frequency === 'monthly') {
    next.setDate(this.dayOfMonth);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }
  
  return next;
};

// Pre-save hook to set next scheduled date
scheduledReportSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('frequency') || this.isModified('dayOfWeek') || this.isModified('dayOfMonth') || this.isModified('time')) {
    this.nextScheduledAt = this.calculateNextSchedule();
  }
  next();
});

module.exports = mongoose.model('ScheduledReport', scheduledReportSchema);
