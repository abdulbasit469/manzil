const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Test Preparation', 'Universities', 'Scholarships', 'Admissions', 'General'],
      message: 'Category must be one of: Test Preparation, Universities, Scholarships, Admissions, General'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false // For admin to lock discussions
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' // Posts need admin approval
  },
  images: [{
    type: String, // URLs or paths to image files
    default: []
  }],
  videos: [{
    type: String, // URLs or paths to video files
    default: []
  }]
}, {
  timestamps: true
});

// Index for better query performance
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ title: 'text', content: 'text' }); // For text search

// Virtual for comment count (will be populated)
postSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  count: true
});

// Ensure virtuals are included in JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);

