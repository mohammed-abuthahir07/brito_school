const pool = require("../../config/db");

const ADMIN_PROFILE_COLUMNS = `
  id, email, mobile_number, full_name, alternative_email, phone_primary,
  phone_secondary, School_location, created_at, updated_at
`;

// =====================================
// Get Profile By Admin ID (From admins table)
// =====================================
const getProfileByAdminId = async (adminId) => {
  const query = `
    SELECT ${ADMIN_PROFILE_COLUMNS}
    FROM admins
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [adminId]);
  return rows[0];
};

// =====================================
// Update Admin Profile (Inside admins table)
// Never update: password, otp_code, otp_expires_at
// =====================================
const updateProfileByAdminId = async (adminId, data) => {
  const {
    full_name,
    alternative_email,
    phone_primary,
    phone_secondary,
    School_location,
  } = data;

  const query = `
    UPDATE admins
    SET
      full_name = ?,
      alternative_email = ?,
      phone_primary = ?,
      phone_secondary = ?,
      School_location = ?
    WHERE id = ?
  `;

  const [result] = await pool.execute(query, [
    full_name !== undefined ? full_name : null,
    alternative_email !== undefined ? alternative_email : null,
    phone_primary !== undefined ? phone_primary : null,
    phone_secondary !== undefined ? phone_secondary : null,
    School_location !== undefined ? School_location : null,
    adminId,
  ]);

  return result.affectedRows;
};

module.exports = {
  getProfileByAdminId,
  updateProfileByAdminId,
};
