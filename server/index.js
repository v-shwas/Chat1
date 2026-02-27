import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { app, server } from "./socket/socket.js";
import authRoutes from "./routes/authRoutes.js";
import msgRoutes from "./routes/msgRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectMongoDb from "./db/dbconnect.js";

dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/message", msgRoutes);
app.use("/api/users", userRoutes);

server.listen(PORT, () => {
  connectMongoDb();
  console.log(`Server running on port ${PORT}`);
});
