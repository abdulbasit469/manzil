const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide program name'],
    trim: true
  },
  /** e.g. BS, MS, BBA, LLB, MBBS, Pharm-D, B.Arch — flexible for real Pakistani offerings */
  degree: {
    type: String,
    required: [true, 'Please provide degree type'],
    trim: true,
    maxlength: 40
  },
  /** Display grouping from source lists: Engineering, Computing, Medical, etc. */
  programGroup: {
    type: String,
    trim: true,
    maxlength: 120
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  duration: {
    type: String,
    default: '4 years'
  },
  feePerSemester: {
    type: Number,
    default: 0,
    min: 0
  },
  totalFee: {
    type: Number,
    min: 0
  },
  eligibility: {
    type: String // e.g., "FSc Pre-Engineering with 60% marks"
  },
  description: {
    type: String
  },
  careerScope: {
    type: String
  },
  availableSeats: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    trim: true,
    default: 'Other',
    maxlength: 80
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Program', programSchema);




