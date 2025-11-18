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
  // Student Profile Fields
  phone: {
    type: String,
    match: [/^[0-9]{11}$/, 'Please provide a valid 11-digit phone number']
  },
  city: {
    type: String,
    trim: true
  },
  intermediateType: {
    type: String,
    enum: ['FSc Pre-Engineering', 'FSc Pre-Medical', 'ICS', 'ICOM', 'FA', 'Other'],
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
  const fields = ['name', 'email', 'phone', 'city', 'intermediateType', 'intermediateMarks', 'matricMarks'];
  const completed = fields.filter(field => this[field]).length;
  const percentage = Math.round((completed / fields.length) * 100);
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

module.exports = mongoose.model('User', userSchema);

