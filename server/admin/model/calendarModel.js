const pool = require("../../config/db");

// =====================================
// Get All Calendars
// =====================================
const getAllCalendars = async () => {
  const query = `
    SELECT *
    FROM calendars
    ORDER BY created_at DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

// =====================================
// Get Calendar By ID
// =====================================
const getCalendarById = async (id) => {
  const query = `
    SELECT *
    FROM calendars
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// =====================================
// Create Calendar Record (Populating file_path & file_url)
// =====================================
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

// =====================================
// Delete Calendar Record
// =====================================
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