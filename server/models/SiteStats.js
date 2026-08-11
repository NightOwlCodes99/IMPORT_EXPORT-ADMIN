const mongoose = require('mongoose');

const siteStatsSchema = new mongoose.Schema({
  activeUsers: {
    value: { type: Number, default: 450 },
    suffix: { type: String, default: '+' },
    label: { type: String, default: 'Active Users' }
  },
  countries: {
    value: { type: Number, default: 7 },
    suffix: { type: String, default: '+' },
    label: { type: String, default: 'Countries' }
  },
  productsListed: {
    value: { type: Number, default: 30 },
    suffix: { type: String, default: '+' },
    label: { type: String, default: 'Active Products' }
  },
  yearsExperience: {
    value: { type: Number, default: 3 },
    suffix: { type: String, default: '+' },
    label: { type: String, default: 'Years Experience' }
  },
  satisfactionRate: {
    value: { type: Number, default: 98 },
    suffix: { type: String, default: '%' },
    label: { type: String, default: 'Customer Satisfaction' }
  },
  verifiedSuppliers: {
    value: { type: Number, default: 45 },
    suffix: { type: String, default: '+' },
    label: { type: String, default: 'Verified Trade Partners' }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one document exists (singleton pattern)
siteStatsSchema.statics.getStats = async function() {
  let stats = await this.findOne();
  if (!stats) {
    stats = await this.create({});
  }
  return stats;
};

module.exports = mongoose.model('SiteStats', siteStatsSchema);
