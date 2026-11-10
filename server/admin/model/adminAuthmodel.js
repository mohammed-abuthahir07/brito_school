const pool = require("../../config/db");

// =====================================
// Find Admin By Email
// Performance: select only columns needed for auth — avoids pulling otp fields
// =====================================
const findAdminByEmail = async (email) => {
  const query = `
    SELECT id, email, password, mobile_number
    FROM admins
    WHERE email = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [email]);

  return rows[0];
};

// =====================================
// Find Admin By ID
// =====================================
const findAdminById = async (id) => {
  const query = `
    SELECT
      id,
      email,
      mobile_number,
      created_at
    FROM admins
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [id]);

  return rows[0];
};

module.exports = {
  findAdminByEmail,
  findAdminById,
};
