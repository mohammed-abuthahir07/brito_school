const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  listGalleries,
  addGallery,
  editGallery,
  removeGallery,
} = require("../controller/galleryController");
const { verifyToken } = require("../middleware/authMiddleware");

const GALLERY_IMAGE_LIMIT_BYTES = 30 * 1024 * 1024;
const GALLERY_IMAGE_SIZE_ERROR =
  "Image size must be below 30 MB. Please select a smaller image.";

const uploadDir = path.join(__dirname, "../../uploads/galleries");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "gallery-" + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (file.mimetype.startsWith("image/") && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for galleries!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: GALLERY_IMAGE_LIMIT_BYTES - 1 },
  fileFilter: fileFilter,
});

const collectGalleryFiles = (req) => {
  const files = [];
  if (req.file) {
    files.push(req.file);
  }
  if (Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.files && typeof req.files === "object") {
    for (const value of Object.values(req.files)) {
      if (Array.isArray(value)) {
        files.push(...value);
      } else if (value) {
        files.push(value);
      }
    }
  }
  return [...new Map(files.filter(Boolean).map((file) => [file.path, file])).values()];
};

const unlinkGalleryFiles = async (files) => {
  await Promise.all(
    files.map((file) =>
      file && file.path ? fs.promises.unlink(file.path).catch(() => {}) : Promise.resolve()
    )
  );
};

// Accept any field name (e.g. "image", "images", "file", "files", "photo", etc.)
const handleGalleryUpload = (req, res, next) => {
  upload.any()(req, res, async (err) => {
    const files = collectGalleryFiles(req);
    if (files.length && !req.file) {
      req.file = files[0];
    }
    req.files = files;

    if (err) {
      await unlinkGalleryFiles(files);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: GALLERY_IMAGE_SIZE_ERROR,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }

    const oversized = files.filter((file) => file.size >= GALLERY_IMAGE_LIMIT_BYTES);
    if (oversized.length > 0) {
      await unlinkGalleryFiles(files);
      return res.status(400).json({
        success: false,
        message: GALLERY_IMAGE_SIZE_ERROR,
      });
    }

    next();
  });
};

const validateImageMagicBytes = async (req, res, next) => {
  const files = collectGalleryFiles(req);
  if (!files.length) {
    return next();
  }

  try {
    for (const file of files) {
      const ext = path.extname(file.originalname || file.filename || "").toLowerCase();
      const mime = (file.mimetype || "").toLowerCase();

      // Only check raster image magic bytes if the file claims to be a JPEG, PNG, GIF, or WebP
      const isClaimedRasterImage =
        [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext) ||
        mime === "image/jpeg" ||
        mime === "image/png" ||
        mime === "image/gif" ||
        mime === "image/webp";

      if (isClaimedRasterImage) {
        const fd = await fs.promises.open(file.path, "r");
        const buffer = Buffer.alloc(12);
        await fd.read(buffer, 0, 12, 0);
        await fd.close();

        const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
        const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
        const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
        const isWebp =
          buffer[0] === 0x52 &&
          buffer[1] === 0x49 &&
          buffer[2] === 0x46 &&
          buffer[3] === 0x46 &&
          buffer[8] === 0x57 &&
          buffer[9] === 0x45 &&
          buffer[10] === 0x42 &&
          buffer[11] === 0x50;

        if (!isJpeg && !isPng && !isGif && !isWebp) {
          await unlinkGalleryFiles(files);
          return res.status(400).json({
            success: false,
            message: "Invalid file content: Uploaded file is not a valid image.",
          });
        }
      }
    }
  } catch (err) {
    await unlinkGalleryFiles(files);
    return res.status(400).json({
      success: false,
      message: "Failed to verify image integrity",
    });
  }

  next();
};

router.get("/galleries", verifyToken, listGalleries);

router.post(
  "/galleries",
  verifyToken,
  handleGalleryUpload,
  validateImageMagicBytes,
  addGallery
);

router.put(
  "/galleries",
  verifyToken,
  handleGalleryUpload,
  validateImageMagicBytes,
  editGallery
);

router.delete("/galleries", verifyToken, removeGallery);

module.exports = router;
