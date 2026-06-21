const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const upload = require("../controllers/upload.controller");
const authMiddleware = require("../middleware/authMiddleware");

// =========================
// 📁 UPLOAD FOLDER
// =========================
const uploadDir = path.resolve(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// =========================
// 📦 MULTER CONFIG
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files allowed ❌"), false);
  }
};

const uploadMiddleware = multer({ storage, fileFilter });

// =========================
// 🚀 ROUTES
// =========================
router.post(
  "/attendance",
  authMiddleware,
  uploadMiddleware.single("file"),
  upload.uploadAttendance
);

router.get("/history", authMiddleware, upload.getHistory);
router.get("/defaulters/:id", authMiddleware, upload.getDefaulters);

module.exports = router;