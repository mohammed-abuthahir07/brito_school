const pool = require("../../config/db");

// =====================================
// Get Profile By Admin ID
// =====================================
const getProfileByAdminId = async (adminId) => {
  const query = `
    SELECT *
    FROM admin_profiles
    WHERE admin_id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [adminId]);
  return rows[0];
};

// =====================================
// Get Profile By Record ID
// =====================================
const getProfileById = async (id) => {
  const query = `
    SELECT *
    FROM admin_profiles
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// =====================================
// Create Profile Record
// =====================================
const createProfile = async (adminId, data) => {
  const {
    full_name,
    alternative_email,
    phone_primary,
    phone_secondary,
    School_location,
    bio,
    emergency_contact_phone,
    linkedin_url,
  } = data;

  const query = `
    INSERT INTO admin_profiles (
      admin_id, full_name, alternative_email, phone_primary, phone_secondary,
      School_location, bio, emergency_contact_phone, linkedin_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.execute(query, [
    adminId,
    full_name,
    alternative_email,
    phone_primary || null,
    phone_secondary || null,
    School_location || null,
    bio || null,
    emergency_contact_phone || null,
    linkedin_url || null,
  ]);

  return result.insertId;
};

// =====================================
// Update Profile Record
// =====================================
const updateProfile = async (adminId, data) => {
  const {
    full_name,
    alternative_email,
    phone_primary,
    phone_secondary,
    School_location,
    bio,
    emergency_contact_phone,
    linkedin_url,
  } = data;

  const query = `
    UPDATE admin_profiles
    SET 
      full_name = ?, alternative_email = ?, phone_primary = ?, phone_secondary = ?,
      School_location = ?, bio = ?, emergency_contact_phone = ?, linkedin_url = ?
    WHERE admin_id = ?
  `;

  const [result] = await pool.execute(query, [
    full_name,
    alternative_email,
    phone_primary || null,
    phone_secondary || null,
    School_location || null,
    bio || null,
    emergency_contact_phone || null,
    linkedin_url || null,
    adminId,
  ]);

  return result.affectedRows;
};

// =====================================
// Delete Profile Record
// =====================================
const deleteProfile = async (adminId) => {
  const query = `
    DELETE FROM admin_profiles
    WHERE admin_id = ?
  `;
  const [result] = await pool.execute(query, [adminId]);
  return result.affectedRows;
};

module.exports = {
  getProfileByAdminId,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
};