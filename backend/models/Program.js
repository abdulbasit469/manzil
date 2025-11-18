const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide program name'],
    trim: true
  },
  degree: {
    type: String,
    required: [true, 'Please provide degree type'],
    enum: ['BS', 'MS', 'PhD', 'Diploma', 'Certificate', 'BBA', 'MBA', 'BE', 'M.Phil', 'BA', 'BA-LLB', 'Pharm-D']
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  duration: {
    type: String,
    required: true // e.g., "4 years", "2 years"
  },
  feePerSemester: {
    type: Number,
    required: true,
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
    enum: ['Engineering', 'Medical', 'Business', 'Computer Science', 'Social Sciences', 'Arts', 'Law', 'Other']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Program', programSchema);




