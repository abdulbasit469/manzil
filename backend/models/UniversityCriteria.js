const mongoose = require('mongoose');

const universityCriteriaSchema = new mongoose.Schema({
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: [true, 'Please provide university'],
    index: true
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: [true, 'Please provide program']
  },
  // Merit calculation weights (must sum to 100 or 1.0)
  matricWeight: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  firstYearWeight: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  secondYearWeight: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  intermediateWeight: {
    type: Number,
    min: 0,
    max: 100,
    default: 40
  },
  entryTestWeight: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  // Entry test information
  entryTestRequired: {
    type: Boolean,
    default: true
  },
  entryTestName: {
    type: String,
    trim: true,
    enum: ['ECAT', 'MDCAT', 'NET', 'NTS', 'USAT', 'NUMS', 'Other']
  },
  entryTestTotalMarks: {
    type: Number,
    default: 200 // Default entry test marks
  },
  // Past merit trends (last 5 years)
  pastMeritTrends: [{
    year: Number,
    closingMerit: Number, // Last merit percentage
    programName: String
  }],
  // Additional criteria
  minimumMatricMarks: {
    type: Number,
    min: 0,
    max: 1100,
    default: 0
  },
  minimumIntermediateMarks: {
    type: Number,
    min: 0,
    max: 1100,
    default: 0
  },
  minimumEntryTestMarks: {
    type: Number,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
universityCriteriaSchema.index({ university: 1, program: 1 }, { unique: true });

// Validate that weights sum to approximately 100 (allow small rounding differences)
universityCriteriaSchema.pre('save', function(next) {
  const totalWeight = this.matricWeight + this.firstYearWeight + 
                     this.secondYearWeight + this.intermediateWeight + 
                     this.entryTestWeight;
  
  if (totalWeight < 95 || totalWeight > 105) {
    return next(new Error('Merit weights must sum to approximately 100%'));
  }
  
  next();
});

module.exports = mongoose.model('UniversityCriteria', universityCriteriaSchema);




