const pool = require("../../config/db");

const CALENDAR_COLUMNS =
  "id, title, description, file_path, file_url, created_at, updated_at";

const applyPagination = (query, pagination) => {
  if (!pagination) {
    return query;
  }
  return `${query} LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;
};

const getAllCalendars = async (pagination = null) => {
  const query = applyPagination(
    `SELECT ${CALENDAR_COLUMNS} FROM calendars ORDER BY created_at DESC`,
    pagination
  );
  const [rows] = await pool.execute(query);
  return rows;
};

const getCalendarById = async (id) => {
  const query = `
    SELECT ${CALENDAR_COLUMNS}
    FROM calendars
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

const createCalendar = async (title, description, filePath) => {
  const query = `
    INSERT INTO calendars (title, description, file_path, file_url)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await pool.execute(query, [
    title,
    description || "",
    filePath,
    filePath,
  ]);
  return result.insertId;
};

const deleteCalendar = async (id) => {
  const query = `
    DELETE FROM calendars
    WHERE id = ?
  `;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllCalendars,
  getCalendarById,
  createCalendar,
  deleteCalendar,
};
