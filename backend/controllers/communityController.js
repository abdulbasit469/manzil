const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// ============================================
// POST CONTROLLERS
// ============================================

/**
 * Create a new post
 */
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and category are required'
      });
    }

    // Normalize category (handle case-insensitive matching)
    const categoryMap = {
      'test preparation': 'Test Preparation',
      'universities': 'Universities',
      'scholarships': 'Scholarships',
      'admissions': 'Admissions',
      'general': 'General',
      'Test Preparation': 'Test Preparation',
      'Universities': 'Universities',
      'Scholarships': 'Scholarships',
      'Admissions': 'Admissions',
      'General': 'General'
    };
    
    const normalizedCategory = categoryMap[category] || categoryMap[category.toLowerCase()];
    
    // Validate category
    const validCategories = ['Test Preparation', 'Universities', 'Scholarships', 'Admissions', 'General'];
    if (!normalizedCategory || !validCategories.includes(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be one of: Test Preparation, Universities, Scholarships, Admissions, General'
      });
    }

    // Process uploaded files
    const images = [];
    const videos = [];

    if (req.files) {
      console.log('Files received:', req.files);
      
      // Process images
      if (req.files.images) {
        if (Array.isArray(req.files.images)) {
          images.push(...req.files.images.map(file => {
            console.log('Image file:', file.filename);
            return `/uploads/images/${file.filename}`;
          }));
        } else {
          console.log('Single image file:', req.files.images.filename);
          images.push(`/uploads/images/${req.files.images.filename}`);
        }
      }

      // Process videos
      if (req.files.videos) {
        if (Array.isArray(req.files.videos)) {
          videos.push(...req.files.videos.map(file => {
            console.log('Video file:', file.filename);
            return `/uploads/videos/${file.filename}`;
          }));
        } else {
          console.log('Single video file:', req.files.videos.filename);
          videos.push(`/uploads/videos/${req.files.videos.filename}`);
        }
      }
    }

    console.log('Processed images:', images);
    console.log('Processed videos:', videos);

    // Check if auto-approve is enabled
    const Settings = require('../models/Settings');
    const settings = await Settings.getSettings().catch(() => ({ autoApprove: false }));
    const postStatus = settings.autoApprove ? 'approved' : 'pending';

    const post = new Post({
      title,
      content,
      category: normalizedCategory,
      author: userId,
      images,
      videos,
      status: postStatus
    });

    await post.save();
    await post.populate('author', 'name email profilePicture');

    res.status(201).json({
      success: true,
      message: settings.autoApprove 
        ? 'Post created and approved successfully' 
        : 'Post created successfully and is pending approval',
      post,
      status: postStatus
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create post'
    });
  }
};

/**
 * Get all posts with pagination, filtering, and search
 */
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt'; // createdAt, views, likes
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    let query = {};

    // Only show approved posts to regular users (admins see all posts including pending)
    // Check if user is admin - try to get user from request
    let isAdmin = false;
    if (req.user) {
      // User is authenticated, check role
      isAdmin = req.user.role === 'admin';
    } else if (req.headers.authorization) {
      // Try to decode token if present but user not populated (for optional auth routes)
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const User = require('../models/User');
        const user = await User.findById(decoded.id).select('role');
        isAdmin = user && user.role === 'admin';
      } catch (error) {
        // Token invalid or expired, treat as non-admin
        isAdmin = false;
      }
    }
    
    // Build status filter for non-admins
    if (!isAdmin) {
      // For non-admins, show approved posts OR posts without status (for backward compatibility)
      query.$or = [
        { status: 'approved' },
        { status: { $exists: false } }
      ];
    }
    // Admins see all posts (no status filter)

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search in title and content (case-insensitive regex if text index not available)
    // If we already have $or (from status filter), we need to combine with $and
    if (search) {
      const searchConditions = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
      
      if (query.$or) {
        // Combine status filter and search filter using $and
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // Build sort object for aggregation
    let sortStage = {};
    if (sortBy === 'views') {
      sortStage = { views: sortOrder };
    } else if (sortBy === 'likes') {
      sortStage = { likeCount: sortOrder };
    } else {
      sortStage = { isPinned: -1, createdAt: sortOrder }; // Pinned posts first, then by date
    }

    // Use single aggregation pipeline for maximum performance
    const aggregationPipeline = [
      // Match posts based on query
      { $match: query },
      
      // Lookup comments to count them
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post',
          as: 'comments'
        }
      },
      
      // Lookup author information
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorInfo',
          pipeline: [
            { $project: { name: 1, email: 1, profilePicture: 1 } }
          ]
        }
      },
      
      // Add computed fields
      {
        $addFields: {
          commentCount: { $size: '$comments' },
          likeCount: { $size: { $ifNull: ['$likes', []] } },
          author: {
            $cond: {
              if: { $gt: [{ $size: '$authorInfo' }, 0] },
              then: { $arrayElemAt: ['$authorInfo', 0] },
              else: null
            }
          }
        }
      },
      
      // Remove unnecessary fields
      {
        $project: {
          comments: 0,
          authorInfo: 0
        }
      },
      
      // Sort
      { $sort: sortStage }
    ];

    // Use $facet to get both paginated results and total count in one query
    const result = await Post.aggregate([
      ...aggregationPipeline,
      {
        $facet: {
          posts: [
            { $skip: skip },
            { $limit: limit }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    const postsWithCounts = result[0]?.posts || [];
    const total = result[0]?.total[0]?.count || 0;

    res.status(200).json({
      success: true,
      posts: postsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch posts'
    });
  }
};

/**
 * Get single post by ID
 */
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('author', 'name email profilePicture')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // Get comment count
    const commentCount = await Comment.countDocuments({ post: id });

    res.status(200).json({
      success: true,
      post: {
        ...post,
        commentCount,
        likeCount: post.likes ? post.likes.length : 0,
        views: post.views + 1 // Return incremented view count
      }
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch post'
    });
  }
};

/**
 * Update post (author only)
 */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is author or admin
    if (post.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) {
      // Normalize category (handle case-insensitive matching)
      const categoryMap = {
        'test preparation': 'Test Preparation',
        'universities': 'Universities',
        'scholarships': 'Scholarships',
        'admissions': 'Admissions',
        'general': 'General',
        'Test Preparation': 'Test Preparation',
        'Universities': 'Universities',
        'Scholarships': 'Scholarships',
        'Admissions': 'Admissions',
        'General': 'General'
      };
      
      const normalizedCategory = categoryMap[category] || categoryMap[category.toLowerCase()];
      const validCategories = ['Test Preparation', 'Universities', 'Scholarships', 'Admissions', 'General'];
      
      if (!normalizedCategory || !validCategories.includes(normalizedCategory)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be one of: Test Preparation, Universities, Scholarships, Admissions, General'
        });
      }
      post.category = normalizedCategory;
    }

    await post.save();
    await post.populate('author', 'name email profilePicture');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update post'
    });
  }
};

/**
 * Delete post (author or admin)
 */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is author or admin
    if (post.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ post: id });

    // Delete the post
    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete post'
    });
  }
};

/**
 * Toggle like on post
 */
exports.toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(likeId => likeId.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      likeCount: post.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Toggle like post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle like'
    });
  }
};

// ============================================
// COMMENT CONTROLLERS
// ============================================

/**
 * Create a comment on a post
 */
exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user.id;

    // Validation
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if post is locked
    if (post.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'This post is locked and cannot be commented on'
      });
    }

    // If parentCommentId is provided, verify it exists and belongs to the same post
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment || parentComment.post.toString() !== postId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment'
        });
      }
    }

    const comment = new Comment({
      content,
      post: postId,
      author: userId,
      parentComment: parentCommentId || null
    });

    await comment.save();
    await comment.populate('author', 'name email profilePicture');
    if (parentCommentId) {
      await comment.populate('parentComment');
    }

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create comment'
    });
  }
};

/**
 * Get all comments for a post (with nested replies)
 */
exports.getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    // Get all comments for this post
    const comments = await Comment.find({ post: postId })
      .populate('author', 'name email profilePicture')
      .populate('parentComment')
      .sort({ createdAt: 1 })
      .lean();

    // Organize comments into threaded structure
    const topLevelComments = comments.filter(c => !c.parentComment);
    const replies = comments.filter(c => c.parentComment);

    // Build nested structure
    const organizedComments = topLevelComments.map(comment => {
      const commentReplies = replies
        .filter(reply => reply.parentComment && reply.parentComment._id.toString() === comment._id.toString())
        .map(reply => ({
          ...reply,
          likeCount: reply.likes ? reply.likes.length : 0
        }));

      return {
        ...comment,
        replies: commentReplies,
        likeCount: comment.likes ? comment.likes.length : 0
      };
    });

    res.status(200).json({
      success: true,
      comments: organizedComments,
      totalComments: comments.length
    });
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch comments'
    });
  }
};

/**
 * Update comment (author only)
 */
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is author or admin
    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();
    await comment.populate('author', 'name email profilePicture');

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update comment'
    });
  }
};

/**
 * Delete comment (author or admin)
 */
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is author or admin
    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Delete all replies to this comment first
    await Comment.deleteMany({ parentComment: id });

    // Delete the comment
    await Comment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete comment'
    });
  }
};

/**
 * Toggle like on comment
 */
exports.toggleLikeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      // Unlike
      comment.likes = comment.likes.filter(likeId => likeId.toString() !== userId);
    } else {
      // Like
      comment.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: isLiked ? 'Comment unliked' : 'Comment liked',
      likeCount: comment.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Toggle like comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle like'
    });
  }
};

/**
 * Get category statistics
 */
exports.getCategoryStats = async (req, res) => {
  try {
    const categories = ['Test Preparation', 'Universities', 'Scholarships', 'Admissions', 'General'];
    
    // Category normalization map for case-insensitive matching
    const categoryNormalizeMap = {
      'general': 'General',
      'General': 'General',
      'test preparation': 'Test Preparation',
      'Test Preparation': 'Test Preparation',
      'universities': 'Universities',
      'Universities': 'Universities',
      'scholarships': 'Scholarships',
      'Scholarships': 'Scholarships',
      'admissions': 'Admissions',
      'Admissions': 'Admissions',
      'study abroad': 'Admissions',
      'Study Abroad': 'Admissions'
    };
    
    const stats = await Post.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map of category counts (normalize case)
    const categoryMap = {};
    stats.forEach(stat => {
      const normalizedCategory = categoryNormalizeMap[stat._id] || categoryNormalizeMap[stat._id?.toLowerCase()] || stat._id;
      if (categoryMap[normalizedCategory]) {
        categoryMap[normalizedCategory] += stat.count;
      } else {
        categoryMap[normalizedCategory] = stat.count;
      }
    });

    // Build response with all categories (including 0 counts)
    const categoryStats = categories.map(category => ({
      name: category,
      count: categoryMap[category] || 0
    }));

    // Calculate total
    const total = Object.values(categoryMap).reduce((sum, count) => sum + count, 0);

    res.status(200).json({
      success: true,
      categories: categoryStats,
      total
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch category statistics'
    });
  }
};

/**
 * Get pending posts for current user (student)
 */
exports.getMyPendingPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const posts = await Post.find({
      author: userId,
      status: 'pending'
    })
      .populate('author', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    // Add like and comment counts
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const commentCount = await Comment.countDocuments({ post: post._id });
      return {
        ...post,
        likeCount: post.likes?.length || 0,
        commentCount
      };
    }));

    res.status(200).json({
      success: true,
      posts: postsWithCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

