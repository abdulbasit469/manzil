const mongoose = require('mongoose');

const savedUniversitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  }
}, {
  timestamps: true
});

// Ensure one user can't save the same university twice
savedUniversitySchema.index({ user: 1, university: 1 }, { unique: true });

module.exports = mongoose.model('SavedUniversity', savedUniversitySchema);



