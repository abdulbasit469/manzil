const express = require('express');
const { register, login, getMe, verifyOTP, resendOTP, forgotPassword, verifyForgotPasswordOTP, resendForgotPasswordOTP, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOTP);
router.post('/resend-forgot-password-otp', resendForgotPasswordOTP);
router.put('/reset-password/:resetToken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;

