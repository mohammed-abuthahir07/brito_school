const {
  getAllGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
} = require("../model/galleryModel");
const { parsePositiveInt, parseListPagination } = require("../utils/validate");
const { unlinkUpload } = require("../utils/files");
const { contentCache } = require("../utils/cache");

const GALLERY_IMAGE_LIMIT_BYTES = 30 * 1024 * 1024;
const GALLERY_IMAGE_SIZE_ERROR =
  "Image size must be below 30 MB. Please select a smaller image.";

const collectUploadedImages = (req) => {
  const files = [];
  if (req.file) {
    files.push(req.file);
  }
  if (Array.isArray(req.files)) {
    files.push(...req.files);
  }
  return [...new Map(files.filter(Boolean).map((file) => [file.path, file])).values()];
};

const rejectOversizedGalleryImages = async (req, res) => {
  const files = collectUploadedImages(req);
  const hasOversized = files.some((file) => file.size >= GALLERY_IMAGE_LIMIT_BYTES);
  if (!hasOversized) {
    return false;
  }
  await Promise.all(files.map((file) => unlinkUpload(file.path)));
  res.status(400).json({
    success: false,
    message: GALLERY_IMAGE_SIZE_ERROR,
  });
  return true;
};

const listGalleries = async (req, res) => {
  try {
    const galleries = await getAllGalleries(parseListPagination(req.query));
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
    });
  }
};

const addGallery = async (req, res) => {
  try {
    if (await rejectOversizedGalleryImages(req, res)) {
      return;
    }

    const { title, description } = req.body;
    const file = req.file;

    if (!title || !file) {
      if (file && file.path) {
        await unlinkUpload(file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Title and an image file are required via form-data",
      });
    }

    const imagePath = `/uploads/galleries/${file.filename}`;
    const insertId = await createGallery(title, description, imagePath);
    contentCache.invalidate("galleries");

    return res.status(200).json({
      success: true,
      message: "Gallery image uploaded successfully!",
      gallery: {
        id: insertId,
        title,
        description: description || null,
        image_path: imagePath,
      },
    });
  } catch (error) {
    if (req.file && req.file.path) {
      await unlinkUpload(req.file.path);
    }
    console.error("Upload Gallery Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const editGallery = async (req, res) => {
  try {
    if (await rejectOversizedGalleryImages(req, res)) {
      return;
    }

    const id = parsePositiveInt(req.query.id);
    const { title, description } = req.body;
    const file = req.file;

    if (!id) {
      if (file && file.path) {
        await unlinkUpload(file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Gallery ID is required in query parameters",
      });
    }

    const existing = await getGalleryById(id);
    if (!existing) {
      if (file && file.path) {
        await unlinkUpload(file.path);
      }
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    const updatedTitle = title || existing.title;
    const updatedDescription = description !== undefined ? description : existing.description;
    let updatedImagePath = existing.image_path;

    if (file) {
      updatedImagePath = `/uploads/galleries/${file.filename}`;
      if (existing.image_path) {
        await unlinkUpload(existing.image_path);
      }
    }

    await updateGallery(id, updatedTitle, updatedDescription, updatedImagePath);
    contentCache.invalidate("galleries");

    return res.status(200).json({
      success: true,
      message: `Gallery ID ${id} updated successfully!`,
      gallery: {
        ...existing,
        title: updatedTitle,
        description: updatedDescription,
        image_path: updatedImagePath,
      },
    });
  } catch (error) {
    if (req.file && req.file.path) {
      await unlinkUpload(req.file.path);
    }
    console.error("Update Gallery Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const removeGallery = async (req, res) => {
  try {
    const id = parsePositiveInt(req.query.id);

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

    if (existing.image_path) {
      await unlinkUpload(existing.image_path);
    }

    await deleteGallery(id);
    contentCache.invalidate("galleries");

    return res.status(200).json({
      success: true,
      message: `Gallery ID ${id} deleted successfully!`,
    });
  } catch (error) {
    console.error("Delete Gallery Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  listGalleries,
  addGallery,
  editGallery,
  removeGallery,
};
