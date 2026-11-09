const express = require("express");
const router = express.Router();
const {
  listKurals,
  addKural,
  editKural,
  removeKural,
} = require("../controller/thirukkuralController");
const { verifyToken } = require("../middleware/authMiddleware");

// =====================================
// Thirukkural Routes (Protected)
// =====================================
router.get("/thirukkural", verifyToken, listKurals);
router.post("/thirukkural", verifyToken, addKural);
router.put("/thirukkural", verifyToken, editKural);
router.delete("/thirukkural", verifyToken, removeKural);

module.exports = router;