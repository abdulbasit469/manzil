const User = require('../models/User');
const sendToken = require('../utils/jwtToken');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      } else {
        // User exists but not verified - resend OTP
        const otp = existingUser.generateOTP();
        await existingUser.save();
        
        try {
          await sendOTPEmail(email, otp, name);
          return res.status(200).json({
            success: true,
            message: 'OTP resent to your email. Please verify.',
            email: email
          });
        } catch (emailError) {
          const errorMsg = emailError.message || '';
          if (errorMsg.includes('Email service not configured') || 
              errorMsg.includes('not configured') || 
              errorMsg === 'EMAIL_SEND_FAILED') {
            console.log(`⚠️  Email not working. OTP for ${email}: ${otp}`);
            return res.status(200).json({
              success: true,
              message: `OTP: ${otp} (Email service not working - check server console)`,
              email: email,
              otp: otp,
              developmentMode: true
            });
          } else {
            console.log(`⚠️  Email failed. OTP for ${email}: ${otp}`);
            return res.status(200).json({
              success: true,
              message: `OTP: ${otp} (Email service issue - check server console)`,
              email: email,
              otp: otp,
              developmentMode: true
            });
          }
        }
      }
    }

    // Create user (not verified yet)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      isVerified: false
    });

    // Generate and send OTP
    const otp = user.generateOTP();
    await user.save();
    
    try {
      await sendOTPEmail(email, otp, name);
      console.log(`✅ New user registered: ${email} - OTP sent`);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful! OTP sent to your email.',
        email: email
      });
    } catch (emailError) {
      // Email service not configured or failed - show OTP in response
      const errorMsg = emailError.message || '';
      if (errorMsg.includes('Email service not configured') || 
          errorMsg.includes('not configured') || 
          errorMsg === 'EMAIL_SEND_FAILED') {
        console.log(`⚠️  Email not working. OTP for ${email}: ${otp}`);
        res.status(201).json({
          success: true,
          message: `Registration successful! OTP: ${otp} (Email service not working - check server console)`,
          email: email,
          otp: otp, // Include OTP in response for development
          developmentMode: true
        });
      } else {
        // Unexpected error - still show OTP
        console.log(`⚠️  Email failed. OTP for ${email}: ${otp}`);
        res.status(201).json({
          success: true,
          message: `Registration successful! OTP: ${otp} (Email service issue - check server console)`,
          email: email,
          otp: otp,
          developmentMode: true
        });
      }
    }

  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for OTP.',
        email: email,
        needsVerification: true
      });
    }

    console.log(`✅ User logged in: ${email}`);
    sendToken(user, 200, res);

  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find user with OTP fields
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified. Please login.'
      });
    }

    // Verify OTP
    const isValid = user.verifyOTP(otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    console.log(`✅ Email verified: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.'
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Verification failed'
    });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified. Please login.'
      });
    }

    // Generate and send new OTP
    const otp = user.generateOTP();
    await user.save();
    
    try {
      await sendOTPEmail(email, otp, user.name);
      console.log(`✅ OTP resent to: ${email}`);

      res.status(200).json({
        success: true,
        message: 'OTP sent to your email'
      });
    } catch (emailError) {
      const errorMsg = emailError.message || '';
      if (errorMsg.includes('Email service not configured') || 
          errorMsg.includes('not configured') || 
          errorMsg === 'EMAIL_SEND_FAILED') {
        console.log(`⚠️  Email not working. OTP for ${email}: ${otp}`);
        res.status(200).json({
          success: true,
          message: `OTP: ${otp} (Email service not working - check server console)`,
          otp: otp,
          developmentMode: true
        });
      } else {
        console.log(`⚠️  Email failed. OTP for ${email}: ${otp}`);
        res.status(200).json({
          success: true,
          message: `OTP: ${otp} (Email service issue - check server console)`,
          otp: otp,
          developmentMode: true
        });
      }
    }

  } catch (error) {
    console.error('❌ Resend OTP error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resend OTP'
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    let resetToken;
    try {
      resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });
    } catch (tokenError) {
      console.error('❌ Error generating reset token:', tokenError);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate reset token. Please try again.'
      });
    }

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
      
      console.log(`✅ Password reset email sent to: ${email}`);
      
      res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email. Please check your inbox.'
      });
    } catch (emailError) {
      console.error('❌ Email error caught:', emailError.message);
      
      // Log reset link to console for development/debugging
      if (emailError.message === 'EMAIL_SEND_FAILED' || 
          emailError.message.includes('Email service not configured')) {
        console.log(`\n⚠️  Email service not working. Reset link for ${email}:`);
        console.log(`   ${resetUrl}\n`);
      } else {
        console.log(`\n⚠️  Email sending failed. Reset link for ${email}:`);
        console.log(`   ${resetUrl}\n`);
      }
      
      // Always return success message - don't reveal email issues to user
      // In production, email should work. In development, check server console for link
      res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email. Please check your inbox.'
      });
    }

  } catch (error) {
    console.error('❌ Forgot password error:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process password reset request'
    });
  }
};

/**
 * @desc    Reset password
 * @route   PUT /api/auth/reset-password/:resetToken
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;
    const { resetToken } = req.params;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide password and confirm password'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Validate password format
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message: 'Password should contain at least one uppercase, lowercase, digit and special character'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find user with reset token and check expiry
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log(`✅ Password reset successful for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password'
    });
  }
};

