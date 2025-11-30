const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  // Registration Fields
  cnic: {
    type: String,
    match: [/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, 'Please provide a valid CNIC (format: 12345-1234567-1)'],
    trim: true
  },
  // Student Profile Fields
  phone: {
    type: String,
    match: [/^[0-9]{11}$/, 'Please provide a valid 11-digit phone number']
  },
  fatherName: {
    type: String,
    trim: true,
    maxlength: [50, 'Father name cannot exceed 50 characters']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true; // Optional field
        const age = Math.floor((Date.now() - value) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= 13 && age <= 100; // Reasonable age range
      },
      message: 'Date of birth must be valid and age should be between 13 and 100 years'
    }
  },
  city: {
    type: String,
    trim: true
  },
  currentStatus: {
    type: String,
    enum: ['FSc Pre-Engineering', 'FSc Pre-Medical', 'ICS', 'ICOM', 'FA', 'A-Levels', 'Other'],
    trim: true
  },
  intermediateType: {
    type: String,
    enum: ['FSc Pre-Engineering', 'FSc Pre-Medical', 'ICS', 'ICOM', 'FA', 'Other'],
  },
  firstYearMarks: {
    type: Number,
    min: 0,
    max: 550
  },
  secondYearMarks: {
    type: Number,
    min: 0,
    max: 550
  },
  intermediateMarks: {
    type: Number,
    min: 0,
    max: 1100
  },
  matricMarks: {
    type: Number,
    min: 0,
    max: 1100
  },
  interests: [{
    type: String
  }],
  profileCompleted: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    select: false
  },
  otpExpiry: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate profile completion percentage
userSchema.methods.calculateProfileCompletion = function() {
  const requiredFields = [
    'name', 
    'email', 
    'phone', 
    'city', 
    'fatherName',
    'gender',
    'dateOfBirth',
    'currentStatus',
    'matricMarks',
    'firstYearMarks',
    'secondYearMarks'
  ];
  
  const completed = requiredFields.filter(field => {
    const value = this[field];
    // Check if field has a value (not null, undefined, or empty string)
    if (value === null || value === undefined || value === '') {
      return false;
    }
    // For arrays, check if not empty
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  }).length;
  
  const percentage = Math.round((completed / requiredFields.length) * 100);
  return percentage;
};

// Generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.otp = otp;
  this.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(enteredOTP) {
  if (!this.otp || !this.otpExpiry) {
    return false;
  }
  if (Date.now() > this.otpExpiry) {
    return false; // OTP expired
  }
  return this.otp === enteredOTP;
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  const crypto = require('crypto');
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire (30 minutes)
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);

