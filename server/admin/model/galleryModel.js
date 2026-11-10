const pool = require("../../config/db");

const GALLERY_COLUMNS =
  "id, title, description, image_path, created_at, updated_at";

const applyPagination = (query, pagination) => {
  if (!pagination) {
    return query;
  }
  return `${query} LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;
};

const getAllGalleries = async (pagination = null) => {
  const query = applyPagination(
    `SELECT ${GALLERY_COLUMNS} FROM galleries ORDER BY created_at DESC`,
    pagination
  );
  const [rows] = await pool.execute(query);
  return rows;
};

const getGalleryById = async (id) => {
  const query = `
    SELECT ${GALLERY_COLUMNS}
    FROM galleries
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

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
