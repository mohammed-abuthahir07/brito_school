const {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../model/announcementModel");

// =====================================
// List All Announcements
// =====================================
const listAnnouncements = async (req, res) => {
  try {
    const announcements = await getAllAnnouncements();
    return res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    console.error("List Announcements Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================
// Create Announcement
// =====================================
const addAnnouncement = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const insertId = await createAnnouncement(
      title,
      content,
      category || "General"
    );
    const newAnnouncement = await getAnnouncementById(insertId);

    return res.status(200).json({
      success: true,
      message: "Announcement created successfully!",
      announcement: newAnnouncement,
    });
  } catch (error) {
    console.error("Create Announcement Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================
// Update Announcement
// =====================================
const editAnnouncement = async (req, res) => {
  try {
    const { id } = req.query;
    const { title, content, category } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Announcement ID is required in query parameters",
      });
    }

    const existing = await getAnnouncementById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    const updatedTitle = title || existing.title;
    const updatedContent = content || existing.content;
    const updatedCategory = category || existing.category;

    await updateAnnouncement(id, updatedTitle, updatedContent, updatedCategory);
    const updatedAnnouncement = await getAnnouncementById(id);

    return res.status(200).json({
      success: true,
      message: `Announcement ID ${id} updated successfully!`,
      announcement: updatedAnnouncement,
    });
  } catch (error) {
    console.error("Update Announcement Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================
// Delete Announcement
// =====================================
const removeAnnouncement = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Announcement ID is required in query parameters",
      });
    }

    const existing = await getAnnouncementById(id);
    if (!existing) {
      return res.status(400).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await deleteAnnouncement(id);

    return res.status(200).json({
      success: true,
      message: `Announcement ID ${id} deleted successfully!`,
    });
  } catch (error) {
    console.error("Delete Announcement Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  listAnnouncements,
  addAnnouncement,
  editAnnouncement,
  removeAnnouncement,
};
