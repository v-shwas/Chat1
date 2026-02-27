import express from "express";
import { SignIn, SignUp } from "../controllers/authcontroller.js";

const router = express.Router();

router.post("/login", SignIn);
router.post("/signup", SignUp);

export default router;
