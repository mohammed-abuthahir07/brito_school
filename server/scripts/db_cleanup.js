// =============================================================================
// db_cleanup.js — Brito School Database Cleanup Script
//
// PURPOSE:
//   Deletes ALL application data from every table EXCEPT the admin account.
//   The `admins` table (login credentials) is never touched.
//
// TABLES CLEARED:
//   • announcements    — all announcement records
//   • calendars        — all academic calendar records + PDF files on disk
//   • galleries        — all gallery image records + image files on disk
//   • thirukkural      — all Thirukkural verse records
//   • admin_profiles   — admin profile details (login account kept)
//
// TABLE PRESERVED:
//   • admins           — admin login credentials (email, password) — UNTOUCHED
//
// USAGE:
//   node scripts/db_cleanup.js
//
// Run from inside the `server/` directory:
//   cd server
//   node scripts/db_cleanup.js
// =============================================================================

"use strict";

const path = require("path");
const fs = require("fs");

// Load environment variables from server/.env
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mysql = require("mysql2/promise");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const UPLOADS_DIR = path.resolve(__dirname, "../uploads");

/**
 * Deletes a physical file from disk if it exists.
 * Silently skips if the file is already gone.
 */
async function deleteFileIfExists(filePath) {
  if (!filePath) return;

  // filePath stored in DB can be like "uploads/calendars/calendar-xxx.pdf"
  // or an absolute path — normalise to absolute.
  const absPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(UPLOADS_DIR, "..", filePath);

  try {
    await fs.promises.unlink(absPath);
    console.log(`  ✔ Deleted file: ${absPath}`);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(`  ⚠ File already gone (skipped): ${absPath}`);
    } else {
      console.error(`  ✘ Could not delete file ${absPath}: ${err.message}`);
    }
  }
}

// ─── Main cleanup ─────────────────────────────────────────────────────────────

async function runCleanup() {
  console.log("=============================================================");
  console.log("  Brito School — Database Cleanup Script");
  console.log("=============================================================");
  console.log(`  Host     : ${process.env.DB_HOST}`);
  console.log(`  Database : ${process.env.DB_NAME || "brito_school"}`);
  console.log("  Admin login table (admins) will NOT be modified.");
  console.log("=============================================================\n");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "brito_school",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
  });

  try {
    // ── 1. Calendars — fetch file paths first, then delete rows ──────────────
    console.log("── 1. Clearing calendars table ──────────────────────────────");
    const [calendarRows] = await conn.execute(
      "SELECT id, file_path FROM calendars"
    );
    console.log(`  Found ${calendarRows.length} calendar record(s).`);

    for (const row of calendarRows) {
      await deleteFileIfExists(row.file_path);
    }

    const [calResult] = await conn.execute("DELETE FROM calendars");
    console.log(`  ✔ Deleted ${calResult.affectedRows} row(s) from calendars.\n`);

    // ── 2. Galleries — fetch image paths first, then delete rows ─────────────
    console.log("── 2. Clearing galleries table ──────────────────────────────");
    const [galleryRows] = await conn.execute(
      "SELECT id, image_path FROM galleries"
    );
    console.log(`  Found ${galleryRows.length} gallery record(s).`);

    for (const row of galleryRows) {
      await deleteFileIfExists(row.image_path);
    }

    const [galResult] = await conn.execute("DELETE FROM galleries");
    console.log(`  ✔ Deleted ${galResult.affectedRows} row(s) from galleries.\n`);

    // ── 3. Announcements ──────────────────────────────────────────────────────
    console.log("── 3. Clearing announcements table ──────────────────────────");
    const [annResult] = await conn.execute("DELETE FROM announcements");
    console.log(
      `  ✔ Deleted ${annResult.affectedRows} row(s) from announcements.\n`
    );

    // ── 4. Thirukkural ────────────────────────────────────────────────────────
    console.log("── 4. Clearing thirukkural table ────────────────────────────");
    const [tkResult] = await conn.execute("DELETE FROM thirukkural");
    console.log(
      `  ✔ Deleted ${tkResult.affectedRows} row(s) from thirukkural.\n`
    );

    // ── 5. Admin profiles ─────────────────────────────────────────────────────
    console.log("── 5. Clearing admin_profiles table ─────────────────────────");
    const [profResult] = await conn.execute("DELETE FROM admin_profiles");
    console.log(
      `  ✔ Deleted ${profResult.affectedRows} row(s) from admin_profiles.\n`
    );

    // ── 6. Summary ────────────────────────────────────────────────────────────
    console.log("=============================================================");
    console.log("  Cleanup complete!");
    console.log("  The `admins` table was NOT modified — login credentials safe.");
    console.log("=============================================================");
  } catch (err) {
    console.error("\n✘ Cleanup failed:", err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

runCleanup();
