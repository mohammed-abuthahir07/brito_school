const {
  getProfileByAdminId,
  updateProfileByAdminId,
} = require("../model/profileModel");

// =====================================
// GET /api/admin/profile
// Returns the logged-in admin's profile data from admins table
// =====================================
const getProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const profile = await getProfileByAdminId(adminId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================
// POST /api/admin/profile
// Upsert-style: updates profile data since profile IS the admin record
// Requires full_name and alternative_email
// =====================================
const createProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { full_name, alternative_email, phone_primary, phone_secondary, School_location } = req.body;

    if (!full_name || !alternative_email) {
      return res.status(400).json({
        success: false,
        message: "full_name and alternative_email are required fields",
      });
    }

    const existing = await getProfileByAdminId(adminId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const data = {
      full_name,
      alternative_email,
      phone_primary: phone_primary !== undefined ? phone_primary : existing.phone_primary,
      phone_secondary: phone_secondary !== undefined ? phone_secondary : existing.phone_secondary,
      School_location: School_location !== undefined ? School_location : existing.School_location,
    };

    await updateProfileByAdminId(adminId, data);

    const updated = await getProfileByAdminId(adminId);

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully!",
      profile: updated,
    });
  } catch (error) {
    console.error("Create Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================
// PUT /api/admin/profile
// Update profile data (partial update — preserves existing values for omitted fields)
// =====================================
const editProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const existing = await getProfileByAdminId(adminId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const mergedData = {
      full_name: req.body.full_name !== undefined ? req.body.full_name : existing.full_name,
      alternative_email: req.body.alternative_email !== undefined ? req.body.alternative_email : existing.alternative_email,
      phone_primary: req.body.phone_primary !== undefined ? req.body.phone_primary : existing.phone_primary,
      phone_secondary: req.body.phone_secondary !== undefined ? req.body.phone_secondary : existing.phone_secondary,
      School_location: req.body.School_location !== undefined ? req.body.School_location : existing.School_location,
    };

    await updateProfileByAdminId(adminId, mergedData);

    const updated = await getProfileByAdminId(adminId);

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully!",
      profile: updated,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getProfile,
  createProfile,
  editProfile,
};
