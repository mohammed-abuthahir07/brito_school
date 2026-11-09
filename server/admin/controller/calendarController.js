const fs = require("fs");
const path = require("path");
const {
  getAllCalendars,
  getCalendarById,
  createCalendar,
  deleteCalendar,
} = require("../model/calendarModel");

// =====================================
// List All Calendars
// =====================================
const listCalendars = async (req, res) => {
  try {
    const calendars = await getAllCalendars();
    return res.status(200).json({
      success: true,
      count: calendars.length,
      calendars,
    });
  } catch (error) {
    console.error("List Calendars Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =====================================
// Add Calendar Record (FormData PDF Upload)
// =====================================
const addCalendar = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!title || !file) {
      return res.status(400).json({
        success: false,
        message: "Title and a PDF file are required via form-data",
      });
    }

    const filePathUrl = `/uploads/calendars/${file.filename}`;
    const insertId = await createCalendar(title, description, filePathUrl);
    const newCalendar = await getCalendarById(insertId);

    return res.status(200).json({
      success: true,
      message: "Calendar PDF uploaded successfully!",
      calendar: newCalendar,
    });
  } catch (error) {
    console.error("Upload Calendar Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =====================================
// Delete Calendar Record & Physical File
// =====================================
const removeCalendar = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Calendar ID is required in query parameters",
      });
    }

    const existing = await getCalendarById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Calendar not found",
      });
    }

    // Remove physical PDF file asynchronously to avoid event loop blocking
    if (existing.file_path) {
      const serverFilePath = path.join(__dirname, "../../", existing.file_path);
      try {
        await fs.promises.unlink(serverFilePath);
      } catch (fileErr) {
        if (fileErr.code !== "ENOENT") {
          console.warn("Notice: could not unlink calendar file:", fileErr.message);
        }
      }
    }

    await deleteCalendar(id);

    return res.status(200).json({
      success: true,
      message: `Calendar ID ${id} deleted successfully!`,
    });
  } catch (error) {
    console.error("Delete Calendar Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  listCalendars,
  addCalendar,
  removeCalendar,
};
