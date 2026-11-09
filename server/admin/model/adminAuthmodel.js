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