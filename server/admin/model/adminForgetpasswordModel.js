const pool = require("../../config/db");

// =====================================
// Find Admin By Email
// =====================================
const findAdminByEmail = async (email) => {
  const query = `
    SELECT *
    FROM admins
    WHERE email = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [email]);
  return rows[0];
};

// =====================================
// Update OTP Code & 2-Min Expiry (Using MySQL Native Time)
// =====================================
const updateOtpByEmail = async (email, otpCode) => {
  const query = `
    UPDATE admins
    SET otp_code = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 2 MINUTE)
    WHERE email = ?
  `;
  await pool.execute(query, [otpCode, email]);
};

// =====================================
// Update Password and Clear OTP Fields
// =====================================
const updatePasswordByEmail = async (email, hashedPassword) => {
  const query = `
    UPDATE admins
    SET password = ?, otp_code = NULL, otp_expires_at = NULL
    WHERE email = ?
  `;
  await pool.execute(query, [hashedPassword, email]);
};

module.exports = {
  findAdminByEmail,
  updateOtpByEmail,
  updatePasswordByEmail,
};