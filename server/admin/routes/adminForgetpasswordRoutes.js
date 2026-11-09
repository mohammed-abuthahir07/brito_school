const express = require("express");
const router = express.Router();
const {
  forgotPassword,
  resetPassword,
} = require("../controller/adminForgetpasswordController");

// =====================================
// Admin Password Reset Routes
// =====================================
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;