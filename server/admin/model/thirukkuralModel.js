const pool = require("../../config/db");

const KURAL_COLUMNS =
  "id, kural_number, tamil_text, english_meaning, explanation, created_at, updated_at";
const DAILY_LOCK_KEY = "brito_thirukkural_daily";

const applyPagination = (query, pagination) => {
  if (!pagination) {
    return query;
  }
  return `${query} LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;
};

const kolkataDateString = (overrideDate) => {
  if (typeof overrideDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(overrideDate)) {
    return overrideDate;
  }
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
};

const toKolkataDate = (value) => {
  if (!value) {
    return null;
  }
  return new Date(value).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
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

const publishDailyKural = async ({
  kuralNumber,
  tamilText,
  englishMeaning,
  explanation,
  displayDate,
}) => {
  const today = kolkataDateString(displayDate);
  const conn = await pool.getConnection();

  try {
    const [lockRows] = await conn.query("SELECT GET_LOCK(?, 10) AS gotLock", [DAILY_LOCK_KEY]);
    if (!lockRows[0] || Number(lockRows[0].gotLock) !== 1) {
      throw new Error("Could not acquire daily Thirukkural lock");
    }

    await conn.beginTransaction();
    const [rows] = await conn.execute(
      `SELECT ${KURAL_COLUMNS} FROM thirukkural ORDER BY created_at DESC, id DESC FOR UPDATE`
    );

    const todayRow = rows.find((row) => toKolkataDate(row.created_at) === today);

    if (todayRow) {
      await conn.execute(
        `
          UPDATE thirukkural
          SET kural_number = ?, tamil_text = ?, english_meaning = ?, explanation = ?
          WHERE id = ?
        `,
        [kuralNumber, tamilText, englishMeaning, explanation || null, todayRow.id]
      );
      await conn.commit();
      return {
        action: "updated",
        id: todayRow.id,
        replacedPrevious: false,
      };
    }

    if (rows.length === 0) {
      const [result] = await conn.execute(
        `
          INSERT INTO thirukkural (kural_number, tamil_text, english_meaning, explanation)
          VALUES (?, ?, ?, ?)
        `,
        [kuralNumber, tamilText, englishMeaning, explanation || null]
      );
      await conn.commit();
      return {
        action: "created",
        id: result.insertId,
        replacedPrevious: false,
      };
    }

    const current = rows[0];
    await conn.execute(
      `
        UPDATE thirukkural
        SET kural_number = ?, tamil_text = ?, english_meaning = ?, explanation = ?
        WHERE id = ?
      `,
      [kuralNumber, tamilText, englishMeaning, explanation || null, current.id]
    );
    await conn.execute("DELETE FROM thirukkural WHERE id != ?", [current.id]);
    await conn.commit();
    return {
      action: "replaced",
      id: current.id,
      replacedPrevious: true,
    };
  } catch (error) {
    try {
      await conn.rollback();
    } catch (_) {
      // ignore rollback errors
    }
    throw error;
  } finally {
    try {
      await conn.query("SELECT RELEASE_LOCK(?)", [DAILY_LOCK_KEY]);
    } catch (_) {
      // lock released with connection
    }
    conn.release();
  }
};

module.exports = {
  kolkataDateString,
  getAllKurals,
  getKuralById,
  getKuralByNumber,
  getDailyKural,
  createKural,
  updateKural,
  deleteKural,
  publishDailyKural,
};
