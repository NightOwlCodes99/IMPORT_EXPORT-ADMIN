const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const pendingUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password']
  },
  role: {
    type: String,
    enum: ['buyer', 'supplier', 'admin', 'importer', 'exporter', 'user', 'customer'],
    default: 'user'
  },
  phone: String,
  company: String,
  country: String,
  verificationCode: String,
  verificationCodeExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900 // Automatically delete after 15 minutes (900 seconds)
  }
});

// Hash password before saving
pendingUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate verification code (6 digits)
pendingUserSchema.methods.generateVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  this.verificationCode = crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');
  
  this.verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return code;
};

module.exports = mongoose.model('PendingUser', pendingUserSchema);
