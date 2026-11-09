const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findAdminByEmail } = require("../model/adminAuthmodel");

// =====================================
// Admin Login Controller
// =====================================
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find Admin
    const admin = await findAdminByEmail(email);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT Token (1-day expiration as per docs)
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
      },
      process.env.JWT_SECRET || "your_super_secret_jwt_key_here_12345",
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully!",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        mobile_number: admin.mobile_number,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  adminLogin,
};