const {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../model/announcementModel");
const { parsePositiveInt, parseListPagination } = require("../utils/validate");

const listAnnouncements = async (req, res) => {
  try {
    const announcements = await getAllAnnouncements(parseListPagination(req.query));
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

const addAnnouncement = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const resolvedCategory = category || "General";
    const insertId = await createAnnouncement(title, content, resolvedCategory);

    return res.status(200).json({
      success: true,
      message: "Announcement created successfully!",
      announcement: {
        id: insertId,
        title,
        content,
        category: resolvedCategory,
      },
    });
  } catch (error) {
    console.error("Create Announcement Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const editAnnouncement = async (req, res) => {
  try {
    const id = parsePositiveInt(req.query.id);
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

    return res.status(200).json({
      success: true,
      message: `Announcement ID ${id} updated successfully!`,
      announcement: {
        ...existing,
        title: updatedTitle,
        content: updatedContent,
        category: updatedCategory,
      },
    });
  } catch (error) {
    console.error("Update Announcement Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const removeAnnouncement = async (req, res) => {
  try {
    const id = parsePositiveInt(req.query.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Announcement ID is required in query parameters",
      });
    }

    const affectedRows = await deleteAnnouncement(id);
    if (!affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

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
