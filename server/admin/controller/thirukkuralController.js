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
      error: error.message,
    });
  }
};

// =====================================
// Add New Kural
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

    // Check if kural_number already exists
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
    const newKural = await getKuralById(insertId);

    return res.status(200).json({
      success: true,
      message: "Thirukkural added successfully!",
      kural: newKural,
    });
  } catch (error) {
    console.error("Add Kural Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =====================================
// Update Kural
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
    const updatedKural = await getKuralById(id);

    return res.status(200).json({
      success: true,
      message: `Thirukkural ID ${id} updated successfully!`,
      kural: updatedKural,
    });
  } catch (error) {
    console.error("Update Kural Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
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
      error: error.message,
    });
  }
};

module.exports = {
  listKurals,
  addKural,
  editKural,
  removeKural,
};