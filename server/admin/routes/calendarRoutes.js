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

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype === "application/pdf" && ext === ".pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// Middleware: Validate Magic Bytes for PDF (%PDF)
const validatePdfMagicBytes = async (req, res, next) => {
  if (req.file) {
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
  next();
};

// =====================================
// Calendar Routes (Protected)
// =====================================
router.get("/calendars", verifyToken, listCalendars);

router.post(
  "/calendars",
  verifyToken,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
        });
      }
      next();
    });
  },
  validatePdfMagicBytes,
  addCalendar
);

router.delete("/calendars", verifyToken, removeCalendar);

module.exports = router;
