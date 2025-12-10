const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost,
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  toggleLikeComment,
  getCategoryStats,
  getMyPendingPosts
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');
const { uploadMedia } = require('../middleware/upload');

// Post routes
router.post('/posts', protect, uploadMedia, createPost);
router.get('/posts', getAllPosts); // Public - anyone can view posts
router.get('/posts/:id', getPostById); // Public
router.put('/posts/:id', protect, updatePost);
router.delete('/posts/:id', protect, deletePost);
router.post('/posts/:id/like', protect, toggleLikePost);

// Comment routes
router.post('/posts/:postId/comments', protect, createComment);
router.get('/posts/:postId/comments', getPostComments); // Public
router.put('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);
router.post('/comments/:id/like', protect, toggleLikeComment);

// Category statistics
router.get('/categories/stats', getCategoryStats); // Public

// Get user's pending posts
router.get('/posts/pending/my-posts', protect, getMyPendingPosts);

module.exports = router;

