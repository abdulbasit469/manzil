const mongoose = require('mongoose');

/**
 * DegreeScope - Option A: Separate collection for degree/career scope content.
 * Links to programs via field (category) and degreeName for "universities offering this degree".
 */
const degreeScopeSchema = new mongoose.Schema({
  degreeName: {
    type: String,
    required: [true, 'Degree name is required'],
    trim: true,
    unique: true
  },
  field: {
    type: String,
    required: [true, 'Field/category is required'],
    trim: true,
    enum: ['Medical', 'Engineering', 'Computer Science', 'Business', 'Arts', 'Social Sciences', 'Law', 'Other']
  },
  scope: {
    type: String,
    required: [true, 'Scope description is required'],
    trim: true
  },
  jobRoles: [{
    type: String,
    trim: true
  }],
  salaryEntry: {
    type: String,
    trim: true
  },
  salaryMid: {
    type: String,
    trim: true
  },
  trends: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

degreeScopeSchema.index({ field: 1 });
degreeScopeSchema.index({ degreeName: 'text', scope: 'text' });

module.exports = mongoose.model('DegreeScope', degreeScopeSchema);
