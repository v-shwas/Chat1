import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", protectRoute, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      url: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Handle multer errors
router.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large. Maximum size is 50MB." });
  }
  if (err.message && err.message.includes("not allowed")) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

export default router;
