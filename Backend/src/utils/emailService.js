// src/utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Your Company Name" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #4CAF50;">Welcome!</h2>
        <p>Thank you for signing up. Please use the following One-Time Password (OTP) to complete your registration:</p>
        <p style="font-size: 24px; font-weight: bold; color: #333; letter-spacing: 2px; border: 1px solid #ddd; padding: 10px; display: inline-block;">
          ${otp}
        </p>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr/>
        <p style="font-size: 0.8em; color: #777;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending OTP email to ${to}:`, error);
    throw new Error('Failed to send verification email.');
  }
};


const sendPasswordResetEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Your Company Name" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #FFA500;">Password Reset</h2>
        <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
        <p style="font-size: 24px; font-weight: bold; color: #333; letter-spacing: 2px; border: 1px solid #ddd; padding: 10px; display: inline-block;">
          ${otp}
        </p>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr/>
        <p style="font-size: 0.8em; color: #777;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending password reset email to ${to}:`, error);
    throw new Error('Failed to send password reset email.');
  }
};


module.exports = { sendOtpEmail, sendPasswordResetEmail };