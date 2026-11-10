const {
  getAllKurals,
  getKuralById,
  getKuralByNumber,
  createKural,
  updateKural,
  deleteKural,
} = require("../model/thirukkuralModel");
const { parsePositiveInt, parseListPagination } = require("../utils/validate");

const listKurals = async (req, res) => {
  try {
    const kurals = await getAllKurals(parseListPagination(req.query));
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

const addKural = async (req, res) => {
  try {
    const { kural_number, tamil_text, english_meaning, explanation } = req.body;

    if (!kural_number || !tamil_text || !english_meaning) {
      return res.status(400).json({
        success: false,
        message: "kural_number, tamil_text, and english_meaning are required",
      });
    }

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

const editKural = async (req, res) => {
  try {
    const id = parsePositiveInt(req.query.id);
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

const removeKural = async (req, res) => {
  try {
    const id = parsePositiveInt(req.query.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Kural ID is required in query parameters",
      });
    }

    const affectedRows = await deleteKural(id);
    if (!affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Thirukkural not found",
      });
    }

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
