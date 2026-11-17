const pool = require("../../config/db");

// =====================================
// GET /api/admin/dashboard
// Two roundtrips: one combined snapshot (counts + latest rows) and one category GROUP BY.
// Response shape is unchanged.
// =====================================
const getDashboard = async (req, res) => {
  try {
    const [snapshotResult, announcementsByCategoryResult] = await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM announcements) AS announcementsTotal,
          (SELECT COUNT(*) FROM calendars) AS calendarsTotal,
          (SELECT COUNT(*) FROM galleries) AS galleriesTotal,
          (SELECT COUNT(*) FROM thirukkural) AS thirukkuralTotal,
          a.id AS a_id,
          a.title AS a_title,
          a.category AS a_category,
          a.created_at AS a_created_at,
          c.id AS c_id,
          c.title AS c_title,
          c.created_at AS c_created_at,
          g.id AS g_id,
          g.title AS g_title,
          g.created_at AS g_created_at,
          t.id AS t_id,
          t.kural_number AS t_kural_number,
          t.created_at AS t_created_at
        FROM (SELECT 1 AS _x) AS dummy
        LEFT JOIN announcements a
          ON a.id = (SELECT id FROM announcements ORDER BY created_at DESC LIMIT 1)
        LEFT JOIN calendars c
          ON c.id = (SELECT id FROM calendars ORDER BY created_at DESC LIMIT 1)
        LEFT JOIN galleries g
          ON g.id = (SELECT id FROM galleries ORDER BY created_at DESC LIMIT 1)
        LEFT JOIN thirukkural t
          ON t.id = (SELECT id FROM thirukkural ORDER BY created_at DESC, id DESC LIMIT 1)
      `),
      pool.query(
        "SELECT category, COUNT(*) AS count FROM announcements GROUP BY category ORDER BY count DESC"
      ),
    ]);

    const row = (snapshotResult[0] && snapshotResult[0][0]) || {};
    const announcementsTotal = Number(row.announcementsTotal || 0);
    const calendarsTotal = Number(row.calendarsTotal || 0);
    const galleriesTotal = Number(row.galleriesTotal || 0);
    const thirukkuralTotal = Number(row.thirukkuralTotal || 0);

    const announcementsByCategory = announcementsByCategoryResult[0].map((item) => ({
      category: item.category,
      count: Number(item.count),
    }));

    const announcementsLatest = row.a_id
      ? {
          id: row.a_id,
          title: row.a_title,
          category: row.a_category,
          created_at: row.a_created_at,
        }
      : null;
    const calendarsLatest = row.c_id
      ? {
          id: row.c_id,
          title: row.c_title,
          created_at: row.c_created_at,
        }
      : null;
    const galleriesLatest = row.g_id
      ? {
          id: row.g_id,
          title: row.g_title,
          created_at: row.g_created_at,
        }
      : null;
    const thirukkuralLatest = row.t_id
      ? {
          id: row.t_id,
          kural_number: row.t_kural_number,
          created_at: row.t_created_at,
        }
      : null;

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
