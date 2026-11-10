const {
  getAllKurals,
  getKuralById,
  getKuralByNumber,
  createKural,
  updateKural,
  deleteKural,
} = require("../model/thirukkuralModel");

// =====================================
// List All Kurals
// =====================================
const listKurals = async (req, res) => {
  try {
    const kurals = await getAllKurals();
    return res.status(200).json({
      success: true,
      count: kurals.length,
      kurals,
    });
  } catch (error) {
    console.error("List Kurals Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================
// Add New Kural
// Performance: check duplicate, insert, return constructed object — no post-insert SELECT
// =====================================
const addKural = async (req, res) => {
  try {
    const { kural_number, tamil_text, english_meaning, explanation } = req.body;

    if (!kural_number || !tamil_text || !english_meaning) {
      return res.status(400).json({
        success: false,
        message: "kural_number, tamil_text, and english_meaning are required",
      });
    }

    // Check if kural_number already exists before attempting insert
    const existing = await getKuralByNumber(kural_number);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Kural number ${kural_number} already exists`,
      });
    }

    const insertId = await createKural(
      kural_number,
      tamil_text,
      english_meaning,
      explanation
    );

    return res.status(200).json({
      success: true,
      message: "Thirukkural added successfully!",
      kural: {
        id: insertId,
        kural_number,
        tamil_text,
        english_meaning,
        explanation: explanation || null,
      },
    });
  } catch (error) {
    // Handle concurrent duplicate key race condition safely
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: `Kural number ${req.body.kural_number} already exists`,
      });
    }
    console.error("Add Kural Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================
// Update Kural
// Performance: fetch once, update, return merged data — no second SELECT
// =====================================
const editKural = async (req, res) => {
  try {
    const { id } = req.query;
    const { kural_number, tamil_text, english_meaning, explanation } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Kural ID is required in query parameters",
      });
    }

    const existing = await getKuralById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Thirukkural not found",
      });
    }

    const updatedNumber = kural_number || existing.kural_number;
    const updatedTamil = tamil_text || existing.tamil_text;
    const updatedEnglish = english_meaning || existing.english_meaning;
    const updatedExplanation =
      explanation !== undefined ? explanation : existing.explanation;

    await updateKural(
      id,
      updatedNumber,
      updatedTamil,
      updatedEnglish,
      updatedExplanation
    );

    return res.status(200).json({
      success: true,
      message: `Thirukkural ID ${id} updated successfully!`,
      kural: {
        ...existing,
        kural_number: updatedNumber,
        tamil_text: updatedTamil,
        english_meaning: updatedEnglish,
        explanation: updatedExplanation,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: `Kural number ${req.body.kural_number} already exists`,
      });
    }
    console.error("Update Kural Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =====================================
// Delete Kural
// =====================================
const removeKural = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Kural ID is required in query parameters",
      });
    }

    const existing = await getKuralById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Thirukkural not found",
      });
    }

    await deleteKural(id);

    return res.status(200).json({
      success: true,
      message: `Thirukkural ID ${id} deleted successfully!`,
    });
  } catch (error) {
    console.error("Delete Kural Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  listKurals,
  addKural,
  editKural,
  removeKural,
};
