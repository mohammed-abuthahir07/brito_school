const fs = require("fs");
const path = require("path");
const {
  getAllGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
} = require("../model/galleryModel");

// =====================================
// List All Galleries
// =====================================
const listGalleries = async (req, res) => {
  try {
    const galleries = await getAllGalleries();
    return res.status(200).json({
      success: true,
      count: galleries.length,
      galleries,
    });
  } catch (error) {
    console.error("List Galleries Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =====================================
// Add New Gallery Image
// =====================================
const addGallery = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!title || !file) {
      return res.status(400).json({
        success: false,
        message: "Title and an image file are required via form-data",
      });
    }

    const imagePath = `/uploads/galleries/${file.filename}`;
    const insertId = await createGallery(title, description, imagePath);
    const newGallery = await getGalleryById(insertId);

    return res.status(200).json({
      success: true,
      message: "Gallery image uploaded successfully!",
      gallery: newGallery,
    });
  } catch (error) {
    console.error("Upload Gallery Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =====================================
// Update Gallery Item (Optional new image)
// =====================================
const editGallery = async (req, res) => {
  try {
    const { id } = req.query;
    const { title, description } = req.body;
    const file = req.file;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Gallery ID is required in query parameters",
      });
    }

    const existing = await getGalleryById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    const updatedTitle = title || existing.title;
    const updatedDescription = description !== undefined ? description : existing.description;
    let updatedImagePath = existing.image_path;

    // If a new image file is uploaded, delete the old physical file asynchronously and use the new path
    if (file) {
      updatedImagePath = `/uploads/galleries/${file.filename}`;

      if (existing.image_path) {
        const oldServerFilePath = path.join(__dirname, "../../", existing.image_path);
        try {
          await fs.promises.unlink(oldServerFilePath);
        } catch (fileErr) {
          if (fileErr.code !== "ENOENT") {
            console.warn("Notice: could not unlink old gallery file:", fileErr.message);
          }
        }
      }
    }

    await updateGallery(id, updatedTitle, updatedDescription, updatedImagePath);
    const updatedGallery = await getGalleryById(id);

    return res.status(200).json({
      success: true,
      message: `Gallery ID ${id} updated successfully!`,
      gallery: updatedGallery,
    });
  } catch (error) {
    console.error("Update Gallery Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =====================================
// Delete Gallery Record & Physical Image File
// =====================================
const removeGallery = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Gallery ID is required in query parameters",
      });
    }

    const existing = await getGalleryById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    // Remove physical image file asynchronously to avoid event loop blocking
    if (existing.image_path) {
      const serverFilePath = path.join(__dirname, "../../", existing.image_path);
      try {
        await fs.promises.unlink(serverFilePath);
      } catch (fileErr) {
        if (fileErr.code !== "ENOENT") {
          console.warn("Notice: could not unlink gallery file:", fileErr.message);
        }
      }
    }

    await deleteGallery(id);

    return res.status(200).json({
      success: true,
      message: `Gallery ID ${id} deleted successfully!`,
    });
  } catch (error) {
    console.error("Delete Gallery Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  listGalleries,
  addGallery,
  editGallery,
  removeGallery,
};
