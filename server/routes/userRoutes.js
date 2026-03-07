import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { getUsersForSidebar, getProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);
router.get("/profile/:id", protectRoute, getProfile);
router.put("/profile", protectRoute, updateProfile);

export default router;
