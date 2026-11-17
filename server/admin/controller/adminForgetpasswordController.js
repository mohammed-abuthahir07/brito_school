const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const {
  findAdminByEmail,
  updateOtpByEmail,
  clearOtpByEmail,
  updatePasswordByEmail,
} = require("../model/adminForgetpasswordModel");

const GENERIC_FORGOT_MESSAGE =
  "If an account exists for this email, a password reset OTP has been sent.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailer = {
  sendOtpEmail: async (email, otpCode) => {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Brito School - Password Reset OTP",
      text: `Your OTP code for password reset is: ${otpCode}. It is valid for 2 minutes.`,
    });
  },
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    if (!EMAIL_PATTERN.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required",
      });
    }

    const admin = await findAdminByEmail(email);
    if (admin) {
      const otpCode = crypto.randomInt(100000, 1000000).toString();
      await updateOtpByEmail(email, otpCode);
      try {
        await mailer.sendOtpEmail(email, otpCode);
      } catch (smtpError) {
        console.error("Forgot Password SMTP Error:", smtpError.message || smtpError);
        try {
          await clearOtpByEmail(email);
        } catch (clearError) {
          console.error("Forgot Password OTP cleanup Error:", clearError.message || clearError);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: GENERIC_FORGOT_MESSAGE,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(200).json({
      success: true,
      message: GENERIC_FORGOT_MESSAGE,
    });
  }
};

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
    if (!admin || !admin.otp_code || admin.otp_code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code.",
      });
    }

    const currentTime = new Date();
    const expiryTime = new Date(admin.otp_expires_at);
    if (currentTime > expiryTime) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired! Please request a new one.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
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
    });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
  mailer,
  GENERIC_FORGOT_MESSAGE,
};
