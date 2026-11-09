const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const {
  findAdminByEmail,
  updateOtpByEmail,
  updatePasswordByEmail,
} = require("../model/adminForgetpasswordModel");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =====================================
// Forgot Password: Send OTP
// =====================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const admin = await findAdminByEmail(email);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found with this email",
      });
    }

    // Generate cryptographically secure 6-digit OTP code
    const otpCode = crypto.randomInt(100000, 1000000).toString();

    // Save OTP and let MySQL handle the 2-minute expiration timestamp
    await updateOtpByEmail(email, otpCode);

    // Send Email via Nodemailer
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Brito School - Password Reset OTP",
      text: `Your OTP code for password reset is: ${otpCode}. It is valid for 2 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email. Valid for 2 minutes.",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP email",
      error: error.message,
    });
  }
};

// =====================================
// Reset Password with OTP Verification
// =====================================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const admin = await findAdminByEmail(email);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    // Verify OTP match
    if (!admin.otp_code || admin.otp_code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code.",
      });
    }

    // Verify OTP expiration safely using local date comparison
    const currentTime = new Date();
    const expiryTime = new Date(admin.otp_expires_at);
    if (currentTime > expiryTime) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired! Please request a new one.",
      });
    }

    // Hash new password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP in DB
    await updatePasswordByEmail(email, hashedPassword);

    return res.status(200).json({
      success: true,
      message: "Password reset successful! You can now log in.",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during password reset",
      error: error.message,
    });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
};
