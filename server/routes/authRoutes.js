import express from "express";
import { SignIn, SignUp, Logout, GetMe } from "../controllers/authcontroller.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/login", SignIn);
router.post("/signup", SignUp);
router.post("/logout", Logout);
router.get("/me", protectRoute, GetMe);

export default router;
