const express = require("express");
const router = express.Router();
const {
  getPublicAnnouncements,
  getPublicCalendars,
  getPublicGalleries,
  getPublicKurals,
  getPublicDailyKural,
} = require("../controller/publicController");

// =====================================
// Public Content Routes (Unauthenticated, Read-Heavy, Cached)
// =====================================
router.get("/announcements", getPublicAnnouncements);
router.get("/calendars", getPublicCalendars);
router.get("/galleries", getPublicGalleries);
router.get("/thirukkural/daily", getPublicDailyKural);
router.get("/thirukkural", getPublicKurals);

module.exports = router;
