const nodemailer = require('nodemailer');
const { google } = require('googleapis');

function isGmailApiConfigured() {
  const id = process.env.GOOGLE_CLIENT_ID?.trim();
  const secret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refresh = process.env.GOOGLE_REFRESH_TOKEN?.trim();
  const from =
    process.env.GMAIL_FROM_EMAIL?.trim() ||
    process.env.EMAIL_USER?.trim();
  return Boolean(id && secret && refresh && from);
}

function isSmtpConfigured() {
  return Boolean(process.env.EMAIL_USER?.trim() && process.env.EMAIL_PASS?.trim());
}

function getSenderEmail() {
  return (
    process.env.GMAIL_FROM_EMAIL?.trim() ||
    process.env.EMAIL_USER?.trim() ||
    ''
  );
}

async function getGmailOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET.trim();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN.trim();
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() ||
    'https://developers.google.com/oauthplayground';

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

function rfc2047Subject(subject) {
  if (/^[\x00-\x7F]*$/.test(subject)) return subject;
  return `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
}

/**
 * Send MIME email via Gmail API (HTTPS — works on hosts that block SMTP).
 */
async function sendViaGmailApi({ to, subject, html }) {
  const fromEmail = getSenderEmail();
  const auth = await getGmailOAuthClient();
  const gmail = google.gmail({ version: 'v1', auth });
  const fromHeader = `Manzil Career Portal <${fromEmail}>`;
  const raw = [
    `From: ${fromHeader}`,
    `To: ${to}`,
    `Subject: ${rfc2047Subject(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ].join('\r\n');
  const encoded = Buffer.from(raw)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded },
  });
  return res.data;
}

function otpEmailHtml(otp, name) {
  return `
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
      `;
}

function passwordResetHtml(resetUrl, name) {
  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000000;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>You requested to reset your password for your Manzil account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #000000; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666; background: #f5f5f5; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>
          <p><strong>This link will expire in 30 minutes.</strong></p>
          <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email from Manzil Career Counseling Portal.<br>
            Please do not reply to this email.
          </p>
        </div>
      `;
}

/**
 * Send OTP email to user
 * For testing: Logs to console if email config not available
 */
const sendOTPEmail = async (email, otp, name) => {
  try {
    if (!isGmailApiConfigured() && !isSmtpConfigured()) {
      console.log('\n📧 ====== OTP EMAIL (Development Mode) ======');
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`OTP: ${otp}`);
      console.log('OTP will expire in 10 minutes');
      console.log(
        '⚠️  Email not configured (need Gmail API OAuth vars or EMAIL_USER+EMAIL_PASS). OTP logged here.'
      );
      console.log('==========================================\n');
      throw new Error(
        'Email service not configured. OTP logged to server console. Please check backend terminal for OTP.'
      );
    }

    const subject = 'Verify Your Email - Manzil';
    const html = otpEmailHtml(otp, name);

    if (isGmailApiConfigured()) {
      const data = await sendViaGmailApi({ to: email, subject, html });
      console.log(`✅ OTP email sent via Gmail API to ${email} id=${data?.id || 'n/a'}`);
      return { success: true, mode: 'gmail_api', messageId: data?.id };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `Manzil Career Portal <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);

    if (error.message.includes('Email service not configured')) {
      throw error;
    }

    console.log('\n📧 ====== OTP EMAIL (Fallback Mode) ======');
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`OTP: ${otp}`);
    console.log(`Error: ${error.message}`);
    console.log('⚠️  Sending failed. OTP logged above.');
    console.log('==========================================\n');
    throw new Error('EMAIL_SEND_FAILED');
  }
};

/**
 * Send password reset email to user
 */
const sendPasswordResetEmail = async (email, resetToken, name) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  try {
    if (!isGmailApiConfigured() && !isSmtpConfigured()) {
      console.log('\n📧 ====== PASSWORD RESET EMAIL (Development Mode) ======');
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`Reset Link: ${resetUrl}`);
      console.log('Reset link will expire in 30 minutes');
      console.log(
        '⚠️  Email not configured (need Gmail API OAuth vars or EMAIL_USER+EMAIL_PASS). Link logged here.'
      );
      console.log('==========================================\n');
      throw new Error(
        'Email service not configured. Reset link logged to server console. Please check backend terminal for reset link.'
      );
    }

    const subject = 'Password Reset Request - Manzil';
    const html = passwordResetHtml(resetUrl, name);

    if (isGmailApiConfigured()) {
      const data = await sendViaGmailApi({ to: email, subject, html });
      console.log(`✅ Password reset email sent via Gmail API to ${email} id=${data?.id || 'n/a'}`);
      return { success: true, mode: 'gmail_api', messageId: data?.id };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `Manzil Career Portal <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);

    if (error.message.includes('Email service not configured')) {
      throw error;
    }

    console.log('\n📧 ====== PASSWORD RESET EMAIL (Fallback Mode) ======');
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log(`Error: ${error.message}`);
    console.log('⚠️  Email sending failed. Reset link logged above.');
    console.log('==========================================\n');
    throw new Error('EMAIL_SEND_FAILED');
  }
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };
