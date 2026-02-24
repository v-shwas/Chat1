import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import msgRoutes from "./routes/msgRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectMongoDb from "./db/dbconnect.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cookieParser());
// Update cors to allow credentials
app.use(cors({
  origin: "http://localhost:5173", // Replace with your frontend URL
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/message", msgRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  connectMongoDb();
  console.log(`server running on ${PORT}`);
});
