const pool = require("../config/db");

async function rollback() {
  console.log("Starting index rollback...");
  const indexes = [
    { table: "announcements", name: "idx_announcements_created_at" },
    { table: "calendars", name: "idx_calendars_created_at" },
    { table: "galleries", name: "idx_galleries_created_at" },
  ];

  try {
    for (const item of indexes) {
      const [rows] = await pool.query(
        "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?",
        [item.table, item.name]
      );
      if (rows.length > 0) {
        await pool.query(`DROP INDEX ${item.name} ON ${item.table}`);
        console.log(`[-] Dropped index ${item.name} from ${item.table}`);
      } else {
        console.log(`[i] Index ${item.name} not present on ${item.table}`);
      }
    }
    console.log("Index rollback completed.");
  } catch (error) {
    console.error("Rollback error:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

rollback();
