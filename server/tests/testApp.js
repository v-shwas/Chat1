/**
 * Test application factory.
 *
 * Builds an Express app wired with all routes but without calling
 * server.listen() or connecting to a real MongoDB instance.
 *
 * The socket/socket.js module is replaced by a lightweight mock via Jest's
 * moduleNameMapper in package.json, so io.to().emit() is always a no-op.
 */

import express from "express";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import helmet from "helmet";

import authRoutes from "../routes/authRoutes.js";
import msgRoutes from "../routes/msgRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import groupRoutes from "../routes/groupRoutes.js";
import uploadRoutes from "../routes/uploadRoutes.js";

const buildApp = () => {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(cors({ origin: true, credentials: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/message", msgRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/groups", groupRoutes);
  app.use("/api/upload", uploadRoutes);

  // Global error handler — also handles multer errors passed by uploadRoutes
  app.use((err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 50MB." });
    }
    if (err.message && err.message.includes("not allowed")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(err.status || 500).json({ error: err.message || "Internal server error" });
  });

  return app;
};

export default buildApp;
