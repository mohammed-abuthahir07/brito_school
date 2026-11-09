const pool = require("../../config/db");

// =====================================
// Get All Announcements
// =====================================
const getAllAnnouncements = async () => {
  const query = `
    SELECT *
    FROM announcements
    ORDER BY created_at DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

// =====================================
// Get Announcement By ID
// =====================================
const getAnnouncementById = async (id) => {
  const query = `
    SELECT *
    FROM announcements
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// =====================================
// Create Announcement
// =====================================
const createAnnouncement = async (title, content, category) => {
  const query = `
    INSERT INTO announcements (title, content, category)
    VALUES (?, ?, ?)
  `;
  const [result] = await pool.execute(query, [
    title,
    content,
    category || "General",
  ]);
  return result.insertId;
};

// =====================================
// Update Announcement
// =====================================
const updateAnnouncement = async (id, title, content, category) => {
  const query = `
    UPDATE announcements
    SET title = ?, content = ?, category = ?
    WHERE id = ?
  `;
  const [result] = await pool.execute(query, [
    title,
    content,
    category || "General",
    id,
  ]);
  return result.affectedRows;
};

// =====================================
// Delete Announcement
// =====================================
const deleteAnnouncement = async (id) => {
  const query = `
    DELETE FROM announcements
    WHERE id = ?
  `;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};