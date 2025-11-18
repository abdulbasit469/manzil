const nodemailer = require('nodemailer');

/**
 * Send OTP email to user
 * For testing: Logs to console if email config not available
 */
const sendOTPEmail = async (email, otp, name) => {
  try {
    // Check if email configuration exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      // For testing without email setup - just log to console
      console.log('\n📧 ====== OTP EMAIL (Development Mode) ======');
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`OTP: ${otp}`);
      console.log('OTP will expire in 10 minutes');
      console.log('==========================================\n');
      return { success: true, mode: 'console' };
    }

    // Create transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // App Password, not regular password
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates (for development)
      }
    });

    // Email content
    const mailOptions = {
      from: `Manzil Career Portal <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Manzil',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000000;">Welcome to Manzil!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for registering with Manzil Career Counseling Portal.</p>
          <p>Your OTP for email verification is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #000000; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p><strong>This OTP will expire in 10 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email from Manzil Career Counseling Portal.<br>
            Please do not reply to this email.
          </p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return { success: true, mode: 'email', messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    // Fallback to console logging if email fails
    console.log('\n📧 ====== OTP EMAIL (Fallback Mode) ======');
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`OTP: ${otp}`);
    console.log('==========================================\n');
    return { success: true, mode: 'fallback' };
  }
};

module.exports = { sendOTPEmail };

