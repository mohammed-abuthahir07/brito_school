const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  listCalendars,
  addCalendar,
  removeCalendar,
} = require("../controller/calendarController");
const { verifyToken } = require("../middleware/authMiddleware");

const CALENDAR_FILE_LIMIT_BYTES = 30 * 1024 * 1024;
const CALENDAR_FILE_SIZE_ERROR =
  "File size must be below 30 MB. Please select a smaller file.";

// =====================================
// Multer Configuration with Absolute Path
// =====================================
const uploadDir = path.join(__dirname, "../../uploads/calendars");

// mkdirSync with recursive:true is safe — creates dir if missing, no-op if exists
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "calendar-" + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

// Accept any file type (PDF, JPG, PNG, DOC, etc.)
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: CALENDAR_FILE_LIMIT_BYTES - 1 },
  fileFilter: fileFilter,
});

// Accept any field name (e.g. "file", "image", "calendar", "document", etc.)
const handleCalendarUpload = (req, res, next) => {
  upload.any()(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: CALENDAR_FILE_SIZE_ERROR,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }

    if (Array.isArray(req.files) && req.files.length > 0 && !req.file) {
      req.file = req.files[0];
    }
    next();
  });
};

// Middleware: Validate Magic Bytes for PDF (%PDF) only if the file claims to be a PDF
const validatePdfMagicBytes = async (req, res, next) => {
  if (req.file) {
    const ext = path.extname(req.file.originalname || "").toLowerCase();
    const mime = (req.file.mimetype || "").toLowerCase();

    // Check %PDF header only if file claims to be a PDF
    if (ext === ".pdf" || mime === "application/pdf") {
      try {
        const fd = await fs.promises.open(req.file.path, "r");
        const buffer = Buffer.alloc(4);
        await fd.read(buffer, 0, 4, 0);
        await fd.close();

        // Check for %PDF (0x25, 0x50, 0x44, 0x46)
        if (buffer.toString("utf8", 0, 4) !== "%PDF") {
          await fs.promises.unlink(req.file.path).catch(() => {});
          return res.status(400).json({
            success: false,
            message: "Invalid file content: Uploaded file is not a valid PDF document.",
          });
        }
      } catch (err) {
        if (req.file && req.file.path) {
          await fs.promises.unlink(req.file.path).catch(() => {});
        }
        return res.status(400).json({
          success: false,
          message: "Failed to verify file integrity",
        });
      }
    }
  }
  next();
};

// =====================================
// Calendar Routes (Protected)
// =====================================
router.get("/calendars", verifyToken, listCalendars);

router.post(
  "/calendars",
  verifyToken,
  handleCalendarUpload,
  validatePdfMagicBytes,
  addCalendar
);

router.delete("/calendars", verifyToken, removeCalendar);

module.exports = router;
