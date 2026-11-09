const express = require("express");
const router = express.Router();
const {
  getProfile,
  addProfile,
  editProfile,
  removeProfile,
} = require("../controller/profileController");
const { verifyToken } = require("../middleware/authMiddleware");

// =====================================
// Admin Profile Routes (Protected)
// =====================================
router.get("/profile", verifyToken, getProfile);
router.post("/profile", verifyToken, addProfile);
router.put("/profile", verifyToken, editProfile);
router.delete("/profile", verifyToken, removeProfile);

module.exports = router;