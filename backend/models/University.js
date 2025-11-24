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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('University', universitySchema);










