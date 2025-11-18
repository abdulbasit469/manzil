const jwt = require('jsonwebtoken');

/**
 * Generate JWT token and send response
 */
const sendToken = (user, statusCode, res) => {
  // Create JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  // Response data
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileCompleted: user.profileCompleted
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData
  });
};

module.exports = sendToken;







