const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide university name'],
    trim: true,
    unique: true
  },
  city: {
    type: String,
    required: [true, 'Please provide city'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Public', 'Private'],
    required: true
  },
  hecRanking: {
    type: Number,
    min: 1
  },
  website: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  facilities: [{
    type: String
  }],
  establishedYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  logo: {
    type: String // URL to logo image
  },
  image: {
    type: String // URL to main university image
  },
  isActive: {
    type: Boolean,
    default: true
  },
  /** Optional: filled by admin or `npm run enrich:universities` (homepage scrape) */
  scrapedSummary: {
    type: String,
    maxlength: 8000
  },
  scrapedHighlights: [{
    type: String,
    maxlength: 500
  }],
  scrapedAt: {
    type: Date
  },
  scrapedSourceUrl: {
    type: String,
    trim: true
  },
  /** Indicative PKR fee ranges (per semester unless noted) — admin-maintained; confirm on official site */
  feeComputingEngSemester: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  feeBusinessSocialSemester: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  /** Typical BS / general per-semester range (premium, private chains, distance, etc.) */
  feeBsTypicalSemester: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  /** Medical MBBS (per year) */
  feeMbbsPerYear: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  feePublicRegularSemester: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  feePublicSelfFinanceSemester: {
    type: String,
    trim: true,
    maxlength: 500,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('University', universitySchema);










