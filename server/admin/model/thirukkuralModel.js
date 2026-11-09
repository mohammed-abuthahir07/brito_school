const pool = require("../../config/db");

// =====================================
// Get All Kurals
// =====================================
const getAllKurals = async () => {
  const query = `
    SELECT *
    FROM thirukkural
    ORDER BY kural_number ASC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

// =====================================
// Get Kural By ID
// =====================================
const getKuralById = async (id) => {
  const query = `
    SELECT *
    FROM thirukkural
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
};

// =====================================
// Get Kural By Kural Number
// =====================================
const getKuralByNumber = async (kuralNumber) => {
  const query = `
    SELECT *
    FROM thirukkural
    WHERE kural_number = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [kuralNumber]);
  return rows[0];
};

// =====================================
// Create New Kural
// =====================================
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

// =====================================
// Update Kural
// =====================================
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

// =====================================
// Delete Kural
// =====================================
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
  createKural,
  updateKural,
  deleteKural,
};