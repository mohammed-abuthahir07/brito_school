
const express = require("express");
const router = express.Router();
const {
  listAnnouncements,
  addAnnouncement,
  editAnnouncement,
  removeAnnouncement,
} = require("../controller/announcementController");
const { verifyToken } = require("../middleware/authMiddleware");

// =====================================
// Announcement Routes (Protected)
// =====================================
router.get("/announcements", verifyToken, listAnnouncements);
router.post("/announcements", verifyToken, addAnnouncement);
router.put("/announcements", verifyToken, editAnnouncement);
router.delete("/announcements", verifyToken, removeAnnouncement); // or removeAnnouncement

module.exports = router;