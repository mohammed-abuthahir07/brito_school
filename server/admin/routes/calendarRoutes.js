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

// Ensure directory exists synchronously on startup
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "calendar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
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

// =====================================
// Calendar Routes (Protected)
// =====================================
router.get("/calendars", verifyToken, listCalendars);
router.post("/calendars", verifyToken, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "Multer Upload Error",
        error: err.message,
      });
    }
    next();
  });
}, addCalendar);
router.delete("/calendars", verifyToken, removeCalendar);

module.exports = router;