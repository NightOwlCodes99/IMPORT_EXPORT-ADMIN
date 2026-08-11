const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  carrier: {
    name: {
      type: String,
      required: true,
      enum: ['DHL Express', 'FedEx', 'UPS', 'Maersk', 'Local Courier', 'Other']
    },
    service: String,
    website: String,
    contactNumber: String
  },
  origin: {
    name: String,
    company: String,
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    country: {
      type: String,
      required: true
    },
    zipCode: String
  },
  destination: {
    name: String,
    company: String,
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    country: {
      type: String,
      required: true
    },
    zipCode: String
  },
  packageInfo: {
    weight: {
      value: {
        type: Number,
        required: true
      },
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
    numberOfPackages: {
      type: Number,
      default: 1,
      min: 1
    },
    packageType: {
      type: String,
      enum: ['Box', 'Pallet', 'Envelope', 'Crate', 'Other'],
      default: 'Box'
    }
  },
  timeline: [{
    status: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    location: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isCompleted: {
      type: Boolean,
      default: true
    }
  }],
  status: {
    type: String,
    enum: ['Pending Pickup', 'Picked Up', 'In Transit', 'Customs Clearance', 'Out for Delivery', 'Delivered', 'Delayed', 'Failed Delivery', 'Returned'],
    default: 'Pending Pickup'
  },
  currentLocation: {
    type: String
  },
  estimatedDelivery: {
    type: Date,
    required: true
  },
  actualDelivery: {
    type: Date
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0
  },
  shippingMethod: {
    type: String,
    enum: ['Air', 'Sea', 'Land', 'Express', 'Standard'],
    default: 'Standard'
  },
  customsInfo: {
    declarationNumber: String,
    clearanceStatus: {
      type: String,
      enum: ['Pending', 'In Progress', 'Cleared', 'Issues'],
      default: 'Pending'
    },
    customsDuty: Number,
    clearanceDate: Date,
    issues: String
  },
  alerts: [{
    type: {
      type: String,
      enum: ['Delay', 'Customs Issue', 'Address Problem', 'Damage', 'Other']
    },
    message: String,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  signature: {
    name: String,
    signedAt: Date,
    image: String
  },
  notes: {
    type: String,
    maxlength: 500
  },
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['Invoice', 'Packing List', 'Bill of Lading', 'Certificate', 'Other']
    },
    public_id: String,
    url: String
  }]
}, {
  timestamps: true
});

// Generate tracking number before saving
shipmentSchema.pre('save', async function(next) {
  if (!this.trackingNumber) {
    const prefix = this.carrier.name.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    
    // Find the latest shipment with a tracking number that starts with this prefix and year
    const latestShipment = await mongoose.model('Shipment')
      .findOne({ trackingNumber: { $regex: `^${prefix}-${year}-` } })
      .sort({ trackingNumber: -1 })
      .select('trackingNumber');
    
    let nextNum = 1;
    if (latestShipment && latestShipment.trackingNumber) {
      // Extract the number from the tracking number (e.g., "DHL-2026-000005" -> 5)
      const match = latestShipment.trackingNumber.match(/-(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    
    this.trackingNumber = `${prefix}-${year}-${String(nextNum).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Shipment', shipmentSchema);
