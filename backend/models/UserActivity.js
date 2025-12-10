const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  section: {
    type: String,
    enum: ['Community', 'University Explorer', 'Merit Calculator', 'Career Assessment'],
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    min: 0
  },
  activityType: {
    type: String,
    enum: ['view', 'interaction', 'completion', 'calculation'],
    default: 'interaction'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // Store additional info like page viewed, action taken, etc.
  }
}, {
  timestamps: true
});

// Index for efficient queries
userActivitySchema.index({ user: 1, section: 1, createdAt: -1 });
userActivitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);

