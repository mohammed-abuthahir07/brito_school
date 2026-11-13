const { getAllAnnouncements } = require("../../admin/model/announcementModel");
const { getAllCalendars } = require("../../admin/model/calendarModel");
const { getAllGalleries } = require("../../admin/model/galleryModel");
const { getDailyKural } = require("../../admin/model/thirukkuralModel");
const { parseListPagination } = require("../../admin/utils/validate");
const { contentCache } = require("../../admin/utils/cache");

const PUBLIC_CACHE_CONTROL = "public, max-age=0, must-revalidate";

const applyPublicCacheHeaders = (req, res, entry) => {
  res.setHeader("ETag", entry.etag);
  res.setHeader("Cache-Control", PUBLIC_CACHE_CONTROL);
  res.setHeader("Last-Modified", new Date(entry.cachedAt).toUTCString());
  res.setHeader("Vary", "Accept-Encoding");
};

const sendCachedPublicResponse = async (req, res, cacheKey, namespace, fetchFn) => {
  try {
    const cached = contentCache.get(cacheKey);
    if (cached) {
      applyPublicCacheHeaders(req, res, cached);
      if (req.headers["if-none-match"] === cached.etag) {
        return res.status(304).end();
      }
      return res.status(200).json(cached.data);
    }

    const data = await fetchFn();
    const entry = contentCache.set(cacheKey, data, namespace);

    applyPublicCacheHeaders(req, res, entry);

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
  const pagination = parseListPagination(req.query) || { limit: 30, offset: 0 };
  pagination.limit = Math.min(pagination.limit, 30);
  const cacheKey = `galleries:${pagination.limit}:${req.query.page || 1}`;

  return sendCachedPublicResponse(req, res, cacheKey, "galleries", async () => {
    const galleries = await getAllGalleries(pagination);
    return {
      success: true,
      count: galleries.length,
      max_capacity: 30,
      galleries,
    };
  });
};

// =====================================
// Public Thirukkural List
// =====================================
const getPublicKurals = async (req, res) => {
  return sendCachedPublicResponse(req, res, "thirukkural:current", "thirukkural", async () => {
    const kural = await getDailyKural();
    return {
      success: true,
      count: kural ? 1 : 0,
      kurals: kural ? [kural] : [],
    };
  });
};

const getPublicDailyKural = async (req, res) => {
  return sendCachedPublicResponse(req, res, "thirukkural:daily", "thirukkural", async () => {
    const kural = await getDailyKural();
    return {
      success: true,
      kural: kural || null,
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
