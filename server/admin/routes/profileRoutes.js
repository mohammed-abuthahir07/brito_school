const express = require("express");
const router = express.Router();
const {
  getProfile,
  createProfile,
  editProfile,
} = require("../controller/profileController");
const { verifyToken } = require("../middleware/authMiddleware");

// =====================================
// Admin Profile Routes (Protected)
// Profile only supports GET, POST, and PUT
// =====================================
router.get("/profile", verifyToken, getProfile);
router.post("/profile", verifyToken, createProfile);
router.put("/profile", verifyToken, editProfile);

module.exports = router;
