const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { isCloudinaryConfigured } = require("../config/cloudinary");

const uploadDir = path.join(__dirname, "../uploads");
if (!isCloudinaryConfigured && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only PDF, JPG, PNG allowed."));
  }

  cb(null, true);
};

module.exports = multer({
  storage: isCloudinaryConfigured ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
