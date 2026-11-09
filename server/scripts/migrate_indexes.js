const pool = require("../config/db");

async function migrate() {
  console.log("Starting index migration...");
  const indexes = [
    {
      table: "announcements",
      name: "idx_announcements_created_at",
      sql: "CREATE INDEX idx_announcements_created_at ON announcements (created_at DESC)",
    },
    {
      table: "calendars",
      name: "idx_calendars_created_at",
      sql: "CREATE INDEX idx_calendars_created_at ON calendars (created_at DESC)",
    },
    {
      table: "galleries",
      name: "idx_galleries_created_at",
      sql: "CREATE INDEX idx_galleries_created_at ON galleries (created_at DESC)",
    },
  ];

  try {
    for (const item of indexes) {
      const [rows] = await pool.query(
        "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?",
        [item.table, item.name]
      );
      if (rows.length === 0) {
        await pool.query(item.sql);
        console.log(`[+] Created index ${item.name} on ${item.table}`);
      } else {
        console.log(`[i] Index ${item.name} already exists on ${item.table}`);
      }
    }
    console.log("Index migration completed successfully.");
  } catch (error) {
    console.error("Migration error:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
