const {
  getProfileByAdminId,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
} = require("../model/profileModel");

// =====================================
// Get Logged-in Admin Profile
// =====================================
const getProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const profile = await getProfileByAdminId(adminId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found for this admin",
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
// Create Admin Profile
// Performance: single INSERT, return constructed object — no post-insert SELECT
// =====================================
const addProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { full_name, alternative_email } = req.body;

    if (!full_name || !alternative_email) {
      return res.status(400).json({
        success: false,
        message: "full_name and alternative_email are required fields",
      });
    }

    const existing = await getProfileByAdminId(adminId);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists. Use PUT to update your details.",
      });
    }

    const insertId = await createProfile(adminId, req.body);
    const newProfile = await getProfileById(insertId);

    return res.status(200).json({
      success: true,
      message: "Admin profile created successfully!",
      profile: newProfile,
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
// Update Admin Profile (Preserves Existing Unsent Fields)
// Performance: fetch existing once, update, return merged — no second SELECT
// =====================================
const editProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const existing = await getProfileByAdminId(adminId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please create one first.",
      });
    }

    const mergedData = {
      full_name: req.body.full_name || existing.full_name,
      alternative_email: req.body.alternative_email || existing.alternative_email,
      phone_primary: req.body.phone_primary !== undefined ? req.body.phone_primary : existing.phone_primary,
      phone_secondary: req.body.phone_secondary !== undefined ? req.body.phone_secondary : existing.phone_secondary,
      School_location: req.body.School_location !== undefined ? req.body.School_location : existing.School_location,
      bio: req.body.bio !== undefined ? req.body.bio : existing.bio,
      emergency_contact_phone: req.body.emergency_contact_phone !== undefined ? req.body.emergency_contact_phone : existing.emergency_contact_phone,
      linkedin_url: req.body.linkedin_url !== undefined ? req.body.linkedin_url : existing.linkedin_url,
    };

    await updateProfile(adminId, mergedData);

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully!",
      profile: {
        ...existing,
        ...mergedData,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================
// Delete Admin Profile
// =====================================
const removeProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const affectedRows = await deleteProfile(adminId);
    if (!affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin profile deleted successfully!",
    });
  } catch (error) {
    console.error("Delete Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getProfile,
  addProfile,
  editProfile,
  removeProfile,
};
