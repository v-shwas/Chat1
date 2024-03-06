import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import msgRoutes from "./routes/msgRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectMongoDb from "./db/dbconnect.js";

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/message", msgRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  connectMongoDb();
  console.log(`server running on ${PORT}`);
});
