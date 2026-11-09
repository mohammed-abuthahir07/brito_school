const pool = require("../../config/db");

// =====================================
// Get All Galleries
// =====================================
const getAllGalleries = async () => {
  const query = `
    SELECT *
    FROM galleries
    ORDER BY created_at DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

// =====================================
// Get Gallery By ID
// =====================================
const getGalleryById = async (id) => {
  const query = `
    SELECT *
    FROM galleries
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// =====================================
// Create Gallery Record
// =====================================
const createGallery = async (title, description, imagePath) => {
  const query = `
    INSERT INTO galleries (title, description, image_path)
    VALUES (?, ?, ?)
  `;
  const [result] = await pool.execute(query, [
    title,
    description || null,
    imagePath,
  ]);
  return result.insertId;
};

// =====================================
// Update Gallery Record
// =====================================
const updateGallery = async (id, title, description, imagePath) => {
  const query = `
    UPDATE galleries
    SET title = ?, description = ?, image_path = ?
    WHERE id = ?
  `;
  const [result] = await pool.execute(query, [
    title,
    description || null,
    imagePath,
    id,
  ]);
  return result.affectedRows;
};

// =====================================
// Delete Gallery Record
// =====================================
const deleteGallery = async (id) => {
  const query = `
    DELETE FROM galleries
    WHERE id = ?
  `;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
};