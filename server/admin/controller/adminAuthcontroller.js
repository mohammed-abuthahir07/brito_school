const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findAdminByEmail } = require("../model/adminAuthmodel");

// Pre-computed dummy hash to prevent timing-based email enumeration attacks
const DUMMY_HASH = "$2b$10$1A2B3C4D5E6F7G8H9I0J1u1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6";

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

    // Constant-time comparison mitigating account enumeration timing attacks
    const hashToCompare = admin ? admin.password : DUMMY_HASH;
    const isMatch = await bcrypt.compare(password, hashToCompare);

    if (!admin || !isMatch) {
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
    });
  }
};

module.exports = {
  adminLogin,
};
