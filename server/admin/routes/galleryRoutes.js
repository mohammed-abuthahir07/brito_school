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
    cb(null, "gallery-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
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
  editGallery
);

router.delete("/galleries", verifyToken, removeGallery);

module.exports = router;