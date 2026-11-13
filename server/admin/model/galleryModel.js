const pool = require("../../config/db");

const GALLERY_COLUMNS =
  "id, title, description, image_path, created_at, updated_at";
const GALLERY_MAX_CAPACITY = 30;
const GALLERY_LOCK_KEY = "brito_gallery_capacity";
const GALLERY_CAPACITY_ERROR =
  "Maximum gallery capacity reached. Only 30 images are allowed. Please delete an existing image before uploading another.";

class GalleryCapacityError extends Error {
  constructor(message = GALLERY_CAPACITY_ERROR) {
    super(message);
    this.name = "GalleryCapacityError";
    this.status = 409;
  }
}

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

const countGalleries = async (connection = pool) => {
  const [rows] = await connection.execute("SELECT COUNT(*) AS total FROM galleries");
  return Number(rows[0].total);
};

const countImagePathReferences = async (imagePath, excludeId = null, connection = pool) => {
  if (!imagePath) {
    return 0;
  }
  if (excludeId) {
    const [rows] = await connection.execute(
      "SELECT COUNT(*) AS total FROM galleries WHERE image_path = ? AND id != ?",
      [imagePath, excludeId]
    );
    return Number(rows[0].total);
  }
  const [rows] = await connection.execute(
    "SELECT COUNT(*) AS total FROM galleries WHERE image_path = ?",
    [imagePath]
  );
  return Number(rows[0].total);
};

const createGallery = async (title, description, imagePath) => {
  const conn = await pool.getConnection();
  try {
    const [lockRows] = await conn.query("SELECT GET_LOCK(?, 10) AS gotLock", [GALLERY_LOCK_KEY]);
    if (!lockRows[0] || Number(lockRows[0].gotLock) !== 1) {
      throw new Error("Could not acquire gallery capacity lock");
    }

    await conn.beginTransaction();
    const total = await countGalleries(conn);
    if (total >= GALLERY_MAX_CAPACITY) {
      await conn.rollback();
      throw new GalleryCapacityError();
    }

    const [result] = await conn.execute(
      `
        INSERT INTO galleries (title, description, image_path)
        VALUES (?, ?, ?)
      `,
      [title, description || null, imagePath]
    );
    await conn.commit();
    return { insertId: result.insertId, total: total + 1 };
  } catch (error) {
    try {
      await conn.rollback();
    } catch (_) {
      // rollback may fail if the transaction never started
    }
    throw error;
  } finally {
    try {
      await conn.query("SELECT RELEASE_LOCK(?)", [GALLERY_LOCK_KEY]);
    } catch (_) {
      // lock is connection-scoped and is released on connection return
    }
    conn.release();
  }
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
  GALLERY_MAX_CAPACITY,
  GALLERY_CAPACITY_ERROR,
  GalleryCapacityError,
  getAllGalleries,
  getGalleryById,
  countGalleries,
  countImagePathReferences,
  createGallery,
  updateGallery,
  deleteGallery,
};
