const pool = require("../../config/db");

const KURAL_COLUMNS =
  "id, kural_number, tamil_text, english_meaning, explanation, created_at, updated_at";

const applyPagination = (query, pagination) => {
  if (!pagination) {
    return query;
  }
  return `${query} LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;
};

const getAllKurals = async (pagination = null) => {
  const query = applyPagination(
    `SELECT ${KURAL_COLUMNS} FROM thirukkural ORDER BY kural_number ASC`,
    pagination
  );
  const [rows] = await pool.execute(query);
  return rows;
};

const getKuralById = async (id) => {
  const query = `
    SELECT ${KURAL_COLUMNS}
    FROM thirukkural
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

const getKuralByNumber = async (kuralNumber) => {
  const query = `
    SELECT id
    FROM thirukkural
    WHERE kural_number = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [kuralNumber]);
  return rows[0];
};

const getDailyKural = async () => {
  const query = `
    SELECT ${KURAL_COLUMNS}
    FROM thirukkural
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `;
  const [rows] = await pool.execute(query);
  return rows[0] || null;
};

const createKural = async (kuralNumber, tamilText, englishMeaning, explanation) => {
  const query = `
    INSERT INTO thirukkural (kural_number, tamil_text, english_meaning, explanation)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await pool.execute(query, [
    kuralNumber,
    tamilText,
    englishMeaning,
    explanation || null,
  ]);
  return result.insertId;
};

const updateKural = async (id, kuralNumber, tamilText, englishMeaning, explanation) => {
  const query = `
    UPDATE thirukkural
    SET kural_number = ?, tamil_text = ?, english_meaning = ?, explanation = ?
    WHERE id = ?
  `;
  const [result] = await pool.execute(query, [
    kuralNumber,
    tamilText,
    englishMeaning,
    explanation || null,
    id,
  ]);
  return result.affectedRows;
};

const deleteKural = async (id) => {
  const query = `
    DELETE FROM thirukkural
    WHERE id = ?
  `;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows;
};

module.exports = {
  getAllKurals,
  getKuralById,
  getKuralByNumber,
  getDailyKural,
  createKural,
  updateKural,
  deleteKural,
};
