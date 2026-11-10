const {
  getAllCalendars,
  getCalendarById,
  createCalendar,
  deleteCalendar,
} = require("../model/calendarModel");
const { parsePositiveInt, parseListPagination } = require("../utils/validate");
const { unlinkUpload } = require("../utils/files");

const listCalendars = async (req, res) => {
  try {
    const calendars = await getAllCalendars(parseListPagination(req.query));
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
    });
  }
};

const addCalendar = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!title || !file) {
      if (file && file.path) {
        await unlinkUpload(file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Title and a PDF file are required via form-data",
      });
    }

    const filePathUrl = `/uploads/calendars/${file.filename}`;
    const insertId = await createCalendar(title, description, filePathUrl);

    return res.status(200).json({
      success: true,
      message: "Calendar PDF uploaded successfully!",
      calendar: {
        id: insertId,
        title,
        description: description || "",
        file_path: filePathUrl,
        file_url: filePathUrl,
      },
    });
  } catch (error) {
    if (req.file && req.file.path) {
      await unlinkUpload(req.file.path);
    }
    console.error("Upload Calendar Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const removeCalendar = async (req, res) => {
  try {
    const id = parsePositiveInt(req.query.id);

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

    if (existing.file_path) {
      await unlinkUpload(existing.file_path);
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
    });
  }
};

module.exports = {
  listCalendars,
  addCalendar,
  removeCalendar,
};
