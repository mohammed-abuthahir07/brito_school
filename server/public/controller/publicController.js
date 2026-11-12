const { getAllAnnouncements } = require("../../admin/model/announcementModel");
const { getAllCalendars } = require("../../admin/model/calendarModel");
const { getAllGalleries } = require("../../admin/model/galleryModel");
const { getAllKurals, getDailyKural } = require("../../admin/model/thirukkuralModel");
const { parseListPagination } = require("../../admin/utils/validate");
const { contentCache } = require("../../admin/utils/cache");

// Helper to serve public content with caching, ETags, and 304 Not Modified
const sendCachedPublicResponse = async (req, res, cacheKey, namespace, fetchFn) => {
  try {
    const cached = contentCache.get(cacheKey);
    if (cached) {
      res.setHeader("ETag", cached.etag);
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
      if (req.headers["if-none-match"] === cached.etag) {
        return res.status(304).end();
      }
      return res.status(200).json(cached.data);
    }

    const data = await fetchFn();
    const entry = contentCache.set(cacheKey, data, namespace);

    res.setHeader("ETag", entry.etag);
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=30");

    if (req.headers["if-none-match"] === entry.etag) {
      return res.status(304).end();
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(`Public API Error [${cacheKey}]:`, error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================
// Public Announcements
// =====================================
const getPublicAnnouncements = async (req, res) => {
  const pagination = parseListPagination(req.query);
  const cacheKey = `announcements:${req.query.limit || "all"}:${req.query.page || 1}`;

  return sendCachedPublicResponse(req, res, cacheKey, "announcements", async () => {
    const announcements = await getAllAnnouncements(pagination);
    return {
      success: true,
      count: announcements.length,
      announcements,
    };
  });
};

// =====================================
// Public Calendars
// =====================================
const getPublicCalendars = async (req, res) => {
  const pagination = parseListPagination(req.query);
  const cacheKey = `calendars:${req.query.limit || "all"}:${req.query.page || 1}`;

  return sendCachedPublicResponse(req, res, cacheKey, "calendars", async () => {
    const calendars = await getAllCalendars(pagination);
    return {
      success: true,
      count: calendars.length,
      calendars,
    };
  });
};

// =====================================
// Public Galleries
// =====================================
const getPublicGalleries = async (req, res) => {
  const pagination = parseListPagination(req.query);
  const cacheKey = `galleries:${req.query.limit || "all"}:${req.query.page || 1}`;

  return sendCachedPublicResponse(req, res, cacheKey, "galleries", async () => {
    const galleries = await getAllGalleries(pagination);
    return {
      success: true,
      count: galleries.length,
      galleries,
    };
  });
};

// =====================================
// Public Thirukkural List
// =====================================
const getPublicKurals = async (req, res) => {
  const pagination = parseListPagination(req.query);
  const cacheKey = `thirukkural:${req.query.limit || "all"}:${req.query.page || 1}`;

  return sendCachedPublicResponse(req, res, cacheKey, "thirukkural", async () => {
    const kurals = await getAllKurals(pagination);
    return {
      success: true,
      count: kurals.length,
      kurals,
    };
  });
};

// =====================================
// Public Daily / Current Thirukkural
// =====================================
const getPublicDailyKural = async (req, res) => {
  const cacheKey = "thirukkural:daily";

  return sendCachedPublicResponse(req, res, cacheKey, "thirukkural", async () => {
    const kural = await getDailyKural();
    return {
      success: true,
      kural,
    };
  });
};

module.exports = {
  getPublicAnnouncements,
  getPublicCalendars,
  getPublicGalleries,
  getPublicKurals,
  getPublicDailyKural,
};
