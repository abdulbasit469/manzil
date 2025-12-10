const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // General Settings
  siteName: {
    type: String,
    default: 'MANZIL',
    trim: true
  },
  siteEmail: {
    type: String,
    default: 'admin@manzil.com',
    trim: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  
  // Notification Settings
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  
  // Community Settings
  autoApprove: {
    type: Boolean,
    default: false // Posts require admin approval by default
  },
  
  // System Info (read-only, calculated)
  platformVersion: {
    type: String,
    default: 'v2.4.1'
  },
  
  // Backup tracking
  lastBackup: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);

