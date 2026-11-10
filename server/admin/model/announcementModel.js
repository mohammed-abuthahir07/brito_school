const pool = require("../../config/db");

const ANNOUNCEMENT_COLUMNS =
  "id, title, content, category, created_at, updated_at";

const applyPagination = (query, pagination) => {
  if (!pagination) {
    return query;
  }
  return `${query} LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;
};

const getAllAnnouncements = async (pagination = null) => {
  const query = applyPagination(
    `SELECT ${ANNOUNCEMENT_COLUMNS} FROM announcements ORDER BY created_at DESC`,
    pagination
  );
  const [rows] = await pool.execute(query);
  return rows;
};

const getAnnouncementById = async (id) => {
  const query = `
    SELECT ${ANNOUNCEMENT_COLUMNS}
    FROM announcements
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

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
