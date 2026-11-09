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

// =====================================
// Multer Configuration for Image Uploads
// =====================================
const uploadDir = path.join(__dirname, "../../uploads/galleries");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype.startsWith("image/") && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for galleries!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Middleware: Validate Magic Bytes for Images
const validateImageMagicBytes = async (req, res, next) => {
  if (req.file) {
    try {
      const fd = await fs.promises.open(req.file.path, "r");
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
        await fs.promises.unlink(req.file.path).catch(() => {});
        return res.status(400).json({
          success: false,
          message: "Invalid file content: Uploaded file is not a valid image.",
        });
      }
    } catch (err) {
      if (req.file && req.file.path) {
        await fs.promises.unlink(req.file.path).catch(() => {});
      }
      return res.status(400).json({
        success: false,
        message: "Failed to verify image integrity",
      });
    }
  }
  next();
};

// =====================================
// Gallery Routes (Protected)
// =====================================
router.get("/galleries", verifyToken, listGalleries);

router.post(
  "/galleries",
  verifyToken,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Multer Upload Error",
          error: err.message,
        });
      }
      next();
    });
  },
  validateImageMagicBytes,
  addGallery
);

router.put(
  "/galleries",
  verifyToken,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Multer Upload Error",
          error: err.message,
        });
      }
      next();
    });
  },
  validateImageMagicBytes,
  editGallery
);

router.delete("/galleries", verifyToken, removeGallery);

module.exports = router;
