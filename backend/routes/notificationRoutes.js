const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes (static paths before /:id to avoid shadowing)
router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllNotifications);

// Admin routes (for creating notifications)
router.post('/', authorize('admin'), createNotification);

module.exports = router;

