const pool = require("../../config/db");

// =====================================
// GET /api/admin/dashboard
// Returns aggregated statistics from all 5 tables
// High-performance: combines scalar counts into 1 query to reduce pool pressure
// =====================================
const getDashboard = async (req, res) => {
  try {
    const [
      countsResult,
      announcementsByCategoryResult,
      announcementsLatestResult,
      calendarsLatestResult,
      galleriesLatestResult,
      thirukkuralLatestResult,
    ] = await Promise.all([
      // Combined scalar counts in 1 single roundtrip
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM announcements) AS announcementsTotal,
          (SELECT COUNT(*) FROM calendars) AS calendarsTotal,
          (SELECT COUNT(*) FROM galleries) AS galleriesTotal,
          (SELECT COUNT(*) FROM thirukkural) AS thirukkuralTotal
      `),
      pool.query(
        "SELECT category, COUNT(*) AS count FROM announcements GROUP BY category ORDER BY count DESC"
      ),
      pool.query(
        "SELECT id, title, category, created_at FROM announcements ORDER BY created_at DESC LIMIT 1"
      ),
      pool.query(
        "SELECT id, title, created_at FROM calendars ORDER BY created_at DESC LIMIT 1"
      ),
      pool.query(
        "SELECT id, title, created_at FROM galleries ORDER BY created_at DESC LIMIT 1"
      ),
      pool.query(
        "SELECT id, kural_number, created_at FROM thirukkural ORDER BY created_at DESC LIMIT 1"
      ),
    ]);

    const countsRow = (countsResult[0] && countsResult[0][0]) || {};
    const announcementsTotal = Number(countsRow.announcementsTotal || 0);
    const calendarsTotal = Number(countsRow.calendarsTotal || 0);
    const galleriesTotal = Number(countsRow.galleriesTotal || 0);
    const thirukkuralTotal = Number(countsRow.thirukkuralTotal || 0);

    const announcementsByCategory = announcementsByCategoryResult[0].map((row) => ({
      category: row.category,
      count: Number(row.count),
    }));

    const announcementsLatest = announcementsLatestResult[0][0] || null;
    const calendarsLatest = calendarsLatestResult[0][0] || null;
    const galleriesLatest = galleriesLatestResult[0][0] || null;
    const thirukkuralLatest = thirukkuralLatestResult[0][0] || null;

    return res.status(200).json({
      success: true,
      dashboard: {
        announcements: {
          total: announcementsTotal,
          byCategory: announcementsByCategory,
          latest: announcementsLatest,
        },
        calendars: {
          total: calendarsTotal,
          latest: calendarsLatest,
        },
        galleries: {
          total: galleriesTotal,
          latest: galleriesLatest,
        },
        thirukkural: {
          total: thirukkuralTotal,
          latest: thirukkuralLatest,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getDashboard,
};
