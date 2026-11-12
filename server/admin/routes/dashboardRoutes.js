const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controller/dashboardController");
const { verifyToken } = require("../middleware/authMiddleware");

// =====================================
// Dashboard Routes (Protected)
// =====================================
router.get("/dashboard", verifyToken, getDashboard);

module.exports = router;
