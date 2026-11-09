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
// Multer Configuration with Auto-Folder Creation
// =====================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/calendars";
    
    // Automatically create folder if it does not exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
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
router.post("/calendars", verifyToken, upload.single("file"), addCalendar);
router.delete("/calendars", verifyToken, removeCalendar);

module.exports = router;