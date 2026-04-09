/**
 * Mock for middlewares/upload.js
 *
 * Uses multer memoryStorage — no filesystem access in tests.
 * Wraps multer.single() to inject a generated filename so that
 * req.file.filename is always a non-undefined string (matching what
 * diskStorage produces), allowing upload routes to behave identically.
 */

import multer from "multer";
import path from "path";

const allowedTypes = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "audio/webm", "audio/mp3", "audio/mpeg", "audio/ogg", "audio/wav",
  "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip", "text/plain",
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const _multer = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Wrap single() to inject a filename mimicking diskStorage behaviour
const upload = {
  single: (field) => (req, res, next) => {
    _multer.single(field)(req, res, (err) => {
      if (err) return next(err);
      if (req.file) {
        const ext = path.extname(req.file.originalname);
        req.file.filename = `${field}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      }
      next();
    });
  },
};

export default upload;
